var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
	gulp.src("test.html")
		.pipe(reveasy({
		    fileTypes:['img1', 'img'],
		    elementAttributes:{
		        img1:{
		            name:'img',
		            src:'data-src'
		        }
		    }}))
		.pipe(gulp.dest("./dist"))
})