var path = require('path');
var through = require('through2');
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var fs = require('fs');
var dateformat = require('dateformat');
var url = require('url');
var _ = require('lodash');
var crypto = require('crypto');
var revver = require('./src/revver');


module.exports = function(options) {
    return through.obj(function(file, enc, cb) {

        options = revver.setOptions(options);

        if (options.cwd) {
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
