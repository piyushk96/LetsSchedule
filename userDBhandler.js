/**
 * Created by piyush on 8/9/16.
 */
'use strict';
const mysql = require('mysql');

let connection = {};
function createConnection(){
    connection = mysql.createConnection({
        host: 'sql6.freemysqlhosting.net',
        user: 'sql6138205',
        database: 'sql6138205',
        password: 'dTluEG1wIr'
        // host: 'localhost',
        // user: 'todouser',
        // database: 'tododb'
    });
}

module.exports = {
    addUser : function (data, cb) {
        createConnection();
        connection.connect();
        let query;
        if(data.password == null)
            query = 'INSERT INTO todoClient(clientId,username,email) VALUES(' +
                '"' + data.clientId + '",' +
                '"' + data.username + '",' +
                '"' + data.email + '"' +
                ');';
        else
            query = 'INSERT INTO todoClient VALUES(' +
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
        let queryString;
        if(data.password == null)
            queryString = 'SELECT * FROM todoClient WHERE ' +
                'email="' + data.email + '" AND ' +
                'password IS null;';
        else
            queryString = 'SELECT * FROM todoClient WHERE ' +
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