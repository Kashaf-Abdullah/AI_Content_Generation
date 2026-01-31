const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message || error);
    if (error?.code === 8000 || /auth/i.test(error.message || '')) {
      console.error('🔒 Authentication failed — verify your MONGO_URI credentials, database user, password, and Atlas IP/network access list.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
