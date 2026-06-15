import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "What is in this image?",
        },
        {
          type: "image_url",
          image_url: {
            url: "https://images.pexels.com/photos/32439849/pexels-photo-32439849.jpeg",
          },
        },
      ],
    },
  ],
});
 
console.log(response.choices[0].message.content);