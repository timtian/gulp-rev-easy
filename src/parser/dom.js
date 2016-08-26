/**
 * Created by timtian on 2016/8/26.
 */
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var revver = require('../revver');


var parser = {};

parser.parse = function(text, filepath, options) {
    try {
        var $ = cheerio.load(text, {
            decodeEntities: false
        });

        for (var i = 0; i < options.fileTypes.length; i++) {
            var fileType = options.fileTypes[i];
            var attributes = options.elementAttributes[fileType];

            var $assets = $(attributes.name);
            for (var j = 0; j < $assets.length; j++) {
                var $asset = $assets.eq(j);
                var src = $asset.attr(attributes.src);

                if (src && !src.match(/.*(\/\/).*/)) {
                    var revv = revver.rev(src, filepath, options);

                    if (revv !== '') {
                        var newsrc = options.transformPath(src, revv);
                        $asset.attr(attributes.src, newsrc);
                        gutil.log(src + ' --> ', gutil.colors.green(newsrc));
                    } else {
                        gutil.log(gutil.colors.blue('ignore:rev is empty'), src);
                    }
                }
            }
        }

        return $.html();

    } catch (err) {
        gutil.log(gutil.colors.red(err.message));
        gutil.log(gutil.colors.red(err.stack));
    }
};

module.exports = parser;