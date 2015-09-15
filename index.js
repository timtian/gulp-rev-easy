var path = require('path');
var through = require('through2');
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var fs = require('fs');
var dateformat = require('dateformat');
var url = require('url');
var _ = require('lodash');
var crypto = require('crypto');

var fileverCache = {};

module.exports = function(options) {

    var defaultOptions = {
        cwd: '',
        base: '',
        suffix: 'v',
        fileTypes: ['js', 'css', 'img'],
        hashLength: 8,
        dateFormat: 'yyyymmddHHMM',
        revType: 'hash',
        transformPath: function(orgPath, rev) {
            var reg = new RegExp('((\\?|\\&|\\&amp\\;)' + options.suffix + '=)([^&\\s]+)', 'gi');
            var newpath = orgPath;
            if (reg.test(orgPath)) {
                newpath = orgPath.replace(reg, '$1' + rev);
            } else {
                newpath += ((orgPath.indexOf('?') > -1 ? '&' : '?') + options.suffix + '=' + rev);
            }
            return newpath;
        },
        elementAttributes: {
            js: {
                name: 'script',
                src: 'src'
            },
            css: {
                name: 'link[rel="stylesheet"]',
                src: 'href'
            },
            img: {
                name: 'img',
                src: 'src'
            }
        }
    };

    options = _.assign(defaultOptions, options);

    return through.obj(function(file, enc, cb) {
        if (options.cwd !== '') {
            gutil.log(gutil.colors.red('options.cwd is obsoleted, use options.base or set gulp.src(path, {cwd:mycwd}) instead'));
            return;
        }

        gutil.log('==== begin rev:' + gutil.colors.cyan(file.path));
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-rev-easy', 'Streaming is not supported'));
            return cb();
        }

        try {
            var $ = cheerio.load(file.contents.toString(), {
                decodeEntities: false
            });


            var baseDir = options.base;

            if (baseDir === '') {
                baseDir = file.cwd;
            }

            for (var i = 0; i < options.fileTypes.length; i++) {
                var fileType = options.fileTypes[i];
                var attributes = options.elementAttributes[fileType];

                var $assets = $(attributes.name);
                for (var j = 0; j < $assets.length; j++) {
                    var $asset = $assets.eq(j);

                    var src = $asset.attr(attributes.src);

                    if (src && !src.match(/.*(\/\/).*/)) {
                        var revv = '';

                        if (options.revType === 'hash') {
                            var srcpath = url.parse(src).pathname;
                            var filepath = null;

                            //if is a /a/b/c/i.png path need a basedir
                            if ((/^\/{1}[^\/]+/gi).test(srcpath)) {
                                filepath = path.join(baseDir, srcpath);
                            } else {
                                filepath = path.join(path.dirname(file.path), srcpath);
                            }

                            if (fs.existsSync(filepath)) {

                                if (fileverCache[filepath] !== undefined) {
                                    revv = fileverCache[filepath];
                                    gutil.log(gutil.colors.green(filepath + ' found in cache'));
                                } else {
                                    revv = crypto
                                        .createHash('md5')
                                        .update(
                                            fs.readFileSync(filepath, {
                                                encoding: 'utf8'
                                            }))
                                        .digest('hex').substring(0, options.hashLength);
                                }
                                fileverCache[filepath] = revv;
                            } else {
                                gutil.log(gutil.colors.red(filepath + ' not found'));
                            }
                        } else {
                            revv = dateformat(new Date(), options.dateFormat);
                        }

                        if (revv !== '') {
                            var newname = options.transformPath(src, revv);
                            $asset.attr(attributes.src, newname);
                            gutil.log(src + ' --> ', gutil.colors.green(newname));
                        } else {
                            gutil.log(gutil.colors.blue('ignore:rev is empty'), src);
                        }
                    }
                }
            }
            file.contents = new Buffer($.html());

            gutil.log(fileverCache);
            gutil.log('==== end rev:' + gutil.colors.cyan(file.path));
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-rev-easy', err));
        }

        this.push(file);
        return cb();
    });
};
