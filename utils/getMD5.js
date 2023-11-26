const crypto = require('crypto');

module.exports = function getMD5(file) {
    return crypto.createHash('md5').update(file).digest('hex')
}
