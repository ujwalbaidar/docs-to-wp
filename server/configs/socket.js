module.exports = (io)=>{
	io.on('connection', (socket) => {
		console.log(`${socket.id} is connected.`);
		global.ioObj = io;
		global.socketObj = socket;
		socket.on('disconnect', () => {
			console.log(`${socket.id} is disconnected.`);
		});
	});
}