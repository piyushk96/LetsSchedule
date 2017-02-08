/**
 * Created by piyush on 7/9/16.
 */
'use strict';
const router = require('express').Router();
// const db = require('../userDBhandler');
const db = require('../psUserDbHandler');
const md5 = require('md5');

router.post('/', function (req, res) {
    let clientId = md5(req.body.email);
    let data = {
        clientId: clientId.slice(0,10),
        username : req.body.username,
        email : req.body.email,
        password : (req.body.password != null) ? md5(req.body.password):null
    };

    db.fetchUser(data.clientId, function(rows) {
        if(rows.length != 0)
            res.send({status: 'exist'});         //returned , server exits
        else {
            db.addUser(data, function (result) {
                res.send({
                    status: 'added',
                    clientId: data.clientId
                });
            });
        }
    });
});






module.exports = router;