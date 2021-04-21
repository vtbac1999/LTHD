const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const mongodb = require('mongoose');
const router = require('express').Router();
const https = require('https');
const axios =require('axios');
// const flash = require('connect-flash');
const passport = require('passport');

const path = require('path');
const cors = require('cors');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongostore = require('connect-mongo')(session);
const excelToJson = require('convert-excel-to-json');
const fastcsv = require("fast-csv");
const fs = require("fs");
const csrfProctection = csrf({ cookie: true });
const multer = require('multer');
const nodemailer = require('nodemailer');
const addDays = require('add-days');
const request = require('request');
const paypal = require('paypal-rest-sdk');
const CryptoJS = require('crypto-js'); // npm install crypto-js
const uuid = require('uuid'); // npm install uuid
const moment = require('moment'); // npm install moment
const QRCode = require('qrcode');
const User = require('./models/user');
const {registerValidation, loginValidation} = require('./validation');
const jwt = require('jsonwebtoken');





var Mailjet = require('node-mailjet').connect('89d3f83cddcb7a959c202b75773628b5', '75dc0201422c9ab354f4a2de606849fa');
require('dotenv/config');
var convertousd=0;
var macoupon = 'no';

request('https://free.currconv.com/api/v7/convert?q=VND_USD&compact=ultra&apiKey=925acffac404d631739e',function (error, response, body) { 
  convertousd = JSON.parse(body).VND_USD;
  }
);



// var arr_qty =[];
// var arr_sl =[];  
// var today = new Date();
// var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_time_'+today.getHours()+'-'+today.getMinutes()+'-'+today.getSeconds();
 

// connect mongodb
mongodb.set('useCreateIndex', true);
mongodb.set('useFindAndModify', false);
mongodb
  .connect(process.env.DB_CONNECT, {
    dbName: 'tmdt',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connect database seccess !!!');
  });


/// middleware
app.use(express.json());
app.use(express.static('./public'));

//app.use(express.static(path.join(__dirname, 'public')));



app.use(
  session({
    secret: 'mysupersecret',
    saveUninitialized: true,
    resave: true,
    // resave: true,
    store: new mongostore({ mongooseConnection: mongodb.connection }),
    cookie: { secure: false, httpOnly: true, maxAge: 6000000 },
  })
);



//
app.set('views', './views');
app.set('view engine', 'ejs');
const port = 3000;
app.listen(port, console.log(`Listening on port ${port}...`));

// app.use(flash());
app.use(passport.initialize())
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// this middleware use to build restful api so need this line to fix 'no access control allow origin' OK
app.use(cors());
const mongoosePaginate = require('mongoose-paginate-v2');







const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
// const userRouter = require('./routes/users');



app.use('/', indexRouter);
app.use('/', authRouter);
// app.use('/api/users', userRouter);
