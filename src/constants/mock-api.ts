////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
// ℹ️  Static seed data — no runtime dependencies on faker.js.
//     Replace with a real API integration for production use.
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from 'match-sorter'; // For filtering

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Define the shape of Product data
export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

// Static seed data (replaces faker.js to avoid 3.5 MB in prod bundle)
const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Bluetooth Headphones', description: 'High-quality over-ear headphones with noise cancellation and 30-hour battery life.', created_at: '2023-03-15T10:30:00.000Z', price: 89.99, photo_url: 'https://api.slingacademy.com/public/sample-products/1.png', category: 'Electronics', updated_at: '2024-01-10T08:00:00.000Z' },
  { id: 2, name: 'Ergonomic Office Chair', description: 'Adjustable lumbar support chair with breathable mesh back and padded armrests.', created_at: '2023-05-20T14:00:00.000Z', price: 249.99, photo_url: 'https://api.slingacademy.com/public/sample-products/2.png', category: 'Furniture', updated_at: '2024-02-15T09:30:00.000Z' },
  { id: 3, name: 'Cotton Crew Neck T-Shirt', description: 'Soft 100% organic cotton t-shirt available in multiple colors.', created_at: '2022-11-01T09:00:00.000Z', price: 24.99, photo_url: 'https://api.slingacademy.com/public/sample-products/3.png', category: 'Clothing', updated_at: '2024-01-05T12:00:00.000Z' },
  { id: 4, name: 'Building Blocks Set', description: 'Creative building blocks set with 500 pieces for ages 6+.', created_at: '2023-07-10T11:00:00.000Z', price: 34.99, photo_url: 'https://api.slingacademy.com/public/sample-products/4.png', category: 'Toys', updated_at: '2024-03-01T07:00:00.000Z' },
  { id: 5, name: 'Organic Green Tea', description: 'Premium loose-leaf green tea sourced from Kyoto, Japan. 200g pouch.', created_at: '2022-08-25T16:00:00.000Z', price: 12.99, photo_url: 'https://api.slingacademy.com/public/sample-products/5.png', category: 'Groceries', updated_at: '2024-01-20T10:00:00.000Z' },
  { id: 6, name: 'JavaScript: The Good Parts', description: 'Classic programming book by Douglas Crockford on JavaScript best practices.', created_at: '2023-01-14T08:00:00.000Z', price: 29.99, photo_url: 'https://api.slingacademy.com/public/sample-products/6.png', category: 'Books', updated_at: '2024-02-01T11:00:00.000Z' },
  { id: 7, name: 'Silver Pendant Necklace', description: 'Elegant sterling silver pendant with cubic zirconia stone.', created_at: '2023-09-05T13:00:00.000Z', price: 59.99, photo_url: 'https://api.slingacademy.com/public/sample-products/7.png', category: 'Jewelry', updated_at: '2024-02-20T15:00:00.000Z' },
  { id: 8, name: 'Vitamin C Serum', description: 'Anti-aging facial serum with 20% Vitamin C and hyaluronic acid. 30ml.', created_at: '2023-04-18T10:00:00.000Z', price: 19.99, photo_url: 'https://api.slingacademy.com/public/sample-products/8.png', category: 'Beauty Products', updated_at: '2024-01-15T14:00:00.000Z' },
  { id: 9, name: 'USB-C Charging Hub', description: '7-in-1 USB-C hub with HDMI, SD card reader, and 100W pass-through charging.', created_at: '2023-02-28T09:00:00.000Z', price: 45.99, photo_url: 'https://api.slingacademy.com/public/sample-products/9.png', category: 'Electronics', updated_at: '2024-03-10T08:00:00.000Z' },
  { id: 10, name: 'Standing Desk Converter', description: 'Height-adjustable desk riser with dual monitor support and keyboard tray.', created_at: '2023-06-12T12:00:00.000Z', price: 179.99, photo_url: 'https://api.slingacademy.com/public/sample-products/10.png', category: 'Furniture', updated_at: '2024-02-25T10:00:00.000Z' },
  { id: 11, name: 'Wool Winter Jacket', description: 'Double-breasted wool blend jacket with satin lining and horn buttons.', created_at: '2022-10-08T11:00:00.000Z', price: 149.99, photo_url: 'https://api.slingacademy.com/public/sample-products/11.png', category: 'Clothing', updated_at: '2024-01-30T09:00:00.000Z' },
  { id: 12, name: 'Remote Control Drone', description: 'Quadcopter drone with 4K camera, GPS and 25 minute flight time.', created_at: '2023-08-22T15:00:00.000Z', price: 299.99, photo_url: 'https://api.slingacademy.com/public/sample-products/12.png', category: 'Electronics', updated_at: '2024-03-05T12:00:00.000Z' },
  { id: 13, name: 'Extra Virgin Olive Oil', description: 'Cold-pressed Italian olive oil, 500ml glass bottle.', created_at: '2022-12-03T08:00:00.000Z', price: 15.99, photo_url: 'https://api.slingacademy.com/public/sample-products/13.png', category: 'Groceries', updated_at: '2024-02-10T07:00:00.000Z' },
  { id: 14, name: 'Design Patterns', description: 'Gang of Four classic on reusable object-oriented software design patterns.', created_at: '2023-03-01T10:00:00.000Z', price: 39.99, photo_url: 'https://api.slingacademy.com/public/sample-products/14.png', category: 'Books', updated_at: '2024-01-25T11:00:00.000Z' },
  { id: 15, name: 'Gold Hoop Earrings', description: '14K gold-plated hoop earrings, 25mm diameter, hypoallergenic.', created_at: '2023-05-09T14:00:00.000Z', price: 39.99, photo_url: 'https://api.slingacademy.com/public/sample-products/15.png', category: 'Jewelry', updated_at: '2024-03-12T16:00:00.000Z' },
  { id: 16, name: 'Retinol Night Cream', description: 'Intensive night cream with retinol and peptides for skin renewal.', created_at: '2023-07-30T09:00:00.000Z', price: 32.99, photo_url: 'https://api.slingacademy.com/public/sample-products/16.png', category: 'Beauty Products', updated_at: '2024-02-05T13:00:00.000Z' },
  { id: 17, name: 'Mechanical Keyboard', description: 'Compact 75% mechanical keyboard with hot-swappable switches and RGB backlight.', created_at: '2023-01-20T12:00:00.000Z', price: 109.99, photo_url: 'https://api.slingacademy.com/public/sample-products/17.png', category: 'Electronics', updated_at: '2024-01-08T10:00:00.000Z' },
  { id: 18, name: 'Puzzle Game Set', description: 'Collection of 5 brain-teaser wooden puzzles in a gift box.', created_at: '2023-11-15T11:00:00.000Z', price: 22.99, photo_url: 'https://api.slingacademy.com/public/sample-products/18.png', category: 'Toys', updated_at: '2024-03-15T08:00:00.000Z' },
  { id: 19, name: 'Bookshelf Speaker Pair', description: 'Passive bookshelf speakers with 5.25-inch woofer and silk dome tweeter.', created_at: '2023-04-05T10:00:00.000Z', price: 199.99, photo_url: 'https://api.slingacademy.com/public/sample-products/19.png', category: 'Electronics', updated_at: '2024-02-18T09:00:00.000Z' },
  { id: 20, name: 'Ceramic Coffee Mug Set', description: 'Set of 4 handcrafted ceramic mugs, 350ml each, dishwasher safe.', created_at: '2023-06-28T08:00:00.000Z', price: 28.99, photo_url: 'https://api.slingacademy.com/public/sample-products/20.png', category: 'Furniture', updated_at: '2024-01-12T14:00:00.000Z' },
];

// Mock product data store
export const fakeProducts = {
  records: [...SEED_PRODUCTS] as Product[],

  // Initialize with sample data
  initialize() {
    this.records = [...SEED_PRODUCTS];
  },

  // Get all products with optional category filtering and search
  async getAll({
    categories = [],
    search
  }: {
    categories?: string[];
    search?: string;
  }) {
    let products = [...this.records];

    // Filter products based on selected categories
    if (categories.length > 0) {
      products = products.filter((product) =>
        categories.includes(product.category)
      );
    }

    // Search functionality across multiple fields
    if (search) {
      products = matchSorter(products, search, {
        keys: ['name', 'description', 'category']
      });
    }

    return products;
  },

  // Get paginated results with optional category filtering and search
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search
  }: {
    page?: number;
    limit?: number;
    categories?: string;
    search?: string;
  }) {
    await delay(1000);
    const categoriesArray = categories ? categories.split('.') : [];
    const allProducts = await this.getAll({
      categories: categoriesArray,
      search
    });
    const totalProducts = allProducts.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Mock current time
    const currentTime = new Date().toISOString();

    // Return paginated response
    return {
      success: true,
      time: currentTime,
      message: 'Sample data for testing and learning purposes',
      total_products: totalProducts,
      offset,
      limit,
      products: paginatedProducts
    };
  },

  // Get a specific product by its ID
  async getProductById(id: number) {
    await delay(1000); // Simulate a delay

    // Find the product by its ID
    const product = this.records.find((product) => product.id === id);

    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }

    // Mock current time
    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Product with ID ${id} found`,
      product
    };
  }
};

// Initialize sample products
fakeProducts.initialize();
