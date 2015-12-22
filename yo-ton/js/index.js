// 头部滚动透明

(function(){
	document.addEventListener('scroll',checkNavBg,false);
	function checkNavBg(){
		var oNav = document.querySelector('nav');
		if(document.body.scrollTop>=30 && oNav.className ==''){
			oNav.className = 'nav-bg';
		}else if(document.body.scrollTop<130){
			oNav.className = '';
		}
	}
})();

(function(){
	var loginBtn = document.querySelector('.login-btn');
	var topBg = document.querySelector('.top-bg');
	var closeBtn = topBg.querySelectorAll('.close');
	var regBox = topBg.querySelector('.reg-box');
	var loginBox = topBg.querySelector('.login-box');
	var toLogin = regBox.querySelector('.to-login');
	var toReg = loginBox.querySelector('.to-reg');
	var inputs = topBg.querySelectorAll('input');

	loginBtn.addEventListener('click',function(e){
		e.preventDefault();
		topBg.className = 'top-bg';
		regBox.className = 'reg-box hide';
		loginBox.className = 'login-box';
	},false);

	for(var i = 0;i<closeBtn.length;i++){
		closeBtn[i].addEventListener('click',function(e){
			topBg.className = 'top-bg hide';
		},false);
	}

	toReg.addEventListener('click',function(e){
		e.preventDefault();
		regBox.className = 'reg-box';
		loginBox.className = 'login-box hide';
	},false);

	toLogin.addEventListener('click',function(e){
		e.preventDefault();
		regBox.className = 'reg-box hide';
		loginBox.className = 'login-box ';
	},false);

	for(var i =0; i<inputs.length;i++){
		inputs[i].addEventListener('focus',function(e){
			for(var j = 0;j<inputs.length;j++){
				inputs[j].style.cssText ='';
			}
			if(this.type == 'submit'){
				this.style.cssText = '';
			}else{
				console.log(e.target);

				this.style.cssText = 'box-shadow:0px 0px 2px 2px rgba(30,135,74,.6);';
			}
		},false);
	}

})();

