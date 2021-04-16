const router = require('express').Router();
const User = require('../model/user');
const {registerValidation, loginValidation} = require('../validation');
// const {registerValidation} = require('../validation');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');


// const { error } = Joi.validate(req.body,schema);



router.post('/register', async(req, res)=>{


    //Let validation
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const emailExits =await User.findOne({email: req.body.email});
    if(emailExits)return res.status(400).send('Email exist');

    //hash password
    const salt =await bcrypt.genSalt(10);
    const hashedPassword= await bcrypt.hash(req.body.password,salt);

    console.log("CO VO DAY");


    const user =new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    });
    try {
        const savedUser= await user.save();
        req.session.user = user;
        res.redirect('http://localhost:3000');
    } catch (err) {
        res.status(400).send(err);
    }
});


router.post('/login', async(req,res)=>{

    const{ error }=loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user =await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email is not found');

    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass)  return res.status(400).send('Invalid password');

    
    req.session.user = user;
    res.redirect('http://localhost:3000');


});

module.exports=router;
