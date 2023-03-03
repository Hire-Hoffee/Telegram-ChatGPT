import { botConnection } from "./botConfig.js";
import { ChatQueryRequest } from "./axiosConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";

const chatBot = botConnection();

chatBot.on("message", async (msg) => {
  const chatID = msg.chat.id;

  if (msg.text === "/start") {
    const text = fillerText.greetings;
    chatBot.sendMessage(chatID, text);
    return;
  }

  try {
    chatBot.sendChatAction(chatID, "typing");

    const userMessages = messagesHandler(chatBot, chatID, database, msg);

    if (userMessages.length > 0) {
      const result = await ChatQueryRequest(userMessages);
      chatBot.sendMessage(chatID, result);
      return;
    } else {
      chatBot.sendMessage(chatID, "Rewrite your request please" + String.fromCodePoint(0x270d));
      return;
    }
  } catch (error) {
    const chatID = msg.chat.id;
    chatBot.sendMessage(chatID, "Unexpected error ocurred " + String.fromCodePoint(0x1f62d));
    console.log(error);
    return;
  }
});
