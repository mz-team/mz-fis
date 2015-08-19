// fis.baidu.com

'use strict';

module.exports = function(ret, settings, conf, opt) {

  if (!opt.weinre)  {
    return;
  }

  var leftDelimiter = fis.config.get('settings.smarty.left_delimiter', '<{');
  var rightDelimiter = fis.config.get('settings.smarty.right_delimiter', '}>');

  fis.util.map(ret.src, function InsertLiveReloadPlaceholder (subpath, file) {
    if (file.rExt === '.tpl') {
      var content = file.getContent();
      var reg = new RegExp(fis.util.escapeReg(leftDelimiter) + '\\/body\\\s*' + fis.util.escapeReg(rightDelimiter));
      var p;

      if (~(p = content.indexOf(leftDelimiter + '/body' + rightDelimiter))) {
        content = content.substr(0, p) + '<!--weinre-->' + content.substr(p);
      } else if (reg.test(content)) {
        content = content.replace(reg, function (all) {
          return "<!--weinre-->" + all; 
        });
      }

      file.setContent(content);
    }
  });
};

