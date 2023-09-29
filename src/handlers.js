function messagesHandler(chatBot, chatID, database, msg, msgAI) {
  const listOfMessages = [];

  if (msgAI) {
    const msgObj = {
      from: {
        id: msg.from.id,
        first_name: "ai_response",
      },
      text: msgAI,
    };
    database.DB.push(msgObj);
    return;
  }

  database.DB.push(msg);
  database.DB.forEach((item) => {
    if (item.from.id === msg.from.id) {
      item.from.first_name === "ai_response"
        ? listOfMessages.push({ role: "assistant", content: item.text })
        : listOfMessages.push({ role: "user", content: item.text });
    }
  });

  if (listOfMessages.length >= 10) {
    database.filterDB(msg.from.id);
    listOfMessages.length = 0;
    chatBot.sendMessage(chatID, "Context memory reset " + String.fromCodePoint(0x1f92f));
  }

  return listOfMessages;
}

export { messagesHandler };
