// 头部滚动透明

$(function(){
	$(window).scroll(function(){
		var oNav = $('nav');
		var offsetTop = $(document).scrollTop();
		if(offsetTop>=30 && !oNav.hasClass('nav-bg')){
			oNav.addClass('nav-bg');
		}else if(offsetTop<130){
			oNav.removeClass('nav-bg');
		}
	});
});