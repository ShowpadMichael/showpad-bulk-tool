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
                            
                            resolve(true);
                       }
                    )
                    .catch(err => reject(err));
            }
        );
    }

    user () {
        var requestOptions = {
            method: 'GET',
            host: util.format('%s.showpad.biz', this.clientCredentials.subdomain),
            path: '/api/v3/users',
            headers: {
                Authorization: 'Bearer ' + this.authObject.access_token
            }
        };

        return this._performApiCall(requestOptions);
    }

    _serverSideAuth () {
        var requestOptions = {
            method: 'POST', 
            host: util.format('%s.showpad.biz', this.clientCredentials.subdomain),
            path: '/api/v3/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        var bodyData = querystring.stringify(
            {
                password: this.clientCredentials.password,
                username: this.clientCredentials.username,
                client_id: this.clientCredentials.clientId,
                client_secret: this.clientCredentials.clientSecret,
                grant_type: 'password'
            }
        );

        return this._performApiCall(requestOptions, bodyData);
    }

    _performApiCall (requestOptions, bodyData) {
        return new Promise((resolve, reject) => {
            var httpsRequest = https.request(requestOptions, function (res) {
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

            httpsRequest.on('error', (err) => {
                reject(err);
            });

            if (!util.isNullOrUndefined(bodyData)) {
                httpsRequest.write(bodyData);
            }

            httpsRequest.end();
        });
    }
}

module.exports = Client;