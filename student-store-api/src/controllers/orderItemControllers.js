const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: true,
        order: true
      }
    });
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        product: true,
        order: true
      }
    });
    
    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { orderId, productId, quantity, price } = req.body;
    
    if (!orderId || !productId || !quantity || !price) {
      return res.status(400).json({ 
        error: 'Order ID, product ID, quantity, and price are required' 
      });
    }
    
    const newOrderItem = await prisma.orderItem.create({
      data: { orderId, productId, quantity, price }
    });
    
    res.status(201).json(newOrderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { orderId, productId, quantity, price } = req.body;
    
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id },
      data: { orderId, productId, quantity, price }
    });
    
    res.json(updatedOrderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.orderItem.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};