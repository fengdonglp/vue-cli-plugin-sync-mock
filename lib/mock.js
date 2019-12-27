const fs = require('fs-extra');
const path = require('path');

const { createFilenameMd5 } = require('./util');

/**
 * @description 开启mock代理
 * @param {Application} app express实例
 * @param {String} cachePath 缓存数据存储路径
 */
module.exports = function setup (app, cachePath) {
  // 从本地缓存中读取
  app.use((req, res, next) => {
    const filepath = path.resolve(cachePath, `${createFilenameMd5(req.url + JSON.stringify(req.body))}.json`)
    if (fs.existsSync(filepath)) {
      fs.readFile(filepath).then(data => {
        res.end(data)
      });
    } else {
      // 如果缓存数据不存在则走用户代理
      next();
    }
  });
};
