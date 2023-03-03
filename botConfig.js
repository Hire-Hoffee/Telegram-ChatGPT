import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
dotenv.config();

function botConnection(token) {
  try {
    const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
    console.log("Bot connected");
    return bot;
  } catch (error) {
    console.log("Connection error");
    return error;
  }
}

export { botConnection };
