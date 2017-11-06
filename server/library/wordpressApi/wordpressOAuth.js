'use strict';
const RequestLib = require('../request/https');
const querystring = require('querystring');
const request = require('request');

class WPOAuthLib {
	constructor(oAuthOpt){
		this.clientId = oAuthOpt.clientId;
		this.clientSecret = oAuthOpt.clientSecret;
		this.redirectUri = oAuthOpt.redirectUrl;
		this.response_type = 'code';
		// this.scope = oAuthOpt.scope || 'global';
		this.blog = oAuthOpt.blog;
		this.authCode = oAuthOpt.authCode
	}

	getOAuthUrl(){
		return new Promise((resolve, reject) => {
			let wpOAuthUrl = "https://public-api.wordpress.com/oauth2/authorize";
			let wpOAuthParams = `client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=${this.response_type}&blog=${this.blog}`;
			let oAuthUrl = `${wpOAuthUrl}?${wpOAuthParams}`;
			resolve(oAuthUrl);
		});
	}

	getOauthTokens(){
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'public-api.wordpress.com',
				path: '/oauth2/token',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				}
			};

			let data = {
				code: this.authCode,
				redirect_uri: this.redirectUri,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				grant_type: 'authorization_code'
			};

            let requestLib = new RequestLib(options);
				requestLib.postRequest(data)
					.then(tokenObj=>{
						resolve(tokenObj);
					})
					.catch(tokenErr=>{
						reject(tokenErr);
					});
            
		});
	}
}

module.exports = WPOAuthLib;