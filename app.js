const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();

const ROOT = "public"

var emoji = ["🙂", "🙁", "❤️", "😉", "😭", "👍", "👎", "😂", "🐶", "🐱", "🔥", "🌈", "⚽️", "🏀", "🏆", "🎹"];
var passwordTitles = ["Email", "Banking", "Shopping"];
var users = {};

//receive a port, or select default port
app.set('port', (process.env.PORT || 5000));

app.use(cookieParser());

//log each server request
app.use(function (req, res, next) {
	console.log(req.method + " request for " + req.url);
	next();
});

app.get("/", function (req, res) {
	res.sendFile("index.html", { root: ROOT });
});

app.get('/practice', (req, res) => {
    var uuid = req.cookies.uuid;
    if (uuid === undefined) {
        res.sendFile("index.html", { root: ROOT })
    } else {
        if (!(uuid in users)) {
            users[uuid] = {
                "passwords": [],
                "testOrder": generateTestOrder()
            }
        }
        res.sendFile("practice.html", { root: ROOT })
    }
});

app.get('/practice/next', (req, res) => {
    var uuid = req.cookies.uuid;
    if (!(uuid in users)) {
        res.send({ "restart": true });
    } else {
        var numPasswords = users[uuid].passwords.length;
        var numPracticedPasswords = users[uuid].passwords.filter(password => password.practiced).length;
        if (numPasswords == numPracticedPasswords) {
            if (numPasswords == 3) {
                res.send({ "readyToTest": true });
            } else {
                var newPassword = generatePassword(numPasswords);
                users[uuid].passwords.push(newPassword);
                res.send(newPassword);
            }
        } else {
            res.send(users[uuid].passwords[numPracticedPasswords]);
        }
    }
});

app.get('/practice/verify', (req, res) => {
    var uuid = req.cookies.uuid;
    if (!(uuid in users)) {
        res.send({ "restart": true });
    } else {
        var passwordIndex = users[uuid].passwords.indexOf(users[uuid].passwords.find(password => !password.practiced));
        if (passwordIndex !== undefined) {
            var attempt = req.query.attempt;
            var matches = validateAttempt(attempt, users[uuid].passwords[passwordIndex].password);
            if (matches) {
                users[uuid].passwords[passwordIndex].practiced = true;
            }
            res.send({ "matches": matches });
        }
    }
});

app.get('/test', (req, res) => {
    var uuid = req.cookies.uuid;
    if (!(uuid in users)) {
        res.sendFile("index.html", { root: ROOT })
    } else {
        res.sendFile("test.html", { root: ROOT });
    }
});

app.get('/test/next', (req, res) => {
    var uuid = req.cookies.uuid;
    if (!(uuid in users)) {
        res.send({ "restart": true });
    } else if (users[uuid].passwords.length < 3) {
        res.sendFile("practice.html", { root: ROOT });
    } else {
        var passwordIndex = users[uuid].testOrder.find(testIndex =>
            users[uuid].passwords[testIndex].attempts < 3 &&
            !(users[uuid].passwords[testIndex].success)
        );
        if (passwordIndex !== undefined) {
            var passwordTitle = users[uuid].passwords[passwordIndex].title;
            res.send({ "title" : passwordTitle });
        } else {
            res.send({ "finished": true });
        }
    }
});

app.get('/test/verify', (req, res) => {
    var uuid = req.cookies.uuid;
    if (!(uuid in users)) {
        res.send({ "restart": true });
    } else {
        var passwordIndex = users[uuid].testOrder.find(testIndex =>
            users[uuid].passwords[testIndex].attempts < 3 &&
            !(users[uuid].passwords[testIndex].success)
        );
        if (passwordIndex !== undefined) {
            var attempt = req.query.attempt;
            var matches = validateAttempt(attempt, users[uuid].passwords[passwordIndex].password);
            users[uuid].passwords[passwordIndex].attempts += 1;
            if (matches) {
                users[uuid].passwords[passwordIndex].success = true;
            }
            res.send({
                "matches": matches,
                "attemptsRemaining": 3 - users[uuid].passwords[passwordIndex].attempts
            });
        }
    }
});

app.get('/thanks', (req, res) => {
    var uuid = req.cookies.uuid;
    if (!(uuid in users)) {
        res.sendFile("index.html", { root: ROOT });
    } else {
        res.sendFile("thanks.html", { root: ROOT });
    }
});

app.get('/users', (req, res) => {
    res.send(users);
});

app.use(express.static(ROOT));

//start listening on the selected port
app.listen(app.get('port'), function () {
	console.log('Server listening on port', app.get('port'));
});

//generates a random order in which passwords will be served
function generateTestOrder() {
    var numIndices = 3;
    var randomIndices = [];
    while (randomIndices.length < numIndices) {
        var randomIndex = Math.floor(Math.random() * numIndices);
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
        }
    }
    return randomIndices;
}

function generatePassword(titleIndex) {
    var title = passwordTitles[titleIndex];
    var passwordLength = 4;

    var chosenIndices = [];
    while (chosenIndices.length < passwordLength) {
        var randomIndex = Math.floor(Math.random() * emoji.length);
        if (!chosenIndices.includes(randomIndex)) {
            chosenIndices.push(randomIndex);
        }
    }
    chosenIndices.sort();

    var chosenEmoji = [];
    while (chosenEmoji.length < chosenIndices.length) {
        var randomIndex = Math.floor(Math.random() * 16);
        if (!chosenEmoji.includes(emoji[randomIndex])) {
            chosenEmoji.push(emoji[randomIndex]);
        }
    }

    return {
        "title": title,
        "password": {
            "indices": chosenIndices,
            "emoji": chosenEmoji
        },
        "attempts": 0,
        "success": false
    }
}

function validateAttempt(attempt, password) {
    var emojiNum = 0;
    for (index in password.indices) {
        if (attempt.charAt(index) !== password.emoji[emojiNum]) {
            // return false;
            console.log("Invalid password");
        }
        emojiNum++;
    }
    return true;
}
