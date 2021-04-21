var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');



const schema = require('../models/schema');
const cartnull = { item: {}, totalQty: 0, totalPrice: Number(0) };
const usernull ={name:"", email:"",password:""};
const allsp = require('../models/sanpham');
const dssanpham = require('../models/sanpham');
const bill = require('../models/bill');
const dsspnoibat = require('../models/sanpham');
const coupon = require('../models/coupon');
const ObjectId = require('mongodb').ObjectID;

var Cart = require('../models/cart');
var User_test = require('../models/user_test');

router.get('/', async (req, res) => {
  // req.session.destroy();
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

  var cart = new Cart(req.session.cart || cartnull);
  var user_test = new User_test(req.session.user || usernull);

  res.render('index', {
    listsp: data,
    listspnoibat: data2,
    message: '',
    session: cart,
    logined: user_test
  });
  
});



router.get('/index', async (req, res) => {
  const data = await dssanpham.find({
    trangthai: 'con',
    hieuluc: 'con',
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  const data2 = await dsspnoibat.find({
    trangthai: 'con',
    noibat: true,
    sl: { $regex: /[^0]/, $options: 'm' },
  });

  var cart = new Cart(req.session.cart || cartnull);
  var user_test = new User_test(req.session.user || usernull);
  res.render('index', {
    listsp: data,
    listspnoibat: data2,
    message: '',
    session: cart,
    logined: user_test
  });
});

router.get('/add-to-cart', async function (req, res) {
    var giasell;
    var id = req.query.id;
    var sl = req.query.sl;
    var cart = new Cart(req.session.cart ? req.session.cart : cartnull);
    const product = await allsp.findById({ _id: new ObjectId(id) });
      
    if (product.hieuluc == 'con')
      giasell = product.gia - (product.gia * product.phantram) / 100;
      else giasell = product.gia;
    
      cart.add(product, product._id, sl, giasell);
      req.session.cart = cart;
      res.redirect('/');
  });
  
  //route shop details
  
  var getitem = require('../models/sanpham');
  router.get('/shop-details', function (req, res) {
    var id = req.query.id;
    var o_id = new ObjectId(id);
    getitem
      .findOne({ _id: o_id })
      .then((docs) => {
        var sp = docs;
        res.render('shop-details', {
          sp: sp,
          session: req.session.cart || cartnull,
        });
      })
      .catch((err) => {
        next(err);
      });
    
  });
  
  
  router.get('/shoping-cart', function (req, res, next) {
    var cart = new Cart(req.session.cart || cartnull);
  
    res.render('shoping-cart', {
      session: req.session.cart || cartnull,
      getcart: cart.genetateArr() || [],
      subtotal: cart.totalPrice || 0,
      phantram: 0,
      
    });
  });
  
  
  
  router.get('/checkout', function (req, res) {
  
    
  // console.log(typeof req.session.coupon)
  let getct = new Cart(req.session.cart||cartnull);
  
    
    res.render('checkout', {
      coupon : req.session.coupon||0,
      session: getct,
      getcart: getct.genetateArr() || []
    });
  });
  

  router.post('/checkcoupon', async function (req, res) {
    macoupon = req.body.id;
    let getcoupon = await coupon.find({ ma: req.body.id, trangthai: 1 });
    let phantramcoupon = 0;
    if (getcoupon.length == 1) {
      phantramcoupon = getcoupon[0].phantram;
      req.session.coupon = phantramcoupon;
    }
    res.send({ phantram: phantramcoupon });
  });
  
  router.post('/buy', (req, res) => {
  
    paypal.configure({
      mode: 'sandbox', // Sandbox or live
      client_id:
        'AbRnw6VYbjNYXz0lpXGs6rLi96qBRV9cAi7tC1kGC6b7O9lqgOVPx9Vpq-Bqwi3-N8QzjRnKazrxvLIS',
      client_secret:
        'ENh8p4FKF7SK3v24Tffd9LScPj4g0Us6PoXq0qUq_7DTt2paRIX7iDHn00qIuJKPeXqU-jLsto7fBSTT',
    });
      let getct = new Cart(req.session.cart);
      let productcart = getct.genetateArr();
    const billproducts = [{
      "name": "abc",
      "sku": "1",
      "price": 10,
      "currency": "USD",
      "quality": 1
    }];
    const tt = 1023.983;
    const am = { "currency": "USD", "total": tt.toFixed(2) };
    const create_payment_json = {
      "intent": "sale",
      "payer": { payment_method: "paypal" },
      "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
        "item_list": { "items": billproducts },
        "amount": am,
        "description": "sdafasdfasdfasdfa"
      }]
    };
  
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.warn(error);
        } else {
          console.log('Create Payment Response');
          console.log(payment);
          payment.links.forEach(link => {
            if (link.rel === 'approval_url') return res.redirect(link.href);
          })
        }
      });
  })
  router.get('/success', (req, res) => {
    res.send({ success: 'success' });
  });
  router.get('/cancel', (req, res) => {
    res.send({ cancel: 'cancel' });
  });
  
  //route blog
  router.get('/blog', function (req, res) {
    res.render('blog');
  });
  router.get('/blog-details', function (req, res) {
    res.render('blog-details');
  });
  router.get('/shop-grid', async function (req, res, next) {
    var filter;
    var search = req.query.search || '';
    var query = '';
    var searchbar = req.query.searchbar || '';
    if (searchbar == '') {
      if (search == '') {
        filter = { sl: { $regex: /[^0]/, $options: 'm' } };
        query = '';
      } else {
        filter = { maloaisp: search, sl: { $regex: /[^0]/, $options: 'm' } };
        query = search;
      }
    } else {
      var querysearchbar = `"\" + ${searchbar} + \""`;
      filter = {
        $text: { $search: querysearchbar, $caseSensitive: false },
        sl: { $regex: /[^0]/, $options: 'm' },
      };
      query = searchbar;
    }
  
    var page = req.query.page || 1;
    var perPage = 12;
    const options = {
      page: page,
      limit: 12,
      collation: {
        locale: 'en',
      },
    };
    //console.log(filter);
    filter.trangthai = "con";
    await allsp.paginate(filter, options, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        res.render('shop-grid', {
          dssp: result.docs,
          page: result.page,
          pages: result.totalPages,
          query: query,
          total: result.totalDocs,
          nextPage: result.hasNextPage,
          perPage: result.hasPrevPage,
          session: req.session.cart || cartnull,
        });
      }
    });
  
  });
  function truhangton(id, value) {
    let hangton = require('../models/tonkho');
    hangton.findOne({ id: id,trangthai:0 }).then((result) => {
      if (result) {
        let slcu = '0';
        if (Number(result.sl) - Number(value) > 0) {
          slcu = Number(result.sl) - Number(value) + '';
        }
        hangton
          .findOneAndUpdate({ id: id }, { $set: { sl: slcu } }, { new: true })
          .then((abc) => {
            
          });
      }
    });
  }
  var in4 = {};
  var globalcart;
  
  router.post('/bill', async function (req, res, next) {
    console.log(req.body);
    var cart = new Cart(req.session.cart || {});
    globalcart = new Cart(req.session.cart);
    var phantram;
    console.log(macoupon);
    const newcoupon = await coupon.find({ ma: macoupon });
    console.log(newcoupon);
    if (!newcoupon[0]) {
      phantram = 0;
    }
    else {
      phantram = newcoupon[0].phantram;
      await coupon.findOneAndUpdate({ ma: macoupon }, { $set: { trangthai: 2 } }, { new: true });
    } 
    var mang_cart =[];
    var total_payment=cart.totalPrice*(100-Number(phantram))/100;
    mang_cart = cart.genetateArr();
    in4 = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      street_address: req.body.street_address,
      apartment_address: req.body.apartment_address,
      phone: req.body.phone,
      email: req.body.email,
      note: req.body.note || ''
    };
      const bill_order = new bill({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        street_address: req.body.street_address,
        apartment_address:req.body.apartment_address,
        phone: req.body.phone,
        email: req.body.email,
        note: req.body.note || '',
        coupon: macoupon,
        discount_percent : phantram,
        total_order_value: cart.totalPrice,
        total_payment:  total_payment,
        bill:mang_cart,
      });
    if (req.body.type == 'paypal') {
      mang_cart.forEach(async e => {
        let oldvalue = await allsp.findById({ _id: new ObjectId(e.item._id) });
        truhangton(e.item._id, e.qty);
        let resetvalue = Number(oldvalue.sl) - Number(e.qty) + '';
        let objupdate = { sl: resetvalue };
        if (Number(resetvalue) == 0) {
          objupdate.trangthai = 'het';
        }
        await allsp.findByIdAndUpdate({ _id: new ObjectId(e.item._id) }, { $set: objupdate },{ new: true });
      })
      bill_order.save();
      cart.deleteall();
      req.session.cart = cart;
      req.session.coupon = 0;
      res.send({ data: '/', textStatus: 200 });
    } else if (req.body.type == 'payment') {
      let htmlt = '<p>Nhấn vào đây để xác nhận đơn hàng: <a href="http://localhost:3000/xacthucdonhang">Đây</a> sau khi thực hiện đơn hàng sẽ được xử lý <p> <p>OGANI thank you !</p>';
      
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env._EMAIL,
          pass: process.env._PASSWORD,
        },
      });
      var mailOptions = {
        from: 'OGANI <' + process.env._EMAIL + '>',
        to: req.body.email,
        subject: 'Xác thực đơn hàng',
        html: htmlt,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      //update trangthai when product =0 ;
     
      //
  
      cart.deleteall();
      req.session.cart = cart;
      res.send({ data: '/', textStatus: 200 });
    }
      
  });
  
  router.get('/xacthucdonhang',async (req, res) => {
    var cart = globalcart;
    var phantram;
    
    const newcoupon = await coupon.find({ ma: macoupon });
    
    if (!newcoupon[0]) {
      phantram = 0;
    }
    else {
      phantram = newcoupon[0].phantram;
      await coupon.findOneAndUpdate({ ma: macoupon }, { $set: { trangthai: 2 } }, { new: true });
    } 
    var mang_cart =[];
    var total_payment=cart.totalPrice*(100-Number(phantram))/100;
    mang_cart = cart.genetateArr();
      const bill_order = new bill({
        first_name: in4.first_name,
        last_name: in4.last_name,
        street_address: in4.street_address,
        apartment_address:in4.apartment_address,
        phone: in4.phone,
        email: in4.email,
        note: in4.note || '',
        coupon: macoupon,
        discount_percent : phantram,
        total_order_value: cart.totalPrice,
        total_payment:  total_payment,
        bill:mang_cart,
      });
      mang_cart.forEach(async e => {
        let oldvalue = await allsp.findById({ _id: new ObjectId(e.item._id) });
        truhangton(e.item._id, e.qty);
        let resetvalue = Number(oldvalue.sl) - Number(e.qty) + '';
        let objupdate = { sl: resetvalue };
        if (Number(resetvalue) == 0) {
          objupdate.trangthai = 'het';
        }
        await allsp.findByIdAndUpdate({ _id: new ObjectId(e.item._id) }, { $set: objupdate },{ new: true });
      })
      
      bill_order.save();
      cart.deleteall();
      req.session.cart = cart;
    res.redirect('/');
    
  })
  function find_id(id ,i)
  {
    allsp.findById(new ObjectId(id), function (err, product) {
      sll= product.sl; 
      var now  = sll- arr_qty[i];
     
      update (id , now);
    });
  }
  
  
  
  
  router.get('/bill', async function (req, res, next) {
    var phantram;
    const mac = req.session.coupon;
    const newcoupon = await coupon.find({ ma: mac });
    if(!newcoupon[0]){phantram=0;}
    else{phantram=newcoupon[0].phantram} 
    var cart = new Cart(req.session.cart ? req.session.cart : {});
  
  var mang = [];
  mang = cart.genetateArr();
  
    res.render('bill',{
      session: req.session.cart || cartnull,
      getcart: cart.genetateArr() || [],
      subtotal: cart.totalPrice || 0,
      phantram: phantram,
    
    });
  });
  
  //route admin
  router.get('/admin', function (req, res) {
    res.render('login');
  });
  
  
  
  const billcsv = require('../models/billcsv');
  var datat = [];
  router.get('/hoadon', async function (req, res,next) {
    const data = await bill.find({ });
    datat=[];
    var from = "";
    var to = "";
  
  
   
    data.forEach(e=> {
      var bill_obj = new  billcsv(e);
      datat.push(bill_obj);      
          })
          // array data 
    console.log(data[0].bill[0]);
    console.log(data[0].bill[0].price);
  
    res.render('hoadon',{
      listbill: data,
      day_from: from,
      day_to: to ,
    });
  })
  router.post('/validateemail', (req, res) => {
    var email = req.body.email;
    
    
    const emailExistence = require('email-existence');
    emailExistence.check(email, function (error, response) {
      res.send(response);
      console.log(response);
    });
  })
  
  router.post('/findbyday', async function (req, res,next) {
    const data = await bill.find({ });
    datat=[];
    var data_find = [];
    var from  = req.body.from ; 
    var to =  req.body.to;
  
  
    var date_from = new Date(from);
    var date_to = new Date(to);
  
    
    data.forEach(bill => {
     if(  date_from.getTime()<= bill.date.getTime()  && bill.date.getTime()<= date_to.getTime()+86400000 )
     {
        data_find.push(bill);
  
     }
    });  
    
    data_find.forEach(e=> {
      var bill_obj = new  billcsv(e);
      datat.push(bill_obj);      
          })
  
     res.render('hoadon',{
      listbill: data_find,
      day_from: from,
      day_to: to ,
    });
  
  });
  
  
  
  
  
  router.get('/coupon',async function (req, res) {
    const coupon = require('../models/coupon');
    const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
    res.render('coupon', { data: datacoupon });
  })
  
  router.get('/qlsanpham',async function (req, res) {
    const spl = await allsp.find({}).sort({ tensp: 1,trangthai: -1 });
   
    res.render('qlsanpham',{data:spl});
  });
  //route admin
  const zdadsfasdfa = [];
  const ac = require('../models/accout');
  router.post('/admin',async function (req, res) {
    // create user in req.body
    const e = req.body.username;
    const pw = req.body.password;
    console.log(e);
    console.log(pw);
    let dataacc = await ac.find({});
    let dataac = [];
    dataac[0] = dataacc;
    let user = await ac.find({ email: e });
    if (user.length != 0) {
     var validatehashpw = await bcrypt.compare(pw, user[0].matkhau); 
    }
    if (validatehashpw) {
      if (user[0].chucvu == "admin") {
        zdadsfasdfa[1] = user[0].email;
        req.session.user = user[0];
        res.render('taikhoan', { dataac: dataac,user:user[0].email });
      } else if (user[0].chucvu == "nhanvien") {
        req.session.user = user[0];
        res.redirect('/thongke');
      } else {
        res.redirect('/admin');
      }
    } else {
      res.redirect('/admin');
    }
    
  });
  ////
  
  router.get('/taikhoan', async (req, res) => {
    const dataac = await ac.find({});
    
    zdadsfasdfa[0] = dataac;
    res.render('taikhoan', { dataac: zdadsfasdfa,user:zdadsfasdfa[1]});
  });
  //

  router.get('/about', function (req, res) {
    res.render('about', { page: '3', session: req.session.cart || cartnull });
  });
  
  // route contact
  router.get('/contact', function (req, res) {
    res.render('contact', { session: req.session.cart || cartnull });
  });
  
  router.get('/profile', function (req, res) {
    res.render('profile',{user : req.session.user});
  });
  
  router.put('/updateprofile', async (req, res) => {
    const updateac = require('../models/accout');
    await updateac.findByIdAndUpdate({ _id: new ObjectId(req.body.id) },
      {
        $set: {
          tennv: req.body.tennv,
          gioitinh: req.body.gioitinh,
          email: req.body.email,
          diachi: req.body.diachi,
          thongtinkhac: req.body.thongtinkhac
        }
      }, { new: true });
    let reloaduser =await updateac.findById({ _id: new ObjectId(req.body.id) });
    req.session.user = reloaduser;
    res.send('Update success...');
  })
  
  const contactmessage = require('../models/contact');
  const phieunhap = require('../models/phieunhap');
  const { response } = require('express');
  const user_test = require('../models/user_test');
  router.post('/contact', async function (req, res) {
    const newcontact = new contactmessage({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });
    newcontact.save();
    const data = await dssanpham.find({ trangthai: 'con', hieuluc: 'con' });
    const data2 = await dsspnoibat.find({ noibat: true });
    res.render('index', {
      listsp: data,
      listspnoibat: data2,
      message: 'Thanks for your contact !!!',
      session: req.session.cart || cartnull,
    });
  });
  router.post('/mailsub',async (req, res) => {
    var email = req.body.email;
    const e = require('../models/mail');
    const gete = await e.find({ email: email });
    console.log(gete);
    if (gete.length == 0) {
      const newe = new e({
        email: email,
      });
      newe.save();
    }
    res.send('successsub');
  })
  
  
  
  //
  
  router.post('/updatesoluong', async (req, res) => {
    if (typeof req.body.sl === 'number') {
     
      let getallsl = await allsp.findById({ _id: new ObjectId(req.body.id[1]) });
      if (Number(req.body.sl) >= 0 && Number(req.body.sl) <= Number(getallsl.sl)) {
        
        let nc = new Cart(req.session.cart);
        let id_ = req.body.id[1];
        nc.update(id_, req.body.sl);
        req.session.cart = nc;
        res.send({ sl: 0,sessioncart : req.session.cart});
      } else if (Number(req.body.sl) > Number(getallsl.sl)) {
        let nc = new Cart(req.session.cart);
        let id_ = req.body.id[1];
        nc.update(id_, getallsl.sl);
        req.session.cart = nc;
        res.send({ sl: Number(getallsl.sl), sessioncart: req.session.cart });
      } else res.send({ sl: 0,sessioncart : req.session.cart });
    }else res.send({ sl: 0, sessioncart: req.session.cart });
  })
  // admin route
  var product = [];
  var bill_count = [];
  var mail_count = [];
  var year_now = new Date();
  
  router.get('/thongke',async (req, res) => {
  
  var namhientai = year_now.getFullYear();
  var namtruoc  = namhientai-1;
    for(var i=0 ; i<=12;i++)
    {
      product[i]=0;
    }
    
     for(var i = 0 ; i <=12 ; i++ )
     {
       bill_count[i]=0;
     }
    
     for(var i = 0 ; i <=12 ; i++ )
     {
       mail_count[i]=0;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    }
    let hangton = require('../models/tonkho');
    let gethangton = await hangton.find({});
    gethangton.forEach(async e => {
      if (e.ngayhethan < Date.now()) {
        await hangton.findOneAndUpdate({ id: e.id }, { $set: { trangthai: 1 } }, { new: true });
      }else if(e.ngayhethan> Date.now()){
        console.log('ok');
      }
    })
    res.render('thongke',
   {
    bill:bill_count,
    product:product,
    mail:mail_count,
    namhientai:namhientai,
    namtruoc: namtruoc,
    hangton:gethangton
   });
  })
  
  
  
  
  router.post('/thongke', async function (req, res,next) {
    var year1 = req.body.Courses;
    var start = new Date(Number(year1), 1, 1);
    var end = new Date(Number(year1), 12, 31);
    if(year1==year_now.getFullYear())
    {
      var year2= Number(year1) -1;
    }  
    else 
    {
      var year2 = Number(year1) + 1;
    }
    
    for(var i=0 ; i<=12;i++)
    {
      product[i]=0;
    }
    
     for(var i = 0 ; i <=12 ; i++ )
     {
       bill_count[i]=0;
     }
    
     for(var i = 0 ; i <=12 ; i++ )
     {
       mail_count[i]=0;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
     }
    
    const data = await bill.find({date: {$gte: start, $lt: end}});
    const data2 = await contactmessage.find({date: {$gte: start, $lt: end}});
     
      data.forEach(e => {
        var qty_bill=0;
    
      switch(e.date.getMonth()+1) {
        case 1:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);   
            })
            product[1]+=qty_bill ;
          break;
        case 2:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
            console.log(obj.qty);
        
            })
            product[2]+=qty_bill ;
          break;
          case 3:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
              console.log(obj.qty);
          
              })
            product[3]+=qty_bill ;
          
          break;
          case 4:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
              console.log(obj.qty);
          
              })
            product[4]+=qty_bill ;
          
          break;
          case 5:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[5]+=qty_bill ;
          
          break;
          case 6:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[6]+=qty_bill ;
          
          break;
          case 7:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[7]+=qty_bill ;
          
          break;
          case 8:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[8]+=qty_bill ;
          
          break;
          case 9:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[9]+=qty_bill ;
          
          break;
          case 10:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[10]+=qty_bill ;
          
          break;
          case 11:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[11]+=qty_bill ;
          
          break;
          case 12:
            e.bill.forEach(obj=>{
              qty_bill+=Number(obj.qty);
            
              })
            product[12]+=qty_bill ;
          
          break;
       
      }
    })
    
     load_data(data,bill_count);
     load_data(data2,mail_count);
    let hangton = require('../models/tonkho');
    let gethangton = await hangton.find({});
     gethangton.forEach(async e => {
      if (e.ngayhethan < Date.now()) {
        await hangton.findOneAndUpdate({ id: e.id }, { $set: { trangthai: 1 } }, { new: true });
      }else if(e.ngayhethan>Date.now()){
        console.log('ok');
      }
    })
     res.render('thongke',
   {
    bill:bill_count,
    product:product,
    mail:mail_count,
    namtruoc:year1,
    namhientai:year2,
    hangton:gethangton
   });
      
      
    })
    
    
    
    function load_data(data,array)
    {
      data.forEach(e=>{
       
    
        switch(e.date.getMonth()+1) {
         case 1:
           array[1]++;
           break;
         case 2:
           array[2]++;     
           break;
           case 3:
             array[3]++;      
           break;
           case 4:
             array[4]++;      
           break;
           case 5:
             array[5]++;     
           break;
           case 6:
             array[6]++;
           
           break;
           case 7:
             array[7]++;
           
           break;
           case 8:
             array[8]++;
           
           break;
           case 9:
             array[9]++;
           
           break;
           case 10:
             array[10]++;
           
           break;
           case 11:
             array[11]++;
           
           break;
           case 12:
             array[12]++;
           
           break;
        
       }
      })
    }
  
  
  router.get('/mail',async (req, res) => {
    const mailschema = require('../models/mail');
    const getmail =await mailschema.find({});
    console.log(getmail);
    res.render('mail',{mail : getmail});
  });
  
  router.get('/mailcontact', async (req, res) => {
    const mailcontactschema = require('../models/contact');
    const getmailcontact = await mailcontactschema.find({});
    console.log(getmailcontact);
    res.render('mailcontact',{mailcontact : getmailcontact});
  });
  router.get('/magiamgia', async (req, res) => {
    const coupon = require('../models/coupon');
    const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
    console.log(datacoupon);
    res.render('magiamgia', { data: datacoupon });
  });
  
  router.get('/nhaphang',async (req, res) => {
    let gettableproduct =await allsp.find({});
  
    res.render('nhaphang',{data:gettableproduct});
  })
  router.post('/dathang', async (req, res) => {
    const donhang = require('../models/phieunhap');
    const objdonhang = {
      dsnhap: [],
      status: 0,
      nguoilap: req.session.user.tennv || 'nv1',
    };
    const donhanglist = req.body.data;
    for ([key, value] of donhanglist) {
      const gettensp = await allsp.findById({ _id: new ObjectId(key) });
      let objecttensp = gettensp.tensp;
     
  
      objdonhang.dsnhap.push({
        id: key,
        tensp: objecttensp,
        sl: value,
        nguoikt: '',
        trangthai: false,
      });
    }
  
    const newdonhang = new donhang(objdonhang);
    console.log(newdonhang);
    await newdonhang.save();
    res.send('Đơn hàng đã được gửi đến quản lý !!!');
  });
  router.get('/xacnhannhaphang',async(req, res) => {
    const getallphieunhap = require('../models/phieunhap');
    const allphieunhap = await getallphieunhap.find({}).sort({status:1});
    res.render('xacnhannhaphang',{data:allphieunhap});
  })
  router.put('/updatedonhang', async (req, res) => {
    let phieunhap = require('../models/phieunhap');
   
    await phieunhap.findByIdAndUpdate({ _id: new ObjectId(req.body.id) }, { $set: { status: Number(req.body.status) } }, { new: true });
    res.send('Update success...');
  })
  router.put('/capnhatdonhang',async (req, res) => {
    const donhang = require('../models/phieunhap');
    const getdonhang = await donhang.find({ "status": 1, "dsnhap.tensp" : req.body.tensp, "dsnhap.sl" : req.body.sl });
    if (getdonhang.length == 0) {
      res.send('Không tìm thấy đơn hàng !!!');
    } else {
  
      await donhang.findOneAndUpdate(
        {
          'status': 1,
          'dsnhap.tensp': req.body.tensp,
          'dsnhap.sl': req.body.sl,
        },
        {
          $set: {
            'dsnhap.$.nguoikt': req.session.use.tennv || 'nv1',
            'dsnhap.$.trangthai': true,
          },
        },
        {
          new: true,
        }
      );
      res.send(getdonhang);
  
    }
  })
  router.post('/updatesoluongsanpham',async (req, res) => {
    var storage2 = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './upload');
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });
  
    var upload2 = multer({ storage: storage2 }).single('exel');
    upload2(req, res,async function (err) {
   
      const result = excelToJson({
        sourceFile: './upload/'+req.file.filename,
        sheets: [{
          name: 'Sheet1',
          header: {
            rows: 1
          },
          columnToKey: {
            B: 'tensp',
            C: 'soluong'
          }
        }],
      });
      
      // update donhang, e là từng phiếu nhập
      let arrayphieunhap = result.Sheet1;
      const hoadon = require('../models/phieunhap');
      arrayphieunhap.forEach(async(e) => {
        console.log(e);
        const getphieunhap = await hoadon.find({ status: 1,dsnhap:{$elemMatch :{tensp : e.tensp,sl:e.soluong,trangthai:false} } });
        //console.log(getphieunhap);
        if (getphieunhap.length == 0) {
          console.log('Không thể cập nhật số lượng sản phẩm: ' + e.tensp);
        } else {
          let getdsnhapphieunhap = getphieunhap[0].dsnhap;
         
          getdsnhapphieunhap.forEach(async(ee) => {
            if (ee.tensp == e.tensp) {
              await hoadon.findOneAndUpdate(
                {
                  status: 1,
                  dsnhap: {
                    $elemMatch: {
                      tensp: e.tensp,
                      sl: e.soluong,
                      trangthai: false,
                    },
                  },
                },
                {
                  $set: {
                    'dsnhap.$.nguoikt': req.session.user.tennv || 'nv1',
                    'dsnhap.$.trangthai': true,
                  },
                },
                {
                  new: true,
                }
              );
              let getproductupdate = await allsp.find({ tensp: ee.tensp });
              let getoldsl = Number(getproductupdate[0].sl);
              // if sl cũ còn thì add vào tồn kho
              if (getoldsl > 0) {
                let hangton = require('../models/tonkho');
                let addhangton = new hangton({
                  id: getproductupdate[0]._id,
                  sl: getoldsl,
                  ngaynhap: getproductupdate[0].ngaynhap,
                  trangthai: 0,
                  tensp: getproductupdate[0].tensp,
                  hsd: getproductupdate[0].hsd,
                  ngayhethan:
                    getproductupdate[0].hsd.split(' ')[1] == 'month'
                      ? addDays(
                          getproductupdate[0].ngaynhap,
                          Number(getproductupdate[0].hsd.split(' ')[0]) * 30
                        )
                      : addDays(
                          getproductupdate[0].ngaynhap,
                          Number(getproductupdate[0].hsd.split(' ')[0])
                        ),
                });
                await addhangton.save();
              }  
              //
              let getidproductupdate = getproductupdate._id;
              await allsp.findOneAndUpdate(
                { tensp: ee.tensp },
                { $set: { sl: getoldsl + e.soluong,ngaynhap: Date.now() } },
                { new: true }
              );
              
              console.log(e.tensp +' Update soluong success!!!');
            }
          })
        }
      })
        //
      if (err instanceof multer.MulterError) {
        console.log('error multerupload excel');
      } else if(err) {
        console.log('error unknow when upload excel');
      }
      console.log('Uploadexcel success !!!');
    })
    res.redirect('/nhaphang');
  }) 
  // ajax route 
  router.put('/updatephantram',async (req, res) => {
    var id = req.body.id;
    var phantram = req.body.phantram;
    var old;  
    var phantramold =await allsp.findById({ _id: new ObjectId(id) }, (err, result) => {
      old = result.phantram;
    });
  
    if (phantram >= 0 && phantram <= 100) {
      allsp.findByIdAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { phantram: phantram } },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log('update false');
          }
          console.log(old);
        }
      );
      res.send({ message: 'Update success !!!',status:1});
    } else {
      res.send({ message: 'Somethong wrong !!!', status: 0, old:old });
    }
  })
  
  router.put('/updatenoibat',async (req, res) => {
    var id = req.body.id;
    var noibat = req.body.noibat;
    console.log(id, noibat);
    allsp.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { noibat: !noibat } },
      { new: true },
      (err, doc) => {
        if (err) {
          res.send({ message: 'Update success !!!' });
        }
        res.send({ message: 'Update success !!!' });
      }
    );
  })
  
  
  router.put('/updatetrangthai', async (req, res) => {
    var id = req.body.id;
    var status = req.body.status;
    if (status == "Hết") {
      status = "con";
    } else status = "het";
    
    allsp.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { trangthai: status } },
      { new: true },
      (err, doc) => {
        if (err) {
          res.send({ message: 'Update success !!!' });
        }
        res.send({ message: 'Update success !!!' });
      }
    );
  });
  
  router.put('/updatehieuluc', async (req, res) => {
    var id = req.body.id;
    var status = req.body.hieuluc;
  
    console.log(id, status);
    allsp.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { hieuluc: status } },
      { new: true },
      (err, doc) => {
        if (err) {
          res.send({ message: 'Update success !!!' });
        }
        res.send({ message: 'Update success !!!' });
      }
    );
  });
  
  
  router.post('/creatcoupon', (req, res) => {
    var sl = req.body.sl;
    var phantram = req.body.phantram;
    
    const randomString = require('randomstring');
    const newcoupon = require('../models/coupon');
    for (var i = 1; i <= sl; i++){
      var z = new newcoupon({
        ma: randomString.generate({
          length: 7,
          charset: 'alphanumeric',
        }),
        phantram: phantram,
        trangthai:0
      });
      z.save();
    }
    res.send('Create Success !!!');
  })
  
  router.put('/updateblockaccout', async (req, res) => {
    let id = req.body.id;
    let block = req.body.status;
  
    ac.findByIdAndUpdate({ _id: new ObjectId(id) },
      { $set: { block: block } },
      { new: true },
      (err, doc) => {
        if (err) {
          console.log(err);
        }
        if(block)
          res.send({ message: 'Blocked !!!' });
        else res.send({ message: 'UnBlocked !!!' });
      });
  });
  
  router.put('/createaccout', async (req, res) => {
    let loai = req.body.loai;
    let tennv = req.body.tennv;
    let email = req.body.email;
    let sdt = req.body.sdt;
    let chucvu = req.body.chucvu;
    let pw = req.body.password;
   
    const salt =await bcrypt.genSalt(10);
    const pwhash = await await bcrypt.hash(req.body.password, salt);
    console.log(salt);
    console.log(pwhash);
    let checkmail = await ac.find({ email: email });
    let cout = checkmail.length;
    if (loai == "tao") {
      let nac =await new ac({
        tennv: tennv,
        email: email,
        sdt: sdt,
        gioitinh: "nam",
        diachi: "273 an duong vuong",
        chucvu: chucvu,
        taikhoan: email,
        matkhau: await bcrypt.hash(req.body.password, salt),
        luongcoban: "15000",
        block: false,
        ngaytao: Date.now(),
        ngaycapnhat: Date.now()
      });
      if (cout == 0) {
        nac.save();
        res.send('Create account success !!!');
      } else res.send('Email exist !!!');
    } else {
      let id = req.body.id;
      let objac = {
        tennv: tennv,
        email: email,
        sdt: sdt,
        gioitinh: '',
        diachi: '',
        chucvu: chucvu,
        taikhoan: email,
        ngaycapnhat: Date.now(),
      };
      if (pw) {
        objac.matkhau = await bcrypt.hash(req.body.password, salt);
      }
      if (pw.length == 0) {
        console.log('adf');
      }
      await ac.findByIdAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: objac,
        }, { new: true }, (err, doc) => {
          if (err) console.log(err);
           res.send('Update accout success !!!');
        }
      );
    }
  });
  
  
  router.post('/addproduct',async (req, res) => {
    let getnamepicture = req.body.anh;
    console.log(getnamepicture);
    
     const storage = multer.diskStorage({
      destination: function (req, file, cb) {
         if (
           file.mimetype !== 'image/png' &&
           file.mimetype !== 'image/jpg' &&
           file.mimetype !== 'image/jpeg'
         ) {
           res.send('Error : Chỉ được upload file png,jpg,jpeg');
           return false;
         }
        cb(null, './public/images/'+req.body.maloaisp);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });
    var upload = multer({ storage: storage }).single('anh');
      upload(req, res,async function (err) {
      if (err) {
        console.log('Error : Somgthing went wrong !!!');
      }
      let objproduct = {
        tensp: req.body.tensp,
        fileanh: req.body.anh,
        chitiet: "abc",
        gia: req.body.gia,
        maloaisp: req.body.maloaisp,
        sl: "0",
        hsd: "1 tháng",
        phantram: 0,
        trangthai: 'het',
        hieuluc: 'het',
        noibat: false,
        ncc :{tenncc :"",gia:0,sdt:"",email:""},
      };
      if (req.body._type == 'tao') {
        let newproduct = new allsp(objproduct);
        newproduct.save(); 
      
      } else {
        var objfixproduct = { tensp: req.body.tensp, gia: req.body.gia, maloaisp: req.body.maloaisp };
        if (req.body.anh) {
          objfixproduct.fileanh = req.body.anh;
        }
        await allsp.findByIdAndUpdate({ _id: new ObjectId(req.body.id) }, { $set: objfixproduct }, { new: true });
  
      }
      console.log(objfixproduct);
    });
    
    res.redirect('/qlsanpham');
  })
  
  router.post('/sendemailtouser', async (req, res) => {
    let htmlt =
      '<p>Nội dung: ' + req.body.noidung + '</p>';
    if (req.body.coupon) {
      
      let newcoupon =await coupon.find({ ma: req.body.coupon,trangthai: 0 });
      if (newcoupon.length == 0) {
        res.send('Mã giảm giá không tồn tại hoặc đã được sử dụng !!!!'); return;
      } else {
        htmlt +=
          '<p>Tặng mã giảm giá: ' +
          req.body.coupon +
          '</p>';
        await coupon.findOneAndUpdate({ ma: req.body.coupon, trangthai: 0 },{trangthai : 1}, { new : true });
      }
    }
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env._EMAIL,
        pass: process.env._PASSWORD,
      },
    });
    var mailOptions = {
      from: 'OGANI <' + process.env._EMAIL + '>',
      to: req.body.email,
      subject: req.body.tieude,
      html: htmlt,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
    res.send('Email đã gửi !!!');
  })
  router.get('/nhacungcap',async (req, res) => {
    const spl = await allsp
      .find({})
      .sort({ sl: 1 });
    
    res.render('nhacungcap',{data:spl});
  })
  router.put('/updatencc', async (req, res) => {
    console.log(req.body);
    await allsp.findByIdAndUpdate({ _id: new ObjectId(req.body.id) },
      { $set: { ncc: { tenncc: req.body.tenncc, gia: req.body.gia, sdt: req.body.sdt, email: req.body.email } } },
      { new: true });
    res.send('Update success ...');
  })
  
  router.post('/apisession', (req, res) => {
    let id = req.body.id;
    
    var crt = new Cart(req.session.cart);
    crt.remove(id);
    crt.totalQty--;
    req.session.cart = crt;
    res.send(req.session.cart);
  })
  
  router.put('/regetcoupon',(req, res)=> {
    if (Number(req.body.phantram) != req.session.coupon) {
      req.session.coupon = 0;
      macoupon = 'no';
    }
    res.redirect('/checkout');
  })
  
  router.post('/abc', async (req, res) => {
    
    let hangton = require('./models/tonkho');
    let gethangton = await hangton.find({
      ngayhethan: { $gte: new Date(req.body.date1), $lte: new Date(req.body.date2) },
    }).sort({ngayhethan:1});
    console.log(gethangton);
    res.send(gethangton);
    
  })
  

module.exports = router;