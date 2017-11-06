'use strict';
const RequestLib = require('../request/https');
const querystring = require('querystring');
const request = require('request');

class OAuthLib {
	constructor(oAuthOpt){
		this.clientId = oAuthOpt.clientId;
		this.clientSecret = oAuthOpt.clientSecret;
		this.redirectUri = oAuthOpt.redirectUrl;
		this.oAuthAccess = oAuthOpt.oAuthAccess;
		this.authCode = oAuthOpt.code || '';
	}

	getOAuthUrl(){
		return new Promise((resolve, reject) => {
			let googleOAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
			if(this.oAuthAccess.scope == undefined){
				this.oAuthAccess.scope = ["email"];
			}else{
				if(typeof this.oAuthAccess.scope === 'object'){
					this.oAuthAccess.scope = this.oAuthAccess.scope.join(" ")
				}
			}
			
			if(this.oAuthAccess.response_type == undefined){
				this.oAuthAccess.response_type = 'code';
			}
			let oAuthParams = 'client_id='+this.clientId+'&redirect_uri='+this.redirectUri;

			let oAuthUrl = googleOAuthUrl+'?'+oAuthParams+'&'+querystring.stringify(this.oAuthAccess);
			resolve(oAuthUrl);
		});
	}

	getAuthUserInfo(){
		return new Promise((resolve, reject)=>{
			this.getOAuthTokens()
				.then(oAuthTokens=>{
					this.getUserInfo(oAuthTokens.access_token)
						.then(userInfo=>{
							resolve({
								oAuthTokenObj: oAuthTokens, 
								oAuthUserObj: userInfo
							});
						})
						.catch(userInfoErr=>{
							reject(userInfoErr)
						});
				})
				.catch(oAuthTokensErr=>{
					reject(oAuthTokensErr)
				});
		});
	}

	getOAuthTokens(){
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'www.googleapis.com',
				path: '/oauth2/v4/token',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				}
			};

			let data = {
				code: this.authCode,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				grant_type: 'authorization_code',
				redirect_uri: this.redirectUri
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

	getUserInfo(accessToken){
		return new Promise((resolve, reject) => {
			let options = {
				hostname: 'www.googleapis.com',
				path: '/userinfo/v2/me',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': `OAuth ${accessToken}`
				}
			};
			let requestLib = new RequestLib(options);
			requestLib.getRequest()
				.then(userInfo=>{
					resolve(userInfo);
				})
				.catch(userInfoErr=>{
					reject(userInfoErr);
				});
		});
	}
}

module.exports = OAuthLib;