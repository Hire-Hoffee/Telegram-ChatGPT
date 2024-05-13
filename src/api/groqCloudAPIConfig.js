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
    model: "llama3-70b-8192",
  });

  return result.choices[0].message.content.trim();
}

export { chatRequestTextGroq };
