
$(function(){
	//上传页面select联动
	$('#upload-direction').change(function(){
		var val = $(this).val();
		$.ajax({
			url:'/admin/direUpload?dire='+val,
			type:'GET',
			success:function(result){
				changeDiff(result);
			},
			error:function(){
				console.log('ajax 请求错误');
			}
		});
	});
	function changeDiff(arr){
		var str = '';
		for(var i =0;i<arr.length;i++){
			str+='<option value="'+arr[i]+'">'+arr[i]+'</option>';
		}
		$('#upload-difficulty').html(str);
	}
	//course 同学和评论加载
	$('#loadBtn1').click(function(){
		var courseId = $(this).attr('data-id');
		var p = $(this).attr('data-p');
		var target = $(this);
		$.ajax({
			url:'/getClass/'+courseId+'?p='+p,
			type:'GET',
			beforeSend:function(){
				target.html('加载中...');
			},
			success:function(result,status){
				console.log(result);
				if(result[0]===null){
					target.html('没有了');
					return false;
				}
				renderCourseMates('classmatesList',result);
				target.html('点击继续加载');
			},
			error:function(){
				console.log('ajax 请求错误');
			}
		});
	});

	$('#loadBtn2').click(function(){
		var courseId = $(this).attr('data-id');
		var p = $(this).attr('data-p');
		var target = $(this);
		$.ajax({
			url:'/getComment/'+courseId+'?p='+p,
			type:'GET',
			beforeSend:function(){
				target.html('加载中...');
			},
			success:function(result,status){
				console.log(result);
				if(result[0]===null){
					target.html('没有了');
					return false;
				}
				renderCourseComment('commentsList',result);
				target.html('点击继续加载');
			},
			error:function(){
				console.log('ajax 请求错误');
				target.html('没有了');
			}
		});
	});

	$('#loadPersonBtn').click(function(){
		var personId = $(this).attr('data-id');
		var p = $(this).attr('data-p');
		var target = $(this);
		$.ajax({
			url:'/personIndex/'+personId+'?p='+p,
			type:'GET',
			beforeSend:function(){
				target.html('加载中...');
			},
			success:function(result,status){
				if(result[0]===null){
					target.html('没有了');
					return false;
				}
				renderPersonIndex('personIndexBox',result);
				target.html('点击继续加载');
			},
			error:function(){
				console.log('ajax 请求错误');
				target.html('没有了');
			}

		});
	});


	$('#loadFriendBtn').click(function(){
		var personId = $(this).attr('data-id');
		var p = $(this).attr('data-p');
		var target = $(this);
		$.ajax({
			url:'/personFriends/'+personId+'?p='+p,
			type:'GET',
			beforeSend:function(){
				target.html('加载中...');
			},
			success:function(result,status){
				if(result[0]===null){
					target.html('没有了');
					return false;
				}
				renderPersonFriend('personFriendBox',result);
				target.html('点击继续加载');
			},
			error:function(){
				console.log('ajax 请求错误');
				target.html('没有了');
			}
		});
	});

	function renderPersonFriend(idName,arr){
		var str = '';
		var oBox = document.querySelector('#'+idName);
		var docFragment = document.createDocumentFragment();
		for(var i = 0;i<arr.length;i++){
			if(!arr[i]){
				continue;
			}
			var oLi = document.createElement('li');
			oLi.className = 'clearfix';
			str +='<li><a href="/person/'+
						arr[i]._id+'"><div class="person-friend"><div class="friend-header"><img src="'+
						arr[i].header+'" alt="用户头像"></div><div class="friend-info"><p class="friend-name"><a href="/person/'+
						arr[i]._id+'">'+arr[i].name+'</a></p><p class="friend-school">'+
						'<a href="#">'+arr[i].school+'</a></p>'+
						'<p class="address">'+arr[i].address+'</p></div></div></a></li>';
			oLi.innerHTML = str;
			str = '';
			docFragment.appendChild(oLi);
		}
		oBox.appendChild(docFragment);
		var p = $('#loadFriendBtn').attr('data-p');
		$('#loadFriendBtn').attr({'data-p':++p});
	}

	function renderPersonIndex(idName,arr){
		var str = '';
		var oBox = document.querySelector('#'+idName);
		var docFragment = document.createDocumentFragment();
		for(var i = 0;i<arr.length;i++){
			if(!arr[i]){
				continue;
			}
			var oLi = document.createElement('li');
			oLi.className = 'clearfix item-course';
			str +='<li class="person-course"><div class="course-img"><img src="'+
						arr[i].courseImg+'" alt="课程图片"></div><div class="course-intro"><h2 class="course-title">'+
						arr[i].title+'<h2><p class="course-info"><span>老师：<a href="/person/'+
						arr[i].teacher.id+'">'+
						arr[i].teacher.name+'</a></span><span>方向：<a href="/courses?dire='+
						arr[i].direction+'">'+arr[i].direction+'</a></span><span>科目：<a href="/courses?diff='+
						arr[i].difficulty+'">'+arr[i].difficulty+'</a></span></p><a class="btn" href="/course/'+
						arr[i]._id+'" >开始学习</a><a class="delete-learn-btn hide" href="/delete/'+
						arr[i]._id+'" >删除该课程</a></div></li>';
			oLi.innerHTML = str;
			str = '';
			docFragment.appendChild(oLi);
		}
		oBox.appendChild(docFragment);
		var p = $('#loadPersonBtn').attr('data-p');
		$('#loadPersonBtn').attr({'data-p':++p});
	}



	function renderCourseComment(idName,arr){
		var str = '';
		var docFragment = document.createDocumentFragment();
		var oBox = document.querySelector('#'+idName);
		for(var i = 0;i<arr.length;i++){
			if(!arr[i]){
				continue;
			}
			var oLi = document.createElement('li');
			oLi.className = 'clearfix';
			str +='<div><a href="/person/'+
						arr[i].userId+'"><img class="user-header" src="'+
						arr[i].header+'" alt="用户头像"></a><br/><a class="user-name" href="'+
						arr[i].userId+'">'+arr[i].name+'</a></div><div><p class="user-text">'+
						arr[i].content+'</p><span class="time">时间:'+
						arr[i].time+'</span><span class="reply"><a href="/reply/'+
						arr[i].userId+'">回复</a></span></div>';

			oLi.innerHTML = str;
			str = '';
			docFragment.appendChild(oLi);
		}
		oBox.appendChild(docFragment);
		var p = $('#loadBtn2').attr('data-p');
		$('#loadBtn2').attr({'data-p':++p});
	}


	function renderCourseMates(idName,arr){
		var str = '';
		var oBox = document.querySelector('#'+idName);
		var docFragment = document.createDocumentFragment();
		for(var i = 0;i<arr.length;i++){
			var oLi = document.createElement('li');
			oLi.className = 'clearfix';
			str += '<div><a href="/person/'+
				arr[i]._id+'"><img class="user-header" src="'+
				arr[i].header+'" alt="用户头像"></a><br/><a class="user-name" href="/person/'+
				arr[i]._id+'">'+arr[i].name+'</a></div><div><p class="user-text">'+
				arr[i].intro+'</p><a class="school" href="#">'+
				arr[i].school+'</a><a class="more" href="/person/'+
				arr[i]._id+'">更多</a></div>';
			oLi.innerHTML = str;
			str = '';
			docFragment.appendChild(oLi);
		}
		oBox.appendChild(docFragment);
		var p = $('#loadBtn1').attr('data-p');
		$('#loadBtn1').attr({'data-p':++p});
	}

});










