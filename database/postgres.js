var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ifsc:aaindus99@localhost:5432/ifsc')

module.exports = db;