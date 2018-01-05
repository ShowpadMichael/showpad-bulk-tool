"use strict";

const Credentials = require('./Credentials');
const util = require('util');
var https = require('https');
var querystring = require('querystring');

class Client {

    constructor (credentials) {
        this.clientCredentials = credentials;
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

    user (dataObject) {
        var requestOptions = {
            method: 'GET',
            path: '/api/v3/users?' + querystring.stringify(dataObject)
        };

        return this._performApiCall(requestOptions);
    }

    _serverSideAuth () {
        var requestOptions = {
            method: 'POST', 
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

        return this._performApiCall(requestOptions, bodyData, true);
    }

    _performApiCall (requestOptions, bodyData, skipAuthCheck) {
        if (util.isNullOrUndefined(skipAuthCheck) || skipAuthCheck === false) {
            if (util.isNullOrUndefined(this.authObject)) {
                // Auth first
                return this.auth()
                    .then( () => {
                        return this._performApiCall(requestOptions, bodyData);
                    })
                    .catch(err => console.log(err));
            } else {
                // Add auth details to the request
                if (util.isNullOrUndefined(requestOptions.headers)) {
                    requestOptions.headers = {};
                }

                requestOptions.headers.authorization = 'Bearer ' + this.authObject.access_token;
            }
        }

        requestOptions.host = util.format('%s.showpad.biz', this.clientCredentials.subdomain);

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