const { to } = require("await-to-js");
const moment = require("moment");
const crypto = require("crypto");

module.exports.to = async (promise) => {
  let err, res;
  [err, res] = await to(promise);
  if (err) return [err];
  return [null, res];
};

module.exports.ReE = function (res, err, code) {
  // Error Web Response
  if (typeof err == "object" && typeof err.message != "undefined") {
    err = err.message;
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json({ success: false, error: err });
};

module.exports.ReS = function (res, data, code) {
  // Success Web Response
  let send_data = { success: true };

  if (typeof data == "object") {
    send_data = Object.assign(data, send_data); //merge the objects
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);
};

module.exports.TE = function (err_message, log) {
  // TE stands for Throw Error
  if (log === true) {
    console.error(err_message);
  }

  throw new Error(err_message);
};

function isNull(field) {
  return typeof field === "undefined" || field === "" || field === null;
}

module.exports.isNull = isNull;

function isEmpty(obj) {
  return !Object.keys(obj).length > 0;
}

module.exports.getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

module.exports.isEmpty = isEmpty;

module.exports.isEmail = (email) => {
  const emailFormat =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailFormat.test(String(email));
};

module.exports.validationFields = async (fields, body) => {
  let feildsCheck = await fields.filter((x) => {
    if (isNull(body[x])) {
      return true;
    }
  });

  if (!isEmpty(feildsCheck)) return feildsCheck;
};

module.exports.dateCount = async (formdate, enddate) => {
  //define moments for the startdate and enddate
  var startdateMoment = moment(formdate, "DD.MM.YYYY");
  var enddateMoment = moment(enddate, "DD.MM.YYYY");

  if (startdateMoment.isValid() === true && enddateMoment.isValid() === true) {
    var days = enddateMoment.diff(startdateMoment, "days");
    return days;
  } else {
    return undefined;
  }
};

module.exports.convertedIOSDate = async (data) => {
  let date = moment(data).format("DD");
  let months = moment(data).format("MM");
  let Year = moment(data).format("YYYY");

  return `${Year}-${months}-${date}T00:00:00Z`;
};

module.exports.convertedIOSToDate = async (data) => {
  let date = moment(data).format("DD");
  let months = moment(data).format("MM");
  let Year = moment(data).format("YYYY");

  return `${Year}-${months}-${date}T23:59:00Z`;
};