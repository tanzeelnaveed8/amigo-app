const regexPatterns = {
  username: /^(?=(?:[^a-zA-Z]*[a-zA-Z]){3})[a-zA-Z0-9_]+$/,
  password: /(?=.*?[0-9])(?=.*?[#?!@$%^&*-.£…]).{8,}/,
  email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/,
  email2: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  fname: /^[a-zA-Z ]*$/,
  organizationname: /^[a-z0-9_ ]*$/,
  url: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
  x: /http(?:s)?:\/\/(?:www\.)?x\.com\/([a-zA-Z0-9_]+)/,
  tellertag: /^@[A-Za-z0-9_](?=.{3,19}$)[A-Za-z0-9_.]*[^_.]$/,
  hashtags: /#\w+/g,
  facebook: /^(?:(?:http|https):\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i,
  Youtube: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/,
  instagram: /(?:http|https):\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_\.]+/,
  tiktok: /(?:http|https):\/\/(?:www\.)?tiktok\.com\/@?[a-zA-Z0-9_]+\/video\/[a-zA-Z0-9_]+/,
  oneCharacterRegex: /^.*[a-zA-Z].*$/
};
export default regexPatterns;
