/**
 * Creates a default admin user for first-time setup.
 * Run with: npm run seed:admin
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@taxcodeinsight.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Admin user already exists:', email);
  } else {
    await User.create({
      name: 'System Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      designation: 'Platform Administrator',
    });
    console.log('Admin user created:', email);
  }

  await mongoose.connection.close();
  process.exit(0);
})();
