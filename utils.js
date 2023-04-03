import fs from "fs/promises";
import { GoogleSpreadsheet } from "google-spreadsheet";
import * as dotenv from "dotenv";
dotenv.config();

async function usersTracking(filePath, msg) {
  try {
    await fs.access(filePath);
  } catch (err) {
    await fs.writeFile(filePath, "[]");
  }

  const fileData = JSON.parse(await fs.readFile(filePath));
  const userData = {
    username: msg.from.username,
    numOfMessages: 1,
    message: msg.text.length >= 75 ? `${msg.text.slice(0, 75)}...` : msg.text,
    message_date: new Date(msg.date * 1000).toLocaleString("ru-RU"),
    language_code: msg.from.language_code,
    is_bot: msg.from.is_bot,
  };

  if (fileData.some((user) => user.username === msg.from.username)) {
    fileData.forEach((user) => {
      if (user.username === msg.from.username) {
        user.numOfMessages += 1;
        user.message = msg.text.length >= 75 ? `${msg.text.slice(0, 75)}...` : msg.text;
        user.message_date = new Date(msg.date * 1000).toLocaleString("ru-RU");
      }
    });
    await fs.writeFile(filePath, JSON.stringify(fileData));
    return;
  }

  fileData.push(userData);
  await fs.writeFile(filePath, JSON.stringify(fileData));
  return;
}

async function toGoogleSheet(sheetTitle, filePath, loginName) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET);
    const credentials = await fs.readFile("./googleCredentials.json");

    await doc.useServiceAccountAuth(JSON.parse(credentials));
    await doc.loadInfo();

    const fileData = JSON.parse(await fs.readFile(filePath));
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();

    rows.forEach((row) => {
      if (row._rawData[0] === loginName) {
        const { username, numOfMessages, message, message_date, language_code, is_bot } =
          fileData.find((user) => user.username === loginName);

        row._rawData = [username, numOfMessages, message, message_date, language_code, is_bot];
        row.save();
        return;
      }
    });

    if (!rows.some((row) => row._rawData[0] === loginName)) {
      const user = fileData.find((user) => user.username === loginName);
      sheet.addRow(user);
    }

    return;
  } catch (error) {
    console.log(error.message);
  }
}

export { usersTracking, toGoogleSheet };
