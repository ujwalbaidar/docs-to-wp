const GoogleOauthAuthLib = require('../../library/googleApi/googleOAuth');
const GoogleDriveLib = require('../../library/googleApi/googleDrive');

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
				console.log(googleAuthUser)
				res.status(200).json({success: true, data: googleAuthUser.oAuthUserObj, message: "Verified User Successfully!"});
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

module.exports = {
	getOAuthUrl,
	validateAuthCode
}