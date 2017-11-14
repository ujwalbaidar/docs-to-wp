import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-admin-header',
	templateUrl: './admin-header.component.html',
	styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

	constructor(private router: Router, private _cookieService: CookieService) { }

	ngOnInit() {
	}

	logout(){
		/*this._cookieService.deleteAll();
		this.router.navigate(['/home']);*/
	}
}
