import { Component, OnInit } from '@angular/core';
import { WpUserService } from '../../../../shared/service/wp-user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-admin-aside',
  templateUrl: './admin-aside.component.html',
  styleUrls: ['./admin-aside.component.css']
})
export class AdminAsideComponent implements OnInit {
	public displayAsideContents: boolean = false;
	public localStorageVal: any;
	constructor(public wpUserService: WpUserService, private router: Router, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.localStorageVal = JSON.parse(localStorage.currentUser);
		this.getWpUser();
	}

	getWpUser(){
		this.wpUserService.listWpUsers()
			.subscribe(wpUsers=>{
				if(wpUsers.success == true){
					if(wpUsers.data.length>0){
						this.displayAsideContents = true;
					}
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
