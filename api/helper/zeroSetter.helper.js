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

// function generateRandomString(length) {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let randomString = '';
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     randomString += characters.charAt(randomIndex);
//   }
//   return randomString;
// }
// module.exports = generateRandomString