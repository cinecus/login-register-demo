var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator')
var User= require('../model/user')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

//หน้า index มี middleware คือ enSureAuthenticated เพื่อดูว่า login อยู่ไหม ถ้า login อยู่ก็ไปหน้า index ถ้าไม่ได้ login ก็ไปที่หน้า login 
router.get('/',enSureAuthenticated, function(req, res, next) {
  res.render('index');
});

function enSureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }else{
    res.redirect('/login')
  }
}


//register
router.get('/register',function(req,res,next){
  res.render('register')
});

//รับ input จากหน้า register ถ้าไม่ผิดเงื่อนไขก็ส่งข้อมูลไปบันทึกใน DB
router.post('/register',[
  check('email', 'กรุณาป้อนอีเมล').isEmail(),
  check('username','กรุณาป้อนชื่อของท่าน').not().isEmpty(),
  check('password','กรุณาป้อนรหัสผ่าน').not().isEmpty()
]
,function(req,res,next){
  //Validation Data
  const result = validationResult(req)
  var errors = result.errors
  //return errors
  if(!result.isEmpty()){
    res.render('register',{errors:errors})
  }else{
    //Insert Data
    var username = req.body.username;
    var password=req.body.password;
    var email=req.body.email;
    var newUser = new User({
      username:username,
      password:password,
      email:email
    })
    User.createUser(newUser,function(err,user){
      if(err) throw err
    })
    res.location('/')
    res.redirect('/')
  }
})

//login
router.get('/login',function(req,res,next){
  res.render('login')
});


//รับ input จากหน้า login ใช้ passport authenticate เป็น built-in function ตรวจสอบการทำงาน ถ้าผิดพลาดจะ Redirect กลับไปที่หน้า login แล้วแสดง Flash message 
router.post('/login',passport.authenticate('local',{
  failureRedirect:'/login',
  failureFlash:true
}),
function(req,res,next){
  req.flash("success","ลงชื่อเข้าใช้เรียบร้อยแล้ว")
  res.redirect('/')
});


//เก็บ id user ที่ loginไว้
passport.serializeUser(function(user,done){
  done(null,user.id)
})
//เอา id ไปใช้หา user แล้วเก็บ user เอาไว้
passport.deserializeUser(function(id,done){
  User.getUserById(id,function(err,user){
    done(err,user)
  })
})

//ใช้ LocalStrategy ตรวจดูว่า username กับ password ถูกต้องหรือไม่
passport.use(new LocalStrategy(function(username,password,done){
  //ค้นหา username ก่อน
  User.getUserByName(username,function(err,user){
    if(err) throw error
    if(!user){
      //ไม่พบผู้ใช้ในระบบ
      return done(null,false)
    }
    //เจอผู้ใช้ก็ตรวจสอบ password
    User.comparePassword(password,user.password,function(err,isMatch){
        if(err) throw error
        if(isMatch){
          return done(null,user)
        }
        else{
          return done(null,false)
        }
      })
  })
}))


//logout
router.get('/logout',function(req,res,next){
  req.logout()
  res.redirect('login')
});

module.exports = router;
