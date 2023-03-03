import TelegramBot from "node-telegram-bot-api";

function botConnection(token) {
  try {
    const bot = new TelegramBot(token, { polling: true });
    console.log("Bot connected");
    return bot;
  } catch (error) {
    console.log("Connection error");
    return error;
  }
}

export { botConnection };
