const axios = require("axios");

async function HarperSaveMessage(userName, room, message, __createdtime__) {
  const dbUrl = process.env.HARBER_URL;
  const dbPW = process.env.HARBER_PW;
  if (!dbPW || !dbUrl) return;

  const data = JSON.stringify({
    operation: "insert",
    schema: "realtime_chat_app",
    table: "messages",
    records: [{ message, userName, room, __createdtime__ }],
  });

  const config = {
    method: "post",
    url: dbUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: dbPW,
    },
    data: data,
  };

  try {
    const response = await axios(config);

    return JSON.stringify(response.data);
  } catch (error) {
    console.log(error);
  }
}

module.exports = HarperSaveMessage;
