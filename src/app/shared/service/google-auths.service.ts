import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class GoogleAuthsService {

	constructor(private http: Http, private _cookieService: CookieService) { }

	getDriveFileList(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('token') });
    	let options = new RequestOptions({ headers: headers }); 	
		return this.http.get('/api/google-drive/listFiles', options)
			.map(this.extractData)
			.catch(err=>{
            	return err;
            });
	}

	seachDocLists(query:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<query.length;i++){
			let key = Object.keys(query[i])[0];
			let value = query[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('token') });
    	let options = new RequestOptions({ headers: headers, search: params }); 	
		return this.http.get('/api/google-drive/listFiles', options)
			.map(this.extractData)
			.catch(err=>{
            	return err;
            });
	}

	exportGoogleDoc(docObj: any){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('token')});
		let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/google-drive/exportDriveFile', docObj, options)
			.map(this.extractData)
			.catch(err=>{
            	return err;
            });
	}

	private extractData(res: Response) {
    	let body = res.json();
    	return body || { };
    }
}
