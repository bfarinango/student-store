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
      where: { order_id },
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
    const { customer_id, status } = req.body;
    
    try {
        const newOrder = await prisma.order.create({
            data: { 
                customer_id: Number(customer_id), 
                totalPrice: 0, 
                status 
            }
        });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { customer_id, status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { customer_id, status }
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
    const { productId, quantity, price } = req.body;
    
    if (!productId || !quantity || !price) {
      return res.status(400).json({ 
        error: 'Product ID, quantity, and price required' 
      });
    }
    
    const newOrderItem = await prisma.orderItem.create({
      data: {
        orderId: orderId,
        productId: Number(productId),
        quantity: Number(quantity),
        price: Number(price)
      }
    });
    
    res.status(201).json(newOrderItem);
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