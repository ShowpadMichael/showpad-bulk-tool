"use strict";

class Credentials {
    constructor (subdomain, username, password, clientId, clientSecret) {
        this.subdomain = subdomain;
        this.username = username;
        this.password = password;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
}

module.exports = Credentials;