const fillerText = {
  greetings: `This bot has ChatGPT artificial intelligence features. You can ask him various questions and he may even answer them correctly.
  \nThis bot can remember the context of the messages, but the context is limited to 10 messages. After reaching this limit, a message will be displayed and the memory of previous requests will be cleared.
  \nYou can manually clear context by sending '/resetcontext' command.
  \nAlso you can generate images using this bot, type '/imagegeneration' command to see more details.
  \nHave fun !
  `,
  resetContext: "Context has been reset " + String.fromCodePoint(0x2705),
  imageGen: `To generate image just type:
  \n"<b>!image [your description of an image]</b>"
  \nIt will be better to write request in English (square brackets are not required)\nP.S. Generating the image may take some time, so be patient and better not write any queries until the image is generated`,
  errors: {
    unexpected: `An unexpected error occurred, please try again later... ${String.fromCodePoint(
      0x1f62d
    )}`,
    tooManyRequests: `${String.fromCodePoint(
      0x231b
    )} There are currently too many requests being sent to the bot so the bot cannot process them all: Trying to resend your request...`,
    retryRequestFailed: `${String.fromCodePoint(
      0x274c
    )} Retry request failed, please try again later`,
    tooLongMsg: `Your message is too long... ${String.fromCodePoint(0x1f625)}`,
    onlyTextAllowed: `Sorry, but I can understand only text messages ${String.fromCodePoint(
      0x1f625
    )}`,
    noImageDes: 'Please write request as "!image [your image description]"',
  },
};

export default fillerText;
