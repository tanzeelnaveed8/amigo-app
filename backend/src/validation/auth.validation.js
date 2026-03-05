const Joi = require('joi');


const createUserInfoBody = {
  userName: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 30 characters',
    'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
    'any.required': 'Username is required'
  }),
  // password removed from API (strip if old clients still send it)
  password: Joi.any().strip(),
  firstName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'First name is required',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().max(50).optional().allow('', null).messages({
    'string.max': 'Last name must not exceed 50 characters',
  }),
  // email is optional for create-userinfo
  email: Joi.string().email().optional().allow('', null).messages({
    'string.email': 'Please provide a valid email address'
  }),
  phone: Joi.string().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  // phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow('', null).messages({
  //   'string.pattern.base': 'Please provide a valid phone number'
  // }),
  // bio removed from API (strip if old clients still send it)
  bio: Joi.any().strip(),
  fcmToken: Joi.string().optional(),
  otpToken: Joi.string().required().messages({
    'any.required': 'OTP token is required'
  }),
  emailOtpToken: Joi.string().optional().allow('', null),
  emailVerified: Joi.string().optional().allow('', null),
  inviteCode: Joi.string().optional().allow('', null),
  paymentVerified: Joi.string().optional().allow('', null)
};


module.exports = {
  
  createUserInfoValidation: {
    body: Joi.object().keys(createUserInfoBody),
  }
};
