import axios from 'axios';

async function main() {
  try {
    console.log('Sending message to https://ishopbd.com/api/chat...');
    const res = await axios.post('https://ishopbd.com/api/chat', {
      messages: [{ role: 'user', content: 'এই মুহূর্তে সব থেকে ভালো কোন চার্জার ফ্যানটি আপনাদের ওয়েব সাইটে আছে' }]
    }, { timeout: 25000 });
    console.log('✅ LIVE Chat API response:');
    console.log(res.data.text);
  } catch (err: any) {
    console.error('❌ LIVE Chat API error:', err.response?.data || err.message);
  }
}

main();
