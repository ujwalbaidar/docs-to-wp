import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class WpUserService {
	public localStorageData = JSON.parse(localStorage.getItem('currentUser'));
	constructor(private http: Http) { 

	}

	listWpUsers(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
    	let options = new RequestOptions({ headers: headers });    	
		return this.http.get('/api/wordpress/listWpUsers', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	getWpUserInfo(query:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<query.length;i++){
			let key = Object.keys(query[i])[0];
			let value = query[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token});
    	let options = new RequestOptions({ headers: headers, search: params }); 	
		return this.http.get('/api/wordpress/userInfo', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	createWpUser(codeObj:Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
		let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/wordpress/createWpUser', codeObj, options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	updateWpUser(wpUserObj: Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
		let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/wordpress/wpUser', wpUserObj, options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	private extractData(res: Response) {
    	let body = res.json();
    	return body || { };
    }
    
	private handleError (error: Response | any) {
		let body = error.json() || '';
		let err = body.data || JSON.stringify(body);
		let errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
		return Observable.throw({errMsg:errMsg, errBody: body, status: error.status});
	}
}
