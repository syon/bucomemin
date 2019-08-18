const debug = require('debug')
const fs = require('fs')

debug.enable('app:*')
const dg = debug('app:ERROR')

module.exports = class ErrLog {
  static async dump(filepath, msg) {
    dg(msg)
    fs.appendFileSync(filepath, msg)
  }
}
