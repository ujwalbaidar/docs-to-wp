import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthsService {

	constructor(private http: Http) { 

	}

	getAuthUrls(){
		let headers = new Headers({ 'Content-Type': 'application/json'});
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/users/oAuthUrl', options)
            .map(this.extractData)
            .catch(err=>{
            	return err;
            });
	}

	validateAuthCode(codeObj:Object){
		let headers = new Headers({ 'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/users/validateAuthCode', codeObj, options)
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
