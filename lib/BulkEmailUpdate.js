"use strict";

const { prompt } = require('inquirer');
const Credentials = require('./Showpad/Api/Credentials');
const ShowpadClient = require('./Showpad/Api/Client');

const BulkEmailUpdate = class {

    run (apiClientConfig) {
        this.apiClient = null;

        this.getOrganisationDetails(apiClientConfig)
            .then(organisationDetails => {
                const apiCredentials = new Credentials(
                    organisationDetails.subdomain,
                    organisationDetails.username,
                    organisationDetails.password,
                    organisationDetails.clientId, 
                    organisationDetails.clientSecret
                );

                this.apiClient = new ShowpadClient(apiCredentials);
                this.apiClient.auth()
                    .then(
                        console.log("we are all done.")
                    )
                    .catch(err => {
                        console.log("An error occured while authenticating:");
                        console.log(err);
                    });
            });
    }

    getOrganisationDetails (apiClientConfig) {
        var questions = [
            {
                type: 'input',
                name: 'subdomain',
                message: 'Subdomain: ',
                default: apiClientConfig.subdomain,
            }, 
            {
                type: 'input',
                name: 'username',
                message: 'Username: ',
                default: apiClientConfig.username,
            }, 
            {
                type: 'password',
                name: 'password', 
                message: 'Password: ',
                default: apiClientConfig.password,
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