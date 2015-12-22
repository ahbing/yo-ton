var express = require('express');
var CourseList = require('../models/CourseList');
var User = require('../models/User');
var Course = require('../models/Course');
var multer = require('multer');

var router = express.Router();


/**
*
*  后台管理操作  上传视频   编辑课程信息  。。。
**
*  后台管理操作  上传视频   编辑课程信息  。。。
**
*  后台管理操作  上传视频   编辑课程信息  。。。
**
*  后台管理操作  上传视频   编辑课程信息  。。。
**
*  后台管理操作  上传视频   编辑课程信息  。。。
**
*  后台管理操作  上传视频   编辑课程信息  。。。
*
*/

router.get('/',checkLogin,hasRoot);
router.get('/',function(req,res){
	res.render('admin',{
		root:req.session.root || 0,
  	user:req.session.user || {},
  	login:req.session.login || false,
  	error:req.flash('error').toString(),
  	success:req.flash('success').toString()
	});
});

router.get('/upload',checkLogin,hasRoot);
router.get('/upload', function(req, res, next) {
	CourseList.find({},function(err,list){
  	res.render('upload',{
  		list:list,
  		child:list[0].child,
	  	root:req.session.root || 0,
	  	user:req.session.user || {},
	  	login:req.session.login || false,
	  	error:req.flash('error').toString(),
	  	success:req.flash('success').toString()
	  });
	});
});

router.get('/direUpload',checkLogin,hasRoot);
router.get('/direUpload',function(req,res){
	var dire = req.query.dire;
	console.log(dire);
	CourseList.findOne({dire:dire},function(err,item){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		res.send(item.child);
	});
});



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/courseImg')
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now()+'-'+ file.originalname)
  }
});

var uploadImg = multer({
	storage: storage
}).fields([
	{name:'img',maxCount:1},
]);

router.post('/upload',checkLogin,hasRoot);
router.post('/upload',function(req,res,next){
	uploadImg(req,res,function(err){
		if(err){
			console.log(err);
			return;
		}
		var body = req.body;
		var imgFilename = req.files.img[0].filename;
		var imgPath = '/images/courseImg/'+imgFilename;
		var title = body.title;
		var teacherName = body.teacherName;
		var teacherId = body.teacherId;
		var teacherIntro = body.teacherIntro;
		var courseDirection = body.courseDirection;
		var courseDifficulty = body.courseDifficulty;
		var date = new Date();
		var time={
			day:date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
			minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
	  	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
		}

		var newCourse = {
			title:title,
			courseImg:imgPath,
			direction:courseDirection,
			difficulty:courseDifficulty,
			teacher:{name:teacherName,id:teacherId,intro:teacherIntro},
			courseSections:[],
			addTime:time
		};

		var course = new Course();
		course.addCourse(newCourse,function(err,course){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.flash('success','新课程上传成功');
			res.redirect('/admin/courseEditList');
		});
	});
});


router.get('/courseEditList',checkLogin,hasRoot);
router.get('/courseEditList',function(req,res){
	Course.count({},function(err,count){
	 	if(err){
	 		console.log(err);
	 		return res.redirect('/');
	 	}
	 	var num = 20;  // 每页显示10篇文章
	 	var total = count;
	 	var page = req.query.p? parseInt(req.query.p):1;
	 	var lastPage = parseInt((total/num));
	 	var query = Course.find({});
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
	 		res.render('courseEditList',{
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

router.get('/editCourseInfo/:courseId',checkLogin,hasRoot);
router.get('/editCourseInfo/:courseId',function(req,res){
	var courseId = req.params.courseId;
	Course.find({_id:courseId},function(err,course){
		if(err){
			console.log(err);
			return res.redirect('back');
		}

		if(course.length==0){
			req.flash('error','课程不存在');
			return res.redirect('back');
		}
		CourseList.find({},function(err,list){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			res.render('editCourseInfo',{
				course:course[0],
				list:list,
				child:list[0].child,
				root:req.session.root || 0,
		  	user:req.session.user || {},
		  	login:req.session.login || false,
		  	error:req.flash('error').toString(),
		  	success:req.flash('success').toString()
			});
		});
	});
});

router.post('/editCourseInfo/:courseId',checkLogin,hasRoot);
router.post('/editCourseInfo/:courseId',function(req,res){
	uploadImg(req,res,function(err){
		if(err){
			console.log(err);
			return;
		}
		var courseId = req.params.courseId;
		var body = req.body;
		var imgPath ='';
		if(req.files.img){
			var imgFilename = req.files.img[0].filename;
			imgPath = '/images/courseImg/'+imgFilename;
		}else{
			imgPath = req.body.oldImg;
		}
		var teacherName = body.teacherName;
		var teacherId = body.teacherId;
		var teacherIntro = body.teacherIntro;
		var direction = body.courseDirection;
		var difficulty = body.courseDifficulty;
		var query = {_id:courseId};
		var updateCourse = {
			title:body.title,
			courseImg:imgPath,
			direction:direction,
			difficulty:difficulty,
			teacher:{name:teacherName,id:teacherId,intro:teacherIntro},
		};
		Course.update(query,{
			$set:(updateCourse),
			$currentDate: { lastModified: {$type: 'date'} }
		},function(err,course){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.flash('success','信息更新成功');
			return res.redirect('/admin/uploadVideo/'+courseId);
		});
	});
});

router.get('/delete/:courseId',checkLogin,hasRoot);
router.get('/delete/:courseId',function(req,res){
	 var courseId = req.params.courseId;
	 Course.remove({_id:courseId},function(err){
	 	if(err){
	 		console.log(err);
	 		return res.redirect('back');
	 	}
	 	req.flash('success','成功删除课程');
	 	return res.redirect('/admin/courseEditList');
	 });
});

router.get('/courseGuide',checkLogin,hasRoot);
router.get('/courseGuide',function(req,res){
	var dire = req.query.dire;
	var diff = req.query.diff;
	var query = Course.find({});
	var getList = {};
	if(dire){
		getList = {dire:dire};
	}
	if(diff){
		getList = {child:diff};
	}
	CourseList.find({},function(err,list){
		console.log(list);
		CourseList.find(getList,function(err,direList){
			var child = [];
			direList.forEach(function(item){
				item.child.forEach(function(val){
					child.push(val);
				});
			});
			res.render('courseGuide',{
				list:list,
				child:child,
				dire:dire,
				root:req.session.root || 0,
		  	user:req.session.user || {},
		  	login:req.session.login || false,
		  	error:req.flash('error').toString(),
		  	success:req.flash('success').toString()
			});
		});
	});
});

router.post('/courseGuide',checkLogin,hasRoot);
router.post('/courseGuide',function(req,res){
	var dire = req.body.title;
	var name = req.body.name;
	var course = new CourseList();
	var cour = {
		dire:dire,
		name:name
	};
	CourseList.findOne({dire:dire},function(err,couruse){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		// console.log(couruse);
		if(!!couruse){
			// 如果已经存在这方向  更新child
			CourseList.update({
				dire:dire,
				child:{$ne:name}
			},{
				$push:{child:name}
			},function(err){
				if(err){
					console.log(err);
					return res.redirect('back');
				}
				req.flash('success','更新成功');
				return res.redirect('back');
			});
		}else{
			//不存在就添加
			course.addCour(cour,function(err){
				if(err){
					console.log(err);
					return res.redirect('back');
				}
				req.flash('success','上传成功');
				return res.redirect('back');
			});
		}
	})

});



router.get('/uploadVideo/:courseId',checkLogin,hasRoot);
router.get('/uploadVideo/:courseId',function(req,res){
	var courseId = req.params.courseId;
	Course.find({_id:courseId},function(err,course){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		res.render('uploadVideo',{
			course:course[0],
			root:req.session.root || 0,
	  	user:req.session.user || {},
	  	login:req.session.login || false,
	  	error:req.flash('error').toString(),
	  	success:req.flash('success').toString()
		});
	});
});

var courseVideo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/video/')
  },
  filename: function (req, file, cb) {
    // cb(null,  Date.now()+'-'+ file.originalname)
    console.log(file);
    cb(null,Date.now()+'-'+file.originalname)
  }
});

var uploadVideo = multer({
	storage: courseVideo
}).fields([
	{name:'courseVideo',maxCount:10},
]);
router.post('/uploadVideo/:courseId',checkLogin,hasRoot);
router.post('/uploadVideo/:courseId',function(req,res){
	var courseId = req.params.courseId;
	uploadVideo(req,res,function(err){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		var courses = req.files.courseVideo;
		var titles = req.body.courseSectionsName;
		console.log(titles instanceof Array);
		var sectionsArr = [];
		var titleArr = [];
		// console.log(courses);

		if(titles instanceof Array){
			for(var i =0;i<courses.length;i++){
				var section = {};
				var filename = '/video/'+courses[i].filename;
				// console.log(filename);
				var title  = titles[i];
				section.title = title;
				section.src = [];
				section.src.push(filename);
				sectionsArr.push(section);
				titleArr.push(title);
			}
		}else{
			var section = {};
			var filename = '/video/'+courses[0].filename;
			var title  = titles;
			section.title = title;
			section.src = [];
			section.src.push(filename);
			sectionsArr.push(section);
			titleArr.push(title);
		}

		// console.log(sectionsArr);
		var sectionsArr = handleSections(sectionsArr,titleArr);
		// console.log(sectionsArr);
		Course.update({
			_id:courseId,
		},{
			$pushAll:{courseSections:sectionsArr}
		},function(err){
			if(err){
				console.log(err);
				return res.redirect('back');
			}
			req.flash('success','课程添加成功');
			return res.redirect('back');
		});
	});
});

function handleSections(sectionsArr,titleArr){
	var titleArr = uniqueArr(titleArr);
	var srcArr = getSrcArr(sectionsArr,titleArr);
	console.log(srcArr);
	var newArr = [];
	for(var i =0;i<srcArr.length;i++){
		var section = {};
		section.title = titleArr[i];
		section.src = srcArr[i];
		newArr.push(section);
	}
	return newArr;
}

function getSrcArr(sectionsArr,titleArr){
	var srcArr = [];
	console.log(titleArr);
	for(var i =0; i<sectionsArr.length;i++){
		if(titleArr.indexOf(sectionsArr[i].title)!==-1){
			var theIndex = titleArr.indexOf(sectionsArr[i].title);
			console.log(theIndex);
			var src = sectionsArr[i].src;
			if(srcArr[theIndex] instanceof Array && srcArr[theIndex][0]!==null){
				console.log('world');
				srcArr[theIndex].push(src);
			}else{
				console.log('hello');
				srcArr[theIndex] = [];
				srcArr[theIndex].push(src);
			}
		}
	}
	return srcArr;
}


function uniqueArr(arr){
	var newArr = [arr[0]];

	for(var i =1;i<arr.length;i++){
		if(newArr.indexOf(arr[i])==-1){
			newArr.push(arr[i]);
		}
	}
	return newArr;
}


function checkLogin(req,res,next){
	if(!req.session.login){
		req.flash('error','请正面上(deng)我(lu)');
		res.redirect('/');
	}
	next();
}

function checkNotLogin(req,res,next){
	if(req.session.login){
		req.flash('error','你已经登录辣');
		res.redirect('back');
	}
	next();
}

function hasRoot(req,res,next){
	if(!req.session.root==1){
		req.flash('error','没有权限');
		return res.redirect('back');
	}
	next();
}


module.exports = router;
