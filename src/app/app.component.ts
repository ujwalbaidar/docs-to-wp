import { Component, OnInit } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
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
		/*let publicPath = ['/home', '/pricing'];
		if(JSON.stringify(this._cookieService.getAll()) !== '{}' && (this._cookieService.get('token') !== undefined || this._cookieService.get('token') !== '')){
			if(publicPath.includes(this.location.path())){
				this.router.navigate(['/documents']);
			}else{
				this.router.navigate([this.location.path()]);
			}

		}else{
			this._cookieService.removeAll();
			this.router.navigate(['/home']);
		}*/
	}
}
