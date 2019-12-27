const crypto = require('crypto');

exports.createFilenameMd5 = function (content) {
  const hash = crypto.createHash('md5');
  hash.update(content);
  return hash.digest('hex');
}
