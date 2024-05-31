import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const instance = axios.create({
  baseURL: "https://api.openai.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_TOKEN}`,
  },
});

async function chatRequestTextOpenAI(content) {
  const result = await instance.post("/v1/chat/completions", {
    model: "gpt-3.5-turbo",
    messages: content,
  });
  return result.data.choices[0].message.content.trim();
}

async function chatRequestImageOpenAI(content) {
  const result = await instance.post("/v1/images/generations", {
    prompt: content,
    n: 1,
    size: "512x512",
  });
  return result.data.data[0].url;
}

export { chatRequestTextOpenAI, chatRequestImageOpenAI };
