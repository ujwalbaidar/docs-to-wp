import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { User } from '../user';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
	user: User = <User>{};
	constructor(public userService: UserService, private router: Router, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.getUserInfo();
	}

	getUserInfo(){
		this.userService.getUserInfo()
			.subscribe(userInfo=>{
				this.user = JSON.parse(JSON.stringify(userInfo.data))
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

	submitUser(){
		this.userService.updateUserInfo(this.user)
			.subscribe(userInfo=>{
				this.router.navigate(['/app/user/lists']);
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
