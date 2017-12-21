import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { WpUserService } from '../../../shared/service/wp-user.service';

export interface WpUser {
	wpUserName: string;
	wpUrl: string;
	wpPassword: string;
}

@Component({
  selector: 'app-wp-user-edit',
  templateUrl: './wp-user-edit.component.html',
  styleUrls: ['./wp-user-edit.component.css']
})
export class WpUserEditComponent implements OnInit {
	wpUser: WpUser = <WpUser>{};
	submittedWpUserForm: boolean = false;
	
	constructor(public wpUserService: WpUserService, private router: Router, public snackBar: MatSnackBar, private activatedRoute: ActivatedRoute) { }

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			let wpUserId = params.wpUserId;
			this.getWpUserInfo(wpUserId);
		});
	}

	getWpUserInfo(wpUserId){
		this.wpUserService.getWpUserInfo([{wpUserId: wpUserId}])
			.subscribe(wpUserInfo=>{
				this.wpUser = JSON.parse(JSON.stringify(wpUserInfo.data));
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

	submitWpUser(isValid){
		this.submittedWpUserForm = true;
		if(isValid){
			this.wpUserService.updateWpUser(this.wpUser)
				.subscribe(wpUserInfo=>{
					this.router.navigate(['/app/user/lists'])
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
