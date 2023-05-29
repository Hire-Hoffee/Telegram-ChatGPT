const fillerText = {
  greetings: `This bot has ChatGPT artificial intelligence features. You can ask him various questions and he may even answer them correctly.
  \nThis bot can remember the context of the messages, but the context is limited to 10 messages. After reaching this limit, a message will be displayed and the memory of previous requests will be cleared.
  \nYou can manually clear context by sending '/resetcontext' command.
  \nAlso you can generate images using this bot, type '/imagegeneration' command to see more details.
  \nHave fun !
  `,

  errors: {
    unexpected: `An unexpected error occurred, please try again later... ${String.fromCodePoint(
      0x1f62d
    )}
    \nP.S. You can write to the creator of the bot @HireHoffee, this can help solve the problem faster.`,

    tooManyRequests: `${String.fromCodePoint(
      0x231b
    )} Too many requests are currently being sent to the bot: trying to resend your request...`,

    retryRequestFailed: `${String.fromCodePoint(
      0x274c
    )} Retry request failed, please try again later`,

    tooLongMsg: `Your message is too long... ${String.fromCodePoint(0x1f625)}`,

    onlyTextAllowed: `Sorry, but I can understand only text messages ${String.fromCodePoint(
      0x1f625
    )}`,
  },

  imageGen: `To generate image just type "/image [your description of an image]" (square brackets are not required) and it will be better to write request in English
  \nP.S. Generating the image may take some time, so be patient and better not write any queries until the image is generated`,
};

export default fillerText;
