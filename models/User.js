var mongoose = require('./connect');

	var Schema = mongoose.Schema;
	var UserSchema = new Schema({
		name:String,
		password:{type:String,index:true},
		header:String,
		email:{type:String, index:true,unique:true},
		bgSrc:String,
		intro:String,
		school:String,
		addTime:{
			day:String,
			minute:String
		},
		address:String,
		myCourses:[{type:Schema.Types.ObjectId,ref:'Course'}],
		myFriends:[{type:Schema.Types.ObjectId,ref:'User'}],
		root:Number,
		active:Boolean,
		isopen:{type:Number,default:0},
		phone:Number
	});

	UserSchema.methods.addUser = function(user,callback){
		this.name = user.name;
		this.password = user.password;
		this.header = '/images/userheader/header.jpg'; //默认头像
		this.email = user.email;
		this.bgSrc = '/images/userbg/bg.jpg';
		this.intro = '你好吗？在努力吗？有微笑吗？';
		this.school = '还没有设置学校';
		this.addTime = user.addTime;
		this.address = '还没有设置地址';
		this.myCourses = [];
		this.myFriends = [];
		this.root = 0;   //学生0  老师为1  默认为0
		this.active = false; //还没有激活
		this.save(callback);
	}
	var User = mongoose.model('users',UserSchema);

	module.exports = User;


