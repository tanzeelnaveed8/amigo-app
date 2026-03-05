const Joi = require('joi');
const pick = require('../pick');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);
    
    if (error) {
        const fieldErrors = {};
        error.details.forEach((detail) => {
            const key = detail.path.join('.');
            fieldErrors[key] = detail.message;
        });
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return res.status(400).json({
            message: errorMessage,
            status: 400,
            errors: error.details.map(detail => detail.message)
        });
    }
    Object.assign(req, value);
    return next();
};

module.exports = validate;
