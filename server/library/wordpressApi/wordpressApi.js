'use strict';
const RequestLib = require('../request/https');
const request = require('request');

class WpApiLib {
	constructor(){
	}

	createWpPost(siteId, access_token, wpPostData){
console.log(siteId)
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'public-api.wordpress.com',
				path: `/rest/v1.2/sites/${siteId}/posts/new`,
				headers: {
					'authorization': `Bearer ${access_token}`,
				}
			};
            let requestLib = new RequestLib(options);
				requestLib.postRequest(wpPostData)
					.then(tokenObj=>{
						resolve(tokenObj);
					})
					.catch(tokenErr=>{
						reject(tokenErr);
					});
            
		});
	}
}

module.exports = WpApiLib;