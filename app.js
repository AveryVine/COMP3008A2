const express = require('express');
const app = express();

const ROOT = "public"

var passwordTitles = ["Email", "Banking", "Shopping"];
var users = {};

//receive a port, or select default port
app.set('port', (process.env.PORT || 5000));

//log each server request
app.use(function (req, res, next) {
	console.log(req.method + " request for " + req.url);
	next();
});

app.get("/", function (req, res) {
	res.sendFile("index.html", { root: ROOT });
});

app.get('/practice', (req, res) => {
    var uuid = req.params.uuid;
    if (!(uuid in users)) {
        users[uuid] = {
            "passwords": [],
            "testOrder": generateTestOrder()
        }
    }
    res.sendFile("practice.html", { root: ROOT })
});

app.get('/practice/next', (req, res) => {
    var uuid = req.params.uuid;
    if (!(uuid in users)) {
        res.sendFile("restart.html", { root: ROOT });
    } else {
        var numPasswords = users[uuid].passwords.length;
        if (numPasswords < 3) {
            var newPassword = generatePassword(numPasswords);
            users[uuid].passwords.push(newPassword);
            res.send(newPassword);
        } else {
            res.sendFile("test.html", { root: ROOT });
        }
    }
});

app.get('/test/next', (req, res) => {
    var uuid = req.params.uuid;
    if (!(uuid in users)) {
        res.sendFile("restart.html", { root: ROOT });
    } else if (users[uuid].passwords.length < 3) {
        res.sendFile("practice.html", { root: ROOT });
    } else {
        var passwordIndex = users[uuid].testOrder.find(testIndex => users[uuid].passwords[testIndex].tested === false);
        if (passwordIndex !== undefined) {
            var passwordTitle = users[uuid].passwords[passwordIndex].title;
            res.send({ "title" : passwordTitle });
        } else {
            res.sendFile("thanks.html", { root: ROOT })
        }
    }
});

app.get('/test/verify', (req, res) => {
    var uuid = req.params.uuid;
    if (!(uuid in users)) {
        res.sendFile("restart.html", { root: ROOT });
    } else {
        var attempt = req.params.attempt;
        //TODO: check if attempt matches password
        var matches = false;
        res.send({ "matches": matches});
    }
});

app.use(express.static(ROOT));

//start listening on the selected port
app.listen(app.get('port'), function () {
	console.log('Server listening on port', app.get('port'));
});

//generates a random order in which passwords will be served
function generateTestOrder() {
    var testIndices = [0, 1, 2];
    var randomizedTestIndices = [];
    var numLoops = testIndices.length;
    for (var i = 0; i < numLoops; i++) {
        var randomIndex = Math.floor(Math.random() * testIndices.length);
        var randomTestIndex = testIndices.splice(randomIndex, 1)[0];
        randomizedTestIndices.push(randomTestIndex);
    }
    return randomizedTestIndices;
}

function generatePassword(titleIndex) {
    var title = passwordTitles[titleIndex];
    //TODO: generate password
    return {
        "title": title,
        "password": undefined,
        "tested": false
    }
}
