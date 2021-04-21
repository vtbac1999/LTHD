
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const User = require('../models/user');

const schema = require('../models/schema');
const cartnull = { item: {}, totalQty: 0, totalPrice: Number(0) };
const usernull ={name:"", email:"",password:""};
const allsp = require('../models/sanpham');
const dssanpham = require('../models/sanpham');
const bill = require('../models/bill');
const dsspnoibat = require('../models/sanpham');
const coupon = require('../models/coupon');
const ObjectId = require('mongodb').ObjectID;


router.post('/register', async (request, response) => {

    // hash password
    const salt =await bcrypt.genSalt(10);
    const hashedPassword = await await bcrypt.hash(req.body.password, salt);
    // console.log(req.session.user);
   

    const user =new User({
        name:req.body.name,
        email:req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser= user.save();
  
       
    res.redirect('/login');

    } catch (err) {
       
    }
});

router.get('/login', async(req,res)=>{
    if(req.session.user !== null)
    {
      return res.redirect('http://localhost:3000')
    }
    else
    {
      return res.render('login.ejs');
    }
});

router.get('/register', async(req,res)=>{
    if(req.session.user)
    {
      return res.redirect('http://localhost:3000')
    }
    else
    {
      return res.render('register.ejs');
    }
});

router.post('/login', async (req, res) => {
    const salt =await bcrypt.genSalt(10);
  const hashedPassword = await await bcrypt.hash(req.body.password, salt);
  data = await dssanpham.find({
    trangthai: 'con',
    hieuluc: 'con',
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  data2 = await dsspnoibat.find({
    trangthai: 'con',
    noibat: true,
    sl: { $regex: /[^0]/, $options: 'm' },
  });

  // console.log(req.session.user);
  const user =new User({
    name:req.body.name,
    email:req.body.email,
    password: hashedPassword
  });

  req.session.user = user;
 
      var cart = new Cart(req.session.cart || cartnull);
      var user_test = new User_test(req.session.user || cartnull);
  res.render('index', {
    listsp: data,
    listspnoibat: data2,
    message: 1,
    session: cart,
    logined: user_test
  });
})

router.get('/logout',async(req,res)=>{
    req.session.user=null;
    res.redirect('/');
    
    })

module.exports = router;