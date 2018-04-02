const express = require('express');
let app = express();

let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.config = require('./server/configs/configs')[env];
require('./server/configs/express')(app);
require('./server/configs/mongoose')(config);
require('./server/models');
require('./server/routes')(app);
app.use(function(err,req, res, next) {
    if(err)console.log(err);
    next();
});
let server = app.listen(config.port, config.host, ()=>{
	console.log(`Server Running at: http://${config.host}:${config.port}/ on ${env} enviornment`);
});
server.timeout = 960000;
const io = require('socket.io')(server);
require('./server/configs/socket')(io);