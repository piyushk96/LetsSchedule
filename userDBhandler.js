/**
 * Created by piyush on 8/9/16.
 */
'use strict';
const mysql = require('mysql');

let connection = {};
function createConnection(){
    connection = mysql.createConnection({
        host: 'sql6.freemysqlhosting.net',
        user: 'sql6135220',
        database: 'sql6135220',
        password: 'CGsgMxRq1I'
    });
}

module.exports = {
    getUserEmail : function (clientId, cb) {
        createConnection();
        connection.connect();
        const queryString = 'SELECT username,email FROM todoClient WHERE clientId="' + clientId + '";';
        connection.query(queryString, function (err, rows, fields) {
            if (err)
                console.log(err);
            cb({
                email : rows[0].email,
                username: rows[0].username
            });
        });
        connection.end();
    },

    addUser : function (data, cb) {
        createConnection();
        connection.connect();
        const query = 'INSERT INTO todoClient VALUES(' +
            '"' + data.clientId + '",' +
            '"' + data.username + '",' +
            '"' + data.email + '",' +
            '"' + data.password + '"' +
            ');';
        connection.query(query, function (err, result) {
            if (err) console.log(err);
            cb(result);
        });
        connection.end();
    },

    fetchUser : function (clientId, cb) {
        createConnection();
        connection.connect();
        const queryString = 'SELECT * FROM todoClient WHERE clientId="' + clientId + '";';
        connection.query(queryString, function (err, rows, fields) {
            if (err)
                console.log(err);
            cb(rows);
        });
        connection.end();
    },

    logInUser : function (data, cb) {
        createConnection();
        connection.connect();
        const queryString = 'SELECT * FROM todoClient WHERE ' +
            'email="' + data.email + '" AND ' +
            'password="' + data.password +
            '";';
        connection.query(queryString, function (err, rows, fields) {
            if (err)
                console.log(err);
            cb(rows);
        });
        connection.end();
    }

};