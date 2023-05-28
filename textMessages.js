const fillerText = {
  greetings: `This bot has ChatGPT artificial intelligence features. You can ask him various questions and he may even answer them correctly.
  \nThis bot can remember the context of the messages, but the context is limited to 10 messages. After reaching this limit, a message will be displayed and the memory of previous requests will be cleared.
  \nYou can manually clear context by sending '/resetcontext' command.
  \nAlso you can generate images using this bot, type '/imagegeneration' command to see more details.
  \nHave fun !
  `,

  error: `An unexpected error occurred, please try again later... ${String.fromCodePoint(0x1f62d)}
  \nP.S. You can write to the creator of the bot @HireHoffee, this can help solve the problem faster.`,

  imageGen: `To generate image just type "/image [your description of an image]" (square brackets are not required)
  \nP.S. Generating the image may take some time, so be patient and better not write any queries until the image is generated`,
};

export default fillerText;
