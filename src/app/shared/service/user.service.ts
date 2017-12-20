import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class UserService {
	public localStorageData = JSON.parse(localStorage.getItem('currentUser'));
	constructor(private http: Http) { 

	}

	listUser(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
    	let options = new RequestOptions({ headers: headers });    	
		return this.http.get('/admin-api/users/list', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	getUserInfo(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
    	let options = new RequestOptions({ headers: headers });    	
		return this.http.get('/api/users/getUserInfo', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	updateUserInfo(userObj){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
		let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/users/updateUserInfo', userObj, options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	loginAdminUser(userObj){
		let headers = new Headers({ 'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers: headers });
		return this.http.post('/app/users/adminLogin', userObj, options)
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