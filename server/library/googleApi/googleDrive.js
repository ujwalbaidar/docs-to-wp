'use strict';
const RequestLib = require('../request/https');
const querystring = require('querystring');
const request = require('request');

class OAuthLib {
	constructor(){

	}

	listFiles(accessToken, qs){
		return new Promise((resolve, reject) => {
			var options = { 
				method: 'GET',
				url: 'https://www.googleapis.com/drive/v3/files',
				qs: qs,
				headers: { 
					'authorization': `Bearer ${accessToken}`,
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
		});
	}

	viewFile(accessToken, fileId, qs){
		return new Promise((resolve, reject)=>{
			var options = { 
				method: 'GET',
				url: `https://www.googleapis.com/drive/v3/files/${fileId}/export`,
				qs: qs,
				headers: { 
					'authorization': `Bearer ${accessToken}`
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

		});
	}
}

module.exports = OAuthLib;