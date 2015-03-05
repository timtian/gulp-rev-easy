var path = require('path');
var through = require('through2');
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var fs = require('fs');
var dateformat = require('dateformat')
var url = require('url');
var _ = require('lodash');

module.exports = function (options) {

  var defaultOptions = {
    cwd: '',
    suffix: 'v',
    fileTypes: ['js', 'css', 'img'],
    hashLength : 5,
    dateFormat : 'yyyymmddHHMM',
    revType:'hash',
    transformPath : function (orgPath, rev) {
      var newpath = orgPath +  (orgPath.indexOf('?') > -1 ? '&':'?') + options.suffix + '=' + rev;
      return newpath
    },
    elementAttributes :{
      js: {
        name: 'script',
        src: 'src'
      },
      css: {
        name: 'link',
        src: 'href'
      },
      img:{
        name: 'img',
        src : 'src'
      }
    }
  };

  options = _.merge(defaultOptions, options);

  return through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-rev-easy', 'Streaming is not supported'));
      return cb();
    }

    try {
      var $ = cheerio.load(file.contents.toString());

      for (var i = 0; i < options.fileTypes.length; i++) {
        var fileType = options.fileTypes[i];
        var attributes = options.elementAttributes[fileType];

        var $assets = $(attributes.name);
        for (var j = 0; j < $assets.length; j++) {
          var $asset = $assets.eq(j);

          var src = $asset.attr(attributes.src);

          if (src && !src.match(/.*(\/\/).*/)) {
            var revv = "";

            if(options.revType == "hash"){
              var filepath = path.join(options.cwd, url.parse(src).pathname);
              revv = require('crypto')
                .createHash('md5')
                .update(
                  fs.readFileSync(filepath, {encoding: 'utf8'}))
                .digest("hex").substring(0, options.hashLength);
            }else{
              revv = dateformat(new Date(), options.dateFormat)
            }

            var newname = options.transformPath(src, revv);
            $asset.attr(attributes.srcAttribute, newname);
            gutil.log(src +"-->" + newname);
          }
        }
      }
      file.contents = new Buffer($.html());
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('gulp-rev-easy', err));
    }

    this.push(file);
    return cb();
  })
};