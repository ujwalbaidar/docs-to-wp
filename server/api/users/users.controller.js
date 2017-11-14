const GoogleOauthAuthLib = require('../../library/googleApi/googleOAuth');
const GoogleDriveLib = require('../../library/googleApi/googleDrive');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

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
						let jwtSignData = {
							userId: userData._id,
							userName: userData.firstName,
							email: userData.email
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
							message: "Save New User Successfully!"});
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
						email: userObj.oAuthUserObj.email,
						googleAuths: userObj.oAuthTokenObj,
						lastLoggedIn: new Date(),
						loginCount: 1
					};
					saveUser(newUserObj)
						.then(userData=>{
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

module.exports = {
	getOAuthUrl,
	validateAuthCode
}