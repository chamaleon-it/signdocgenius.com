const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://peter:Peter%40321@peter.ddldxcr.mongodb.net/?appName=peter';

async function checkDoc() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const doc = await db.collection('documents').findOne({});
    console.log('Any doc in DB:', doc);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
checkDoc();
