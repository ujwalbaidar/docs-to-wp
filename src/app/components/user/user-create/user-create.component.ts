import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { WpUserService } from '../../../shared/service/wp-user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
	user: User = <User>{};
	constructor(public wpUserService: WpUserService, private router: Router, public snackBar: MatSnackBar) { }
	ngOnInit() {
	}

	submitWpUser(){
		this.wpUserService.createWpUser(this.user)
			.subscribe(userCreateResp=>{
				if(userCreateResp.success===true){
					window.location.href = location.origin+'/app/user/lists';
				}else{
					let snackBarRef = this.snackBar.open(userCreateResp.message, '',{
						duration: 3000,
					});
					snackBarRef.afterDismissed().subscribe(() => {
						this.user.userName = '';
						this.user.password = '';
						this.user.url = '';
					});
				}
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 3000,
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