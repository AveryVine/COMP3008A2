class Logger {
    constructor() {
        this.fs = require('fs');
        this.directory = "./logs";
        this.filename = "session_" + (new Date()).getTime() + ".csv";
        this.filepath = this.directory + "/" + this.filename;
        if (!this.fs.existsSync(this.directory)) {
            this.fs.mkdirSync(this.directory);
        }
        this.fs.open(this.filepath, 'w', (err, file) => {
            if (err) throw err;
        });
    }

    newSession(uuid) {
        this.log(uuid, "admin", "newSession");
    }

    passwordCreated(uuid) {
        this.log(uuid, "create", "passwordGenerated");
    }

    practiceStart(uuid) {
        this.log(uuid, "create", "startPractice");
    }

    practiceLogin(uuid, success) {
        this.log(uuid, "create", success ? "goodPractice" : "badPractice");
    }

    testStart(uuid) {
        this.log(uuid, "enter", "startLogin");
    }

    testLogin(uuid, success) {
        this.log(uuid, "enter", success ? "goodLogin" : "badLogin");
    }

    testComplete(uuid, success) {
        this.log(uuid, "enter", success ? "success" : "failure");
    }

    endSession(uuid, successes) {
        this.log(uuid, "admin", "endSession", successes);
    }

    log(uuid, category, action, details) {
        var timestamp = (new Date()).toISOString();
        var message = timestamp + "," + uuid + "," + category + "," + action;
		if (details != undefined) {
			message +=  "," + details + "\n";
		}
		else {
			message += "\n";
		}
        this.fs.appendFile(this.filepath, message, (err) => {
            if (err) throw err;
        });
        console.log("(" + timestamp + ") " + uuid + ": " + category + " " + action);
    }
}

module.exports = { Logger: Logger }
