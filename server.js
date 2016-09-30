/**
 * Created by piyush on 24/8/16.
 */
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const todos = require('./routes/todos');
const login = require('./routes/login');
const signup = require('./routes/signup');


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/todos', todos);
app.use('/login', login);
app.use('/signup', signup);

app.use('/', express.static(__dirname + '/public_html'));
app.set('port', process.env.PORT || 8080);

app.get('/login', function (req, res) {
    res.sendFile('public_html/login.html', {root: __dirname });
});

app.get('/signup', function (req, res) {
    res.sendFile('public_html/signup.html', {root: __dirname});
});


app.listen(app.get('port'), function () {
    console.log('http://localhost:' + app.get('port'));
});