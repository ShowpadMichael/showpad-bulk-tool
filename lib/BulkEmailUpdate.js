"use strict";

const { prompt } = require('inquirer');
const Credentials = require('./Showpad/Api/Credentials');
const ShowpadClient = require('./Showpad/Api/Client');

const BulkEmailUpdate = class {

    run (apiClientConfig) {
        this.apiClient = null;
        this.emailAddressStructure = [];

        var that = this;

        this.getOrganisationDetails(apiClientConfig)
            .then(organisationDetails => {
                const apiCredentials = new Credentials(
                    organisationDetails.subdomain,
                    organisationDetails.username,
                    organisationDetails.password,
                    organisationDetails.clientId, 
                    organisationDetails.clientSecret
                );

                // Get the new structure of the email addresses
                this.getNewEmailAddressStructure()
                    .then(answers => {
                        console.log(answers);

                        this.apiClient = new ShowpadClient(apiCredentials);

                        this.apiClient.user({fields: answers.join(',')})
                            .then(
                                data => {
                                    console.log(data.response.items);
                                }
                            )
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

    getNewEmailAddressStructure () {
        console.log("What is the new email structure?");

        var parts = {
            'first name': 'firstName',
            'last name': 'lastName',
            'separator': 'separator',
            '@': '@',
            'domain name': 'domain',
        };

        var questions = [
            {
                type: 'list',
                name: 'part',
                message: 'What part would you like to add?',
                choices: ['First name', 'Last name', 'A separator', '@', 'Domain name'], 
                filter: function(val) {
                    return parts[val.toLowerCase()];
                }
            },
            {
                type: 'confirm',
                name: 'askAgain',
                message: 'Want to add another part (just hit enter for YES)?',
                default: true
            }
        ];

        return prompt(questions)
            .then( answers => {
                this.emailAddressStructure.push(answers.part);

                if (answers.askAgain) {
                    return this.getNewEmailAddressStructure();
                } else {
                    return Promise.resolve(this.emailAddressStructure);
                }
            });
    }
};

module.exports = {
    getInstance: (apiClientConfig) => { 
        const instance = new BulkEmailUpdate();
        instance.run(apiClientConfig);
    },
};