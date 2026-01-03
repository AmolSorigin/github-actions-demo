import Joi from 'joi';

// Push notification validation schema for FCM
export const publishPushNotificationSchema = Joi.object({
  platformApplicationArn: Joi.string().trim().min(1).required().messages({
    'any.required': 'platformApplicationArn is required',
    'string.empty': 'platformApplicationArn cannot be empty',
    'string.min': 'platformApplicationArn must be at least 1 character',
  }),
  deviceToken: Joi.string().trim().min(1).required().messages({
    'any.required': 'deviceToken is required',
    'string.empty': 'deviceToken cannot be empty',
    'string.min': 'deviceToken must be at least 1 character',
  }),
  message: Joi.string().trim().min(1).max(2000).required().messages({
    'any.required': 'message is required',
    'string.empty': 'message cannot be empty',
    'string.min': 'message must be at least 1 character',
    'string.max': 'message must not exceed 2000 characters',
  }),
  title: Joi.string().trim().min(1).max(100).optional().messages({
    'string.empty': 'title cannot be empty',
    'string.min': 'title must be at least 1 character',
    'string.max': 'title must not exceed 100 characters',
  }),
  badge: Joi.number().integer().min(0).optional().messages({
    'number.base': 'badge must be a number',
    'number.integer': 'badge must be an integer',
    'number.min': 'badge must be 0 or greater',
  }),
  sound: Joi.string().trim().min(1).max(50).optional().messages({
    'string.empty': 'sound cannot be empty',
    'string.min': 'sound must be at least 1 character',
    'string.max': 'sound must not exceed 50 characters',
  }),
  customData: Joi.object()
    .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()))
    .optional()
    .messages({
      'object.base': 'customData must be an object',
    }),
});

// SMS validation schema
export const sendSMSSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      'any.required': 'phoneNumber is required',
      'string.pattern.base':
        'phoneNumber must be in E.164 format (e.g., +1234567890) with country code',
    }),
  message: Joi.string().trim().min(1).max(1600).required().messages({
    'any.required': 'message is required',
    'string.empty': 'message cannot be empty',
    'string.min': 'message must be at least 1 character',
    'string.max': 'message must not exceed 1600 characters',
  }),
  senderId: Joi.string().trim().min(1).max(11).optional().messages({
    'string.empty': 'senderId cannot be empty',
    'string.min': 'senderId must be at least 1 character',
    'string.max': 'senderId must not exceed 11 characters (alphanumeric)',
  }),
});
