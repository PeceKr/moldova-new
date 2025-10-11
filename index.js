"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const bot = require("./viber_bot/bot").bot;
const path = require("path");
const DbConnection = require("./api/database/client");

DbConnection.connect();

app.use(express.static("public"));
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "build")));
app.use(
  "/public/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);
app.use("/viber/webhook", bot.middleware());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

const subscribersRoutes = require("./api/routes/subscirbers");

app.use("/api/v1", subscribersRoutes);

app.use("/test", function (req, res, next) {
  console.log("ok");
  res.send("ok");
});

app.use("/email", async function (req, res, next) {
  await sendEmail("pece.krstevski11@gmail.com", "Test", "Test", "Test");
  console.log("ok");
  res.send("ok");
});

const port = process.env.PORT || 3009;
console.log(`Running in ${process.env.NODE_ENV} mode`);

app.listen(port, async () => {
  console.log(`Server running on port: ${port}`);
  try {
    const webhookUrl = process.env.NODE_ENV === "prod"
      ? `${process.env.PUBLIC_URL}/viber/webhook`
      : "https://a3a80e254fd9.ngrok-free.app/viber/webhook";

    await bot.setWebhook(webhookUrl);
    console.log(`Viber Webhook set: ${webhookUrl}`);
  } catch (error) {
    console.error("Failed to set webhook:", error);
    process.exit(1);
  }
});
