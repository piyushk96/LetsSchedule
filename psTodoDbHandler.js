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

const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDateString(date) {
    let d = date.getDate();
    let dd = (d < 10) ? "0" + d : d;
    const dateString = dd + "-" + month[date.getMonth()] + "-" + date.getFullYear();
    return dateString;
}

module.exports = {
    getMaxTodoId: function (cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        client.query("SELECT MAX(id) AS id FROM todolist2;", function (err, rows, fields) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(rows.rows);
        });
    },

    fetchTodos: function (obj, cb) {
        let todolist = {};
        let queryString;
        let today = new Date();
        switch (obj.title){
            case 'inbox': queryString = "SELECT * from todolist2 WHERE done=0 and clientid='" + obj.clientId + "';";
                break;
            case 'completed': queryString = "SELECT * from todolist2 WHERE done=1 and clientid='" + obj.clientId + "';";
                break;
            case 'important': queryString = "SELECT * from todolist2 WHERE important=1 and done=0 and clientid='" + obj.clientId + "' order by duedate;";
                break;
            case 'today': today = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
                queryString = "SELECT * from todolist2 WHERE duedate='" + today + "' and done=0 and clientid='" + obj.clientId + "';";
                break;
            case 'tomorrow': let tomorrow = new Date(today.getTime() + 86400000);
                tomorrow = tomorrow.getFullYear() + "-" + (tomorrow.getMonth()+1) + "-" + tomorrow.getDate();
                queryString = "SELECT * from todolist2 WHERE duedate='" + tomorrow + "' and done=0 and clientid='" + obj.clientId + "';";
                break;
        }
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        client.query(queryString,function (err, rows, fields) {
            client.end();
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
                        let tomorrow = new Date(date.getTime() + 86400000);
                        dateStr = getDateString(tomorrow);
                        date = tomorrow;
                    }
                    todolist.headingDate = dateStr;
                    todolist.headingTimestamp = date.getTime();
                }

                for (let row of rows.rows) {
                    let dateString = "", timeStamp = '0';
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
    },

    fetchMultipleTitleTodos : function (clientId, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        let todolist = [{},{},{},{},{},{},{}];
        let date = new Date();

        for(let i=0; i<7; i++) {
            const queryString = "SELECT * from todolist2 WHERE duedate=CURRENT_DATE+" + i + " and done=0 and clientid='" + clientId + "';" ;
            client.query(queryString, function (err, rows, fields) {
                if (err)
                    console.log(err);
                else{
                    todolist[i].list = [];

                    const dateString = getDateString(date);
                    todolist[i].headingDate = dateString;
                    todolist[i].headingTimestamp = date.getTime();

                    for (let row of rows.rows) {
                        todolist[i].list.push({
                            id: row.id,
                            task: row.task,
                            done: false,
                            important: (row.important == 0) ? false : true
                        });
                    }

                    let newDate = new Date(date.getTime() + 86400000);
                    date = newDate;
                    if(i == 6) {
                        client.end();
                        cb(todolist);
                    }
                }
            });
        }
    },

    addTodo : function (todo, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        let dateString = '';
        let queryString;

        const important = (todo.important == true) ? 1 : 0;
        if(todo.date != '') {
            const date = new Date(todo.date);
            dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            queryString = "INSERT INTO todolist2(id,task,important,duedate,clientid) VALUES(" +
                todo.id + "," +
                "'" + todo.task + "'," +
                important +
                ",'" + dateString + "'," +
                "'" + todo.clientId + "'" +
                ");";
        }
        else{
            queryString = "INSERT INTO todolist2(id,task,important,clientid) VALUES(" +
                todo.id + "," +
                "'" + todo.task + "'," +
                important +
                ",'" + todo.clientId + "'" +
                ");";
        }
        client.query(queryString, function (err, result) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(result);
        });
    },

    updateTodoTask : function (todo, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        const queryString = "UPDATE todolist2 SET task='" + todo.task + "' where id=" + todo.id + " and clientid='" + todo.clientId + "';";
        client.query(queryString, function (err, result) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(result);
        });
    },

    updateTodoDate : function (obj, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        let queryString;
        if(obj.date == 'today')
            queryString = "UPDATE todolist2 SET duedate=CURRENT_DATE where id=" + obj.id + " and clientid='" + obj.clientId + "';";
        else if(obj.date == 'tomorrow')
            queryString = "UPDATE todolist2 SET duedate=CURRENT_DATE + 1 where id=" + obj.id + " and clientid='" + obj.clientId + "';";
        else{
            const date = new Date(obj.date);
            const dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            queryString = "UPDATE todolist2 SET duedate='" + dateString + "' where id=" + obj.id + " and clientid='" + obj.clientId + "';";
        }
        client.query(queryString, function (err, result) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(result);
        });
    },

    modifyDoneStatus: function (obj, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        const done = ((obj.done == true) ? 1 : 0);
        const queryString = "UPDATE todolist2 SET done=" + done + " WHERE id=" + obj.id + " and clientid='" + obj.clientId + "';";
        client.query(queryString, function (err, result) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(result);
        });
    },

    modifyImportantStatus: function (obj, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        const important = ((obj.imp == true) ? 1 : 0);
        const queryString = "UPDATE todolist2 SET important=" + important + " WHERE id=" + obj.id + " and clientid='" + obj.clientId + "';";
        client.query(queryString, function (err, result) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(result);
        });
    },

    deleteTodos: function (obj, cb) {
        createClient();
        client.connect(function (err) {
            if(err)
                console.log(err);
        });
        let queryString;
        if(obj.id == 0)
            queryString = "DELETE FROM todolist2 WHERE done = 1 and clientid='" + obj.clientId + "';";
        else
            queryString = "DELETE FROM todolist2 WHERE id = " + obj.id + " and clientid='" + obj.clientId + "';";
        client.query(queryString, function (err, result) {
            client.end();
            if(err)
                console.log(err);
            else
                cb(result);
        });
    }
};
