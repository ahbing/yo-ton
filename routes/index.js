var express = require('express');
var crypto = require('crypto');
// var	mongoose = require('../models/connect');
var User = require('../models/User');
var Course = require('../models/Course');
var CourseList = require('../models/CourseList');
// var models = require('../models/models');
// var User = models.User;
// var Course = models.Course;
var fs = require('fs');
var nodemailer = require('nodemailer');
var multer = require('multer');



var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var num = 4;
	var query = Course.find({});
	query.limit(num);
	query.sort({addTime:-1});
	query.exec(function(err,courses){
		if(err){
			console.log(err);
			return res.redirect('/');
		}
		res.render('index',{
			courses:courses,
			root:req.session.root,
	  	user:req.session.user,
	  	login:req.session.login,
	  	error:req.flash('error').toString(),
	  	success:req.flash('success').toString()
		});
		console.log(req.session);
		console.log('hello world');
	});
});

router.post('/reg',checkNotLogin);
router.post('/reg',function(req,res,next){
	console.log(req.body);
	var email = req.body.email;
	var psw = req.body.password;
	var psw2 = req.body.password2;
	var user = new User();
	var date = new Date();
	var time = {
		day:date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
  	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}

	if(psw!==psw2){
		req.flash('error','两次密码输入不一致');
		return res.redirect('back');
	}
	var shasum = crypto.createHash('sha1');
	shasum.update(psw);
	var newPsw = shasum.digest('hex');
	var newUser = {
		name:email,
		password:newPsw,
		email:email,
		addTime:time
	}
	User.find({email:email},function(err,theUser){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		if(theUser.length!==0){
			//存在当前email用户
			req.flash('error','当前邮箱已经被注册了，换一个吧');
			return res.redirect('back');
		}
		user.addUser(newUser,function(err,user){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			var userId = user._id;
			var acCode = user.password.slice(0,10); //验证邮箱的激活码 去加密密码的前6位.
			req.flash('success','注册成功，欢迎来到邮筒!   ：）');
			//验证
			active(email,userId,acCode,req,res);
			//验证成功才算登录
			console.log(user.active);
			console.log(user);
			req.session.user = user;
			req.session.login = true;
			req.session.root = user.root;
			// return res.redirect('/');
		});
	})
});
router.post('/login',checkNotLogin);
router.post('/login',function(req,res){
	var email = req.body.email;
	var psw = req.body.password;

	var shasum = crypto.createHash('sha1');
	shasum.update(psw);
	psw = shasum.digest('hex');

	User.find({email:email},function(err,user){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		if(user.length == 0){
			req.flash('error','当前邮箱还没有注册，请先注册');
			return res.redirect('/');
		}
		user = user[0];
		var truePsw = user.password;
		if(truePsw !== psw){
			req.flash('error','用户名或密码错误');
			return res.redirect('/');
		}
		req.session.login =true;
		req.session.user = user;
		req.session.root = user.root;
		req.flash('success','登录成功,欢迎你');
		res.redirect('/');
	});
});

router.get('/logout',checkLogin);
router.get('/logout',function(req,res){
	req.session.login = false;
	req.session.user = null;
	req.flash('success','你已经退出邮筒，再见');
	return res.redirect('/');
});


router.get('/courses', function(req, res, next) {
	Course.count({},function(err,count){
	 	if(err){
	 		console.log(err);
	 		return res.redirect('/');
	 	}
	 	var dire = req.query.dire;
		var diff = req.query.diff;
		var query = Course.find({});
		var getList = {};
		if(dire){
			getList = {dire:dire};
			query = Course.find({direction:dire});
		}
		if(diff){
			getList = {child:diff};
			query = Course.find({difficulty:diff});
		}
	 	var num = 20;  // 每页显示10篇文章
	 	var total = count;
	 	var page = req.query.p? parseInt(req.query.p):1;
	 	var lastPage = parseInt((total/num));
	 	var pageNumArr = [];
	 	for(var i = 0;i<lastPage;i++){
	 		pageNumArr.push(i);
	 	}
	 	if(pageNumArr.length==0){
	 		pageNumArr = [0];
	 	}
	 	query.skip((page-1)*num);
	 	query.limit(num);

	 	//增加最后编辑字段  方便排序
	 	query.sort({addTime:-1});
	 	query.exec(function(err,courses){
	 		if(err){
	 			console.log(err);
	 			return;
	 		}
	 		console.log(getList);
	 		CourseList.find({},function(err,list){

	 			CourseList.find(getList,function(err,direList){
					var child = [];
		 			direList.forEach(function(item){
		 				// console.log(item.child);
		 				item.child.forEach(function(val){
		 					child.push(val);
		 				});
		 			});
		 			console.log(child);
			 		res.render('courses',{
			 			list:list,
			 			dire:dire,
			 			child:child,
			 			courses:courses,
			 			lastPage:lastPage,
			 			page:page,
			 			pageNumArr:pageNumArr,
			 			isFirstPage:(page -1) == 0,
			 			isLastPage :( (page-1)* num + courses.length)== total,
						root:req.session.root || 0,
						user:req.session.user || {},
						login:req.session.login || false,
						error:req.flash('error').toString(),
						success:req.flash('success').toString()
			 		});
	 			});
	 		});
	 	});
 	});
});


router.get('/course/:courseId',checkLogin);
router.get('/course/:courseId', function(req, res) {
	var courseId = req.params.courseId;
	Course.findOne({_id:courseId},function(err,course){
		if(err){
			console.log(err);
			res.redirect('back');
		}
		var userId = req.session.user._id;
		var teacherId = course.teacher.id;
		User.findOne({_id:teacherId},function(err,teacher){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
	  	// 在个人课表中添加此课程
	  	User.update({
	  		_id:userId,
	  		myCourses:{$ne:courseId}
	  	},{
	  		$push:{myCourses:{$each:[courseId],$position:0}}
	  	},function(err){
	  		if(err){
	  			console.log(err);
	  			return res.redirect('back');
	  		}
	  		// 在课程中添加该学生
	  		Course.update({
	  			_id:courseId,
	  			schoolMates:{$ne:userId}
	  		},{
	  			$push:{schoolMates:{$each:[userId],$position:0}},
	  			$inc:{studentCount:1}
	  		},function(err){
	  			if(err){
		  			console.log(err);
		  			return res.redirect('back');
	  			}
	  			res.render('course',{
				  	course:course,
				  	teacher:teacher,
				  	user:req.session.user || {},
				  	login:req.session.login || false,
				  	error:req.flash('error').toString(),
				  	success:req.flash('success').toString()
			  	});
	  		});
	  	});
		})
	});
});

router.get('/getClass/:courseId',checkLogin);
router.get('/getClass/:courseId',function(req,res){
	var courseId = req.params.courseId;
	// console.log(courseId);
	Course.findOne({_id:courseId},function(err,course){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var userIds = course.schoolMates;
		var num = 10; //一次加载num条数据
		var now = 0;
		var page = req.query.p? parseInt(req.query.p):1;
		var start = (page-1)*num;
		var end = page*num;
		// 当查询数大于所有数时   取所有数的最后一次数
		if(userIds.length<page*num){
			num = userIds.length-((page-1)*num);
			start = (userIds.length-num);
			end = userIds.length;
		}
		//  如果可取数小于0了  发送空数组
		if(num<=0){
			res.send([null]);
		}
		// query.skip((page-1)*num);
		// query.limit(num);
		var lists = [];
		for(var i = start;i<end;i++){
			(function(i){
				User.findOne({_id:userIds[i]},'_id address school intro name header',function(err,list){
					if(err){
						console.log(err);
						return res.redirect('back');
					}
					console.log(list);
					lists.push(list);
					now++;
					//循环完毕  就将lists结果返回
					if(now == end){
						res.send(lists);
					}
				})
			})(i);
		}
	});
});


router.get('/getComment/:courseId',checkLogin);
router.get('/getComment/:courseId',function(req,res){
	var courseId = req.params.courseId;
	Course.findOne({_id:courseId},function(err,item){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var comments = item.comments;
		var page = req.query.p? parseInt(req.query.p):1;
		var num = 10; //一次加载num条数据
		var start = (page-1)*num;
		var end = page*num;
		// 当查询数大于所有数时   取所有数的最后一次数
		if(comments.length<page*num){
			num = comments.length-((page-1)*num);
			start = comments.length - num;
			end = comments.length;
		}
		//  如果可取数小于0了  发送空数组
		if(num<=0){
			return res.send([null]);
		}
		var lists = [];
		for(var i =start;i<end;i++){
			(function(i){
				lists.push(comments[i]);
				if(i==end-1){
					//循环完毕  就将lists结果返回
					//console.log(lists);
					return res.send(lists);
				}
			})(i);
		}



		// for(var i = start; i<end;i++){
		// 	(function(i){
		// 		var comment = comments[i];
		// 		var content = comment.content;
		// 		var time = comment.time;
		// 		var userId = comment.userId;
		// 		User.findOne({_id:userId},'header name',function(err,user){
		// 			if(err){
		// 				console.log(err);
		// 				return res.redirect('back');
		// 			}
		// 			// user对象无法添加属性
		// 			var list = {};
		// 			console.log('********************************************************');
		// 			console.log(content);
		// 			console.log(comments[i].content);
		// 			console.log('********************************************************');
		// 			list.header = user.header;
		// 			list.name = user.name;
		// 			list._id = user._id;
		// 			list.content = content;
		// 			list.time = time;
		// 			lists.push(list);
		// 			// console.log('----------------------------------------------------------------------------');
		// 			// console.log(list);
		// 			// console.log('----------------------------------------------------------------------------');

		// 			if(i == end-1){
		// 				//循环完毕  就将lists结果返回
		// 				console.log(lists);
		// 				return res.send(lists);
		// 			}
		// 		});
		// 	})(i);
		// }
	});
});




router.post('/comment/:courseId',checkLogin);
router.post('/comment/:courseId',function(req,res){
	var courseId = req.params.courseId;
	var url = '/course/'+courseId+'?comment=true';
	console.log(url);
	var date = new Date();
	var time = date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate();
	var content = req.body['comment-content'];
	var header = req.session.user.header;
	var name = req.session.user.name;
	var userId = req.session.user._id;
	console.log(content);
	Course.update(
		{_id:courseId},
		{$push:{comments:{
			$each:[{
				userId:userId,
				content:content,
				name:name,
				header:header,
				time:time}],
			$position:0}}
		},
		function(err){
			if(err){
				return console.log(err);
			}
			req.flash('success','留言成功');
			return res.redirect(url);
		}
	);
});

router.get('/person/:personId',checkLogin);
router.get('/person/:personId', function(req, res, next) {
	 var personId = req.params.personId;
	 var userId = req.session.user._id;
	 User.findOne({_id:personId},function(err,person){
	 	if(err){
	 		console.log(err);
	 		return res.redirect('back');
	 	}
	 	User.findOne({_id:userId},function(err,user){
	 		var courses = person.myCourses;
		 	var friends = user.myFriends;
		 	var hasAdd = false;
		 	if(friends.indexOf(personId)!==-1){
				hasAdd = true;
		 	}
		 	res.render('person',{
		 		person:person,
		 		hasAdd:hasAdd,
		 		user:req.session.user || {},
		  	login:req.session.login || false,
		  	error:req.flash('error').toString(),
		  	success:req.flash('success').toString()
		 	});
	 	});
	});
});

router.get('/personIndex/:personId',checkLogin);
router.get('/personIndex/:personId',function(req,res){
	 var personId = req.params.personId;
	 User.findOne({_id:personId},function(err,person){
	 	if(err){
	 		console.log(err);
	 		return res.redirect('back');
	 	}
	 	var courses = person.myCourses;
		var page = req.query.p? parseInt(req.query.p):1;
		var num = 10; //一次加载num条数据
		var start = (page-1)*num;
		var end = page*num;
		var courseList = [];
		// 当查询数大于所有数时   取所有数的最后一次数
		if(courses.length<page*num){
			num = courses.length-((page-1)*num);
			start = courses.length - num;
			end = courses.length;
		}
		//  如果可取数小于0了  发送空数组
		if(num<=0){
			return res.send([null]);
		}

	 	courses = courses.slice(start,end);
	 	var filter = '_id difficulty direction teacher courseImg title';
	 	Course.find({_id:{$in:courses}},filter,function(err,lists){
			res.send(lists);
	 	});
	});
});

router.get('/personFriends/:personId',checkLogin);
router.get('/personFriends/:personId',function(req,res){
	 var personId = req.params.personId;
	 User.findOne({_id:personId},function(err,person){
	 	if(err){
	 		console.log(err);
	 		return res.redirect('back');
	 	}
	 	var friends = person.myFriends;
		var page = req.query.p? parseInt(req.query.p):1;
		var num = 10; //一次加载num条数据
		var start = (page-1)*num;
		var end = page*num;
		var courseList = [];
		// 当查询数大于所有数时   取所有数的最后一次数
		if(friends.length<page*num){
			num = friends.length-((page-1)*num);
			start = friends.length - num;
			end = friends.length;
		}
		//  如果可取数小于0了  发送空数组
		if(num<=0){
			return res.send([null]);
		}

	 	friends = friends.slice(start,end);
	 	var filter = '_id header name school address email';
	 	User.find({_id:{$in:friends}},filter,function(err,lists){
			res.send(lists);
	 	});
	});
});


router.get('/delete/:courseId',checkLogin);
router.get('/delete/:courseId',function(req,res){
	var courseId = req.params.courseId;
	var userId = req.session.user._id;
	User.findOne({_id:userId},function(err,user){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var myCourses = user.myCourses;
		var theIndex = myCourses.indexOf(courseId);
		myCourses.splice(theIndex,1);  // 删除该id
		User.findByIdAndUpdate(userId,{$set:{
			myCourses:myCourses
		}},function(err){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.flash('success','删除课程成功');
			return res.redirect('back');
		});
	});
});

router.get('/removeFrirend/:personId',checkLogin);
router.get('/removeFrirend/:personId',function(req,res){
	var personId = req.params.personId;
	var userId = req.session.user._id;

	User.findOne({_id:userId},function(err,user){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var friends = user.myFriends;
		var theIndex = friends.indexOf(personId);
		friends.splice(theIndex,1);
		User.findByIdAndUpdate(userId,{$set:{
			myFriends:friends
		}},function(err){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.flash('success','成功移除关注');
			return res.redirect('back');
		});
	});
});

router.get('/addFrirend/:personId',checkLogin);
router.get('/addFrirend/:personId',function(req,res){
	var personId = req.params.personId;
	var userId = req.session.user._id;
	User.update({
  	_id:userId,
  		myFriends:{$ne:personId}
  	},{
  		$push:{myFriends:{$each:[personId],$position:0}}
  	},function(err){
  		if(err){
  			console.log(err);
  			return res.redirect('back');
  		}
  		req.flash('success','成功添加关注');
  		return res.redirect('back');
  	}
  );
});


router.get('/setting/:personId?',checkLogin);
router.get('/setting/:personId?', function(req, res, next) {
	var personId = req.params.personId;
	User.find({_id:personId},function(err,person){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var info = false,password = false, header = false;
		if(req.query.editinfo=='true') info = true;
		if(req.query.editpsw=='true') password = true;
		if(req.query.editheader=='true') header = true;
		toRender = {
			info:info,
			password:password,
			header:header
		}
		var person = person[0];
		res.render('setting',{
			person:person,
			toRender:toRender,
	 		user:req.session.user || {},
	  	login:req.session.login || false,
	  	error:req.flash('error').toString(),
	  	success:req.flash('success').toString()
		});
	});
});

router.get('/settingActive/:personId',checkLogin);
router.get('/settingActive/:personId',function(req,res){
	var personId = req.params.personId;
	User.findOne({_id:personId},function(err,person){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		// active(email,userId,acCode,req,res)
		var email = person.email;
		var acCode = person.password.slice(0,10);
		active(email,personId,acCode,req,res);
	});
});

router.post('/settingInfos/:personId',checkLogin);
router.post('/settingInfos/:personId',function(req,res){
	var personId = req.params.personId;
	console.log(personId);
	var oldEmail = req.session.user.email;
	var body = req.body;
	var query = {_id:personId};
	var updatePerson = {
		name:body.username,
		email:body.email,
		school:body.school,
		company:body.company,
		address:body.address,
		isopen:body.isopen,
		phone:body.phone
	};
	console.log(oldEmail);
	if(oldEmail !== body.email){
		updatePerson.active = false;
	}
	console.log(updatePerson);
	console.log(body.phone);
	console.log(body.isopen);
	var q = User.where(query).setOptions({ overwrite: true, upsert: true  });
	q.update({
		$set:(updatePerson),
		$currentDate:{ lastModified: {$type: 'date'} }
	},function(err){
		if(err){
			console.log(err);
		}
		req.session.user.name = updatePerson.name;
		req.session.user.email = updatePerson.email;
		req.session.user.school = updatePerson.school;
		req.session.user.company = updatePerson.company;
		req.session.user.address = updatePerson.address;
		req.session.user.isopen = updatePerson.isopen;
		req.session.user.phone = updatePerson.phone;
		req.flash('success','信息更新成功');
		return res.redirect('back');
	});
});

router.post('/settingpassword/:personId',checkLogin);
router.post('/settingpassword/:personId',function(req,res){
	var personId = req.params.personId;
	var oldPsw = req.body.oldpsw;
	var newPsw = req.body.newpsw;
	var newPsw2 = req.body.newpsw2;
	if(newPsw.length<6){
		req.flash('error','密码长度不少于6位');
		return res.redirect('back');
	}
	if(newPsw !== newPsw2){
		req.flash('error','两次密码输入不一样');
		return res.redirect('back');
	}
	oldPsw = crypto.createHash('sha1').update(oldPsw).digest('hex');
	User.findOne({_id:personId},function(err,person){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var oldPsw2 = person.password;
		if(oldPsw == oldPsw2){
			//原密码正确
			newPsw = crypto.createHash('sha1').update(newPsw).digest('hex');
			var query = {_id:personId};
			var updatePsw = {
				password : newPsw
			};
			User.update(query,updatePsw,function(err){
				if(err){
					console.log(err);
					return res.redirect('back');
				}
				req.flash('success','密码更新成功');
				return res.redirect('back');
			});
		}else{
			req.flash('error','原密码输入错误');
			return res.redirect('back');
		}
	});
});

var userBg = multer.diskStorage({
	destination:function(req,file,cb){
    cb(null, './public/images/userbg/')
	},
	filename:function(req,file,cb){
    cb(null, file.fieldname + '-' + Date.now())
	}
});

var uploadBg = multer({
	storage:userBg
}).fields([
	{name:'personBg',maxCount:1}
]);

router.post('/editPersonBg/:personId',checkLogin);
router.post('/editPersonBg/:personId',function(req,res){
	uploadBg(req,res,function(err){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var personId = req.params.personId;
		var imgFilename = req.files.personBg[0].filename;
		var imgPath = '/images/userbg/'+imgFilename;
		// console.log(imgPath);
		var query = {_id:personId};
		var updateBg = {bgSrc:imgPath};

		User.update(query,updateBg,function(err){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.session.user.bgSrc=imgPath;
			req.flash('success','背景修改成功');
			return res.redirect('back');
		});
	});
});


var userHeader = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/userheader/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var uploadHeader = multer({
 storage: userHeader
}).fields([
	{name:'newheader',maxCount:1},
]);

router.post('/settingheader/:personId',checkLogin);
router.post('/settingheader/:personId',function(req,res){
	uploadHeader(req,res,function(err){
		if(err){
			console.log(err);
		}
		var personId = req.params.personId;
		var imgFilename = req.files.newheader[0].filename;
		var imgPath = '/images/userheader/'+imgFilename;
		// console.log(imgPath);
		var query = {_id:personId};
		var updateHeader = {header:imgPath};

		User.update(query,updateHeader,function(err){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.session.user.header=imgPath;
			req.flash('success','头像修改成功');
			return res.redirect('back');
		});

	});
});


router.get('/about', function(req, res, next) {
  res.render('about');
});


router.get('/active/:userId/:acCode',checkLogin);
router.get('/active/:userId/:acCode',function(req,res){
	var userId = req.params.userId,
			acCode = req.params.acCode;
	User.find({_id:userId},function(err,user){
		user = user[0];
		console.log(user);
		var theCode = user.password.slice(0,10);
		if(user._id == userId && theCode == acCode){
			//更新数据库
			var query = {_id:userId},
					updateActive = {active:true};
			User.update(query,{$set:updateActive},{multi:false},function(err){
				if(err){
					req.flash('error','验证失败，请稍后重试');
					return res.redirect('/');
				}
				req.session.login = true;
				req.flash('success','邮箱验证成功');
				return res.redirect('back');
			});
		}else{
			req.flash('error','验证失败，请在稍后重试');
			return res.redirect('/');
		}
	});
});

router.get('/toActive',function(req,res){
	res.render('toActive');
});

function checkLogin(req,res,next){
	if(!req.session.login){
		req.flash('error','请先登录邮筒噢，登录一下下很快的呢');
		return res.redirect('/');
	}
	next();
}

function checkNotLogin(req,res,next){
	if(req.session.login){
		req.flash('error','你已经登录辣');
		return res.redirect('back');
	}
	next();
}

function active(email,userId,acCode,req,res){
	var transporter = nodemailer.createTransport({
	  	"aliases": ["QQ Enterprise"],
	    "domains": [
	        "exmail.qq.com"
	    ],
	    "host": "smtp.exmail.qq.com",
	    "port": 465,
	    "secure": true,
		  auth: {
	      user: 'hr@betahouse.us',
	       pass: 'beta22'
		  }
	}

	);
	var mailOptions = {
	    from: 'hr@betahouse.us',
	    to: email ,
	    subject: 'yo-ton 验证注册邮箱',
	    // 线上
	    // html: '<a href="https://betashare.herokuapp.com/active/'+userId+'/'+acCode+'">点此激活你在 beta-分享 的账户</a> <br/><br/><br/>beta-分享  小组  <br/>敬上'
	    //  本地
	    html: '<a href="127.0.0.1:3000/active/'+userId+'/'+acCode+'">点此激活你在 邮筒网 的账户</a><br>如果无法打开，请复制下面的链接到浏览器输入框验证 127.0.0.1:3000/active/'+userId+'/'+acCode+'  <br/><br/><br/>邮筒网 <br/>敬上<br/>'

	};
	transporter.sendMail(mailOptions, function(err, info){
    if(err){
      console.log(err);
     	req.flash('error',err);
    	return res.redirect('/');
    }else{
	    return res.redirect('/toActive');
	    // console.log('Message sent: ' + info.response);
    }
	});
}

module.exports = router;
