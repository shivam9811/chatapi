const axios = require("axios");

async function harperGetMessages(room) {
  const dbUrl = process.env.HARBER_URL;
  const dbPw = process.env.HARBER_PW;
  if (!dbUrl || !dbPw) return null;

  let data = JSON.stringify({
    operation: "sql",
    sql: `SELECT * FROM realtime_chat_app.messages WHERE room = '${room}' LIMIT 100`,
  });
  const config = {
    method: "post",
    url: dbUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: dbPw,
    },
    data: data,
  };

  const response = await axios(config);
  return JSON.stringify(response.data);
}

module.exports = harperGetMessages;
