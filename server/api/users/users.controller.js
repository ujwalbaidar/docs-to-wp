const GoogleOauthAuthLib = require('../../library/googleApi/googleOAuth');
const GoogleDriveLib = require('../../library/googleApi/googleDrive');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Billings = mongoose.model('Billings');
const Packages = mongoose.model('Package');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const crypto = require('crypto');

const createAdminUser = (req, res) =>{
	User.find({role:30}, (adminUserInfoErr, adminUserInfo)=>{
		if(adminUserInfoErr){
			res.status(400).json({success:false, data: err, message: "Failed to retrieve admin user info."});
		}else{
			if(adminUserInfo.length > 0){
				res.status(200).json({success: false, data: adminUserInfo, message: 'Admin User already exists'});
			}else{
				let newUserObj = {
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					role: 30,
					shortUserId: shortid.generate(),
					email: req.body.email,
					googleAuths: {},
					lastLoggedIn: new Date(),
					loginCount: 1,
					secondaryEmail: req.body.email
				};
				newUserObj.password = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey).update(req.body.password).digest('hex');
				saveUser(newUserObj)
					.then(userData=>{
						res.status(200).json({success: true, data: userData, message: 'Admin User created succcessfully.'});
					})
					.catch(userDataErr=>{
						res.status(400).json({success:false, data: userDataErr, message: "Failed to create admin user."});
					});
			}
		}
	});
}

const adminLogin = (req, res) => {
	User.findOne({email: req.body.email}, (err, userInfo)=>{
		if(err){
			res.status(400).json({success:false, data: err, message: 'Failed to retrieve user.'})
		}else{
			if(userInfo){
				let adminPassword = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey).update(req.body.password).digest('hex');
				if(userInfo.password === adminPassword && userInfo.role>20){
					let jwtSignData = {
							userId: userInfo._id,
							userName: userInfo.firstName,
							email: userInfo.email,
							role: userInfo.role
						};
						let jwtSignOptions = {
							expiresIn: config.activateAccount.expireTime, 
							algorithm: config.activateAccount.algorithm 
						};

						let token = jwt.sign(jwtSignData, config.activateAccount.secretKey, jwtSignOptions);

						res.status(200).json({
							success: true, 
							data: {
								name: userInfo.firstName,
								email: userInfo.email,
								token: token,
								role: userInfo.role
							}, 
							message: "User Verified Successfully."});
				}else{
					res.status(200).json({success:false, data: {field:'password', msg:'Password is incorrect.'}});
				}
			}else{
				res.status(200).json({success:false, data: {field:'email', msg:'Email does not exist.'}});
			}
			
		}
	})
}

const getOAuthUrl = (req, res) => {
	let authUrls = {};
	let oAuthTypes = ['google'];
	for(let i=0; i<oAuthTypes.length; i++){
		let loginType = oAuthTypes[i];
		let oAuthOptions = {
			loginMethod: loginType,
			clientId: config[loginType]['client_id'],
			clientSecret: config[loginType]['client_secret'],
			redirectUrl: config[loginType]['redirect_url'],
			oAuthAccess: config[loginType]['oAuthAccess']
		};

		getLibAuthUrl(loginType, oAuthOptions)
			.then(authUrl=>{
				authUrls[loginType] = authUrl;
				if(i==(oAuthTypes.length-1)){
					res.status(200).json({success:true, data:authUrls, message: 'Oauth Urls'});
				}
			});
	}
}

const getLibAuthUrl = (loginType, oAuthOptions)=>{
	return new Promise((resolve)=>{
		switch(loginType){
			case 'google':
				let googleOauthAuthLib = new GoogleOauthAuthLib(oAuthOptions);
				googleOauthAuthLib.getOAuthUrl()
					.then(googleAuthUrl=>{
						resolve(googleAuthUrl);
					});
				break;
		}
	});
}

const validateAuthCode = (req, res)=>{
	let loginType = req.body.loginType;
	let authCode = req.body.code;
	if(loginType === 'google'){
		getGoogleAuthUserInfo(loginType, authCode)
			.then(googleAuthUser=>{
				processUserDbAuths(googleAuthUser)
					.then(userData=>{
						processFreeUserDbBilling(userData)
							.then(billingInfo=>{
								let jwtSignData = {
									userId: userData._id,
									userName: userData.firstName,
									email: userData.email,
									role: userData.role,
									accountType: billingInfo.selectedProduct.shortPackageId
								};
								let jwtSignOptions = {
									expiresIn: config.activateAccount.expireTime, 
									algorithm: config.activateAccount.algorithm 
								};

								let token = jwt.sign(jwtSignData, config.activateAccount.secretKey, jwtSignOptions);
								res.status(200).json({
									success: true, 
									data: {
										name: userData.firstName,
										email: userData.email,
										token: token
									}, 
									message: "Save New User Successfully!"
								});
							})
							.catch(billingInfoErr=>{
								res.status(400).json({success: false, data: billingInfoErr, message: "Failed to save free user billing informations."});
							});
					})
					.catch(userDataErr=>{
						res.status(400).json({success: false, data: userDataErr, message: "Failed to add user informations."});
					});
			})
			.catch(googleAuthUserErr=>{
				res.status(400).json({success: false, data: googleAuthUserErr, message: "Failed to verify user"});
			});
	}
}

const getGoogleAuthUserInfo = (loginType, authCode)=>{
	return new Promise((resolve, reject) => {
		let oAuthOptions = {
			loginMethod: loginType,
			clientId: config[loginType]['client_id'],
			clientSecret: config[loginType]['client_secret'],
			redirectUrl: config[loginType]['redirect_url'],
			oAuthAccess: config[loginType]['oAuthAccess'],
			code: authCode
		};

		let googleOauthAuthLib = new GoogleOauthAuthLib(oAuthOptions);
			googleOauthAuthLib.getAuthUserInfo()
				.then(googleAuthUser=>{
					resolve(googleAuthUser);
				})
				.catch(googleAuthUserErr=>{
					reject(googleAuthUserErr)
				});
	});
	
}

const getUserInfo = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = mongoose.Types.ObjectId(req.headers.userId);
		User.find({_id: userId}, {_id: 0, email: 1, secondaryEmail: 1}, (err, user)=>{
			if(err){
				res.status(400).json({success:false, data: err, message: 'Failed to retrieve user informations.'});
			}else{
				res.status(200).json({success: true, data: user[0], message: 'User informations retrieved succcessfully.'});
			}
		})
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const updateUserInfo = (req,res)=>{
	if(req.headers && req.headers.userId){
		let userId = mongoose.Types.ObjectId(req.headers.userId);
		User.update({_id: userId}, {secondaryEmail:req.body.secondaryEmail}, (err, updateResp)=>{
			if(err){
				res.status(400).json({success:false, data: err, message: 'Failed to update user data.'});
			}else{
				res.status(200).json({success: true, data: req.body, message: 'User informations updated succcessfully.'});
			}
		});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const getUser = (queryObj) =>{
	return new Promise((resolve, reject) => {
		User.find(queryObj, (err, user)=>{
			if(err){
				reject(err);
			}else{
				resolve(user);
			}
		});
	});
}

const saveUser = (saveObj)=>{
	return new Promise((resolve, reject)=>{
		let user = new User(saveObj);
		user.save((err, user)=>{
			if(err){
				reject(err);
			}else{
				resolve(user);
			}
		});
	});
}

const updateUser = (updateQuery, updateData)=>{
	return new Promise((resolve, reject)=>{
		User.update(updateQuery, updateData, (err, updateObj)=>{
			if(err){
				reject(err);
			}else{
				resolve(updateData);
			}
		});
	});
}

const processUserDbAuths = (userObj)=>{
	return new Promise((resolve, reject) => {
		getUser({email: userObj.oAuthUserObj.email})
			.then(userInfo=>{
				if(userInfo.length>0){
					let updateQuery = { email: userInfo[0].email };
					let userUpdateObj = {
						'googleAuths.access_token': userObj.oAuthTokenObj.access_token,
						lastLoggedIn: new Date(),
						$inc: {loginCount: 1}
					};
					
					if(userObj.oAuthTokenObj.refresh_token){
						userUpdateObj['googleAuths.refresh_token'] = userObj.oAuthTokenObj.refresh_token;
					}

					updateUser(updateQuery, userUpdateObj)
						.then(userData=>{
							userInfo[0]['newUser']=false;
							resolve(userInfo[0]);
						})
						.catch(userDataErr=>{
							reject(userDataErr);
						});
				}else{
					let newUserObj = {
						firstName: userObj.oAuthUserObj.given_name,
						lastName: userObj.oAuthUserObj.family_name,
						role: 20,
						shortUserId: shortid.generate(),
						email: userObj.oAuthUserObj.email,
						googleAuths: userObj.oAuthTokenObj,
						lastLoggedIn: new Date(),
						loginCount: 1,
						secondaryEmail: userObj.oAuthUserObj.email
					};
					saveUser(newUserObj)
						.then(userData=>{
							userData['newUser']=true;
							resolve(userData);
						})
						.catch(userDataErr=>{
							reject(userDataErr);
						});
				}
			})
			.catch(userInfoErr=>{
				reject(userInfoErr);
			})
	});
}

const processFreeUserDbBilling = (userData)=>{
	return new Promise((resolve, reject)=>{
		if(userData.newUser && userData.newUser == true){
			findPackage({cost:{$eq:0}}, {})
				.then(packages=>{
						let saveObj = {
							salesIds: [],
							selectedProduct: {
								name: packages[0]['name'],
								cost: packages[0]['cost'],
								priorityLevel: packages[0]['priorityLevel'],
								maxUrls: packages[0]['maxUrls'],
								maxExports: packages[0]['maxExports'],
								shortPackageId: packages[0]['shortPackageId'],
							},
							userId: userData._id,
							totalWpUrls: 0,
							totalExports: 0,
							recurrenceBilling: false
						};
						saveBilling(saveObj)
							.then(saveBillingInfo=>{
								resolve(saveBillingInfo);
							})
							.catch(saveBillingErr=>{
								reject(saveBillingErr);
							});
				})
				.catch(packageErr=>{
					reject(packageErr);
				});
		}else{
			findBilling({userId: userData._id}, {})
				.then(billingInfo=>{
					resolve(billingInfo[0]);
				})
				.catch(billingErr=>{
					reject(billingErr);
				});
		}
	});
}

const findPackage = (query, projection)=>{
	return new Promise((resolve, reject)=>{
		Packages.find(query, projection, (err, packages)=>{
			if(err){
				reject(err);
			}else{
				resolve(packages)
			}
		});
	});
}

const findBilling = (query, projection)=>{
	return new Promise((resolve, reject)=>{
		Billings.find(query, projection, (err, billings)=>{
			if(err){
				reject(err);
			}else{
				resolve(billings)
			}
		});
	});
}

const saveBilling = (saveObj)=>{
	return new Promise((resolve, reject)=>{
		let billings = new Billings(saveObj);
		billings.save((err, billingInfo)=>{
			if(err){
				reject(err);
			}else{
				resolve(billingInfo)
			}
		});
	});
}

module.exports = {
	createAdminUser,
	adminLogin,
	getOAuthUrl,
	validateAuthCode,
	getUserInfo,
	updateUserInfo
}