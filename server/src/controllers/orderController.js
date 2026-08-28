import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      // Deduct size stock if available
      if (product.stockBySizes && product.stockBySizes.has(item.size)) {
        const currentQty = product.stockBySizes.get(item.size);
        if (currentQty >= item.quantity) {
          product.stockBySizes.set(item.size, currentQty - item.quantity);
          await product.save();
        }
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice: product.price,
        image: product.image,
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SMU-${new Date().getFullYear()}-${randomSuffix}`;

    const order = new Order({
      userId: req.user._id,
      orderNumber,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || req.user.shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card / UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      trackingNumber: `TRK${Date.now().toString().slice(-8)}`,
      estimatedDelivery: '3-5 Business Days',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
