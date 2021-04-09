const Joi  =require('joi')
const registerValidation = (data)=>{
    const rule = Joi.object({
        name:Joi.string().min(6).max(255).required(),
        email:Joi.string().min(6).max(255).require().email(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).require(),
    })
    return rule.validate(data);
}
module.exports.registerValidation=registerValidation;
