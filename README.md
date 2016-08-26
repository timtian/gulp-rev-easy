# gulp-rev-easy


**upgrade to [1.2.x] add new parse mode:plain, support unwell-formed html, if you want use old mode set revMode to 'dom', now default mode is plain mode**


```
//options
{
    revMode:'plain'
}
```

# Install
```
$ npm install gulp-rev-easy --save-dev
```
# Examples
```
assets\index.css
assets\index.js
test.html
gulpfile.js
```
### Input
```html
//test.html
<!doctype html>
<html lang="en">
<head>
  <title>gulp-rev-easy</title>
  <link type="text/css" rel="stylesheet" media="all" 
    href="assets/index.css?max_age=1024">
</head>
<body>
  <img data-src="assets/audrey-hepburn.jpg" 
    src="assets/audrey-hepburn.jpg">
  <script src="assets/index.js?max_age=1024"></script>
</body>
</html>
```

### Useage
```js
//gulpfile.js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy())
    .pipe(gulp.dest("./dist"))
})
```

```
gulp reveasy
```
### Output
```html
<!doctype html>
<html lang="en">
<head>
  <title>gulp-rev-easy</title>
  <link type="text/css" rel="stylesheet" media="all"
    href="assets/index.css?max_age=1024&amp;v=0a1085be">
</head>
<body>
  <img data-src="assets/audrey-hepburn.jpg" 
    src="assets/audrey-hepburn.jpg?v=7c5d110d">
  <script src="assets/index.js?max_age=1024&amp;v=3fffb693"></script>
</body>
</html>
```

# Options

 - base
 - revMode
 - revType
 - dateFormat
 - hashLength
 - suffix
 - fileTypes
 - elementAttributes
 - patterns
 - ignorePattern
 - transformPath

## options.base


    type:string
    default:file.cwd
    
    set base directory for your assets
    <img src='/a/b.png'/> rev will found file in path.join(base, src)
    options.cwd is obsoleted, use options.base or set gulp.src(path, {cwd:mycwd}) instead


## options.revMode


    revMode:['dom'|plain']
    default:'plain'

    set rev mode, set patterns

>more and more unwell-formed documents, it's can't parse to dom-tree or sometime lost/change raw text, so add new parse mode:plain.

## options.revType


    type:['hash'|date']
    default:'hash'
    
    set rev type 

#### example
```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({revType:'date'}))
    .pipe(gulp.dest("./dist"))
    
})
```

```html
<link type="text/css" rel="stylesheet" media="all" 
  href="assets/index.css?max_age=1024">
```
```html
<link type="text/css" rel="stylesheet" media="all" 
  href="assets/index.css?max_age=1024&amp;v=201503061144">
```

## options.dateFormat

    type:string
    default:'yyyymmddHHMM'
    
```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({revType:'date', dateFormat:'yymmddHHmm'}))
    .pipe(gulp.dest("./dist"))
    
})
```
#### Output
```html
<link type="text/css" rel="stylesheet" media="all" 
  href="assets/index.css?max_age=1024&amp;v=1503061144">
```

## options.hashLength

    type:integer
    default:8
    
```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({revType:'hash', hashLength:5}))
    .pipe(gulp.dest("./dist"))
    
})
```
#### Output

```html
<!--default output-->
<img data-src="assets/audrey-hepburn.jpg" 
  src="assets/audrey-hepburn.jpg?v=7c5d110d">
```
-->
```html
<img data-src="assets/audrey-hepburn.jpg" 
  src="assets/audrey-hepburn.jpg?v=7c5d1">
```

## options.suffix

    type:string
    default:v
    
```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({suffix:'hashkey'}))
    .pipe(gulp.dest("./dist"))
    
})
```
#### Output

``` html
<!--default output-->
<img src="assets/audrey-hepburn.jpg?v=7c5d110d">
```
-->
```html
<img src="assets/audrey-hepburn.jpg?hashkey=7c5d110d">
```

## options.fileTypes

    type:array
    default:['js','css','img']
    
```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({fileTypes:['js']}))
    .pipe(gulp.dest("./dist"))
    
})
```
#### Output

```html
<!doctype html>
<html lang="en">
<head>
  <title>gulp-rev-easy</title>
  <link type="text/css" rel="stylesheet" media="all" 
    href="assets/index.css?max_age=1024">
</head>
<body>
  <img data-src="assets/audrey-hepburn.jpg"
    src="assets/audrey-hepburn.jpg">
  <script src="assets/index.js?max_age=1024&amp;v=3fffb693"></script>
</body>
</html>
```

## options.elementAttributes (dom mode)
```js

    /*
    how find target element 
     js: {
        name: 'script',
        src: 'src'
      }
      =>
      $('script').attr('src') = newpath
     use other selector in name such as
     {
        name:'.cached',
        src:'src'
      }
    */
    type:object
    default:{
      js: {
        name: 'script',
        src: 'src'
      },
      css: {
        name: 'link[type="text/css"]',
        src: 'href'
      },
      img:{
        name: 'img',
        src : 'src'
      }
    }
```   

```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({
        fileTypes:['img1'],
        elementAttributes:{
            img1:{
                name:'img',
                src:'data-src'
            }
        }))
    .pipe(gulp.dest("./dist"))
})
```
#### Output
```html
  <!--default out-->
  <img data-src="assets/audrey-hepburn.jpg" 
    src="assets/audrey-hepburn.jpg?v=7c5d110d">
```
-->
```html
  <img data-src="assets/audrey-hepburn.jpg?v=7c5d110d" 
    src="assets/audrey-hepburn.jpg">
```

```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({
        revMode:'dom',
        fileTypes:['img1'],
        elementAttributes:{
            img1:{
                name:'img',
                src:'data-src'
            }
        }))
    .pipe(gulp.dest("./dist"))
})
```
## options.patterns (plain mode)

    type : object
    default:
        patterns:{
            js:{
                regex:/(<script[^>]*?\s+src=)("(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
            },
            css:{
                regex:/(<link[^>]*?\s+rel=['"]stylesheet['"]?[^>]*?\s+href=)("(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
            },
            img:{
                regex:/(<img[^>]*?\s+src=)("(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
            }
        }

    return $1 + ['|"] + options.transformPath($2) + $3

```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({
            revMode:'plain',
            fileTypes:['img1', 'img'],
            patterns:{
                img1:{
                    regex:/(<img[^>]*?\s+data-src=)("(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
                }
            }}))
    .pipe(gulp.dest("./dist"))
})
```
#### Output
```html
  <!--default out-->
  <img data-src="assets/audrey-hepburn.jpg"
    src="assets/audrey-hepburn.jpg?v=7c5d110d">
```
-->
```html
  <img data-src="assets/audrey-hepburn.jpg?v=7c5d110d"
    src="assets/audrey-hepburn.jpg?v=7c5d110d">
```


## options.ignorePattern (plain mode)
    type:RegExp
    default:/<script[^>]*?type=['"]?text\/javascript['"]?[^>]*?>[\s\S]{10,}?<\/script>/gi
    ignore rev content,
    default will ignore any content in <script type=text\/javascript>..</script>
    if you want rev script set to false


```js
gulp.task("reveasy-plain-mode", function (argument) {
	gulp.src("test.html")
		.pipe(reveasy({
			revMode:'plain',
			fileTypes:['img1', 'img', 'css', 'js'],
			ignorePattern:false,
			patterns:{
				img1:{
					regex:/(<img[^>]*?\s+data-src=)("(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
				}
			}}))
		.pipe(gulp.dest("./dist"))
})
```

#### In
```html
<img data-src="assets/audrey-hepburn.jpg" src="assets/audrey-hepburn.jpg">
<script src="assets/index.js?max_age=1024"></script>
<script type=text/javascript>
  var test2 = '<img data-src="assets/audrey-hepburn.jpg" src="assets/audrey-hepburn.jpg">'
</script>
<script type="text/html">
  <img data-src="assets/audrey-hepburn.jpg" src="assets/audrey-hepburn.jpg">
</script>

```

#### Out
```html
<!--default  ignore <script type="text/script">..</script> tag -->
<img data-src="assets/audrey-hepburn.jpg?v=6a5f96ce" src="assets/audrey-hepburn.jpg?v=6a5f96ce">
<script src="assets/index.js?max_age=1024&v=3fffb693"></script>
<script type=text/javascript>
  var test2 = '<img data-src="assets/audrey-hepburn.jpg" src="assets/audrey-hepburn.jpg">'
</script>
<script type="text/html">
  <img data-src="assets/audrey-hepburn.jpg?v=6a5f96ce" src="assets/audrey-hepburn.jpg?v=6a5f96ce">
</script>

```
set to ignorePattern:false
```html
<!-- set to false, rev all -->
<img data-src="assets/audrey-hepburn.jpg?v=6a5f96ce" src="assets/audrey-hepburn.jpg?v=6a5f96ce">
<script src="assets/index.js?max_age=1024&v=3fffb693"></script>
<script type=text/javascript>
  var test2 = '<img data-src="assets/audrey-hepburn.jpg?v=6a5f96ce" src="assets/audrey-hepburn.jpg?v=6a5f96ce">'
</script>
<script type="text/html">
  <img data-src="assets/audrey-hepburn.jpg?v=6a5f96ce" src="assets/audrey-hepburn.jpg?v=6a5f96ce">
</script>

```


## options.transformPath
    type:function
    default:function(orgPath, ver){}
custom change path
```js
var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");

gulp.task("reveasy", function (argument) {
  gulp.src("test.html")
    .pipe(reveasy({
        transformPath:function(orgpath, ver){
          var newpath = "http://s1.cdn.com/" + orgpath 
                          + (orgpath.indexOf('?') > -1 ? "&" : "?")  
                          + "v=" + ver;
          return newpath;
        }
    }))
    .pipe(gulp.dest("./dist"))
})
```
#### Output
```html
  <!--default out-->
  <img data-src="assets/audrey-hepburn.jpg" 
    src="assets/audrey-hepburn.jpg?v=7c5d110d">
```
-->
```html
<img data-src="assets/audrey-hepburn.jpg"
    src="http://s1.cdn.com/assets/audrey-hepburn.jpg?v=7c5d110d">
```
# Other
