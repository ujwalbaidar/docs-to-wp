const path = require('path');
const jwt = require('jsonwebtoken');

module.exports = function(app){
	app.use('/api/users', auth, require('../api/users'));
	app.use('/api/google-drive', auth, require('../api/google-drive'));
	app.use('/api/wordpress', auth, require('../api/wordpress'));
	app.use('/api/exports', auth, require('../api/exports'));
	app.use('/api/packages', auth, require('../api/packages'));
	app.use('/api/billings', auth, require('../api/billings'));

	app.use('/admin-api/packages', adminAuth, require('../api/packages'));

	app.use('/app/users', require('../api/users'));
	app.use('/app/wp-auth', require('../api/wordpress'));
	app.use('/app/packages', require('../api/packages'));

	app.route('*')
		.get((req, res) => {
			res.render('index');
		});

	function auth(req, res, next){
		jwt.verify(req.headers.token, config.activateAccount.secretKey, { algorithms: config.activateAccount.algorithm }, function(err, decoded) {
			if(err){
				res.status(401).send({success:false, message: 'Login is Required!'});
			}else{
				req.headers.userId = decoded.userId;
				req.headers.email = decoded.email;
				req.headers.accountType = decoded.accountType;
				next();
			}
		});
    }

    function adminAuth(req, res, next){
		jwt.verify(req.headers.token, config.activateAccount.secretKey, { algorithms: config.activateAccount.algorithm }, function(err, decoded) {
			if(err){
				res.status(401).send({success:false, message: 'Login is Required!'});
			}else{
				if(decoded.role ===30){
					req.headers.userId = decoded.userId;
					req.headers.email = decoded.email;
					req.headers.role = decoded.role;
					req.headers.accountType = decoded.accountType;
					next();
				}else{
					res.status(401).send({success:false, message: 'Request From Unauthorised user.'});
				}
			}
		});
    }
}
