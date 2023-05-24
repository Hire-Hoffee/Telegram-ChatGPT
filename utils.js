import fs from "fs/promises";
import { GoogleSpreadsheet } from "google-spreadsheet";
import * as dotenv from "dotenv";
dotenv.config();

async function toGoogleSheet(sheetTitle, msg) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET);
    const credentials = await fs.readFile("./googleCredentials.json");

    await doc.useServiceAccountAuth(JSON.parse(credentials));
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();

    msg.from.username = msg.from.username ? msg.from.username : "unknown";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row._rawData[0] === msg.from.username) {
        row._rawData[1] = Number(row._rawData[1]) + 1;
        row._rawData[2] = msg.text.length >= 75 ? `${msg.text.slice(0, 75)}...` : msg.text;
        row._rawData[3] = new Date(msg.date * 1000).toLocaleString("ru-RU");
        row.save();
        return;
      }
    }

    const userData = {
      username: msg.from.username,
      numOfMessages: 1,
      message: msg.text.length >= 75 ? `${msg.text.slice(0, 75)}...` : msg.text,
      message_date: new Date(msg.date * 1000).toLocaleString("ru-RU"),
      language_code: msg.from.language_code,
      is_bot: msg.from.is_bot,
    };

    sheet.addRow(userData);
    return;
  } catch (error) {
    console.log(error.message);
  }
}

export { toGoogleSheet };
