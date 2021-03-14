"use strict";
var mariadb = require("mariadb");
var pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'chromium_new',
    port: '3307'
});
module.exports = {
    getConnection: function () {
        return new Promise(function (res, rej) {
            pool.getConnection()
                .then(function (conn) {
                res(conn);
            })
                .catch(function (error) {
                rej(error);
            });
        });
    }
};
