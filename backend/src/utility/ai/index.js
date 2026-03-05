const { default: axios } = require("axios");

const apiKey = process.env.OPENAI_API_KEY_APP;


const genrateResponse=async (message)=>{
    try {
        const OPENAI_API_KEY_APP =apiKey; // Replace with your actual OpenAI API key
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: message
            },
            {
              role: 'user',
              content: 'Hello!'
            }
          ]
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY_APP}`
          }
        });
    
        //// console.log(response.data);
        return response.data.choices[0].message.content;
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
      }
}

module.exports={genrateResponse}