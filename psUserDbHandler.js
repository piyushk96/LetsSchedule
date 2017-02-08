/**
 * Created by piyush on 5/2/17.
 */
'use strict';
const pg = require('pg');

let client;
function createClient(){
    client = new pg.Client({
        host : 'localhost',
        user : 'todouser',
        database : 'tododb',
        password : '12345',
        port : '5432'
    });
}

module.exports = {
    addUser : function (data, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        let query;
        if(data.password == null)
            query = "INSERT INTO todoclient(clientid,username,email) VALUES(" +
                "'" + data.clientId + "'," +
                "'" + data.username + "'," +
                "'" + data.email + "'" +
                ");";
        else
            query = 'INSERT INTO todoclient VALUES(' +
                "'" + data.clientId + "'," +
                "'" + data.username + "'," +
                "'" + data.email + "'," +
                "'" + data.password + "'" +
                ");";
        client.query(query, function (err, result) {
            client.end();
            if (err)
                console.log(err);
            cb(result);
        });
    },

    fetchUser : function (clientId, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        const queryString = "SELECT * FROM todoclient WHERE clientid='" + clientId + "';";
        client.query(queryString, function (err, rows, fields) {
            client.end();
            if (err)
                console.log(err);
            cb(rows.rows);
        });
    },

    logInUser : function (data, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        let queryString;
        if(data.password == null)
            queryString = "SELECT * FROM todoclient WHERE " +
                "email='" + data.email + "' AND " +
                "password IS null;";
        else
            queryString = "SELECT * FROM todoclient WHERE " +
                "email='" + data.email + "' AND " +
                "password='" + data.password +
                "';";
        client.query(queryString, function (err, rows, fields) {
            client.end();
            if (err)
                console.log(err);
            if(rows.rows.length == 0)
                cb(0, null);
            else
                cb(1, rows.rows[0].clientid);
        });
    }
};