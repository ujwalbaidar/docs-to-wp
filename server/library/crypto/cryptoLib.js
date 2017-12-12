'use strict';
const crypto = require('crypto');

class CryptoLib {
	constructor(cryptoObj){
		this.cryptoAlgorithm = cryptoObj.cryptoAlgorithm;
		this.cryptoSecret = cryptoObj.cryptoSecret;
	}

	encryptString(text){
		return new Promise(resolve => {
			let cipher = crypto.createCipher(this.cryptoAlgorithm, this.cryptoSecret);
			let encrypted = '';
			cipher.on('readable', () => {
				const data = cipher.read();
				if (data){
					encrypted += data.toString('hex');
				}
			});
			cipher.on('end', () => {
				resolve(encrypted);
			});

			cipher.write(text);
			cipher.end();
		});
	}

	decryptString(text){
		return new Promise((resolve, reject)=>{
			let decipher = crypto.createDecipher(this.cryptoAlgorithm, this.cryptoSecret);
			let decrypted = '';
			decipher.on('readable', () => {
				const data = decipher.read();
				if (data)
					decrypted += data.toString('utf8');
			});
			decipher.on('end', () => {
				resolve(decrypted);
			});

			decipher.write(text, 'hex');
			decipher.end();
		});
	}
}

module.exports = CryptoLib;