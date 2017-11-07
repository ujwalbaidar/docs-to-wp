import { Component, OnInit } from '@angular/core';
import { AuthsService } from '../../../shared/service/auths.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: 'app-google-auths',
  templateUrl: './google-auths.component.html',
  styleUrls: ['./google-auths.component.css']
})
export class GoogleAuthsComponent implements OnInit {
	public authUrls: any;
	constructor(public authsService: AuthsService, private activatedRoute: ActivatedRoute, private router: Router, private _cookieService: CookieService) { }

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			if(JSON.stringify(params) != "{}" && params.action === 'validate'){
				this.activatedRoute.queryParams.subscribe(queryParams => {
				   this.validateOauthCode(queryParams.code, params.loginType);
				});
			}else{
				this.getAuthUrls();
			}
		});
	}

	getAuthUrls(){
		this.authsService.getAuthUrls()
			.subscribe(authUrlObj=>{
				if(authUrlObj.success === true){
					this.authUrls = authUrlObj.data;
				}
			}, authUrlErr=>{

			});
	}

	validateOauthCode(authCode, loginType){
		let paramObj = {code:authCode, loginType: loginType};
		this.authsService.validateAuthCode(paramObj)
			.subscribe(authInfos=>{
				let authInfosData = authInfos.data;
				this._cookieService.put('name', authInfosData.name);
				this._cookieService.put('email', authInfosData.email);
				this._cookieService.put('token', authInfosData.token);
				this.router.navigate(['/app']);
			}, authError=>{
				// this.router.navigate(['/home']);
			});
	}
}
