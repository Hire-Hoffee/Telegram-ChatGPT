import { botConnection } from "./botConfig.js";
import { chatRequestTextOpenAI, chatRequestImageOpenAI } from "./api/openaiAPIConfig.js";
import { chatRequestTextG4F } from "./api/g4fAPIConfig.js";
import { chatRequestImageFusionBrain } from "./api/fusionBrainAPIConfig.js";
import { chatRequestTextGroq } from "./api/groqCloudAPIConfig.js";
import { chatRequestTextOpenRouter } from "./api/openRouterAPIConfig.js";
import { messagesHandler } from "./handlers.js";
import { database } from "./messagesDB.js";
import fillerText from "./textMessages.js";
import { toGoogleSheet } from "./utils.js";
import { backOff } from "exponential-backoff";

const providers = {
  groq: { text: chatRequestTextGroq },
  openRouter: { text: chatRequestTextOpenRouter },
  openAI: { text: chatRequestTextOpenAI, image: chatRequestImageOpenAI },
  g4f: { text: chatRequestTextG4F },
  fusionBrain: { image: chatRequestImageFusionBrain },
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
  if (msg.text.length >= 3000) {
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
      chatBot.sendMessage(chatID, fillerText.resetContext);
      return;
    }

    if (msg.text.split(" ")[0] === "!image") {
      chatBot.sendChatAction(chatID, "typing");

      if (!msg.text.split("!image ")[1]) {
        chatBot.sendMessage(chatID, fillerText.errors.noImageDes);
        return;
      }

      const result = await backOff(
        () => providers.fusionBrain.image(msg.text.split("!image ")[1]),
        {
          numOfAttempts: 2,
          startingDelay: 15000,
          retry: function (e, attemptNumber) {
            if (attemptNumber === this.numOfAttempts) {
              chatBot.sendMessage(chatID, fillerText.errors.retryRequestFailed);
              return false;
            }
            chatBot.sendChatAction(chatID, "typing");
            chatBot.sendMessage(chatID, fillerText.errors.tooManyRequests);
            return true;
          },
        }
      );

      chatBot.sendPhoto(chatID, result);
      return;
    }

    const listOfMessages = messagesHandler(chatBot, chatID, database, msg);

    if (listOfMessages.length > 0) {
      chatBot.sendChatAction(chatID, "typing");

      for (const item in providers) {
        try {
          const textProvider = providers[item].text;

          if (textProvider) {
            const result = await backOff(() => textProvider(listOfMessages), {
              numOfAttempts: 2,
              startingDelay: 10000,
              retry: function (e, attemptNumber) {
                if (attemptNumber === this.numOfAttempts) {
                  return false;
                }
                chatBot.sendChatAction(chatID, "typing");
                return true;
              },
            });

            chatBot.sendMessage(chatID, result);
            messagesHandler(chatBot, chatID, database, msg, result);
            return;
          }
        } catch (error) {
          console.log(error);
          continue;
        }
      }

      chatBot.sendMessage(chatID, fillerText.errors.retryRequestFailed);
      return;
    } else {
      chatBot.sendMessage(chatID, "Rewrite your request please " + String.fromCodePoint(0x270d));
      return;
    }
  } catch (error) {
    console.log(error);
    chatBot.sendMessage(msg.chat.id, fillerText.errors.unexpected);
    return;
  }
});
