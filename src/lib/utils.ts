import { connectToDatabase } from './db';

export async function generateUniqueRegistrationNumber(): Promise<string> {
  const prefix = 'G25-';
  const length = 6;
  
  for (let attempts = 0; attempts < 10; attempts++) {
    // Generate a random string
    const randomStr = Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .toUpperCase();
    
    const registrationNumber = `${prefix}${randomStr}`;
    
    try {
      const { db } = await connectToDatabase();
      
      // Verify uniqueness
      const existing = await db.collection('users').findOne({ registrationNumber });
      if (!existing) {
        return registrationNumber;
      }
    } catch (error) {
      console.error('Error generating registration number:', error);
      throw new Error('Failed to generate unique registration number');
    }
  }
  
  throw new Error('Failed to generate unique registration number after multiple attempts');
} 