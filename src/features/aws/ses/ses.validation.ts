import Joi from 'joi';

// Email validation schema
export const sendEmailSchema = Joi.object({
  to: Joi.alternatives()
    .try(Joi.string().email().required(), Joi.array().items(Joi.string().email()).min(1).required())
    .required()
    .messages({
      'alternatives.match': 'to must be a valid email address or an array of valid email addresses',
      'any.required': 'to (recipient email) is required',
      'string.email': 'to must be a valid email address',
      'array.min': 'to array must contain at least one email address',
    }),
  subject: Joi.string().trim().min(1).max(200).required().messages({
    'any.required': 'subject is required',
    'string.empty': 'subject cannot be empty',
    'string.min': 'subject must be at least 1 character',
    'string.max': 'subject must not exceed 200 characters',
  }),
  body: Joi.string().trim().min(1).required().messages({
    'any.required': 'body is required',
    'string.empty': 'body cannot be empty',
    'string.min': 'body must be at least 1 character',
  }),
  from: Joi.string().email().optional().messages({
    'string.email': 'from must be a valid email address',
  }),
  replyTo: Joi.alternatives()
    .try(Joi.string().email(), Joi.array().items(Joi.string().email()).min(1))
    .optional()
    .messages({
      'alternatives.match':
        'replyTo must be a valid email address or an array of valid email addresses',
      'string.email': 'replyTo must be a valid email address',
      'array.min': 'replyTo array must contain at least one email address',
    }),
  isHtml: Joi.boolean().optional().messages({
    'boolean.base': 'isHtml must be a boolean value (true or false)',
  }),
});
