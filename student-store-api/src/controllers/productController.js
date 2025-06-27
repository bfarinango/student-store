const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
    try {
    let products = await prisma.product.findMany();
    
    const { category, sort } = req.query;
    
    if (category) {
        products = products.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
        );
    }
    
    if (sort === 'price') {
        products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'name') {
        products.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    res.json(products);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
    const { name, description, price, image_url, category } = req.body;
    
    if (!name || !price || !category) {
        return res.status(400).json({ 
        error: 'Name, price, and category are required' 
        });
    }
    
    const newProduct = await prisma.product.create({
        data: { name, description, price, image_url, category }
    });
    
    res.status(201).json(newProduct);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
    const id = Number(req.params.id);
    const { name, description, price, image_url, category } = req.body;
    
    const updatedProduct = await prisma.product.update({
        where: { id },
        data: { name, description, price, image_url, category }
    });
    
    res.json(updatedProduct);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};