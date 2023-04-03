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
    message_date: new Date(msg.date * 1000).toLocaleString(),
    language_code: msg.from.language_code,
    is_bot: msg.from.is_bot,
  };

  if (fileData.some((user) => user.username === msg.from.username)) {
    fileData.forEach((user) => {
      if (user.username === msg.from.username) {
        user.numOfMessages += 1;
        user.message = msg.text.length >= 75 ? `${msg.text.slice(0, 75)}...` : msg.text;
        user.message_date = new Date(msg.date * 1000).toLocaleString();
      }
    });
    await fs.writeFile(filePath, JSON.stringify(fileData));
    return;
  }

  fileData.push(userData);
  await fs.writeFile(filePath, JSON.stringify(fileData));
  return;
}

async function toGoogleSheet(sheetTitle, filePath) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET);
    const credentials = await fs.readFile("./googleCredentials.json");

    await doc.useServiceAccountAuth(JSON.parse(credentials));
    await doc.loadInfo();

    const usersData = JSON.parse(await fs.readFile(filePath));

    if (doc.sheetsByTitle[sheetTitle]) {
      doc.sheetsByTitle[sheetTitle].delete();
    }

    await doc.addSheet({ headerValues: Object.keys(usersData[0]), title: sheetTitle });
    const sheet = doc.sheetsByTitle[sheetTitle];
    sheet.addRows(usersData);
  } catch (error) {
    console.log(error.message);
  }
}

export { usersTracking, toGoogleSheet };
