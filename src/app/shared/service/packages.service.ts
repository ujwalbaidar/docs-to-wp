import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class PackagesService {
	public localStorageData = JSON.parse(localStorage.getItem('currentUser'));
	constructor(private http: Http) { }

	getCheckoutUrl(packageQuery){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<packageQuery.length;i++){
			let key = Object.keys(packageQuery[i])[0];
			let value = packageQuery[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token});
    	let options = new RequestOptions({ headers: headers, search: params }); 
		return this.http.get('/api/packages/getCheckoutUrl', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	saveAdminPackage(packageObj){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token});
		let options = new RequestOptions({ headers: headers });
		return this.http.post('/admin-api/packages/adminPackage', packageObj, options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	updateAdminPackage(packageObj){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token});
		let options = new RequestOptions({ headers: headers });
		return this.http.put('/admin-api/packages/adminPackage', packageObj, options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	getPackages(){
		let headers = new Headers({ 'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers: headers });
		return this.http.get('/app/packages/list', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	getBillingPackages(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token});
		let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/packages/billingPackages', options)
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
