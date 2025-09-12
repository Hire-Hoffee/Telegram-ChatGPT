"use strict";
import { Groq } from "groq-sdk";
import * as dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_TOKEN,
});

async function chatRequestTextGroq(content) {
  const result = await groq.chat.completions.create({
    messages: content,
    model: "llama-3.3-70b-versatile",
  });

  return result.choices[0].message.content.trim();
}

export { chatRequestTextGroq };
