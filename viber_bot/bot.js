const fs = require("fs"); //Load the filesystem module
const ViberBot = require("viber-bot").Bot;
const BotEvents = require("viber-bot").Events;
const executeMessage = require("../viber_bot/messages/bot.messages");
const TextMessage = require("viber-bot").Message.Text;
const winston = require("winston");
const stringResources = require("../static/string.resources.json");
const KeyBoard = require("viber-bot").Message.Keyboard;
const dbSubscribers = require("../api/database/db.subscribers");
const keyboards = require("../static/keyboards.json");
const PictureMessage = require("viber-bot").Message.Picture;
const utils = require("../common/utils");
const enums = require("../common/enums");
const FileMessage = require("viber-bot").Message.File;
const URLMessage = require("viber-bot").Message.Url;
const logs = require("../api/database/logs");

function createLogger() {
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === "prod" ? "info" : "debug",
    format:
      process.env.NODE_ENV === "dev"
        ? winston.format.json()
        : winston.format.simple(),
    transports: [new winston.transports.Console()],
  });
  return logger;
}

const logger = createLogger();

const bot = new ViberBot({
  logger: logger,
  authToken: process.env.VIBER_TOKEN,
  name: process.env.VIBER_BOT_NAME,
  avatar: process.env.VIBER_BOT_AVATAR,
});

bot.onConversationStarted(
  async (userProfile, isSubscribed, context, onFinish) => {
    let language = userProfile.language == "ru" ? "ru" : "ro";
    var keyboard = keyboards[`${language}-subscribe`];
    bot.sendMessage(
      userProfile,
      new TextMessage(`${stringResources["Subscribe"][language]}`, keyboard)
    );
    let user = await dbSubscribers.findByViberId(userProfile.id);
    if (!user) {
      const userDetails = await bot.getUserDetails(userProfile);
      os = utils.getOsType(userDetails.primary_device_os);
      user = await dbSubscribers.createSubscriber(userProfile, userDetails);
    }
    await dbSubscribers.updateCurrentStep(
      userProfile.id,
      enums.CurrentStep.Subscribing
    );
  }
);
bot.on("delivered", async (m) => {
  console.log(m);
});
bot.on("seen", async (m) => {
  console.log(m);
});

bot.on(BotEvents.ERROR, (err) => console.log("erroorrr bot", err));
bot.on(BotEvents.UNSUBSCRIBED, (response) => {
  console.log("unsubscribe : ", response);
});

bot.on(BotEvents.MESSAGE_RECEIVED, async (message, response) => {
  try {
    let user = await dbSubscribers.findByViberId(response.userProfile.id);
    if (!user) {
      const userDetails = await bot.getUserDetails(response.userProfile);
      user = await dbSubscribers.createSubscriber(
        response.userProfile,
        userDetails
      );
    }
    if (user.name == 'Наталья') {
      const logPayload = {
        text: "Incoming message",
        user,
        message,
      };
      logs.insertLog(logPayload, enums.LogLevels.Info);
    }
    return await executeMessage(message, response, bot, user);
  } catch (ex) {
    console.log("Executing error : ", ex);
  }
});

bot.onTextMessage(/.*/, (message, response) => {
  const payload = message.text;

  if (payload === 'BUTTON_START') {
    console.log('🚀 User pressed START button');
    // handle button press
  } else if (payload === 'BUTTON_HELP') {
    console.log('🆘 User pressed HELP button');
  } else {
    console.log('📝 User typed:', payload);
    // handle free text
  }
});

async function SendMessagesToUser(user, message, isPicture) {
  try {
    const userProfile =
      user.userProfile != null ? user.userProfile : user.user_profile;
    const os = utils.getOsType(user.user_details.primary_device_os);
    let language = userProfile.language == "ru" ? "ru" : "ro";
    var SAMPLE_KEYBOARD = keyboards[`${language}-${os}`]["main_menu"];
    const extension = isPicture ? utils.getFileExtension(message.url) : "";
    if (
      extension == "png" ||
      extension == "PNG" ||
      extension == "jpg" ||
      extension == "jpeg"
    ) {
      const message1 = new PictureMessage(
        message.url,
        message.text,
        message.url
      );
      var response = await bot.sendMessage(userProfile, message1);
      console.log(response);
    } else if (extension == "pdf") {
      await bot.sendMessage(userProfile, new URLMessage(message.url));
    } else {
      await bot.sendMessage(userProfile, new TextMessage(message));
    }
    setTimeout(() => {
      bot.sendMessage(
        userProfile,
        new KeyBoard(SAMPLE_KEYBOARD, null, null, null, 6)
      );
    }, 1500);
  } catch (error) {
    console.log("rrrr", error);
    throw error;
  }
}

module.exports = {
  bot: bot,
  sendMessage: SendMessagesToUser,
};
