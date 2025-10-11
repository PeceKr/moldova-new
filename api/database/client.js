// api/database/client.js
const { MongoClient } = require("mongodb");
const dbConfig = require("./db.config.json");

let client;
let db;

async function connect() {
  if (db) return db;

  const uri = `mongodb://${process.env.DB_USERNAME}:${encodeURIComponent(
    process.env.DB_PASSWORD
  )}@${process.env.DB_URL}?authSource=admin`;

  // Create and connect the client (no callback => returns a Promise)
  client = new MongoClient(uri, {
    // optional but helpful:
    maxPoolSize: 10,
    retryWrites: true,
  });

  await client.connect();

  db = client.db(process.env.DATABASE_NAME);

  // Ensure desired collections exist
  const existing = await db.collections();
  const names = new Set(existing.map(c => c.collectionName));
  for (const colName of dbConfig.Collections || []) {
    if (!names.has(colName)) {
      await db.createCollection(colName);
    }
  }

  console.log("Database connection success");
  return db;
}

async function getDb() {
  if (db) return db;
  return connect();
}

module.exports = { getDb, connect };
