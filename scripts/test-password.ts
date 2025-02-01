import { hash, compare } from 'bcryptjs';

async function testPassword() {
  try {
    const password = 'Takingnew2025!';
    console.log('Original password:', password);

    // Create hash
    const hashedPassword = await hash(password, 12);
    console.log('Hashed password:', hashedPassword);

    // Test comparison
    const isValid = await compare(password, hashedPassword);
    console.log('Password comparison result:', isValid);

    // Test with wrong password
    const wrongPassword = 'WrongPassword123!';
    const isInvalid = await compare(wrongPassword, hashedPassword);
    console.log('Wrong password comparison result:', isInvalid);

  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword(); 