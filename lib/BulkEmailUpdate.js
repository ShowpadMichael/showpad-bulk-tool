"use strict";

const { prompt } = require('inquirer');
const Credentials = require('./Showpad/Api/Credentials');

const BulkEmailUpdate = class {

    run (apiClientConfig) {
        this.getOrganisationDetails(apiClientConfig)
            .then(organisationDetails => {
                const apiCredentials = new Credentials(
                    organisationDetails.subdomain,
                    organisationDetails.username,
                    organisationDetails.password,
                    organisationDetails.clientId, 
                    organisationDetails.clientSecret
                );
            });
    }

    getOrganisationDetails (apiClientConfig) {
        var questions = [
            {
                type: 'input',
                name: 'subdomain',
                message: 'Subdomain: ',
            }, 
            {
                type: 'input',
                name: 'username',
                message: 'Username: ',
                default: 'supportagent@showpad.com',
            }, 
            {
                type: 'password',
                name: 'password', 
                message: 'Password: ',
            },
            {
                type: 'input',
                name: 'clientId',
                message: 'API ClientID: ',
                default: apiClientConfig.apiClientId,
            }, 
            {
                type: 'input',
                name: 'clientSecret',
                message: 'API ClientSecret: ', 
                default: apiClientConfig.apiClientSecret,
            }
        ];
        
        return prompt(questions);
    }
};

module.exports = {
    getInstance: (apiClientConfig) => { 
        const instance = new BulkEmailUpdate();
        instance.run(apiClientConfig);
    },
};