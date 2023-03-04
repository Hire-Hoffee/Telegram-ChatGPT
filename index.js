import { botConnection } from "./botConfig.js";
import { ChatQueryRequest } from "./axiosConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";

const chatBot = botConnection();

chatBot.on("message", (msg) => {
  const chatID = msg.chat.id;
  if (!msg.text) {
    chatBot.sendMessage(
      chatID,
      "Sorry, but I can understand only text messages " + String.fromCodePoint(0x1f625)
    );
  }
  return;
});

chatBot.on("text", async (msg) => {
  const chatID = msg.chat.id;

  if (msg.text === "/start") {
    const text = fillerText.greetings;
    chatBot.sendMessage(chatID, text);
    return;
  }

  try {
    chatBot.sendChatAction(chatID, "typing");
    const listOfMessages = messagesHandler(chatBot, chatID, database, msg);

    if (listOfMessages.length > 0) {
      setTimeout(async () => {
        chatBot.sendChatAction(chatID, "typing");
        const result = await ChatQueryRequest(listOfMessages);
        chatBot.sendMessage(chatID, result);
        messagesHandler(chatBot, chatID, database, msg, result);
      }, 3000);
      return;
    } else {
      chatBot.sendMessage(chatID, "Rewrite your request please" + String.fromCodePoint(0x270d));
      return;
    }
  } catch (error) {
    const chatID = msg.chat.id;
    chatBot.sendMessage(chatID, "Unexpected error ocurred " + String.fromCodePoint(0x1f62d));
    console.log(error.response.statusText);
    return;
  }
});
