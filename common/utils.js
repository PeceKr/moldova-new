const enums = require("./enums");

function isWorkingHour() {
  const now = new Date();
  return (
    now.getDay() >= 1 &&
    now.getDay() <= 5 &&
    now.getHours() >= 8 &&
    now.getHours() < 16
  );
}

function replaceURL(val) {
  var exp =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return val.replace(exp, "<a href='$1'>$1</a>");
}

function updateHaystack(input, needle) {
  return input.replace(
    new RegExp("(^|\\s)(" + needle + ")(\\s|$)", "ig"),
    "$1<b>$2</b>$3"
  );
}

const OneHourAgo = (date) => {
  const hour = 1000 * 60 * 60;
  const hourago = Date.now() - hour;

  return date < hourago;
};

const TwoHourAgo = (date) => {
  const hour = 1000 * 60 * 60 * 2;
  const twoHourAgo = Date.now() - hour;

  return date < twoHourAgo;
};

function correctPhone(phone) {
  const regex = /^3897\d{7}/g;
  const test = regex.test(phone);
  console.log(test);
  return test;
}

const ValidPhone = (phone) => {
  if (phone !== "" && isNaN(phone) && phone.length < 9) return false;
  return true;
};
function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function calculateDate(day) {
  const dayNumber = enums.Day[day];

  let date = new Date();

  if (dayNumber > date.getDay()) {
    date.setDate(date.getDate() + dayNumber - date.getDay());
  } else {
    date.setDate(date.getDate() + (7 - (date.getDay() - dayNumber)));
  }

  const newDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );
  return newDate;
}

function returnDayFromNumber(number) {
  switch (number) {
    case 1:
      return "Понеделник";
    case 2:
      return "Вторник";
    case 3:
      return "Среда";
    case 4:
      return "Четврток";
    case 5:
      return "Петок";
    case 6:
      return "Сабота";
    case 0:
      return "Недела";
  }
}

const zeroPad = function (minutes) {
  return ("0" + minutes).slice(-2);
};

function getOsType(device) {
  const deviceString = device.toString();
  if (deviceString.includes("iOS")) {
    return "ios";
  } else {
    return "android";
  }
}

function getFileExtension(url) {
  // Extract the part of the URL after the last dot
  const dotIndex = url.lastIndexOf(".");

  if (dotIndex === -1) {
    // If there is no dot in the URL, there is no extension
    return null;
  }

  const extension = url.substring(dotIndex + 1).toLowerCase();
  return extension;
}

module.exports = {
  isWorkingHour,
  replaceURL,
  updateHaystack,
  OneHourAgo,
  TwoHourAgo,
  ValidPhone,
  validateEmail,
  calculateDate,
  returnDayFromNumber,
  zeroPad,
  correctPhone,
  getOsType,
  getFileExtension,
};
