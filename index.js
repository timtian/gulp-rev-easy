var path = require('path');
var through = require('through2');
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var fs = require('fs');
var dateformat = require('dateformat');
var url = require('url');
var _ = require('lodash');
var crypto = require('crypto');


module.exports = function(options) {

    var defaultOptions = {
        cwd: '',
        base: '',
        suffix: 'v',
        fileTypes: ['js', 'css', 'img'],
        hashLength: 8,
        dateFormat: 'yyyymmddHHMM',
        revType: 'hash',
        revMode: 'plain',
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
        ignorePattern:/<script[^>]*?type=['"]?text\/javascript['"]?[^>]*?>[\s\S]{10,}?<\/script>/gi
    };

    options = _.assign({}, defaultOptions, options);

    options.elementAttributes = _.assign({}, defaultOptions.elementAttributes, options.elementAttributes);
    options.patterns = _.assign({}, defaultOptions.patterns, options.patterns);

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

        var parser = require('./src/parser/' + options.revMode);
        var revText = parser.parse(file.contents.toString(), file.path, options);
        file.contents = new Buffer(revText);

        gutil.log('==== end rev:' + gutil.colors.cyan(file.path));

        this.push(file);
        return cb();
    });
};
