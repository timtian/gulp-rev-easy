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

        var assertpath = options.findFile(src, filepath, options);
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


var defaultOptions = {
    base: '',
    suffix: 'v',
    fileTypes: ['js', 'css', 'img'],
    hashLength: 8,
    dateFormat: 'yyyymmddHHMM',
    revType: 'hash',
    revMode: 'plain',
    transformPath: function(orgPath, rev) {
        var reg = new RegExp('((\\?|\\&|\\&amp\\;)' + this.suffix + '=)([^&\\s]+)', 'gi');
        var newpath = orgPath;
        if (reg.test(orgPath)) {
            newpath = orgPath.replace(reg, '$1' + rev);
        } else {
            newpath += ((orgPath.indexOf('?') > -1 ? '&' : '?') + this.suffix + '=' + rev);
        }
        return newpath;
    },
    findFile: function(src, filepath, options){
        var assetPath = src;
        var srcpath = url.parse(src).pathname;
        //if is a /a/b/c/i.png path need a basedir
        if ((/^\/{1}[^\/]+/gi).test(srcpath)) {
            assetPath = path.join(options.base, srcpath);
        } else {
            assetPath = path.join(path.dirname(filepath), srcpath);
        }
        return assetPath;
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
    },
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
    },
    ignorePattern:/<script\b[^<]*(?:(?!<\/script>)<[^<]*)+<\/script>/gi,
    ignoreFilter:function(match){
        var type = "text/javascript";
        var m = (/^<script[^>]type=(.+)>/gi).exec(match[0]);
        if(m){
            type = _.trim(m[1], '"\'').toLowerCase();
        }
        return type == "text/javascript";
    }
};

//ignorePattern:/<script[^>]*?type=['"]?text\/javascript['"]?[^>]*?>[\s\S]{10,}?<\/script>/gi

revver.setOptions = function(options){
    var newObj = _.assign({}, defaultOptions, options);
    newObj.elementAttributes = _.assign({}, defaultOptions.elementAttributes, options.elementAttributes);
    newObj.patterns = _.assign({}, defaultOptions.patterns, options.patterns);
    return newObj
}

module.exports = revver;