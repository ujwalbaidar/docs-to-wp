const WordpressOauthLib = require('../../library/wordpressApi/wordpressOAuth');
const wordpress = require( "wordpress" );
const WpApiLib = require('../../library/wordpressApi/wordpressApi');
const CryptoLib = require('../../library/crypto/cryptoLib');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Billings = mongoose.model('Billings');
const WpUser = mongoose.model('WpUser');
const shortid = require('shortid');

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

const getWpUserInfo = (req, res)=>{
	if(req.headers && req.headers.userId){
		let wpUserId = req.query.wpUserId;
		WpUser.find({shortWpId: wpUserId}, {_id:0, wpPassword: 0}, (err, wpUserInfo)=>{
			if(err){
				res.status(400).json({success:false, data: err, message: 'Failed to retrieve wordpress user data.'})
			}else{
				res.status(200).json({success:true, data: wpUserInfo[0], message:'Wordpress users has been retrieved successfully.'});
			}
		});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const createWpUser = (req, res)=>{
	if(req.headers && req.headers.userId){		
		getUserBilling({userId: req.headers.userId}, {_id: 0, selectedProduct: 1, totalWpUrls: 1, totalExports: 1})
			.then(billingInfo=>{
				let userBilling = billingInfo[0];
				let userProduct = userBilling.selectedProduct;
				if(userBilling.totalWpUrls<userProduct.maxUrls){
					let wpApiLib = new WpApiLib();
					let cryptoObj = {
						cryptoAlgorithm: config['wp']['cryptoAlgorithm'],
						cryptoSecret: config['wp']['cryptoSecret']
					};
					let cryptoLib = new CryptoLib(cryptoObj);
					cryptoLib.encryptString(req.body.password)
						.then(encryptedPassword=>{
							checkWpUserPost(req.body)
								.then(wpOptionsObj=>{
									if(JSON.stringify(wpOptionsObj) === '{}'){
										res.status(400).json({success:false, data: {}, message: 'Failed to varify wordpress account. Domain or Username/Password missmatch!'});
									}else{
										let saveObj = {
											wpUrl: wpOptionsObj.url,
											wpUserName: req.body.userName,
											wpPassword: encryptedPassword,
											status: true,
											wpUserId: req.headers.userId,
											shortWpId: shortid.generate()
										};

										saveWpUser(saveObj)
											.then(wpUserInfo=>{
												let updateObj = {
													updateDate: new Date(),
													$inc: {totalWpUrls: 1}
												};
												updateUserBilling({userId: req.headers.userId}, updateObj)
													.then(billingUpdateResp=>{
															res.status(200).json({success: true, data: wpUserInfo, message: 'Wordpress User created successfully.'});
														})
													.catch(billingUpdateErr=>{
														res.status(400).json({success: false, data: billingUpdateErr, message: 'Failed to update billings'});
													});
											})
											.catch(wpUserInfoErr=>{
												res.status(400).json({success: false, data: wpUserInfoErr, message: 'Failed to save wordpress user.'});
											});
									}
								});
						});
				}else{
					res.status(200).json({success: false, data: {}, message: `You are not allowed to create more than ${userProduct.maxUrls} account.`});
				}
			})
			.catch(billingInfoErr=>{
				res.status(400).json({success: false, data: billingInfoErr, message: 'Failed to retrieve user billingInfo'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const checkWpUserPost = (reqBody) => {
	let loopIndexArr = [];
	let matchWpOptions = {};

	return new Promise(resolve=>{
		let userUrl = reqBody.url||reqBody.wpUrl;
		let splitUserUrl = userUrl.split('://');
		if(splitUserUrl.length>1){
			let userWpDomain = splitUserUrl[1];
			let splitUserWpDomain = userWpDomain.split('/');
			for(let i=(splitUserWpDomain.length - 1); i>=0; i--){
				let arrayData = JSON.parse(JSON.stringify(splitUserWpDomain));
				arrayData.length = i + 1;
				let joinUrl = arrayData.join('/');
				
				let wpOptions = {
					url: `${splitUserUrl[0]}://${joinUrl}`.trim(),
					username: reqBody.userName || reqBody.wpUserName,
					password: reqBody.password || reqBody.wpPassword
				};

				let wpApiLib = new WpApiLib();
				wpApiLib.getWpUserProfile(wpOptions)
					.then(wpPosts=>{
						loopIndexArr.push(i);
						if(wpPosts){
							matchWpOptions = wpOptions;
						}
	
						if(loopIndexArr.length === splitUserWpDomain.length){
							resolve(matchWpOptions);
						}
					})
					.catch(wpPostsErr=>{
						loopIndexArr.push(i);
						if(loopIndexArr.length === splitUserWpDomain.length){
							resolve(matchWpOptions);
						}
					});
			}
		}
	});
}

const updateWpUser = (req, res)=>{
	if(req.headers && req.headers.userId){
		checkWpUserPost(req.body)
			.then(wpOptionsObj=>{
				if(JSON.stringify(wpOptionsObj) === '{}'){
					res.status(400).json({success:false, data: {}, message: 'Failed to varify wordpress account. Domain or Username/Password missmatch!'});
				}else{
					let cryptoObj = {
						cryptoAlgorithm: config['wp']['cryptoAlgorithm'],
						cryptoSecret: config['wp']['cryptoSecret']
					};
					let cryptoLib = new CryptoLib(cryptoObj);
					cryptoLib.encryptString(req.body.wpPassword)
						.then(encryptedPassword=>{
							let updateQuery = {
								wpUserId: req.headers.userId,
								shortWpId: req.body.shortWpId
							};
							
							let updateObj = {
								wpUrl: wpOptionsObj.url,
								wpUserName: req.body.wpUserName,
								wpPassword: encryptedPassword,
								updateDate: new Date()
							};

							WpUser.update(updateQuery, updateObj, (err, updateResp)=>{
								if(err){
									res.status(400).json({success:false, data: err, message: 'Failed to update wordpress user data.'})
								}else{
									res.status(200).json({success:true, data: req.body, message:'Wordpress users has been updated successfully.'});
								}
							});
						});
				}
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const getUserBilling = (query, projection)=>{
	return new Promise((resolve, reject)=>{
		Billings.find(query, projection, (err, billingInfo)=>{
			if(err){
				reject(err);
			}else{
				resolve(billingInfo);
			}
		});
	});
}

const updateUserBilling = (query, updateObj)=>{
	return new Promise((resolve, reject)=>{
		Billings.update(query, updateObj, (err, updateResp)=>{
			if(err){
				reject(err);
			}else{
				resolve(updateResp);
			}
		});
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
	createWpUser,
	getWpUserInfo,
	updateWpUser
}