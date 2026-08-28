import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Policy from '../models/Policy.js';
import School from '../models/School.js';

// Helper function to call OpenAI API if key exists
async function queryLLM(prompt, systemInstruction) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
  } catch (err) {
    console.error('[AI Agent] OpenAI API error:', err.message);
  }
  return null;
}

export const processAIQuery = async (req, res) => {
  try {
    const { message, schoolId, grade } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const queryLower = message.toLowerCase();
    const user = req.user; // populated if token present via optionalAuth

    // Data structures for retrieved context
    let retrievedContext = [];
    let retrievedSources = [];
    let orderCards = [];
    let productCards = [];
    let intent = 'general';

    // -------------------------------------------------------------
    // 1. ORDER LOOKUP INTENT ("Where is my order?", "Track order", "Order status")
    // -------------------------------------------------------------
    const orderMatch = queryLower.match(/order\s*(?:#|num|number)?\s*([a-z0-9-]+)/i) || 
                       queryLower.includes('order') || 
                       queryLower.includes('track') || 
                       queryLower.includes('where is my') ||
                       queryLower.includes('status');

    if (orderMatch) {
      intent = 'order_status';
      let userOrders = [];

      // Check if user specified a specific order number in query (e.g. SMU-2026-1042)
      const explicitNumberMatch = message.match(/SMU-\d{4}-\d{4}/i);

      if (explicitNumberMatch) {
        userOrders = await Order.find({ orderNumber: new RegExp(explicitNumberMatch[0], 'i') });
        retrievedSources.push(`MongoDB Order Query: orderNumber=${explicitNumberMatch[0]}`);
      } else if (user) {
        userOrders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
        retrievedSources.push(`MongoDB User Orders Query: userId=${user._id} (Found ${userOrders.length} orders)`);
      }

      if (userOrders.length > 0) {
        orderCards = userOrders;
        userOrders.forEach((ord) => {
          retrievedContext.push(
            `ORDER RECORD:\n` +
            `- Order #: ${ord.orderNumber}\n` +
            `- Status: ${ord.orderStatus}\n` +
            `- Date Placed: ${new Date(ord.createdAt).toLocaleDateString()}\n` +
            `- Items: ${ord.items.map((i) => `${i.name} (Size: ${i.size}, Qty: ${i.quantity})`).join(', ')}\n` +
            `- Total Amount: $${ord.totalAmount}\n` +
            `- Carrier: ${ord.carrier}\n` +
            `- Tracking #: ${ord.trackingNumber || 'N/A'}\n` +
            `- Estimated Delivery: ${ord.estimatedDelivery}`
          );
        });
      } else if (!user) {
        retrievedContext.push('ORDER RECORD: User is currently browsing as Guest. No active session orders found. Advise user to login or provide their SMU-XXXX-XXXX order number.');
      } else {
        retrievedContext.push(`ORDER RECORD: User (${user.name}) has no recent orders in database.`);
      }
    }

    // -------------------------------------------------------------
    // 2. PRODUCT & SIZE INTENT ("Do you have white shirts for Grade 7?", "Sizes available", "Price")
    // -------------------------------------------------------------
    const isProductQuery = queryLower.includes('shirt') || 
                           queryLower.includes('trouser') || 
                           queryLower.includes('pant') || 
                           queryLower.includes('skirt') || 
                           queryLower.includes('blazer') || 
                           queryLower.includes('sweater') || 
                           queryLower.includes('uniform') || 
                           queryLower.includes('size') || 
                           queryLower.includes('grade') || 
                           queryLower.includes('stock') || 
                           queryLower.includes('buy') ||
                           queryLower.includes('have');

    if (isProductQuery) {
      if (intent === 'general') intent = 'product_catalog';
      if (queryLower.includes('size') || queryLower.includes('available')) intent = 'size_availability';

      // Build product search query
      let productDbQuery = {};

      // Filter by target school if specified or user profile
      const effectiveSchoolId = schoolId || (user && user.schoolId ? user.schoolId : null);
      if (effectiveSchoolId) {
        productDbQuery.schoolId = effectiveSchoolId;
      }

      // Check grade mentions (e.g. "Grade 7", "Grade 5", "Grade 10")
      const gradeMatch = message.match(/grade\s*(\d{1,2})/i);
      const effectiveGrade = gradeMatch ? `Grade ${gradeMatch[1]}` : (grade || (user ? user.grade : null));

      if (effectiveGrade) {
        productDbQuery.applicableGrades = { $in: [effectiveGrade, 'All Grades', 'Grade 1-12'] };
      }

      // Search keyword matching
      const keywords = ['shirt', 'trouser', 'skirt', 'blazer', 'sweater', 'pe', 'shoes', 'tie', 'belt', 'socks'];
      const matchedKeyword = keywords.find(kw => queryLower.includes(kw));

      if (matchedKeyword) {
        productDbQuery.name = { $regex: matchedKeyword, $options: 'i' };
      }

      const products = await Product.find(productDbQuery).populate('schoolId').limit(6);
      retrievedSources.push(`MongoDB Product Query: ${JSON.stringify(productDbQuery)} (Found ${products.length} products)`);

      if (products.length > 0) {
        productCards = products;
        products.forEach((prod) => {
          let stockMapStr = '';
          if (prod.stockBySizes) {
            stockMapStr = Array.from(prod.stockBySizes.entries())
              .map(([sz, qty]) => `${sz}: ${qty > 0 ? `${qty} in stock` : 'Out of Stock'}`)
              .join(', ');
          }

          retrievedContext.push(
            `PRODUCT RECORD:\n` +
            `- ID: ${prod._id}\n` +
            `- Name: ${prod.name}\n` +
            `- School: ${prod.schoolId ? prod.schoolId.name : 'All Schools'}\n` +
            `- Category: ${prod.category}\n` +
            `- Price: $${prod.price}\n` +
            `- Applicable Grades: ${prod.applicableGrades.join(', ')}\n` +
            `- Gender: ${prod.gender}\n` +
            `- Available Sizes & Stock breakdown: [ ${stockMapStr} ]\n` +
            `- Description: ${prod.description}\n` +
            `- Material: ${prod.material}`
          );
        });
      } else {
        // Fallback search without school restriction to suggest alternatives
        const fallbackProducts = await Product.find(matchedKeyword ? { name: { $regex: matchedKeyword, $options: 'i' } } : {}).limit(4);
        if (fallbackProducts.length > 0) {
          productCards = fallbackProducts;
          retrievedContext.push(`No exact matches for requested school/grade filter, but found ${fallbackProducts.length} similar uniforms across catalog.`);
        }
      }
    }

    // -------------------------------------------------------------
    // 3. DELIVERY & RETURN/EXCHANGE POLICY INTENT
    // -------------------------------------------------------------
    if (queryLower.includes('deliver') || queryLower.includes('shipping') || queryLower.includes('time') || queryLower.includes('how long')) {
      intent = 'delivery_info';
      const policies = await Policy.find({ category: 'Delivery' });
      retrievedSources.push(`MongoDB Policy Query: category=Delivery`);
      policies.forEach(p => {
        retrievedContext.push(`STORE POLICY (${p.title}): ${p.content} Highlights: ${p.highlights.join('; ')}`);
      });
    }

    if (queryLower.includes('return') || queryLower.includes('exchange') || queryLower.includes('replace') || queryLower.includes('refund')) {
      intent = 'return_exchange';
      const policies = await Policy.find({ category: 'Returns & Exchanges' });
      retrievedSources.push(`MongoDB Policy Query: category=Returns & Exchanges`);
      policies.forEach(p => {
        retrievedContext.push(`STORE POLICY (${p.title}): ${p.content} Highlights: ${p.highlights.join('; ')}`);
      });
    }

    // If context is still empty, load general store policies
    if (retrievedContext.length === 0) {
      const allPolicies = await Policy.find({}).limit(3);
      allPolicies.forEach(p => {
        retrievedContext.push(`GENERAL POLICY (${p.title}): ${p.content}`);
      });
    }

    // -------------------------------------------------------------
    // 4. GENERATE AI RESPONSE (LLM or Dynamic Rule Synthesis)
    // -------------------------------------------------------------
    const systemPrompt = `You are ShopMyUniform's friendly, highly knowledgeable AI Customer Support Assistant.
Your goal is to assist parents, students, and customers with information regarding school uniforms, product sizes, order statuses, delivery, and return/exchange procedures.

CRITICAL INSTRUCTIONS:
1. Always base your answers strictly on the RETRIEVED MONGODB DATABASE CONTEXT provided below.
2. If answering order status questions, state the exact order number, current status (e.g. Processing, Shipped, Delivered), and estimated delivery.
3. If answering product/size questions, specify exact prices, applicable grades, and size stock counts (e.g. S, M, L).
4. Be polite, concise, professional, and clear. Format responses nicely using Markdown (bullet points, bold text).`;

    const fullPrompt = `USER QUERY: "${message}"

RETRIEVED MONGODB DATABASE CONTEXT:
${retrievedContext.join('\n\n')}

USER PROFILE CONTEXT:
- Authenticated: ${user ? 'Yes (' + user.name + ', Role: ' + user.role + ')' : 'No (Browsing as Guest)'}
- Target Grade: ${user && user.grade ? user.grade : grade || 'Not specified'}

Please provide a clear, formatted customer support answer.`;

    let aiReply = await queryLLM(fullPrompt, systemPrompt);

    // Fallback dynamic generator if no LLM key is active
    if (!aiReply) {
      aiReply = generateDynamicResponse(intent, queryLower, retrievedContext, user, orderCards, productCards);
    }

    return res.json({
      reply: aiReply,
      intent,
      orderData: orderCards,
      productData: productCards,
      retrievedSources,
    });

  } catch (error) {
    console.error('[AI Controller Error]', error);
    res.status(500).json({ message: 'Error processing support request: ' + error.message });
  }
};

// Smart fallback synthesis engine when no external LLM API key is present
function generateDynamicResponse(intent, queryLower, retrievedContext, user, orderCards, productCards) {
  if (intent === 'order_status') {
    if (orderCards.length > 0) {
      const latestOrder = orderCards[0];
      const itemsList = latestOrder.items.map(i => `• **${i.name}** (Size: ${i.size}, Qty: ${i.quantity})`).join('\n');
      return `Hello${user ? ' ' + user.name : ''}! Here is the current status of your order retrieved from our database:

📦 **Order Number:** \`${latestOrder.orderNumber}\`
🚚 **Status:** **${latestOrder.orderStatus}**
📅 **Placed On:** ${new Date(latestOrder.createdAt).toLocaleDateString()}
🚛 **Courier & Tracking:** ${latestOrder.carrier} (Ref: ${latestOrder.trackingNumber || 'Pending'})
⏱️ **Estimated Delivery:** ${latestOrder.estimatedDelivery}

**Items Included:**
${itemsList}

💰 **Total Paid:** $${latestOrder.totalAmount.toFixed(2)}`;
    } else if (!user) {
      return `I would be happy to help check your order! Please **log in to your ShopMyUniform account** or provide your explicit Order Number (e.g. \`SMU-2026-XXXX\`) so I can query your order status from our database.`;
    } else {
      return `Hi ${user.name}, I searched our database but could not find any active orders under your registered account (\`${user.email}\`). If you placed an order under a different email, please provide the order number (e.g., \`SMU-2026-XXXX\`).`;
    }
  }

  if (intent === 'product_catalog' || intent === 'size_availability') {
    if (productCards.length > 0) {
      const formattedProducts = productCards.map(p => {
        let sizesStr = 'N/A';
        if (p.stockBySizes) {
          sizesStr = Array.from(p.stockBySizes.entries())
            .map(([sz, qty]) => qty > 0 ? `**${sz}** (${qty} in stock)` : `~~${sz}~~ (Out of stock)`)
            .join(', ');
        }
        return `👕 **${p.name}**
- **Price:** $${p.price}
- **Applicable Grades:** ${p.applicableGrades.join(', ')}
- **Gender:** ${p.gender}
- **Available Sizes:** ${sizesStr}
- **Material:** ${p.material}`;
      }).join('\n\n');

      return `Based on live inventory in our database, here is the product and size availability:

${formattedProducts}

You can select your preferred size directly from the product page and add it to your shopping cart!`;
    } else {
      return `I searched our uniform inventory but couldn't find an exact match for your request. We stock uniforms for Grades 1 through 12 including Shirts, Trousers, Skirts, Blazers, and PE gear. Please feel free to select your school or search with keywords like "shirt" or "blazer"!`;
    }
  }

  if (intent === 'delivery_info') {
    return `🚚 **ShopMyUniform Shipping & Delivery Guidelines:**

• **Standard Delivery:** Orders are delivered within **3 to 5 business days** across all major school districts.
• **Order Dispatch:** Orders placed before 2:00 PM are processed and dispatched on the same business day.
• **Tracking:** As soon as your order ships, you will receive an SMS and email with a live tracking link, which you can also check here using the **"Where is my order?"** command!`;
  }

  if (intent === 'return_exchange') {
    return `🔄 **Hassle-Free Uniform Exchange & Return Policy:**

• **Return Window:** You can exchange or return any uniform item within **14 days** of delivery.
• **Condition:** Items must be unworn, unwashed, with original tags intact.
• **Size Exchange:** If the uniform shirt or trouser size doesn't fit your student perfectly, we offer **free size exchanges** with doorstep pickup!
• **Process:** Simply visit **My Orders**, select the item you wish to exchange, or reach out to us right here in chat with your Order Number!`;
  }

  return `Welcome to **ShopMyUniform Customer Support**! 🏫

I am connected directly to our MongoDB database to give you instant, real-time assistance. Here are a few things you can ask me:

• 📦 **"Where is my order?"** *(Checks your live order tracking)*
• 👕 **"Do you have white shirts for Grade 7?"** *(Queries real catalog stock)*
• 📏 **"Which sizes are available for navy trousers?"** *(Checks live size inventory)*
• 🚚 **"How long will delivery take?"** *(Retrieves shipping policy)*
• 🔄 **"I want to exchange my shirt. What is the process?"** *(Explains exchange rules)*

How can I help you and your student today?`;
}
