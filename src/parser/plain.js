/**
 * Created by timtian on 2016/8/26.
 */
var gutil = require('gulp-util');
var revver = require('../revver');


var parser = {};

parser.parse = function(text, filepath, options) {
    try {

        var resText= [];
        var textList = [];
        var mList = [];
        if(options.ignorePattern){
            textList = text.split(options.ignorePattern);

            var m;
            while ((m = options.ignorePattern.exec(text)) !== null) {
                mList.push(m[0]);
            }
        }else{
            textList.push(text);
        };



        for(var j = 0; j < textList.length; j++){
            var revText = textList[j];

            for (var i = 0; i < options.fileTypes.length; i++) {
                var fileType = options.fileTypes[i];
                var pattern = options.patterns[fileType];
                revText = revText.replace(pattern.regex, function(match, p1, p2, p3, offset, string){

                    var q = p2.substring(0, 1);
                    var src = p2.substring(1, p2.length - 1);
                    var revv = revver.rev(src, filepath, options);
                    var newsrc = p2;

                    if (revv !== '') {
                        newsrc = options.transformPath(src, revv);
                        gutil.log(src + ' --> ', gutil.colors.green(newsrc));
                    } else {
                        gutil.log(gutil.colors.blue('ignore:rev is empty'), src);
                    }

                    return p1 + q +  newsrc + q + p3;
                })
            }

            resText.push(revText);

            if(mList.length > 0)
                resText.push(mList.shift());
        }



        return resText.join('');
    } catch (err) {
        gutil.log(gutil.colors.red(err.message));
        gutil.log(gutil.colors.red(err.stack));
    }
};

module.exports = parser;