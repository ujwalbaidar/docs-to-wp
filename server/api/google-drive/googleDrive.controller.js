const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cheerio = require('cheerio');

const GoogleDriveLib = require('../../library/googleApi/googleDrive');
let accessToken = `ya29.Glz1BL_gDVHhw34KXqy2Mqcs9bXBMpKuuYyI06hQnfToilXKdGeYRityLFKGuxjfEMWPMpvqPbbBLZlxyuOqIxQbKMV03-ptMyXkzYtgIAv_gW7itldGnWzAv6qamg`;
const WpApiLib = require('../../library/wordpressApi/wordpressApi');

const listDriveFiles = (req, res)=>{
	let qs = {};
	qs = { 
		q: `mimeType = 'application/vnd.google-apps.document'`,
		orderBy: 'name'
	};

	googleDriveLib = new GoogleDriveLib();
	googleDriveLib.listFiles(accessToken, qs)
		.then(driveFiles=>{
			res.status(200).json({success: true, data: driveFiles, message: 'successfully retrieved drive files!'});
		})
		.catch(driveFilesErr=>{
			res.status(400).json({success: false, data: driveFilesErr, message: driveFilesErr.error.message || 'failed to retriev drive files!'});
		});
}

const viewDriveFile = (req, res)=>{
	let qs = { mimeType: 'text/html', alt: 'media' };
	let fileId = `1J3JhUEoQAt8Yquxf0FwUPbKT-sanCi1AyDj7-WZgPpo`;
	googleDriveLib = new GoogleDriveLib();
	googleDriveLib.viewFile(accessToken, fileId, qs)
		.then(driveFile=>{
			var $ = cheerio.load(driveFile, {ignoreWhitespace: true, useHtmlParser2: true});
			$('*').removeAttr('style');
			$('*').removeAttr('id');
			$('*').removeAttr('class');
			let htmlElement = $.html();
			var bodyContents = htmlElement.split('<body>');
			bodyContents = bodyContents[1].replace('</body>','').replace('</html>','');
			console.log(typeof bodyContents)
			createWpPost(bodyContents)
				.then(createPostResp => {
					res.status(200).json(createPostResp);
				})
				.catch(createPostErr=>{
					res.status(400).send(createPostErr);
				});
		})
		.catch(driveFileErr=>{
			res.status(400).json({success: false, data: driveFileErr, message: driveFileErr || 'failed to retriev file contents!'});
		});
}

const createWpPost = (wpContent)=>{
	return new Promise((resolve, reject)=>{
		let wpApiLib = new WpApiLib();
		let siteId = '64822055';
		let access_token = 'i6ppvHiotxXE9LKdQ)hIlGfgOZ8wVAZK(HyAgGoVHL4IKO1T3w^p)RxoraIu@ohp';
		
		let wpPostData = {
			title: 'Hello World',
			content: wpContent
		};

		wpApiLib.createWpPost(siteId, access_token, wpPostData)
			.then(wpPostResponse=>{
				resolve(postResponse);
			})
			.catch(wpPostErr=>{
				reject(wpPostErr);
			});
	});
}
module.exports = {
	listDriveFiles,
	viewDriveFile
}
