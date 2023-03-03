import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const instance = axios.create({
  baseURL: "https://api.openai.com/v1/chat/completions",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_TOKEN}`,
  },
});

async function ChatQueryRequest(content) {
  const result = await instance.post("", {
    model: "gpt-3.5-turbo",
    messages: content,
  });

  return result.data.choices[0].message.content.trim();
}

export { ChatQueryRequest };
