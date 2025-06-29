const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Starting to seed the database...');
    
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, './data/products.json'), 'utf8')
    );
    
    for (const productData of productsData.products) {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: productData.image_url,
          category: productData.category
        }
      });
      console.log(`Created product: ${product.name}`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });