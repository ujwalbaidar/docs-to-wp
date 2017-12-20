import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
	public displayedColumns: any;
  	public dataSource: any;

	constructor(public userService: UserService, private router: Router, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.getUsers();
	}

	getUsers(){
		this.userService.listUser()
			.subscribe(userData=>{
				this.displayedColumns = ['name', 'email', 'secondaryEmail', 'loginCount', 'action'];
				if(userData.success == true){
					this.dataSource = new UserListDataSource(userData.data);
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

export interface UserList {
	name: string;
	email: string;
	secondaryEmail: string;
	loginCount: Number;
}

export class UserListDataSource extends DataSource<any> {
	constructor(public exportsData){
		super();
	}

	connect(): Observable<UserList[]> {
		const userList: UserList [] = this.exportsData;
		return Observable.of(userList);
		
	}

	disconnect() {}
}