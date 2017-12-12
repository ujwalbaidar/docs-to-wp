import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserService } from '../../../shared/service/user.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

export interface Admin {
	email: string;
	password: string;
}

@Component({
	selector: 'app-admin-login',
	templateUrl: './admin-login.component.html',
	styleUrls: ['./admin-login.component.css']
})

export class AdminLoginComponent implements OnInit {
	public submittedLoginForm: Boolean = false;
	public admin: Admin = <Admin>{};
	public errObj: any = {};

	constructor(public userService: UserService, public snackBar: MatSnackBar, private router: Router) { }

	ngOnInit() {
	}

	adminLogin(isValid){
		this.submittedLoginForm = true;
		if(isValid === true){
			this.userService.loginAdminUser(this.admin)
				.subscribe(loginResponse=>{
					if(loginResponse.success === false){
						let snackBarRef = this.snackBar.open(loginResponse.data.msg, '',{
							duration: 2000,
						});
					}else{
						let authInfosData = loginResponse.data;
						localStorage.setItem('currentUser', JSON.stringify({ name: authInfosData.name, email: authInfosData.email, token: authInfosData.token, role: authInfosData.role }));
						this.router.navigate(['/app/admin-packages']);
					}
				}, error =>{
					let errMsg = error.errBody.message || 'Failed to perform this action.';
					let snackBarRef = this.snackBar.open(errMsg, '',{
						duration: 2000,
					});
					snackBarRef.afterDismissed().subscribe(() => {
						if(error.status === 401){
							localStorage.removeItem('currentUser');
							this.router.navigate(['/home']);
						}else{
							window.location.reload();
						}
				});
			});
		}
	}
}