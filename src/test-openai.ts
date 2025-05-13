import { testOpenAIConnection } from './config/openai';

async function main() {
  console.log('Testing OpenAI API connection...');
  const result = await testOpenAIConnection();
  console.log('Test result:', result ? 'Success' : 'Failed');
}

main().catch(console.error); 