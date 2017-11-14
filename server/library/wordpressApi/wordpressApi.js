'use strict';
const RequestLib = require('../request/https');
const request = require('request');
var wordpress = require( "wordpress" );
var xmlrpc = require('xmlrpc');
var fieldMap = require( "./fields" );

class WpApiLib {
	constructor(){
	}

	getWpPost(url, username, password){
		return new Promise((resolve, reject)=>{
			var client = wordpress.createClient({
			    url: url,
			    username: username,
			    password: password
			});

			client.getPosts(1, (err,posts)=>{
				if(err){
					reject(err)
				}else{
					resolve(posts)
				}
			});
		});
	}

	exportDocToWp(wpOptions, wpContent, exportMethod){
		return new Promise((resolve, reject)=>{
			if(exportMethod === 'post'){
				this.createPosts(wpOptions, wpContent)
					.then(exportInfo=>{
						resolve(exportInfo);
					})
					.catch(exportInfoErr=>{
						reject(exportInfoErr);
					});
			}else{
				this.createPages(wpOptions, wpContent)
					.then(exportInfo=>{
						resolve(exportInfo);
					})
					.catch(exportInfoErr=>{
						reject(exportInfoErr);
					});
			}
		});
	}

	createPosts(wpOptions, wpContent){
		return new Promise((resolve, reject)=>{
			let client = wordpress.createClient(wpOptions);
			client.newPost(wpContent, (err,exportInfo)=>{
				if(err){
					reject(err);
				}else{
					resolve(exportInfo);
				}
			});
		});
	}

	createPages(wpOptions, wpContent){
		return new Promise((resolve, reject) => {
			let client = wordpress.createClient(wpOptions);
			let fieldMapContent = fieldMap.to( wpContent, "page" );
			client.rpc.methodCall('wp.newPage', [ 0, wpOptions.username, wpOptions.password, fieldMapContent ], (err, data)=>{
				if(err){
					reject(err);
				}else{
					resolve(data);
				}
			});
		});
	}
}

module.exports = WpApiLib;
