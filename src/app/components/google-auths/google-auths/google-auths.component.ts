import { Component, OnInit } from '@angular/core';
import { AuthsService } from '../../../shared/service/auths.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-google-auths',
  templateUrl: './google-auths.component.html',
  styleUrls: ['./google-auths.component.css']
})
export class GoogleAuthsComponent implements OnInit {
	public authUrls: any;
	constructor(public authsService: AuthsService, private activatedRoute: ActivatedRoute, private router: Router, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			if(JSON.stringify(params) != "{}" && params.action === 'validate'){
			   this.validateOauthCode(params.code, params.loginType);
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
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					window.location.reload();
				});
			});
	}

	validateOauthCode(authCode, loginType){
		let paramObj = {code:authCode, loginType: loginType};
		this.authsService.validateAuthCode(paramObj)
			.subscribe(authInfos=>{
				let authInfosData = authInfos.data;
				localStorage.setItem('currentUser', JSON.stringify({ name: authInfosData.name, email: authInfosData.email, token: authInfosData.token }));
				this.router.navigate(['/app']);
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					window.location.reload();
				});
			});
	}
}
