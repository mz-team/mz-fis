//vi mz/index.js
var fis =  require('fis3');
var lolcat = require('fis-lolcat');

fis.require.prefixes.unshift('mz');
fis.cli.name = 'mz';
fis.cli.info = require('./package.json');



/**
 * 输出 mz 版本信息。
 *
 * ```
 *
 * __/\\\\____________/\\\\__/\\\\\\\\\\\\\\\_        
 *  _\/\\\\\\________/\\\\\\_\////////////\\\__       
 *   _\/\\\//\\\____/\\\//\\\___________/\\\/___      
 *    _\/\\\\///\\\/\\\/_\/\\\_________/\\\/_____     
 *     _\/\\\__\///\\\/___\/\\\_______/\\\/_______    
 *      _\/\\\____\///_____\/\\\_____/\\\/_________   
 *       _\/\\\_____________\/\\\___/\\\/___________  
 *        _\/\\\_____________\/\\\__/\\\\\\\\\\\\\\\_ 
 *         _\///______________\///__\///////////////__
 * ```
 *
 */

fis.cli.version = function() {
  var content = ['',
    '  v' + fis.cli.info.version,
    ''
  ].join('\n');


  var logo = [
      "  /\\\\\\\\            /\\\\\\\\  /\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\     ",    
      "  \\/\\\\\\\\\\\\        /\\\\\\\\\\\\ \\////////////\\\\\\         ",
      "   \\/\\\\\\//\\\\\\    /\\\\\\//\\\\\\           /\\\\\\/         ",
      "    \\/\\\\\\\\///\\\\\\/\\\\\\/ \\/\\\\\\         /\\\\\\/          ",
      "     \\/\\\\\\  \\///\\\\\\/   \\/\\\\\\       /\\\\\\/           ",
      "      \\/\\\\\\    \\///     \\/\\\\\\     /\\\\\\/            ",
      "       \\/\\\\\\             \\/\\\\\\   /\\\\\\/             ",
      "        \\/\\\\\\             \\/\\\\\\  /\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\  ",
      "         \\///              \\///  \\///////////////  ",
      ""
    ].join('\n');


  if (fis.get('options.color') !== false) {
    logo = lolcat(logo);
  }
  console.log(content + '\n' + logo);
};

var sets = {
    'namespace': '',
    'static': 'static',
    'template': 'template',
    'rewriteFilename': '',
    'smarty': {
        'left_delimiter': '<{',
        'right_delimiter': '}>'
    },
    'browsers': ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],
    'server':{
      'rewrite': true,
      'type': 'php',
      'libs': 'pc',
      'clean': {
        'exclude': ''
      }
    }
};



fis.util.map(sets, function(key, value) {
    fis.set(key, value);
});

fis.set('project.ignore', ['node_modules/**', 'output/**', '.git/**','**/.svn/**', 'fis-conf.js','**/_*.scss']); // set 为覆盖不是叠加

fis.set('component.github.author', 'mz-components');

//addSameNameRequire 会用到
fis.set('project.ext', {
  po   : 'json',
  scss : 'css'
}); 




//模块化方案，本项目选中CommonJS方案(同样支持异步加载哈)
fis.hook('module', {
    mode: 'commonJs'
});

fis.match('**/*.scss', {
    rExt: '.css', // from .scss to .css
    //自动require同目录同名 .custom.scss
    parser: [function(content, file, settings){
      var customFileExt = '.custom.scss';

      if(fis.util.isFile(file.realpathNoExt + customFileExt)){

        var customFilename = file.filename + customFileExt;
        var patch = [
          '/*!'+ customFilename +'*/',
          '@import "'+ customFilename + '";'
        ];
        content += patch.join('\n');
      }
      return content;
    },fis.plugin('sass', {
        // fis-parser-sass option
    })]
});
fis.match('*', {
    useHash: false // md5 都关掉
        // release: '/${static}/${namespace}/$0'
});
fis.match('*.tpl', {
    parser: [function (content, file, settings) {
        return content.replace(/\{\{([\.\w]+)\}\}/g, function(a,b,c){
          return fis.get(b);
        });
    }],
    preprocessor: [fis.plugin('extlang', {
      'left_delimiter'  : sets.smarty.left_delimiter,
      'right_delimiter' : sets.smarty.right_delimiter      
    }), fis.plugin('components')],
    postprocessor: fis.plugin('require-async',{
      'left_delimiter'  : sets.smarty.left_delimiter,
      'right_delimiter' : sets.smarty.right_delimiter 
    }),
    optimizer: [
        fis.plugin('smarty-xss'),
        fis.plugin('html-compress')
    ],
    useMap: true,
    isMod: true,
    useSameNameRequire: true,
    release: '/${template}/${namespace}/$0'
});
fis.match('*.js', {
    useSameNameRequire: true,
    preprocessor: fis.plugin('components')
});

fis.match('/page/**.tpl', {
    // 标记是否是个页面，向下兼容
    extras: {
        isPage: true
    }
});

fis.match('/lang/(*).po', {
    release: '/config/lang/${namespace}.$1.po',
    rExt: '.json',
    parser: fis.plugin('po', {

    })    
});
fis.match('/components/**', {
    useMap: true,
    release: '/${static}/${namespace}/$0'
});
fis.match('/components/**.{css,js}', {
    isMod: true
});

fis.match('/components/**.{json,md}', {
    release: false
});

fis.match('/${static}/(**)', {
    release: '/${static}/${namespace}/$1'
});
fis.match('/widget/**', {
    release: '/${static}/${namespace}/$0'
});

fis.match('/widget/**.{css,js}', {
    isMod: true
});

fis.match('/widget/(**.tpl)', {
    release: '/${template}/${namespace}/$0',
    url : '${namespace}/widget/$1',
});

fis.match('/{plugin/**,smarty/**,php-simulation-env/**,smarty.conf,domain.conf,**.php}', {
    useMap: false,
    isMod: false,
    release: '$0'
});



fis.match('server.conf', {
    parser: [function (content, file, settings) {
      content = content.replace(/(\^\S*)\{\{([\.\w]+)\}\}/g, function(a,b,c){
          return b + fis.get(c).replace(/\//g, '\\\/');
      });

        return content.replace(/\{\{([\.\w]+)\}\}/g, function(a,b,c){
          return fis.get(b);
      });
    }],
    release: '/server-conf/${rewriteFilename}.conf'
});
// test & config
fis.match('/({test,config})/(**)', {
    useMap: false,
    release: '/$1/${namespace}/$2'
});
fis.match('${namespace}-map.json', {
    release: '/config/$0'
});
fis.match('::package', {
    prepackager: [
        fis.plugin('widget-inline'),
        fis.plugin('js-i18n',{
            enable: true,
            left_delimiter: sets.smarty.left_delimiter,
            right_delimiter: sets.smarty.right_delimiter
        })
    ],
    postpackager: [require('./lib/livereload-target.js'), function createMap(ret) {
        var path = require('path')
        var root = fis.project.getProjectPath();
        var map = fis.file.wrap(path.join(root, fis.get('namespace') + '-map.json'));
        if(Object.keys(ret.map.res).length){
          map.setContent(JSON.stringify(ret.map));
          ret.pkg[map.subpath] = map;
        }
    }],
    spriter: fis.plugin('csssprites')
});


//不用被mod
fis.match(/.*\.partial\.js$/, {
    isMod: false
});

fis.match('/favicon.ico', {
    useHash: false,
    release: '$0'
},true);

// mz release prod 线上环境，sqa为测试环境
['prod', 'sqa'].forEach(function(_mediaName_) {

  fis.media(_mediaName_)
      .match('*.js', {
          useHash: true,
          optimizer: fis.plugin('uglify-js')
      })
      .match('*.{css,scss}', {
          useHash: true,
          useSprite: true,
          optimizer: fis.plugin('clean-css')
      })
      .match('::image', {
          useHash: true,
      })

      .match('*.png', {
          useHash: true,
          optimizer: fis.plugin('png-compressor')
      })  
});



//项目 fis-conf.js load完之后再运行的
fis.amount = function(){

  fis.match('**/*.scss', {
      postprocessor: fis.plugin('autoprefixer',{
        browsers: fis.get('browsers')
      })
  });

  if(fis.get('urlprefix') !== undefined){
     fis.set('rewriteFilename', fis.get('namespace') + fis.get('urlprefix').replace(/\//g, '_'));
  }

  if(fis.get('cdn') !== undefined){

    ['prod', 'sqa'].forEach(function(_mediaName_) {
      fis.media(_mediaName_)
          .match('*.js', {
              domain: fis.get('cdn'),
          })
          .match('*.{css,scss}', {
              domain: fis.get('cdn'),
          })
          .match('::image', {
              domain: fis.get('cdn'),
          })
    });

  }

}

module.exports = fis;


