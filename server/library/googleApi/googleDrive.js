'use strict';
const RequestLib = require('../request/https');
const querystring = require('querystring');
const request = require('request');

class GoogleDriveLib {
	constructor(oAuthOpt){
		this.clientId = oAuthOpt.clientId;
		this.clientSecret = oAuthOpt.clientSecret;
	}

	listFiles(accessToken, refreshToken, qs){
		return new Promise((resolve, reject) => {
			this.refreshAccessToken(accessToken, refreshToken)
				.then((newAccessToken)=>{
					var options = { 
						method: 'GET',
						url: 'https://www.googleapis.com/drive/v2/files',
						qs: qs,
						headers: { 
							'authorization': `Bearer ${newAccessToken}`,
							'content-type': 'application/json' 
						},
						json: true
					};
					request(options, function (error, response, body) {
						if (error){
							reject(error);
						}else{
							if(response.statusCode === 200){
								resolve(body);
							}else{
								reject(body);
							}
						}

					});
				})
				.catch(newAccessTokenErr=>{
					reject(newAccessTokenErr)
				});
		});
	}

	getDriveFile(accessToken, refreshToken, fileId, qs){
		return new Promise((resolve, reject)=>{
			this.refreshAccessToken(accessToken, refreshToken)
				.then((newAccessToken)=>{
					var options = { 
						method: 'GET',
						url: `https://www.googleapis.com/drive/v3/files/${fileId}/export`,
						qs: qs,
						headers: { 
							'authorization': `Bearer ${newAccessToken}`
						}
					};
					request(options, function (error, response, body) {
						if (error){
							reject(error);
						}else{
							if(response.statusCode === 200){
								resolve(body);
							}else{
								reject(body);
							}
						}
					});
				})
				.catch(newAccessTokenErr=>{
					reject(newAccessTokenErr)
				});

		});
	}

	refreshAccessToken(accessToken, refreshToken){
		let clientId = this.clientId;
		let clientSecret = this.clientSecret;

		return new Promise((resolve, reject)=>{
			request({ 
				method: 'GET',
				url: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
				qs: {access_token: accessToken},
				headers: { 
					'content-type': 'application/json' 
				},
				json: true
			}, (error, response, body)=>{
				if(error){
					reject(error)
				}else{
					if(response.statusCode === 200){
						resolve(accessToken);
					}else{
						let options = {
							hostname: 'www.googleapis.com',
							path: '/oauth2/v4/token',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
							}
						};
						let data = {
							client_id: clientId,
							client_secret: clientSecret,
							grant_type: 'refresh_token',
							refresh_token: refreshToken
						};
			            let requestLib = new RequestLib(options);
							requestLib.postRequest(data)
								.then(tokenObj=>{
									resolve(tokenObj.access_token)
								})
								.catch(tokenErr=>{
									reject(tokenErr)
								});
					}
				}
			})
		});
	}
}

module.exports = GoogleDriveLib;