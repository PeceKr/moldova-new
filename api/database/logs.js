const { getDb } = require("./client");

async function insertLog(log, log_level) {
  try {
    const db = await getDb();
    return await db
      .collection("logs")
      .insertOne({ log: log, log_level: log_level, date: new Date() });
  } catch (error) {
    console.log("insertLog , reason :", error);
    throw error;
  }
}

module.exports = {
  insertLog,
};
