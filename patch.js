var fs = require('fs'),
    path = require('path'),
    patchesDir = 'patches',
    blackFilePatterns = [/\.DS_Store$/, /\.svn/];

var isPassFile = function (blackFilePatterns) {
    var len = blackFilePatterns.length;
    return function (pathname) {
        var pass = true;
        for (var i = 0; i < len; i++) {
            if (blackFilePatterns[i].test(pathname)) {
                pass = false;
                break;
            }
        }
        return pass;
    }
}(blackFilePatterns);

function travel(dir, callback) {
    if (!fs.existsSync(dir)) {
        return false;
    }
    fs
        .readdirSync(dir)
        .forEach(function (file) {
            var pathname = path.join(dir, file);
            if (fs.statSync(pathname).isDirectory()) {
                travel(pathname, callback);
            } else {
                if (isPassFile(pathname)) {
                    callback(pathname);
                }
            }
        });
}

console.log('patching...');

travel(patchesDir, function (sourcePath) {
    var path = sourcePath.replace(patchesDir, '.');
    var modType = '[add]';
    var nodeModulesPath = '.'+ path.sep + 'node_modules'+ path.sep;
    if (path.indexOf('node_modules') > -1) {
        var matchResult = path.match(/^\.[-\w\/\\]+node_modules[\/\\](([-\w]+)[\/\\](?:[-\w\/\\\.]+))$/);
        if (fs.existsSync(nodeModulesPath + matchResult[2])) {
            path = nodeModulesPath + matchResult[1];
        }
        if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
            var modType = '[mod]';
        }
    }
    fs
        .createReadStream(sourcePath, {}, function (err) {})
        .pipe(fs.createWriteStream(path));
    console.log(modType + ' ' + path);
});

console.log('done.');