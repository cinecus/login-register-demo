var mongoose = require('mongoose')
var mongoDB = 'mongodb://localhost:27017/LoginDB'
var bcrypt = require('bcrypt')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy



//เชื่อมต่อฐานข้อมูล
mongoose.connect(mongoDB,{
    useNewUrlParser:true
})

var db=mongoose.connection;
db.on('error',console.error.bind(console,'Mongodb Connect Error'))

//สร้าง table
var userSchema = mongoose.Schema({
    username:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    }
})

var User = module.exports = mongoose.model('User',userSchema)

module.exports.createUser=function(newUser,callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
           newUser.password = hash
           newUser.save(callback)
        });
    });
    newUser.save(callback)
}

//ค้นหา user จาก id
module.exports.getUserById = function(id,callback){
    User.findById(id,callback)
}

//ให้ ค้นว่ามี
module.exports.getUserByName = function(username,callback){
    var query={
        username:username
    }
    User.findOne(query,callback)
}

//เปรียบเทียบ password
module.exports.comparePassword = function(password,hash,callback){
    bcrypt.compare(password,hash,function(err,isMatch){
        callback(null,isMatch)
    })
}