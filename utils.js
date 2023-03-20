import fs from "fs/promises";

async function usersTracking(filePath, msg) {
  try {
    await fs.access(filePath);
  } catch (err) {
    await fs.writeFile(filePath, "[]");
  }

  const fileData = JSON.parse(await fs.readFile(filePath));
  const userData = {
    username: msg.from.username,
    message: msg.text,
    message_date: new Date(msg.date * 1000).toLocaleString(),
    language_code: msg.from.language_code,
    is_bot: msg.from.is_bot,
  };

  if (fileData.some((user) => user.username === msg.from.username)) {
    return;
  }

  fileData.push(userData);
  await fs.writeFile(filePath, JSON.stringify(fileData));

  return;
}

export { usersTracking };
