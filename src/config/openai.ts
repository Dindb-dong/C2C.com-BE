import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION_ID, // Optional
  maxRetries: 3,
  timeout: 30000, // 30 seconds
});

// Test the API connection
export const testOpenAIConnection = async () => {
  try {
    await openai.models.list();
    console.log('OpenAI API connection successful');
    return true;
  } catch (error) {
    console.error('OpenAI API connection failed:', error);
    return false;
  }
};

export default openai; 