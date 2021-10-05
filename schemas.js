const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

// Extension to make sure HTML is not injected into our site. Using Joi and Sanitize-HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
                }
            }
        }
});

// This adds the extension to the Joi package. This gives us the option to use escapeHTML on our string validation
const Joi = BaseJoi.extend(extension);

// Campground Schema for Joi
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(0).max(5).required(),
        body: Joi.string().required().escapeHTML()
    }).required()
});