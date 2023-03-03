import { botConnection } from "./botConfig.js";
import { ChatQueryRequest } from "./axiosConfig.js";

const chatBot = botConnection();

chatBot.on("message", async (msg) => {
  try {
    const chatID = msg.chat.id;
    chatBot.sendChatAction(chatID, "typing");
    const result = await ChatQueryRequest(msg.text);
    chatBot.sendMessage(chatID, result);
  } catch (error) {
    const chatID = msg.chat.id;
    chatBot.sendMessage(chatID, "Произошла непредвиденная ошибка " + String.fromCodePoint(0x1f62d));
  }
});
