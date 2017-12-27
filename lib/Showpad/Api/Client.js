"use strict";

const Credentials = require('./Credentials');
const util = require('util');
var https = require('https');
var querystring = require('querystring');

class Client {

    constructor (credentials) {
        this.clientCredentials = credentials;
        this.endPoint = '%s.showpad.biz';

        this.serverSideAuth();
    }

    serverSideAuth () {
        console.log('server side auth');

        var requestOptions = {
            method: 'POST', 
            host: util.format('%s.showpad.biz', this.clientCredentials.subdomain),
            path: '/api/v3/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        var oAuth2TokenRequest = https.request(requestOptions, function(res) {
            res.setEncoding('utf-8');
            var responseString = '';

            res.on('data', function(data) {
                console.log("data");
                responseString += data;
            });
            res.on('end', function() {
                console.log('--');
                console.log(responseString);
                var responseObject = JSON.parse(responseString);
                //success(responseObject);
            });
        });
        oAuth2TokenRequest.on('error', function(err) {
            console.log("error");
            console.log(err);
        });
        oAuth2TokenRequest.write(
            querystring.stringify(
                {
                    password: this.clientCredentials.password,
                    username: this.clientCredentials.username,
                    client_id: this.clientCredentials.clientId,
                    client_secret: this.clientCredentials.clientSecret,
                    grant_type: 'password'
                }
            )
        );

        oAuth2TokenRequest.end();
    }
}

module.exports = Client;