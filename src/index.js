import { botConnection } from "./botConfig.js";
import { chatRequestTextOpenAI, chatRequestImageOpenAI } from "./api/openaiAPIConfig.js";
import { chatRequestTextAcytoo } from "./api/acytooAPIConfig.js";
import { chatRequestTextAivvm } from "./api/aivvmAPIConfig.js";
import { chatRequestTextG4F } from "./api/g4fAPIConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";
import { toGoogleSheet } from "./utils.js";
import { backOff } from "exponential-backoff";

const providers = {
  openAI: { text: chatRequestTextOpenAI, image: chatRequestImageOpenAI },
  acytoo: { text: chatRequestTextAcytoo },
  aivvm: { text: chatRequestTextAivvm },
  g4f: { text: chatRequestTextG4F },
};

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
      chatBot.sendMessage(chatID, fillerText.imageGen, { parse_mode: "html" });
      return;
    }
    if (msg.text === "/resetcontext") {
      database.filterDB(msg.from.id);
      chatBot.sendMessage(chatID, "Context has been reset " + String.fromCodePoint(0x2705));
      return;
    }

    if (msg.text.split(" ")[0] === "!image") {
      chatBot.sendChatAction(chatID, "typing");

      if (!msg.text.split("!image ")[1]) {
        chatBot.sendMessage(chatID, 'Please write request as "!image [your image description]"');
        return;
      }

      const result = await backOff(() => providers.openAI.image(msg.text.split("!image ")[1]), {
        numOfAttempts: 3,
        startingDelay: 15000,
        retry: function (e, attemptNumber) {
          if (attemptNumber === this.numOfAttempts) {
            chatBot.sendMessage(chatID, fillerText.errors.retryRequestFailed);
            return false;
          }
          if (e?.response?.data?.error?.type === "insufficient_quota") {
            chatBot.sendMessage(msg.chat.id, fillerText.errors.billingLimitReached);
            return false;
          }

          chatBot.sendChatAction(chatID, "typing");
          chatBot.sendMessage(chatID, fillerText.errors.tooManyRequests);
          return true;
        },
      });

      chatBot.sendPhoto(chatID, result);
      return;
    }

    const listOfMessages = messagesHandler(chatBot, chatID, database, msg);

    if (listOfMessages.length > 0) {
      chatBot.sendChatAction(chatID, "typing");

      const result = await backOff(() => providers.g4f.text(listOfMessages), {
        numOfAttempts: 3,
        startingDelay: 10000,
        retry: function (e, attemptNumber) {
          if (attemptNumber === this.numOfAttempts) {
            chatBot.sendMessage(chatID, fillerText.errors.retryRequestFailed);
            return false;
          }
          if (e?.response?.data?.error?.type === "insufficient_quota") {
            chatBot.sendMessage(msg.chat.id, fillerText.errors.billingLimitReached);
            return false;
          }

          chatBot.sendChatAction(chatID, "typing");
          chatBot.sendMessage(chatID, fillerText.errors.tooManyRequests);
          return true;
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
    if (error?.response?.status === 429) {
      console.log(error.response.data);
      return;
    }
    if (error?.response?.data?.error?.type === "insufficient_quota") {
      console.log(error.response.data);
      chatBot.sendMessage(msg.chat.id, fillerText.errors.billingLimitReached);
      return;
    }
    if (error?.response?.status === 400 && error?.response?.data?.error?.message) {
      console.log(error.response.data);
      chatBot.sendMessage(
        msg.chat.id,
        `${String.fromCodePoint(0x274c)} ${error.response.data.error.message}`
      );
      return;
    }

    console.log(error);
    chatBot.sendMessage(msg.chat.id, fillerText.errors.unexpected);
    return;
  }
});
