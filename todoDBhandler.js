/**
 * Created by piyush on 24/8/16.
 */
'use strict';
const mysql = require('mysql');

let connection = {};
const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


function createConnection() {
    connection = mysql.createConnection({
        // host: 'sql11.freemysqlhosting.net',
        // user: 'sql11155241',
        // database: 'sql11155241',
        // password: 'UuGBn2zY5R'
        host: 'localhost',
        user: 'todouser',
        database: 'tododb'
    });
}

function getDateString(date) {
    let d = date.getDate();
    let dd = (d < 10) ? '0' + d : d;
    const dateString = dd + '-' + month[date.getMonth()] + '-' + date.getFullYear();
    return dateString;
}

module.exports = {
    getMaxTodoId: function (cb) {
        createConnection();
        connection.connect();
        connection.query('SELECT MAX(id) AS id FROM todolist2;', function (err, rows, fields) {
            if(err)
                console.log(err);
            else
                cb(rows);
        });
        connection.end();
    },

    fetchTodos: function (obj, cb) {
        let todolist = {};
        let queryString;
        let today = new Date();
        switch (obj.title){
            case 'inbox': queryString = 'SELECT * from todolist2 WHERE done=0 and clientId="' + obj.clientId + '";';
                break;
            case 'completed': queryString = 'SELECT * from todolist2 WHERE done=1 and clientId="' + obj.clientId + '";';
                break;
            case 'important': queryString = 'SELECT * from todolist2 WHERE important=1 and done=0 and clientId="' + obj.clientId + '" order by duedate;';
                break;
            case 'today': today = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
                queryString = 'SELECT * from todolist2 WHERE duedate="' + today + '" and done=0 and clientId="' + obj.clientId + '";';
                break;
            case 'tomorrow': let tomorrow = new Date(today.getTime() + 86400000);
                tomorrow = tomorrow.getFullYear() + "-" + (tomorrow.getMonth()+1) + "-" + tomorrow.getDate();
                queryString = 'SELECT * from todolist2 WHERE duedate="' + tomorrow + '" and done=0 and clientId="' + obj.clientId + '";';
                break;
        }
        createConnection();
        connection.connect();
        connection.query(queryString,function (err, rows, fields) {

            if(err)
                console.log(err);
            else {
                todolist.list = [];
                let date = new Date();

                if(obj.title == 'today' || obj.title == 'tomorrow') {
                    let dateStr;
                    if(obj.title == 'today')
                        dateStr = getDateString(date);
                    else {
                        var tomorrow = new Date(date.getTime() + 86400000);
                        dateStr = getDateString(tomorrow);
                        date = tomorrow;
                    }
                    todolist.headingDate = dateStr;
                    todolist.headingTimestamp = date.getTime();
                }

                for (let row of rows) {
                    let dateString = '', timeStamp = '0';
                    if(row.duedate != null && (obj.title == 'inbox' || obj.title == 'important')) {
                        dateString = getDateString(row.duedate);
                        timeStamp = row.duedate.getTime() + 86400000;  //js and mysql one day difference
                    }

                    todolist.list.push({
                        id: row.id,
                        task: row.task,
                        taskDateString: dateString,
                        taskTimeStamp: timeStamp,
                        done: (row.done == 0) ? false : true,
                        important: (row.important == 0) ? false : true
                    });
                }
                cb(todolist);
            }
        });
        connection.end();
    },

    fetchMultipleTitleTodos : function (clientId, cb) {
        createConnection();
        connection.connect();
        let todolist = [{},{},{},{},{},{},{}];
        let date = new Date();

        for(let i=0; i<7; i++) {
            const queryString = 'SELECT * from todolist2 WHERE duedate=CURDATE()+INTERVAL ' + i + ' DAY and done=0 and clientId="' + clientId + '";' ;
            connection.query(queryString, function (err, rows, fields) {
                if (err)
                    throw err;
                else{
                    todolist[i].list = [];

                    const dateString = getDateString(date);
                    todolist[i].headingDate = dateString;
                    todolist[i].headingTimestamp = date.getTime();

                    for (let row of rows) {
                        todolist[i].list.push({
                            id: row.id,
                            task: row.task,
                            done: false,
                            important: (row.important == 0) ? false : true
                        });
                    }

                    let newDate = new Date(date.getTime() + 86400000);
                    date = newDate;
                    if(i == 6)
                        cb(todolist);
                }
            });
        }
        connection.end();
    },

    addTodo : function (todo, cb) {
        createConnection();
        connection.connect();
        let dateString = '';
        let queryString;
        if(todo.date != '') {
            const date = new Date(todo.date);
            dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            queryString = 'INSERT INTO todolist2(id,task,important,duedate,clientId) VALUES(' +
                todo.id + ',' +
                '"' + todo.task + '",' +
                todo.important +
                ', "'+dateString+'",' +
                '"' + todo.clientId + '"' +
                ');';
        }
        else{
            queryString = 'INSERT INTO todolist2(id,task,important,clientId) VALUES(' +
                todo.id + ',' +
                '"' + todo.task + '",' +
                todo.important +
                ',"' + todo.clientId + '"' +
                ');';
        }
        connection.query(queryString, function (err, result) {
            if(err)
                console.log(err);
            else
                cb(result);
        });
        connection.end();
    },

    updateTodoTask : function (todo, cb) {
        createConnection();
        connection.connect();
        const queryString = 'UPDATE todolist2 SET task="' + todo.task + '" where id=' + todo.id + ' and clientId="' + todo.clientId + '";';
        connection.query(queryString, function (err, result) {
            if(err)
                console.log(err);
            else
                cb(result);
        });
        connection.end();
    },

    updateTodoDate : function (obj, cb) {
        createConnection();
        connection.connect();
        let queryString;
        if(obj.date == 'today')
            queryString = 'UPDATE todolist2 SET duedate=CURDATE() where id=' + obj.id + ' and clientId="' + obj.clientId + '";';
        else if(obj.date == 'tomorrow')
            queryString = 'UPDATE todolist2 SET duedate=CURDATE()+ INTERVAL 1 DAY where id=' + obj.id + ' and clientId="' + obj.clientId + '";';
        else{
            const date = new Date(obj.date);
            const dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            queryString = 'UPDATE todolist2 SET duedate="' + dateString + '" where id=' + obj.id + ' and clientId="' + obj.clientId + '";';
        }
        connection.query(queryString, function (err, result) {
            if(err)
                console.log(err);
            else
                cb(result);
        });
        connection.end();
    },

    modifyDoneStatus: function (obj, cb) {
        createConnection();
        connection.connect();
        const queryString = 'UPDATE todolist2 SET done=' + obj.done + ' WHERE id=' + obj.id + ' and clientId="' + obj.clientId + '";';
        connection.query(queryString, function (err, result) {
            if(err)
                console.log(err);
            else
                cb(result);
        });
        connection.end();
    },

    modifyImportantStatus: function (obj, cb) {
        createConnection();
        connection.connect();
        const queryString = 'UPDATE todolist2 SET important=' + obj.imp + ' WHERE id=' + obj.id + ' and clientId="' + obj.clientId + '";';
        connection.query(queryString, function (err, result) {
            if(err)
                console.log(err);
            else
                cb(result);
        });
        connection.end();
    },

    deleteTodos: function (obj, cb) {
        createConnection();
        connection.connect();
        let queryString;
        if(obj.id == 0)
            queryString = 'DELETE FROM todolist2 WHERE done = 1 and clientId="' + obj.clientId + '";';
        else
            queryString = 'DELETE FROM todolist2 WHERE id = ' + obj.id + ' and clientId="' + obj.clientId + '";';
        connection.query(queryString, function (err, result) {
            if(err)
                console.log(err);
            else
                cb(result);
        });
        connection.end();
    }
};



