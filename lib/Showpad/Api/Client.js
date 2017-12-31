"use strict";

const Credentials = require('./Credentials');
const util = require('util');
var https = require('https');
var querystring = require('querystring');

class Client {

    constructor (credentials) {
        this.clientCredentials = credentials;
        this.endPoint = '%s.showpad.biz';
    }

    auth () {
        var that = this;
        return new Promise(
            (resolve, reject) => {
                this._serverSideAuth()
                    .then(
                        (authObject) => {
                            that.authObject = authObject;
                            console.log("now resolve");
                            resolve(true);
                       }
                    )
                    .catch(err => reject(err));
            }
        );
    }

    user () {
        var that = this;
        
        return new Promise((resolve, reject) => {
            var requestOptions = {
                method: 'GET',
                host: util.format('%s.showpad.biz', this.clientCredentials.subdomain),
                path: '/api/v3/users',
                headers: {
                    Authorization: 'Bearer ' + that.authObject.access_token
                }
            };

            var userRequest = https.request(requestOptions, function(res) {
                res.setEncoding('utf-8');
                var responseString = '';

                res.on('data', function(data) {
                    responseString += data;
                });
                res.on('end', function() {
                    var data = JSON.parse(responseString);

                    resolve(data);
                });
            });
            userRequest.on('error', err => reject(err));
            userRequest.end();
        });
    }

    _serverSideAuth () {
        return new Promise((resolve, reject) => {
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
                    responseString += data;
                });
                res.on('end', function() {
                    var responseObject = JSON.parse(responseString);

                    resolve(responseObject);
                });
            });
            oAuth2TokenRequest.on('error', function(err) {
                reject(err);
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
        });
    }
}

module.exports = Client;