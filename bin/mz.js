#!/usr/bin/env node
// vi mz/bin/mz.js
var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var cli = new Liftoff({
  name: 'mz', // 命令名字
  processTitle: 'mz',
  moduleName: 'mz',
  configName: 'fis-conf',

  // only js supported!
  extensions: {
    '.js': null
  }
});

cli.launch({
  cwd: argv.r || argv.root,
  configPath: argv.f || argv.file
}, function(env) {
  var fis;
  if (!env.modulePath) {
    fis = require('../');
  } else {
    fis = require(env.modulePath);
  }

  //确保必须存在 fis-conf.js 才可运行 mz release
  if(process.argv.indexOf('release') > -1){
    var configFileName = 'fis-conf.js';
    var projectConfigPath = fis.util(process.cwd(), configFileName) ;
    var rOptionIndex = process.argv.indexOf('-r');
    if(rOptionIndex > -1){
      var rOptionRoot = process.argv[rOptionIndex + 1];
      if(rOptionRoot.charAt(0) === '/'){
        projectConfigPath = fis.util(rOptionRoot, configFileName) ;
      }else{
        projectConfigPath =fis.util(process.cwd(), rOptionRoot, configFileName);
      }
    }
    if(!fis.util.isFile(projectConfigPath)){
      fis.log.error('未找到 ' +configFileName +'，请 cd 到项目目录或使用 -r 参数指定项目目录');
    }
  }

  fis.set('system.localNPMFolder', path.join(env.cwd, 'node_modules/mz'));
  fis.set('system.globalNPMFolder', path.dirname(__dirname));

  fis.cli.run(argv, env);
});
