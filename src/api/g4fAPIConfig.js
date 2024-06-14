import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const instance = axios.create({
  baseURL: process.env.HOST ? `http://${process.env.HOST}:8989` : "http://localhost:8989",
  headers: {
    "Content-Type": "application/json",
  },
});

async function chatRequestTextG4F(content) {
  const result = await instance.post("/data", {
    messages: content,
  });
  return result.data;
}

export { chatRequestTextG4F };
