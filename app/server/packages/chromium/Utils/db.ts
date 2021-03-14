const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'chromium_new',
  port: '3307'
});

module.exports = {
  getConnection() {
    return new Promise(function (res, rej) {
      pool.getConnection()
        .then(function (conn: any) {
          res(conn);
        })
        .catch(function (error: any) {
          rej(error);
        });
    });
  }
};
