const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkUsers() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log('\nUser Details:', {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: user.role,
        admin: user.admin,
        createdAt: user.createdAt,
        // Show all fields that might indicate admin status
        ...Object.keys(user)
          .filter(key => key.toLowerCase().includes('admin'))
          .reduce((obj, key) => ({ ...obj, [key]: user[key] }), {})
      });
    });
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers(); 