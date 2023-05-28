import { botConnection } from "./botConfig.js";
import { chatRequestText, chatRequestImage } from "./axiosConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";
import { toGoogleSheet } from "./utils.js";

const chatBot = botConnection();
let messagesNum = 0;

chatBot.setMyCommands([
  { command: "resetcontext", description: "Reset ChatGPT conversation context" },
  { command: "imagegeneration", description: "Learn how to generate images..." },
]);

chatBot.on("message", (msg) => {
  const chatID = msg.chat.id;
  if (!msg.text) {
    chatBot.sendMessage(
      chatID,
      "Sorry, but I can understand only text messages " + String.fromCodePoint(0x1f625)
    );
    return;
  }
  if (msg.text.length >= 4090) {
    chatBot.sendMessage(chatID, "Your message is too long..." + String.fromCodePoint(0x1f625));
    return;
  }
});

chatBot.on("text", async (msg) => {
  try {
    messagesNum += 1;
    const chatID = msg.chat.id;
    await toGoogleSheet("Users", msg);

    if (msg.text === "/start") {
      const text = fillerText.greetings;
      chatBot.sendMessage(chatID, text);
      return;
    }
    if (msg.text === "/resetcontext") {
      if (messagesNum < 20) {
        database.filterDB(msg.from.id);
        setTimeout(() => {
          chatBot.sendMessage(chatID, "Context has been reset " + String.fromCodePoint(0x2705));
          messagesNum = 0;
        }, 1000);
      }
      return;
    }
    if (msg.text === "/imagegeneration") {
      const text = fillerText.imageGen;
      chatBot.sendMessage(chatID, text);
      return;
    }

    if (msg.text.split(" ")[0] === "/image") {
      try {
        chatBot.sendChatAction(chatID, "typing");
        const imageDescription = msg.text.split("/image ")[1];
        const result = await chatRequestImage(imageDescription);
        chatBot.sendPhoto(chatID, result);
        return;
      } catch (error) {
        chatBot.sendMessage(chatID, error.response.data.error.message);
        return;
      }
    }

    chatBot.sendChatAction(chatID, "typing");
    const listOfMessages = messagesHandler(chatBot, chatID, database, msg);

    if (listOfMessages.length > 0) {
      if (messagesNum < 20) {
        setTimeout(async () => {
          try {
            chatBot.sendChatAction(chatID, "typing");
            const result = await chatRequestText(listOfMessages);
            chatBot.sendMessage(chatID, result);
            messagesHandler(chatBot, chatID, database, msg, result);
            messagesNum = 0;
          } catch (error) {
            chatBot.sendMessage(msg.chat.id, fillerText.error);
            console.log(error);
            return;
          }
        }, 1000);
      }
      return;
    } else {
      chatBot.sendMessage(chatID, "Rewrite your request please " + String.fromCodePoint(0x270d));
      return;
    }
  } catch (error) {
    chatBot.sendMessage(msg.chat.id, fillerText.error);
    console.log(error);
    return;
  }
});
