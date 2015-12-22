var mongoose = require('./connect');

var Schema = mongoose.Schema;
var CourseSchema = new Schema({
	title:String,
	courseImg:String,
	direction:{
		_index:{type:Number,index:true},
		dire:{type:String}
	},
	// direction:{type:String,index:true},
	// difficulty:{type:String,index:true},
	difficulty:{
		_index:{type:Number,index:true},
		diff:{type:String}
	},
	teacher:{
		id:String,
		intro:String,
		name:String
	},
	studentCount:Number,
	courseSections:Array,
	curSection:Number,
	comments:{type:Array},
	schoolMates:[{type: Schema.Types.ObjectId,ref:"User"}],
	addTime:{
		day:String,
		minute:String
	},
	isOpen:Boolean  //暂不公开
});


CourseSchema.methods.addCourse = function(course,callback){
	this.title = course.title;
	this.courseImg = course.courseImg;
	this.direction = course.direction;
	this.difficulty = course.fifficulty;
	this.teacher = course.teacher;
	this.studentCount = 0;
	this.curSection = 0;
	this.courseSections = course.courseSections;
	this.comments = [];
	this.schoolMates = [];
	this.addTime = course.addTime;
	this.isOpen = false; //暂不公开 处于上传或者编辑状态
	this.save(callback);
};

var Course = mongoose.model('courses',CourseSchema);

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
	myCourses:[{type:Number,ref:"Course"}],
	myFriends:[{type:Number,ref:"User"}],
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
	this.school = '';
	this.addTime = user.addTime;
	this.address = '';
	this.myCourses = [];
	this.myFriends = [];
	this.root = 0;   //学生0  老师为1  默认为0
	this.active = false; //还没有激活
	this.save(callback);
}
var User = mongoose.model('users',UserSchema);

var models = {
	User:User,
	Course:Course
}

module.exports = models;
