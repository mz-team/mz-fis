var fs = require('fs'),
    path = require('path'),
    patchesDir = 'patches',
    blackFilePatterns = [/\.DS_Store$/, /\.svn/];


var isPassFile = function(blackFilePatterns){
    var len = blackFilePatterns.length;
    return function(pathname){
        var pass = true;
        for(var i = 0; i < len ; i++){
            if(blackFilePatterns[i].test(pathname)){
                pass = false;
                break;
            }
        }
        return pass;
    }
}(blackFilePatterns);



function travel(dir, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);
        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname, callback);
        } else {
            if(isPassFile(pathname)){
                callback(pathname);
            }  
        }
    });
}

console.log('patching...');

travel(patchesDir, function(path){
    var target =  path.replace(patchesDir, '.'),
        modType = '[add]';

    if ( fs.existsSync( target )  && fs.lstatSync( target ).isFile()) {
        modType = '[mod]';
    }
    fs.createReadStream( path ).pipe( fs.createWriteStream( target ) );
    console.log(modType + ' ' + target);
});

console.log('done.');