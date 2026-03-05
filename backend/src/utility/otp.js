const generateOTP = () => {
  let digits = '0123456789';
  let OTP = '';
  let usedDigits = [];

  // Iterate over the digits variable and add each digit to the OTP string
  for (let i = 0; i < 6; i++) {
      let index;
      do {
          index = Math.floor(Math.random() * digits.length);
      } while (usedDigits.includes(digits[index]));
      
      usedDigits.push(digits[index]);
      OTP += digits[index];
  }

  // Return the OTP string
  return OTP;
};
module.exports={generateOTP}