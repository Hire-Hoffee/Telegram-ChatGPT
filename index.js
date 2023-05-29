import { botConnection } from "./botConfig.js";
import { chatRequestText, chatRequestImage } from "./axiosConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";
import { toGoogleSheet } from "./utils.js";
import { backOff } from "exponential-backoff";

const chatBot = botConnection();

chatBot.setMyCommands([
  { command: "resetcontext", description: "Reset ChatGPT conversation context" },
  { command: "imagegeneration", description: "Learn how to generate images..." },
]);

chatBot.on("message", (msg) => {
  if (!msg.text) {
    chatBot.sendMessage(msg.chat.id, fillerText.errors.onlyTextAllowed);
    return;
  }
  if (msg.text.length >= 4090) {
    chatBot.sendMessage(msg.chat.id, fillerText.errors.tooLongMsg);
    return;
  }
});

chatBot.on("text", async (msg) => {
  try {
    const chatID = msg.chat.id;
    await backOff(() => toGoogleSheet("Users", msg), { delayFirstAttempt: true });

    if (msg.text === "/start") {
      chatBot.sendMessage(chatID, fillerText.greetings);
      return;
    }
    if (msg.text === "/imagegeneration") {
      chatBot.sendMessage(chatID, fillerText.imageGen);
      return;
    }
    if (msg.text === "/resetcontext") {
      database.filterDB(msg.from.id);
      chatBot.sendMessage(chatID, "Context has been reset " + String.fromCodePoint(0x2705));
      return;
    }

    if (msg.text.split(" ")[0] === "/image") {
      chatBot.sendChatAction(chatID, "typing");

      if (!msg.text.split("/image ")[1]) {
        chatBot.sendMessage(chatID, 'Please write request as "/image [your image description]"');
        return;
      }

      const result = await backOff(() => chatRequestImage(msg.text.split("/image ")[1]), {
        delayFirstAttempt: true,
        numOfAttempts: 3,
        startingDelay: 300,
        retry: function (e, attemptNumber) {
          chatBot.sendChatAction(chatID, "typing");
          if (attemptNumber === this.numOfAttempts) {
            chatBot.sendMessage(chatID, fillerText.errors.retryRequestFailed);
            return false;
          }
        },
      });

      chatBot.sendPhoto(chatID, result);
      return;
    }

    const listOfMessages = messagesHandler(chatBot, chatID, database, msg);

    if (listOfMessages.length > 0) {
      chatBot.sendChatAction(chatID, "typing");

      const result = await backOff(() => chatRequestText(listOfMessages), {
        delayFirstAttempt: true,
        numOfAttempts: 5,
        startingDelay: 200,
        retry: function (e, attemptNumber) {
          if (attemptNumber === this.numOfAttempts) {
            chatBot.sendMessage(chatID, fillerText.errors.retryRequestFailed);
            return false;
          }
        },
      });

      chatBot.sendMessage(chatID, result);
      messagesHandler(chatBot, chatID, database, msg, result);
      return;
    } else {
      chatBot.sendMessage(chatID, "Rewrite your request please " + String.fromCodePoint(0x270d));
      return;
    }
  } catch (error) {
    console.log(error);

    if (error?.response?.status === 429) {
      chatBot.sendMessage(msg.chat.id, fillerText.errors.tooManyRequests);
      return;
    }
    if (error?.response?.status === 400 && error?.response?.data?.error?.message) {
      chatBot.sendMessage(
        msg.chat.id,
        `${String.fromCodePoint(0x274c)} ${error.response.data.error.message}`
      );
      return;
    }

    chatBot.sendMessage(msg.chat.id, fillerText.errors.unexpected);
    return;
  }
});
