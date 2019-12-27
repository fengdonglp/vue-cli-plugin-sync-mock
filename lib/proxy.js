const fs = require('fs-extra')
const querystring = require('querystring')
const path = require('path')

const { createFilenameMd5 } = require('./util')

/**
 * 拦截http-proxy-middleware代理的请求与响应
 * 同步真实接口数据到本地，并将接口地址与mock文件的对应关系存储在json文件内
 */
function createProxy(cachePath) {
  return {
    onProxyReq: (proxyReq, req, res) => {
      // FIXED body-parser导致代理中断：https://github.com/chimurai/http-proxy-middleware/issues/320
      const contentType = proxyReq.getHeader('Content-Type')
      if (!req.body || !contentType) {
        return
      }

      const writeBody = (bodyData) => {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        proxyReq.write(bodyData)
      }

      if (contentType.includes('application/json')) {
        writeBody(JSON.stringify(req.body))
      }

      if (contentType === 'application/x-www-form-urlencoded') {
        writeBody(querystring.stringify(req.body))
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      const _write = res.write
      const _end = res.end
      const chunks = []

      res.write = function (...argument) {
        chunks.push(argument[0])
        _write.apply(res, argument)
      }

      res.end = function (...argument) {
        try {
          const filepath = path.resolve(cachePath, `${createFilenameMd5(req.originalUrl + JSON.stringify(req.body))}.json`)
          fs.ensureFile(filepath).then(() => {
            return fs.writeFile(filepath, Buffer.concat(chunks))
          }).catch(console.log.bind(console))

          _end.apply(res, argument)
        } catch (error) {
          console.log(error)
          _end.apply(res, argument)
        }
      }
    }
  };
}

/**
 * @description 将拦截生成缓存混入用户代理
 * @param {Object} _proxy
 * @param {Boolean} sync
 * @param {String} cachePath
 * @returns
 */
function mixProxy(_proxy, sync, cachePath) {
  if (!sync) {
    return _proxy;
  }

  const filter = createProxy(cachePath);

  Object.values(_proxy).forEach(config => {
    config = Object.assign(config, filter);
  });

  return _proxy;
}

module.exports = {
  createProxy,
  mixProxy
}