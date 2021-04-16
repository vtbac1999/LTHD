const Joi = require('joi');

//Register Validation




  const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string()
        .min(3)
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};

  const loginValidation = (data) => {
    const schema2 = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });
    return schema2.validate(data);
  };

module.exports.registerValidation = registerValidation;
module.exports.loginValidation=loginValidation;

    



