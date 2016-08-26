/**
 * Created by timtian on 2016/8/26.
 */


var path = require('path');
var gutil = require('gulp-util');
var fs = require('fs');
var dateformat = require('dateformat');
var url = require('url');
var _ = require('lodash');
var crypto = require('crypto');

var fileverCache = {};


var revver= {};
revver.rev = function(src, filepath, options) {
    var revv = '';
    if (options.revType === 'hash') {
        var srcpath = url.parse(src).pathname;
        var assertpath = null;

        //if is a /a/b/c/i.png path need a basedir
        if ((/^\/{1}[^\/]+/gi).test(srcpath)) {
            assertpath = path.join(options.base, srcpath);
        } else {
            assertpath = path.join(path.dirname(filepath), srcpath);
        }
        if (fs.existsSync(assertpath)) {
            var mtime = +fs.statSync(assertpath).mtime;
            if (fileverCache[assertpath] && fileverCache[assertpath].mtime == mtime) {
                revv = fileverCache[assertpath].rev;
                gutil.log(gutil.colors.green('found in cache >>' + assertpath + '@' + mtime));
            } else {
                revv = crypto
                    .createHash('md5')
                    .update(
                        fs.readFileSync(assertpath, {
                            encoding: 'utf8'
                        }))
                    .digest('hex').substring(0, options.hashLength);
            }
            fileverCache[assertpath] = {
                mtime: mtime,
                rev: revv
            };
        } else {
            gutil.log(gutil.colors.red(assertpath + ' not found'));
        }
    } else {
        revv = dateformat(new Date(), options.dateFormat);
    }

    return revv;
};


module.exports = revver;