const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

router.get('/', (req, res) =>{
    res.render('pages/admin-chat')
})

router.get('/user', (req, res) =>{
    const user = req.session.account;
    res.render('pages/user-chat', {
        user
    })
})

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: '❌ Lỗi khi gọi Groq API.' });
  }
});


module.exports = router;
