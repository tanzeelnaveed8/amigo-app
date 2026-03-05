const { objectId, password }  = require('./custom.validation.js');
const validate = require('./validate.middleware.js');
module.exports = { objectId, password, validate };
