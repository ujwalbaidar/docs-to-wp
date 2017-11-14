import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class ExportsService {

	constructor(private http: Http, private _cookieService: CookieService) { 

	}

	listExportFiles(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('token') });
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