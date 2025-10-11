var DbConnection = require("./client");
var ObjectId = require("mongodb").ObjectID;

async function insertLog(log, log_level) {
  try {
    let db = await DbConnection.Get();
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
