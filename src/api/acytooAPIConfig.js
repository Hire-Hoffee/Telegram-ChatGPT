import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const instance = axios.create({
  baseURL: "https://chat.acytoo.com",
  headers: {
    "Content-Type": "application/json",
  },
});

async function chatRequestTextAcytoo(content) {
  try {
    const result = await instance.post("/api/completions", {
      model: "gpt-3.5-turbo",
      messages: content,
    });
    return result.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export { chatRequestTextAcytoo };
