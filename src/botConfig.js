import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
dotenv.config();

const botToken =
  process.env.APP_STATUS === "ON_DEV" ? process.env.BOT_TOKEN_DEV : process.env.BOT_TOKEN;

function botConnection() {
  try {
    const bot = new TelegramBot(botToken, { polling: true });
    console.log("Bot connected");
    return bot;
  } catch (error) {
    console.log("Connection error");
    return error;
  }
}

export { botConnection };
