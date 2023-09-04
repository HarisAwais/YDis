function zeroSetter(date_time, option) {
  let modifiedDateTime = new Date(date_time);

  switch (option) {
    case "date":
      modifiedDateTime = new Date(modifiedDateTime.setUTCFullYear(1970, 0, 1));
      break;
    case "time":
      modifiedDateTime = new Date(modifiedDateTime.setUTCHours(0, 0, 0, 0));
      break;
    default:
      throw new Error("option must be date or time");
  }

  return modifiedDateTime.toISOString();
}

module.exports = zeroSetter;
