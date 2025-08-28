// backend/src/utils/generateVerificationCode.js
const generateVerificationCode = () => {
  // Generuj 6-cyfrowy kod
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateVerificationCode;