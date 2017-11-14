import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
	selector: 'app-root',
  	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	constructor(private router: Router, private _cookieService: CookieService, private location: Location) { }

	ngOnInit(){
		let publicPath = ['/home', '/pricing'];
		if(JSON.stringify(this._cookieService.getAll()) !== '{}' && (this._cookieService.get('token') !== undefined || this._cookieService.get('token') !== '')){
			if(publicPath.includes(this.location.path())){
				this.router.navigate(['/app/documents']);
			}else{
				this.router.navigate(['/app/documents']);
			}

		}else{
			if(this.location.path().startsWith('/app/google-auth/action/validate/loginType/google') && location.search){
					let queryUrl = {};
					location.search.substr(1).split("&")
						.forEach(item => {
							let [k,v] = item.split("="); 
							v = v && decodeURIComponent(v); 
							(queryUrl[k] = queryUrl[k] || []).push(v)
						});
					let navigateUrl = ['/app/google-auth/action/validate/loginType/google',queryUrl['code'][0], queryUrl['authuser'][0], queryUrl['prompt'][0], queryUrl['session_state'][0]]
					this.router.navigate(navigateUrl);
			}else{
				// this._cookieService.deleteAll();
				this.router.navigate(['/home']);
			}
		}
	}
}
