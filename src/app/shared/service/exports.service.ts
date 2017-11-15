import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

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
			.catch(err=>{
            	return err;
            });
	}

	private extractData(res: Response) {
    	let body = res.json();
    	return body || { };
    }
}