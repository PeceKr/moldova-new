const keyboards = require("../../static/keyboards.json");
const KeyBoard = require("viber-bot").Message.Keyboard;
const dbSubscribers = require("../../api/database/db.subscribers");
const TextMessage = require("viber-bot").Message.Text;
const urlMessage = require("viber-bot").Message.Url;
const stringResources = require("../../static/string.resources.json");
const utils = require("../../common/utils");
const external = require("../../api/external.calls");
const enums = require("../../common/enums");
const FileMessage = require("viber-bot").Message.File;

async function executeMessage(message, response, bot, user) {
  console.log(message);
  let language = response.userProfile.language == "ru" ? "ru" : "ro";
  var SAMPLE_KEYBOARD =
    keyboards[
    `${language}-${utils.getOsType(user.user_details.primary_device_os)}`
    ]["main_menu"];
  if (message instanceof FileMessage) {
    await external.sendToMoldovaFile(user.viber_id, user.name, message);
    return;
  }

  switch (message.text) {
    case "BTN_UPLOAD_DOCS":
      await bot.sendMessage(
        response.userProfile,
        new TextMessage(
          `Bună ziua, vă rugăm să urmați pașii:
      
1. Accesați pagina IuteCredit Partner UI.  
2. Găsiți clientul dvs.  
3. Apăsați butonul – Gestionează documentele.  
4. Apăsați butonul – Încarcă.

\* În cazul în care nu aveți acces la Partner UI, vă rugăm să atașați documentul aici.`,
          SAMPLE_KEYBOARD
        )
      );
      break;


    case "BTN_CANCEL_REQUEST":
      await bot.sendMessage(response.userProfile, new TextMessage(`Bună ziua ,va rugăm să inițiați anularea cererii prin intermediul sistemului 1C sau prin Partener UI.`, SAMPLE_KEYBOARD));
      break;

    case "BTN_MODIFY_NUMBER_SUM":
      await bot.sendMessage(response.userProfile, new TextMessage(`Bună ziua, în cazul în care Dvs doriți să modificați suma creditului, vă rugăm să indicați nume/prenume, IDNP-ul clientului, și suma pentru modificare

În cazul în care Dvs doriți să modificați numărul de telefon, vă rugăm sa indicați numărul nou al clientului`, SAMPLE_KEYBOARD));
      break;

    case "BTN_CONTRACT_STATUS":
      await bot.sendMessage(response.userProfile, new TextMessage(`Bună ziua, va rugăm să ne oferiți numărul contractului, și solicitarea Dvs.`, SAMPLE_KEYBOARD));
      break;

    case "BTN_CALL_CLIENT": {
      await bot.sendMessage(response.userProfile, new TextMessage(`Bună ziua , vă rugăm să indicați nume/prenume, IDNP-ul, și numărul de telefon al clientului.`, SAMPLE_KEYBOARD));
      break;
    }

    case "BTN_SUBSCRIBE_FIRST_TIME":
      await bot.sendMessage(response.userProfile, new TextMessage("Mulțumim! V-ați abonat."));
      break;

    default:
      // Not a button payload => treat as free text      
      await external.sendToMoldova(
        user.viber_id,
        user.name,
        message.text,
        message.url
      );
      bot.sendMessage(
        response.userProfile,
        new KeyBoard(SAMPLE_KEYBOARD, null, null, null, 6)
      );
      break;
  }

  await dbSubscribers.updateCurrentStep(user.viber_id, null);

}


module.exports = executeMessage;
