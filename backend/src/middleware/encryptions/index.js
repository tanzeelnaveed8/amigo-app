const bcrypt = require('bcrypt');


const encryption=async(data)=>{
    const StringData=String(data)
    try {
        const saltRounds = 10;
        const hashedData = await bcrypt.hash(StringData, saltRounds);
        return hashedData;
    } catch (error) {
        throw error;
    }
}

const decrypt = async (data, hashedData) => {
  // //// console.log('Data to be decrypted:', data);
  // //// console.log('Hashed data from database:', hashedData);
  try {
      const StringData = String(data);
      // //// console.log('Stringified data for comparison:', StringData);

      // Compare the hashed data with the plaintext data
      const match = await bcrypt.compare(StringData, hashedData);
      // //// console.log('Match:', match);
      return match;
  } catch (error) {
      throw error;
  }
};


module.exports={encryption,decrypt}