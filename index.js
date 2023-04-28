import { botConnection } from "./botConfig.js";
import { ChatRequestText } from "./axiosConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";
import { usersTracking, toGoogleSheet } from "./utils.js";

const chatBot = botConnection();
let messagesNum = 0;

chatBot.setMyCommands([
  { command: "resetcontext", description: "Reset ChatGPT conversation context" },
]);

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
  try {
    messagesNum += 1;

    const chatID = msg.chat.id;
    await usersTracking("./usersData.json", msg);
    await toGoogleSheet("Users", "./usersData.json", msg.from.username);

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

    chatBot.sendChatAction(chatID, "typing");
    const listOfMessages = messagesHandler(chatBot, chatID, database, msg);

    if (listOfMessages.length > 0) {
      if (messagesNum < 20) {
        setTimeout(async () => {
          try {
            chatBot.sendChatAction(chatID, "typing");
            const result = await ChatRequestText(listOfMessages);
            chatBot.sendMessage(chatID, result);
            messagesHandler(chatBot, chatID, database, msg, result);
            messagesNum = 0;
          } catch (error) {
            const chatID = msg.chat.id;
            const text = fillerText.error;
            chatBot.sendMessage(chatID, text);
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
    const chatID = msg.chat.id;
    const text = fillerText.error;
    chatBot.sendMessage(chatID, text);
    console.log(error);
    return;
  }
});
