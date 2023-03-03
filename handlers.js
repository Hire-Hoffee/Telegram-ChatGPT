function messagesHandler(chatBot, chatID, database, msg) {
  const userMessages = [];

  database.DB.push(msg);
  database.DB.forEach((item) => {
    if (item.from.id === msg.from.id) {
      userMessages.push({ role: "user", content: item.text });
    }
  });

  if (userMessages.length === 50) {
    database.filterDB(msg.from.id);
    userMessages.length = 0;
    chatBot.sendMessage(chatID, "Context memory reset " + String.fromCodePoint(0x1f92f));
  }

  return userMessages;
}

export { messagesHandler };
