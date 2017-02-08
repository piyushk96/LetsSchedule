/**
 * Created by piyush on 6/9/16.
 */
'use strict';
const router = require('express').Router();
// const db = require('../userDBhandler');
const db = require('../psUserDbHandler');
const md5 = require('md5');

router.post('/checkclientid', function (req, res) {
    const clientId = req.body.clientId;
    db.fetchUser(clientId, function (rows) {
        if(rows.length != 0)
            res.send({status: 'exists'});
        else
            res.send({status: 'notExist'});
    });
});

// router.post('/checkclientemail', function (req, res) {
//     let data = {
//         email : req.body.email,
//         password : null
//     };
//
//     db.logInUser(data, function(rows) {
//         if(rows.length == 0)
//             res.send({status: 'invalid'});
//         else {
//             res.send({
//                 status: 'valid',
//                 clientId: rows[0].clientId
//             });
//         }
//     });
// });

router.post('/', function (req, res) {
    let data = {
        email : req.body.email,
        password : (req.body.password == null)? null : md5(req.body.password)
    };

    db.logInUser(data, function(numOfRows, clientId) {
        if(numOfRows == 0)
            res.send({status: 'invalid'});
        else {
            res.send({
                status: 'valid',
                clientId: clientId
            });
        }
    });
});



module.exports = router;