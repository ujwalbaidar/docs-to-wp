const WordpressOauthLib = require('../../library/wordpressApi/wordpressOAuth');
const wordpress = require( "wordpress" );
const WpApiLib = require('../../library/wordpressApi/wordpressApi');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const WpUser = mongoose.model('WpUser');

const listWpUsers = (req, res)=>{
	if(req.headers && req.headers.userId){
		getWpUser({wpUserId: req.headers.userId})
			.then(wpUserList=>{
				res.status(200).json({success:true, data: wpUserList, message:'Wordpress users has been retrieved successfully.'});
			})
			.catch(wpUserListErr=>{
				res.status(400).json({success:false, data: wpUserListErr, message: 'Failed to retrieve wordpress user list.'})
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const getWpUser = (query)=>{
	return new Promise((resolve, reject)=>{
		WpUser.find(query, (err, wpUsers) => {
			if(err){
				reject(err);
			}else{
				resolve(wpUsers);
			}
		});
	});
}

const createWpUser = (req, res)=>{
	let wpApiLib = new WpApiLib();
	let wpOptions = {
		url: req.body.url,
		username: req.body.username,
		password: req.body.password
	};
	wpApiLib.getWpUserProfile(wpOptions)
		.then(wpPosts=>{
			let saveObj = {
				wpUrl: req.body.url,
				wpUserName: req.body.username,
				wpPassword: req.body.password,
				status: true,
				wpUserId: req.headers.userId
			};
			saveWpUser(saveObj)
				.then(wpUserInfo=>{
					res.status(200).json({success: true, data: wpUserInfo, message: 'Wordpress User created successfully.'});
				})
				.catch(wpUserInfoErr=>{
					res.status(400).json({success: false, data: wpUserInfoErr, message: 'Failed to create wordpress user'});
				})
		})
		.catch(wpPostsErr=>{
			res.status(wpPostsErr.code).json({success:false, data: wpPostsErr, message: 'Incorrect username or password'});
		});
}

const saveWpUser = (saveObj) => {
	return new Promise((resolve, reject)=>{
		let wpUser = new WpUser(saveObj);
		wpUser.save((err, wpUser)=>{
			if(err){
				reject(err);
			}else{
				resolve(wpUser);
			}
		});
	});
}

module.exports = {
	listWpUsers,
	createWpUser
}