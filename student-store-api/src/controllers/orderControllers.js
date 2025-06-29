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
        customerId: Number(customerId), 
        totalPrice: 0, 
        status 
      }
    });

    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price)
          }
        });
      }

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: newOrder.id }
      });
      
      const total = orderItems.reduce((sum, item) => {
        return sum + (item.quantity * Number(item.price));
      }, 0);

      const updatedOrder = await prisma.order.update({
        where: { id: newOrder.id },
        data: { totalPrice: total }
      });

      res.status(201).json(updatedOrder);
    } else {
      res.status(201).json(newOrder);
    }
    
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