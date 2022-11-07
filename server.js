const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path')
const session = require('express-session');
const flash = require('express-flash');


const router = require('./router');
const db = require('./db/mongodb')

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));

app.use('/public/', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/upload', express.static(__dirname + '/upload'));


app.get('/test', (req, res) => {
    return res.send({ responseCode: 200, responseMessage: "Hello...From....Node....!" })
})


app.use(session({
    secret: "thisissecretkeyformemogram",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000,
        //secure : true
    }
}));

app.use(flash());
app.use('', router);


app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.listen(9000, (err, result) => {
    if (err) {
        console.log("server error", err)
    }
    else {
        console.log("Server is listening at 9000");

    }
})