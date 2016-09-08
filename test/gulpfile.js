var gulp = require("gulp");
var reveasy = require("../index");

gulp.task("reveasy-dom-mode", function (argument) {
	gulp.src("test.html")
		.pipe(reveasy({
			revMode:'dom',
		    fileTypes:['img1', 'img'],
		    elementAttributes:{
		        img1:{
		            name:'img',
		            src:'data-src'
		        }
		    }}))
		.pipe(gulp.dest("./dist"))
})


gulp.task("reveasy-plain-mode", function (argument) {
	gulp.src("test.html")
		.pipe(reveasy({
			revMode:'plain',
			hashLength:7,
			revType:'hash',
			suffix:'tt',
			fileTypes:['img1', 'img', 'css', 'js'],
			patterns:{
				img1:{
					regex:/(<img[^>]*?\s+data-src=)("(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
				}
			}}))
		.pipe(gulp.dest("./dist"))
})