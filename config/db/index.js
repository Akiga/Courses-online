
const mongoose = require('mongoose');
require('dotenv').config();
connect().catch(err => console.log(err));

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
}

module.exports = { connect };