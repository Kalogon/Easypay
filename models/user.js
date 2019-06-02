var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
//해시 알고리즘 적용 회수, 높을수록 보안은 높음 속도는 느려짐
var SALT_FACTOR = 10;
//몽구스 요청하고 필드 정의
var userSchema = mongoose.Schema({
  username: {type:String,required:true,unique:true},
  password: {type:String,required:true},
  createdAt:{type:Date,default:Date.now},
  diplayName: String,
  bio: String,
  friends: [new mongoose.Schema({friend: String, money: Number},{ _id: false })],
  room: [new mongoose.Schema({tempfriend: String, tempmoney: Number})],
  rooms: [mongoose.Schema.Types.Mixed ],
  roomNames: [String]
});
 


//모델에 간단한 메서드 추가
userSchema.methods.name = function(){
  return this.displayName||this.username;
};
//bcrypt를 위한 빈 함수
var noop = function(){};
//모델이 저장되기("save") 전(.pre)에 실행되는 함수
userSchema.pre("save",function(done){
  let user = this;
  if(!user.isModified("password")){
    return done();
  }
  bcrypt.genSalt(SALT_FACTOR,function(err,salt){
    if(err){return done(err);}
    bcrypt.hash(user.password,salt,noop,function(err,hashedPassword){
      if(err){return done(err);}
      user.password = hashedPassword;
      done();
    });
  });
});
// 비밀번호 검사하는 함수
userSchema.methods.checkPassword = function(guess,done){
  bcrypt.compare(guess,this.password,function(err,isMatch){
      done(err,isMatch);
  });
};

//돈관리 함수
userSchema.methods.addFriend = function (newfriend, pay) {
  let input={friend:newfriend, money:pay}
  this.friends.push(input);
  return this.save();
};


//userSchema.methods.plusMoney = function(oldfriend,pay) {
  //let temp=0
  //if(Number(pay)>0){
  //  temp=Number(this.money[index])+Number(pay);
  //} 
  //else{
    //temp=Number(this.money[index])-Math.abs(Number(pay))
  //}
  //console.log(this);
  //return this.update({"friends.friend": oldfriend},{"$set":{
   // "friends.$.money": temp
  //}});
//}

userSchema.methods.removeFriend = function (oldfriend,oldmoney) {
  let input={friend:oldfriend,money:oldmoney}
  this.friends.pull(input);
  return this.save();
};

userSchema.methods.addRoom = function (eachfriend, eachpay) {
  let input={tempfriend:eachfriend, tempmoney:eachpay}
  this.room.push(input);
  return this.save();
};

userSchema.methods.putRoom = function () {
  console.log(this.room)
  this.rooms.push(this.room);
  console.log(this.rooms)
  return this.save();
};

userSchema.methods.deleteRoom = function () {
  this.room=[]
  return this.save();
};

userSchema.methods.addroomname = function (name) {
  this.roomNames.push(name)
  return this.save()
}
//실제로 사용자 모델만들고 내보내기
var User = mongoose.model("User",userSchema);
module.exports = User;
