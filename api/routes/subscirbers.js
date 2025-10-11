const express = require("express");
const router = express.Router();
const auth = require("../services/auth");
const dbSubscribers = require("../database/db.subscribers");
const bot = require("../../viber_bot/bot");
const logs = require("../database/logs");

router.post("/send-message", async (req, res, next) => {
  try {
    logs.insertLog({ type: "message", body: req.body, header: req.headers }, 1);
    // Validate api-key
    if (!req.header("API-KEY")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!(await auth.validateAPIKey(req.header("API-KEY"))))
      return res.status(401).json({ message: "Unauthorized" });

    // Validate viber_id
    if (!req.body.viber_id) {
      return res.status(400).json({ message: "Viber_id is required" });
    }

    var user = await dbSubscribers.findByViberId(req.body.viber_id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Subscriber with provided viber_id doesn’t exist" });
    }
    if (!req.body.text && !req.body.image_url) {
      // Validate provided text
      return res.status(400).json({ message: "Message content is required" });
    }

    const message =
      req.body.image_url != null && req.body.image_url != ""
        ? {
            text: req.body.text,
            url: req.body.image_url,
            isPicture: req.body.image_url != null && req.body.image_url != "",
          }
        : req.body.text;

    await bot.sendMessage(user, message, message.isPicture);

    return res.status(200).json({ message: "message successfully sent" });
  } catch (error) {
    console.log(error);
    logs.insertLog(error, 2);
    return res.status(500).json({
      error,
    });
  }
});

module.exports = router;
