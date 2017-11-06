const path = require('path');

module.exports = function(app){
	app.use('/api/users', require('../api/users'));
	app.use('/api/google-drive', require('../api/google-drive'));
	app.use('/api/wordpress', require('../api/wordpress'));
	app.use('/app/wp-auth', require('../api/wordpress'));
	app.route('*')
		.get((req, res) => {
			res.render('index');
		});
}
