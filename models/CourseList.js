 /*
	var courseList = [{
		id="1221212121212121",
		course_dire:'会计从业',
		child:[{
			course_name:'会计从业三门联报'
		}]
	},{
		id="dsjndjsadnjsa",
		course_dire:'银行从业',
		child:[{
			course_name:'个人理财',
		},{
			course_name:'风险管理',
		}]
	},{
		id="dnjksandljnsajkdnk",
		course_dire:'证券从业',
		child:[{
			course_name:'证券基础',
			course_name:'证券交易',
			course_name:'证券分析',
			course_name:'证券法规',
			course_name:'金融基础',
			course_name:'投资银行'
		}]
	}]
 */

 var mongoose = require('./connect');

 var Schema = mongoose.Schema;

 var CourseListSchame = new Schema({
 	dire:{type:String,index:true},
	child:[{type:String,index:true}]
 });
CourseListSchame.methods.addCour = function(cour,callback){
	this.dire = cour.dire;
	this.child = cour.name || [];
	this.save(callback);
}


var CourseList = mongoose.model('courselists',CourseListSchame);

module.exports = CourseList;



