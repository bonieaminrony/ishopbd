import axios from 'axios';

async function main() {
  try {
    console.log('Sending message to /api/chat...');
    const res = await axios.post('http://localhost:3000/api/chat', {
      messages: [{ role: 'user', content: 'ফ্যান কি আছে আপনাদের দোকানে?' }]
    });
    console.log('✅ Chat API response:');
    console.log(res.data.text);
  } catch (err: any) {
    console.error('❌ Chat API error:', err.response?.data || err.message);
  }
}

main();
