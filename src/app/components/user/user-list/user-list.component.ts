import { Component, OnInit } from '@angular/core';
import { WpUserService } from '../../../shared/service/wp-user.service';
import { UserService } from '../../../shared/service/user.service';
import { BillingsService } from '../../../shared/service/billings.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
	public wpUsers: any;
	public userInfo: any = {};
	public displayedColumns: any;
  	public dataSource: any;
  	public userBilling: any;

	constructor(public wpUserService: WpUserService, private router: Router, public snackBar: MatSnackBar, public userService: UserService, public billingsService: BillingsService) { }

	ngOnInit() {
		this.getUserInfo();
		this.listWpUsers();
		this.getUserBilling();
	}

	getUserInfo(){
		this.userService.getUserInfo()
			.subscribe(userInfo=>{
				this.userInfo = JSON.parse(JSON.stringify(userInfo.data));
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

	listWpUsers(){
		this.displayedColumns = ['userName', 'url', 'actions'];
		this.wpUserService.listWpUsers()
			.subscribe(wpUsers=>{
				if(wpUsers.success == true){
					this.dataSource = new WpUserDataSource(wpUsers.data);
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

	getUserBilling(){
		this.billingsService.getUserBillingInfo()
			.subscribe(userBilling=>{
				this.userBilling = userBilling.data;
			}, error=>{
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
			})
	}
}

export interface User {
	userName: string;
	url: string;
}


export class WpUserDataSource extends DataSource<any> {
	constructor(public userData){
		super();
	}

	connect(): Observable<User[]> {
		const wpUsers: User [] = this.userData;
		return Observable.of(wpUsers);
		
	}

	disconnect() {}
}