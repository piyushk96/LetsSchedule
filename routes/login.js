/**
 * Created by piyush on 6/9/16.
 */
'use strict';
const router = require('express').Router();
const db = require('../userDBhandler');
const md5 = require('md5');

router.post('/checkclient', function (req, res) {
    var clientId = req.body.clientId;
    db.fetchUser(clientId, function (rows) {
        if(rows.length != 0)
            res.send({status: 'exists'});
        else
            res.send({status: 'notExist'});
    })
});

router.post('/', function (req, res) {
    let data = {
        email : req.body.email,
        password : md5(req.body.password)
    };

    db.logInUser(data, function(rows) {
        if(rows.length == 0)
            res.send({status: 'invalid'});
        else {
            res.send({
                status: 'valid',
                clientId: rows[0].clientId
            });
        }
    });
});



module.exports = router;