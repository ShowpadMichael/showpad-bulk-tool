"use strict";

const { prompt } = require('inquirer');
const fs = require('fs');

const bulkUpdateEmailAddresses = 'Bulk update email addresses';
var config = null;

const apps = [
    {
        type: 'list',
        name: 'app',
        message: 'What can I do for you?',
        choices: [
            bulkUpdateEmailAddresses,
        ]
    }
];

// First, let's start to fetch, and create if necessary, the config file
if (!fs.existsSync('config.json')) {
    fs.writeFileSync(
        'config.json', 
        JSON.stringify({
            apiClientId: '', 
            apiClientSecret: ''
        })
    );
}
config = JSON.parse(fs.readFileSync('config.json'));


prompt(apps).then(answer => {
        switch(answer.app) {
            case bulkUpdateEmailAddresses:
                require('./lib/BulkEmailUpdate').getInstance(config);
                break;
            default:
                console.log("Whoops, something happened.");
        }
    }
);