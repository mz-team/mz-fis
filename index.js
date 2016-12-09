//vi mz/index.js
var fis = require('fis3');
var lolcat = require('fis-lolcat');

var cloneObjectOrdered = function (obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  var temp = obj.constructor();

  if (Array.isArray(obj)) {
    [].concat(obj).sort().forEach(function (value, index) {
      temp[index] = cloneObjectOrdered(value);
    });
  } else {
    Object.keys(obj).sort().forEach(function (key) {
      temp[key] = cloneObjectOrdered(obj[key]);
    });
  }
  return temp;
}

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

fis.cli.version = function () {
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
  'server': {
    'rewrite': false,
    'type': 'php',
    'libs': '',
    'clean': {
      'include': '**.*',
      'exclude': ''
    }
  }
};

fis.util.map(sets, function (key, value) {
  fis.set(key, value);
});

fis.set('project.ignore', ['node_modules/**', 'output/**', '.git/**', '**/.svn/**', 'fis-conf.js', '**/_*', '_*/*']); // set 为覆盖不是叠加

fis.set('component.github.author', 'mz-components');

//addSameNameRequire 会用到
fis.set('project.ext', {
  po: 'json',
  scss: 'css'
});

//增加 ::image 的类型
fis.set('project.fileType.image', ['mp3', 'mp4', 'webm', 'flv']);

//增加 livereload 与 weinre 的本地 IP 限制
fis.config.set('livereload-iprule', '(?!127)*.*.*.*');
fis.config.set('weinre-iprule', '(?!127)*.*.*.*');

//模块化方案，本项目选中CommonJS方案(同样支持异步加载哈)
fis.hook('commonjs', {

});
//相对路径
fis.hook('relative');

fis.match('**/*.scss', {
  rExt: '.css', // from .scss to .css
  parser: [function (content, file, settings) {
    var prependScss = [], appendScss = [];

    //若指定 globalVarScss ，则所有 scss 文件自动 import 这个文件，通常用来定义全局 @mixin
    var globalVarScss = fis.get('globalVarScss');
    if (globalVarScss) {
      prependScss.push('/*!' + globalVarScss + '*/');
      prependScss.push('@import "' + globalVarScss + '";');
    }

    //自动 import 同目录同名 .custom.scss
    var customFileExt = '.custom.scss';
    if (fis.get('autoImportCustomScss')) {
      if (fis.util.isFile(file.realpathNoExt + customFileExt)) {
        var customFilename = file.filename + customFileExt;
        appendScss.push('/*!' + customFilename + '*/');
        appendScss.push('@import "' + customFilename + '";');
      }
    }

    //自动 import 父级目录下与父级目录同名的 scss
    if (fis.get('autoImportParentScss')) {
      var parentDir = file.dirname.match(/^(.*\/([^\/]+))\/[^\/]+$/);
      var parentFilename = parentDir[2] + '.scss';
      if (fis.util.isFile(parentDir[1] + '/' + parentFilename)) {
        prependScss.push('/*!' + parentFilename + '*/');
        prependScss.push('@import "../' + parentFilename + '";');
      }
      var parentCustomFilename = parentDir[2] + customFileExt;
      if (fis.get('autoImportCustomScss') && fis.util.isFile(parentDir[1] + '/' + parentCustomFilename)) {
        prependScss.push('/*!' + parentCustomFilename + '*/');
        prependScss.push('@import "../' + parentCustomFilename + '";');
      }
    }

    content = prependScss.join('\n') + content;
    content = content + appendScss.join('\n');
    return content;
  }, fis.plugin('node-sass', {
    // fis-parser-node-sass option
  })]
});


fis.match('*', {
  useHash: false // md5 都关掉
  // release: '/${static}/${namespace}/$0'
});

fis.match('*.html', {
  postprocessor: fis.plugin('href-locate', {})
});

fis.match('*.tpl', {
  parser: [
    fis.plugin('partial'),
    function (content, file, settings) {
      return content.replace(/\{\{(?:(\w+)\:)?([\.\w]+)\}\}/g, function (str, func, arg) {
        if (func) {
          return fis[func](arg);
        } else {
          return fis.get(arg);
        }
      });
    }],
  preprocessor: [fis.plugin('extlang', {
    'left_delimiter': sets.smarty.left_delimiter,
    'right_delimiter': sets.smarty.right_delimiter
  }), fis.plugin('components')],
  postprocessor: [

    fis.plugin('require-async', {
      'left_delimiter': sets.smarty.left_delimiter,
      'right_delimiter': sets.smarty.right_delimiter
    }),
    fis.plugin('href-locate', {
      'left_delimiter': sets.smarty.left_delimiter,
      'right_delimiter': sets.smarty.right_delimiter
    })

  ],
  optimizer: [
    fis.plugin('smarty-xss'),
    // fis.plugin('html-compress',{
    //   'level' : 'strip',
    //   'leftDelimiter' : sets.smarty.left_delimiter,
    //   'rightDelimiter' : sets.smarty.right_delimiter
    // })
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
  url: '${namespace}/widget/$1',
});

fis.match('/{plugin/**,smarty/**,php-simulation-env/**,smarty.conf,domain.conf,**.php}', {
  useMap: false,
  isMod: false,
  release: '$0'
});

fis.match('/html/(**)', {
  release: '/${static}/${namespace}/$1'
});

fis.match('*.html:js', {
  preprocessor: fis.plugin('components')
});


fis.match('/server.conf', {
  parser: [function (content, file, settings) {
    content = content.replace(/(\^\S*)\{\{([\.\w]+)\}\}/g, function (a, b, c) {
      return b + fis.get(c).replace(/\//g, '\\\/');
    });

    return content.replace(/\{\{([\.\w]+)\}\}/g, function (a, b, c) {
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
    fis.plugin('js-i18n', {
      enable: true,
      left_delimiter: sets.smarty.left_delimiter,
      right_delimiter: sets.smarty.right_delimiter
    })
  ],
  postpackager: [require('./lib/livereload-target.js'), require('./lib/weinre-target.js'), function createMap(ret) {
    if (fis.get('namespace')) {
      var path = require('path');
      var root = fis.project.getProjectPath();
      var map = fis.file.wrap(path.join(root, fis.get('namespace') + '-map.json'));
      var orderedMap = cloneObjectOrdered(ret.map);

      if (Object.keys(ret.map.res).length) {
        map.setContent(JSON.stringify(orderedMap, null, 2));
        ret.pkg[map.subpath] = map;
      }
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
}, true);

// 打包配置，packOrder设置匹配文件在包中的出现顺序，值越小越靠前，默认-1
fis.match('/static/lib/mod.js', { packOrder: -101 });
fis.match('{' + [
  '/static/global/global.scss',
  '/components/jquery/jquery.js',
  '/components/zepto/zepto.js'
].join() + '}', {
    packOrder: -100
  });
fis.match('tracker.js', { packOrder: 100 });

// mz release prod 线上环境，sqa为测试环境
['prod', 'sqa'].forEach(function (_mediaName_) {
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
      optimizer: fis.plugin('png-compressor', {
        type: 'pngquant'
      })
    })
    .match('*.hd.png', {
      useHash: true,
      optimizer: false
    })
    .match('*.html', {
      optimizer: fis.plugin('html-minifier')
    })
    .match('*.tpl', {
      parser: [
        fis.plugin('partial', { type: 'ssi' }),
        function (content, file, settings) {
          return content.replace(/\{\{(?:(\w+)\:)?([\.\w]+)\}\}/g, function (str, func, arg) {
            if (func) {
              return fis[func](arg);
            } else {
              return fis.get(arg);
            }
          });
        }]
    });

  //这条配置与 hook-relative 一起用的时候有bug，所以开启relative就关掉压缩
});




//项目 fis-conf.js set完后再运行
fis.mount = function (config) {
  if (typeof config === 'function') {
    return config(fis);
  } else if (!config) {
    return;
  } else {
    for (var i in config) {
      fis.set(i, config[i]);
    }
  }

  //server.conf重命名
  fis.set('rewriteFilename', fis.get('urlprefix') ? fis.get('namespace') + fis.get('urlprefix').replace(/\//g, '_') : fis.get('namespace'));

  //autoprefixer
  if (Array.isArray(config.browsers)) {
    fis.match('**/*.scss', {
      postprocessor: fis.plugin('autoprefixer', {
        browsers: config.browsers
      })
    });
  }

  //若指定 globalVarScss ，则所有 scss 文件自动 import 这个文件，通常用来定义全局 @mixin
  if (config.globalVarScss) {
    if (!fis.util.isFile(fis.util(fis.project.getProjectPath(), config.globalVarScss))) {
      fis.log.error('globalVarScss'.green + ' file not found: ' + config.globalVarScss);
    }
  }

  //如果按相对路径发布
  if (config.relative) {
    fis.match('*.html', {
      relative: true,
      optimizer: null
    })
      .match('*.js', {
        relative: true
      })
      .match('*.{css,scss}', {
        relative: true
      });
  }

  //enableLoader
  if (config.enableLoader) {
    fis.match('::package', {
      // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
      postpackager: fis.plugin('loader', {
        resourceType: 'commonJs',
        processor: {
          '.tpl': 'html',
          '.html': 'html'
        },
        useInlineMap: true
      })
    });
  }

  //allInOne
  if (config.allInOne) {
    var allInOneFileBasename = typeof config.allInOne === "string" ? config.allInOne : '/static/aio';
    if (!/^[\w\/]+$/.test(allInOneFileBasename)) {
      fis.log.error('allInOne'.green + ' config should match pattern: /^[\\w\\/]+$/');
    }
    fis.match('*.js', {
      packTo: allInOneFileBasename + '.js'
    });
    fis.match('*.{css,scss}', {
      packTo: allInOneFileBasename + '.css'
    });
  }

  //静态资源增加domain前缀
  if (config.cdn) {
    var cdnMatches = config.cdn.match(/^((?:https?\:)?\/\/)?.+$/);
    var cdn = cdnMatches[1] ? cdnMatches[0] : '//' + cdnMatches[0];
    ['prod', 'sqa'].forEach(function (_mediaName_) {
      fis.media(_mediaName_)
        .match('*.js', {
          domain: cdn,
          relative: false
        })
        .match('*.{css,scss}', {
          domain: cdn,
          relative: false
        })
        .match('::image', {
          domain: cdn,
          relative: false
        })
        .match('*.html', {
          relative: false
        })
    });
  }

  //设置环境变量
  if (config.env && Array.isArray(config.env.keys)) {
    var env = {};
    for (var i = 0; i < config.env.keys.length; i++) {
      if (process.env && process.env[config.env.keys[i]]) {
        env[config.env.keys[i]] = process.env[config.env.keys[i]];
      } else {
        fis.log.error('invalid environment variable [' + config.env.keys[i].green + '] ');
      }
    }
    fis.set('env', env);
  }
}

module.exports = fis;
