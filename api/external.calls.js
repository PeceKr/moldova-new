const axios = require("axios");
const logs = require("../api/database/logs");
const enums = require("../common/enums");
const https = require("https");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const { dirname } = require("path");
const { getFileExtension } = require("../common/utils");

async function post(url, req) {
  let request = JSON.stringify(req);
  await axios
    .post(url, request)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new ApplicationError(err.message, err.status);
    });
}

async function sendSMS(phoneNumber, code) {
  const url = `http://api.rmlconnect.net:8080/bulksms/bulksms?username=${process.env.SMS_USERNAME}&password=${process.env.SMS_PASSWORD}&type=0&dlr=1&destination=${phoneNumber}&source=OSistina&message=Code:${code}`;
  await axios
    .post(url)
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

async function sendeReferSMS(userPhone, ReferphoneNumber) {
  const url = `http://api.rmlconnect.net:8080/bulksms/bulksms?username=${process.env.SMS_USERNAME}&password=${process.env.SMS_PASSWORD}&type=0&dlr=1&destination=${ReferphoneNumber}&source=OSistina&message=Pocituvani dobivte preporaka od prijatelot so broj ${userPhone} za da se registrirate i koristite povolnosti od Kodot na Doverba na Sistina Oftalmologija`;
  await axios
    .post(url)
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

async function sendToMoldova(viber_id, viber_name, text, image_url) {
  const url = process.env.MOLDOVA_PUBLIC_URL;
  const config = {
    headers: { Authorization: `Bearer ${process.env.MOLDOVA_TOKEN}` },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };
  const bodyParams = {
    viber_id,
    viber_name,
    text,
    image_url,
    to: "moldova",
  };

  try {
    const call = await axios.post(url, bodyParams, config);
    logs.insertLog(
      { status: call.status, config: call.config },
      enums.LogLevels.Info
    );
  } catch (error) {
    console.log(error);
  }
}

async function sendToMoldovaFile(viber_id, viber_name, file_message) {
  const appDir = dirname(require.main.filename);
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const extension = getFileExtension(file_message.filename);
  const fileName = `${timestamp}.${extension}`;
  const localFilePath = path.join(`${appDir}/public/uploads`, fileName);

  downloadFile(file_message.url, localFilePath, fileName)
    .then(() => {
      sendToMoldova(
        viber_id,
        viber_name,
        ``,
        `${process.env.PUBLIC_URL}/uploads/${fileName}`
      );
    })
    .catch((error) => {
      console.error("Error downloading file:", error.message);
    });
}

async function downloadFile(url, destination) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  });

  // Pipe the response stream to a file
  response.data.pipe(fs.createWriteStream(destination));

  return new Promise((resolve, reject) => {
    response.data.on("end", () => resolve());
    response.data.on("error", (err) => reject(err));
  });
}

module.exports = {
  sendSMS,
  post,
  sendeReferSMS,
  sendToMoldova,
  sendToMoldovaFile,
};
