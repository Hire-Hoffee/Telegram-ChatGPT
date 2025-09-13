import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const instance = axios.create({
  baseURL: "https://openrouter.ai",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPEN_ROUTER_TOKEN}`,
  },
});

async function chatRequestTextOpenRouter(content) {
  const result = await instance.post("/api/v1/chat/completions", {
    model: "deepseek/deepseek-chat-v3.1:free",
    messages: content,
  });

  return result.data.choices[0].message.content.trim();
}

export { chatRequestTextOpenRouter };
