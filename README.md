# Telegram Chat Bot with GPT features

This project is a Telegram bot that provides users with the ability to communicate with a neural networks using the features of ChatGPT and other APIs.

### [Link to bot](https://t.me/chatting_gpt3_bot)

<br/>

![Dark theme](https://i.imgur.com/sqAjUqA.png "Dark theme")

#### Functionality:

- **Communicating with ChatGPT:** Users can send text messages to the bot, and receive responses generated by ChatGPT (or other APIs).
- **Image generation:** The bot can generate images from a user's text description using the FusionBrain API.
- **Context Memoization:** The bot remembers the context of the last 10 messages in a conversation with each user, allowing for a more natural dialog.
- **Reset Context:** Users can reset the context of a conversation using the `/resetcontext` command.
- **User Logging:** Information about users and their last post is stored in Google Table.

### Technologies:

- **Node.js:** The server side of the bot is written in Node.js.
- **Telegram Bot API:** Used to interact with Telegram API.
- **OpenAI, FusionBrain, Groq, G4F APIs:** Used to access the neural network.
- **Google Sheets API:** Used to record information about users and their messages.

### Project Structure:

- **index.js:** The main project file that starts the bot and handles incoming messages.
- **botConfig.js:** Contains configuration for connecting to Telegram Bot API.
- **handlers.js:** Contains functions to process user messages, including saving context and sending requests to the API.
- **messagesDB.js:** Implements a simple database for storing message context.
- **textMessages.js:** Contains text messages used by the bot.
- **utils.js:** Contains helper functions such as writing data to Google Table.
- **api/:** Folder containing configuration files for various APIs:
  - **openaiAPIConfig.js:** Configuration for OpenAI APIs.
  - **g4fAPIConfig.js:** Configuration for G4F API.
  - **fusionBrainAPIConfig.js:** Configuration for FusionBrain API.
  - **groqCloudAPIConfig.js:** Configuration for Groq Cloud API.

### Project startup:

1. Clone the project repository.
2. Install the dependencies: `npm install`.
3. Create an `.env` file and add the following environment variables described in `.env.example` file
4. Generate the `googleCredentials.json` file on Google Cloud Platform.
5. Run the project: `npm run pm_start`.

#### Additional information:

- The project uses `exponential-backoff` to resend API requests in case of errors.
- You can change the list of APIs used by adding or removing the corresponding configuration files in the `api` folder.

### Conclusion:

This project is a simple but functional Telegram bot that demonstrates the possibilities of using ChatGPT and other APIs to create interactive bots. You can use this project as a starting point for creating your own bots with advanced functionality.
