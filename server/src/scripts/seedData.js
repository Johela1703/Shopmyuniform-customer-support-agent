import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import School from '../models/School.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Policy from '../models/Policy.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    // Clear existing data
    await School.deleteMany({});
    await Product.deleteMany({});
    await Policy.deleteMany({});
    
    // Check if test user already exists
    let testUser = await User.findOne({ email: 'demo@shopmyuniform.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Sarah Jenkins',
        email: 'demo@shopmyuniform.com',
        password: 'password123',
        role: 'parent',
        studentName: 'Alex Jenkins',
        grade: 'Grade 7',
        phone: '+1 (555) 234-5678',
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          pincode: '62704',
        },
      });
      console.log('[Seed] Created demo user (demo@shopmyuniform.com / password123)');
    }

    // 1. Seed Schools
    const schoolsData = [
      {
        name: "St. Xavier's International Academy",
        code: "SXIA",
        city: "Springfield",
        logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200",
        grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        contactEmail: "uniforms@stxaviers.edu",
        contactPhone: "+1 (555) 100-2000",
      },
      {
        name: "Greenfield Public School",
        code: "GPS",
        city: "Metro City",
        logoUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=200",
        grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        contactEmail: "admin@greenfieldpublic.org",
        contactPhone: "+1 (555) 300-4000",
      },
      {
        name: "Oakridge International School",
        code: "OIS",
        city: "Highland",
        logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=200",
        grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        contactEmail: "support@oakridge.edu",
        contactPhone: "+1 (555) 500-6000",
      },
    ];

    const createdSchools = await School.insertMany(schoolsData);
    console.log(`[Seed] Inserted ${createdSchools.length} schools`);

    // Assign school to demo user
    testUser.schoolId = createdSchools[0]._id;
    await testUser.save();

    const stXaviers = createdSchools[0];
    const greenfield = createdSchools[1];
    const oakridge = createdSchools[2];

    // 2. Seed Products
    const productsData = [
      // St Xavier's Products
      {
        name: "St. Xavier's Classic White Short-Sleeve Oxford Shirt",
        schoolId: stXaviers._id,
        category: "Shirts",
        gender: "Unisex",
        applicableGrades: ["Grade 6", "Grade 7", "Grade 8", "Grade 9"],
        price: 24.99,
        description: "Crisp white oxford cotton shirt featuring St. Xavier's embroidered crest on the chest pocket. Wrinkle-resistant and breathable for school comfort.",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 15, S: 25, M: 30, L: 18, XL: 10, XXL: 5 },
        material: "65% Cotton, 35% Polyester",
        isFeatured: true,
      },
      {
        name: "St. Xavier's Navy Blue Tailored School Trousers",
        schoolId: stXaviers._id,
        category: "Trousers",
        gender: "Boys",
        applicableGrades: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        price: 32.50,
        description: "Formal dark navy blue pleated trousers with adjustable waistband technology and reinforced knee stitching for long-lasting durability.",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 8, S: 20, M: 22, L: 14, XL: 6, XXL: 2 },
        material: "65% Polyester, 35% Viscose",
        isFeatured: true,
      },
      {
        name: "St. Xavier's Navy Blue Pleated School Skirt",
        schoolId: stXaviers._id,
        category: "Skirts",
        gender: "Girls",
        applicableGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"],
        price: 29.99,
        description: "Permanent knife-pleat navy blue skirt with elasticated waist tab and side zip pocket.",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 10, S: 18, M: 25, L: 12, XL: 5, XXL: 3 },
        material: "100% Polyester Gabardine",
        isFeatured: true,
      },
      {
        name: "St. Xavier's Crested Navy Blazer",
        schoolId: stXaviers._id,
        category: "Blazers",
        gender: "Unisex",
        applicableGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        price: 64.99,
        description: "Tailored formal blazer with gold embossed buttons and woven school emblem.",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 5, S: 12, M: 15, L: 10, XL: 4, XXL: 2 },
        material: "100% Polyester Shell with Soft Satin Lining",
        isFeatured: true,
      },
      {
        name: "St. Xavier's Dri-Fit PE Sports Polo Shirt",
        schoolId: stXaviers._id,
        category: "PE Uniform",
        gender: "Unisex",
        applicableGrades: ["Grade 1-12"],
        price: 19.99,
        description: "Moisture-wicking mesh PE polo shirt designed for active physical education sessions.",
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 20, S: 30, M: 35, L: 20, XL: 12, XXL: 6 },
        material: "100% Performance Micro-Poly",
        isFeatured: false,
      },

      // Greenfield Products
      {
        name: "Greenfield Sky Blue Long-Sleeve Shirt",
        schoolId: greenfield._id,
        category: "Shirts",
        gender: "Unisex",
        applicableGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"],
        price: 22.99,
        description: "Light sky blue long-sleeve uniform shirt with button-down collar.",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 12, S: 20, M: 18, L: 10, XL: 5, XXL: 2 },
        material: "60% Cotton, 40% Polyester",
        isFeatured: true,
      },
      {
        name: "Greenfield Charcoal Grey School Trousers",
        schoolId: greenfield._id,
        category: "Trousers",
        gender: "Boys",
        applicableGrades: ["Grade 1-12"],
        price: 31.00,
        description: "Charcoal grey flat-front school trousers with stain-resistant fabric treatment.",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 10, S: 15, M: 20, L: 12, XL: 4, XXL: 2 },
        material: "65% Polyester, 35% Rayon",
        isFeatured: false,
      },

      // Oakridge Products
      {
        name: "Oakridge Premium Maroon V-Neck Sweater",
        schoolId: oakridge._id,
        category: "Sweaters",
        gender: "Unisex",
        applicableGrades: ["Grade 1-12"],
        price: 38.99,
        description: "Warm knitted maroon V-neck sweater featuring gold trim details and school crest.",
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600",
        stockBySizes: { XS: 8, S: 14, M: 16, L: 10, XL: 6, XXL: 3 },
        material: "100% Cotton Knit",
        isFeatured: true,
      },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Inserted ${createdProducts.length} uniform products`);

    // 3. Seed Sample Orders for Demo User
    await Order.deleteMany({});
    const sampleOrder = await Order.create({
      userId: testUser._id,
      orderNumber: 'SMU-2026-1042',
      items: [
        {
          productId: createdProducts[0]._id,
          name: createdProducts[0].name,
          size: 'M',
          quantity: 2,
          unitPrice: createdProducts[0].price,
          image: createdProducts[0].image,
        },
        {
          productId: createdProducts[1]._id,
          name: createdProducts[1].name,
          size: 'M',
          quantity: 1,
          unitPrice: createdProducts[1].price,
          image: createdProducts[1].image,
        },
      ],
      totalAmount: 82.48,
      shippingAddress: testUser.shippingAddress,
      paymentMethod: 'Credit Card (Visa ending in 4242)',
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      trackingNumber: 'TRK-98421034',
      carrier: 'Express Uniform Logistics',
      estimatedDelivery: '2 Business Days (August 30, 2026)',
    });

    console.log(`[Seed] Created sample order: ${sampleOrder.orderNumber}`);

    // 4. Seed Policies
    const policiesData = [
      {
        category: 'Delivery',
        title: 'Standard & Express Shipping Policy',
        content: 'All uniform orders are processed within 24 hours. Standard shipping delivers in 3-5 business days. Express shipping is available for urgent back-to-school needs with 1-2 business day turnaround.',
        highlights: ['Free shipping on orders over $75', 'Real-time tracking via SMS and WhatsApp', 'Delivered in eco-friendly protective packaging'],
      },
      {
        category: 'Returns & Exchanges',
        title: '14-Day Free Exchange Guarantee',
        content: 'We understand children grow fast! ShopMyUniform offers a 14-day hassle-free exchange window. If a shirt, trouser, or blazer does not fit, you can request a free size exchange with doorstep pickup.',
        highlights: ['14-day return/exchange window', 'Free doorstep size replacement', 'Unworn condition with tags required'],
      },
      {
        category: 'Size Guide',
        title: 'Uniform Sizing & Fit Guidelines',
        content: 'Our uniform sizes range from XS (Grade 1-2) up to XXL (Senior Secondary). Each product page lists exact chest, sleeve, and waist measurements in inches.',
        highlights: ['XS: Chest 28-30"', 'S: Chest 32-34"', 'M: Chest 36-38"', 'L: Chest 40-42"', 'XL: Chest 44-46"'],
      },
    ];

    await Policy.insertMany(policiesData);
    console.log('[Seed] Inserted store policies into database');

    console.log('[Seed] Database seeding completed successfully!');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
};

if (process.argv[1].endsWith('seedData.js')) {
  connectDB().then(async () => {
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
