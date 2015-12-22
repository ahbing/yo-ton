var mongoose = require('./connect');

	var Schema = mongoose.Schema;
	var CourseSchema = new Schema({
		title:String,
		courseImg:String,
		direction:{type:String,index:true},
		difficulty:{type:String,index:true},
		teacher:{
			id:String,
			intro:String,
			name:String
		},
		studentCount:Number,
		courseSections:Array,
		curSection:Number,
		comments:Array,
		schoolMates:Array,
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
		this.difficulty = course.difficulty;
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

	module.exports = Course;

