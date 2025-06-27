const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { customerId, status, items } = req.body;
    
    if (!customerId || !status) {
      return res.status(400).json({ 
        error: 'Customer ID and status are required' 
      });
    }
    
    const newOrder = await prisma.order.create({
      data: {
        customerId,
        status,
        totalPrice: 0
      }
    });
    
    if (items && items.length > 0) {
      let total = 0;
      
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        });
        total += item.quantity * Number(item.price);
      }
      
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { totalPrice: total }
      });
    }
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { customerId, status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { customerId, status }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.order.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItems = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    let totalAdded = 0;
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }
      });
      totalAdded += item.quantity * Number(item.price);
    }
    
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const newTotal = Number(order.totalPrice || 0) + totalAdded;
    
    await prisma.order.update({
      where: { id: orderId },
      data: { totalPrice: newTotal }
    });
    
    res.json({ message: 'Items added successfully', totalAdded });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTotal = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId }
    });
    
    const total = orderItems.reduce((sum, item) => {
      return sum + (item.quantity * Number(item.price));
    }, 0);
    
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};