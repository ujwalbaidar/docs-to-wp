import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class ExportsService {
	public localStorageData = JSON.parse(localStorage.getItem('currentUser'));
	constructor(private http: Http) { 

	}

	listExportFiles(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
    	let options = new RequestOptions({ headers: headers });    	
		return this.http.get('/api/exports/listExports', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	exportDocToWp(exportElement){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this.localStorageData.token });
		let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/exports/exportDocToWp', exportElement, options)
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