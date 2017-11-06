const WordpressOauthLib = require('../../library/wordpressApi/wordpressOAuth');
var wordpress = require( "wordpress" );

const getOAuthUrl = (req, res)=>{
	let oAuthOptions = {
		clientId: config['wp']['client_id'],
		clientSecret: config['wp']['client_secret'],
		redirectUrl: config['wp']['redirect_url'],
		blog: 'renewableenergypicks.com'
	};

	let wordpressOauthLib = new WordpressOauthLib(oAuthOptions);
	wordpressOauthLib.getOAuthUrl()
		.then(oAuthUrl=>{
			res.status(200).json({success: true, data: oAuthUrl, message: 'wordpress oauthu rl retrieved successfully!'});
		})
		.catch(oAuthUrlErr=>{
			console.log(oAuthUrlErr);
			res.status(400).json({success: false, data: oAuthUrlErr, message: 'failed to retrieve wordpress oauthurl'});
		});
}

const validateWpCode = (req, res)=>{
	let params = req.params;
	let query = req.query;
	getOauthTokens(req.query.code)
		.then(authTokens=>{
			res.status(200).json({success: true, data: authTokens, message: 'successfully retrieved wordpress auth tokens'});
		})
		.catch(authTokenErr=>{
			res.status(400).json({success: false, data: authTokenErr, message: 'failed to retrieve wordpress auth tokens'});
		});
}

const getOauthTokens = (authCode)=>{
	return new Promise((resolve, reject)=>{
		let oAuthOptions = {
				clientId: config['wp']['client_id'],
				clientSecret: config['wp']['client_secret'],
				redirectUrl: config['wp']['redirect_url'],
				authCode: authCode
			};

			let wordpressOauthLib = new WordpressOauthLib(oAuthOptions);
				wordpressOauthLib.getOauthTokens()
					.then(authTokens=>{
						resolve(authTokens);
					})
					.catch(authTokenErr=>{
						reject(authTokenErr)
					});
	});
}

const getPosts = (req, res)=>{
	var client = wordpress.createClient({
	    url: "https://renewableenergypicks.com",
	    username: "testuser",
	    password: "hJosf0Ja^QwXztY2NeSnzr#l"
	});
	var data = {
		title: 'test for work',
		content: '<h5>test for work</h5>'
	}
	client.newPost(data, function( error, posts ) {
		if(error){
			console.log("-------------------------------")
			console.log(error);
			console.log("-------------------------------")
			res.status(400).json(error);
		}else{
			console.log(posts)
			res.status(200).json(posts);
		}
	});
}

module.exports = {
	getOAuthUrl,
	validateWpCode,
	getPosts
}