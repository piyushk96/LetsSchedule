/**
 * Created by piyush on 6/9/16.
 */
'use strict';
const router = require('express').Router();
// const db = require('../todoDBhandler');
const db = require('../psTodoDbHandler');
// const db2 = require('../userDBhandler');
const db2 = require('../psUserDbHandler');


router.get('/emailandusername', function (req, res) {
    db2.fetchUser(req.query.clientId, function (obj) {
        res.send(obj);
    });
});

router.get('/findmaxtodoid', function (req,res) {
    db.getMaxTodoId(function (id) {
        res.send(id);
    });
});

router.post('/addtodo', function(req, res){
    const newTodo = {
        id: req.body.id,
        task: req.body.task,
        date: req.body.date,
        important: (req.body.important == 'true')? true : false,
        clientId: req.body.clientId
    };
    db.addTodo(newTodo, function (result) {
        res.send(result)
    });
});

router.get('/fetchtodos', function (req, res) {
    const obj = {
        title: req.query.title,
        clientId: req.query.id
    };
    if(req.query.title != 'next7days') {
        db.fetchTodos(obj, function (todos) {
            res.send(todos);
        });
    }
    else{
        db.fetchMultipleTitleTodos(obj.clientId, function (todos) {
            res.send(todos);
        });
    }
});

router.post('/updatetodotask', function (req, res) {
    const obj = {
        id: req.body.id,
        task: req.body.task,
        clientId: req.body.clientId
    };
    db.updateTodoTask(obj, function (result) {
        res.send(result);
    });
});

router.get('/updatetododate', function (req, res) {
    const obj = {
        id: req.query.id,
        date: req.query.date,
        clientId: req.query.clientId
    };
    db.updateTodoDate(obj, function (result) {
        res.send(result);
    });
});

router.get('/modifydonestatus', function (req, res) {
    const done = (req.query.done == 'true')? false : true;      //reverse status
    const obj = {
        id: req.query.id,
        done: done,
        clientId: req.query.clientId
    };
    db.modifyDoneStatus(obj, function (result) {
        res.send(result);
    });
});

router.get('/modifyimportantstatus', function (req, res) {
    const imp = (req.query.imp == 'true')? false : true;        //reverse status
    const obj = {
        id: req.query.id,
        imp: imp,
        clientId: req.query.clientId
    };
    db.modifyImportantStatus(obj, function (result) {
        res.send(result);
    });
});

router.get('/deletetodos', function (req, res) {
    const obj = {
        id: req.query.id,
        clientId: req.query.clientId
    };
    db.deleteTodos(obj, function (result) {
        res.send(result);
    });
});

module.exports = router;