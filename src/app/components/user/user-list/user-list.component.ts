import { Component, OnInit } from '@angular/core';
import { WpUserService } from '../../../shared/service/wp-user.service';
import { CookieService } from 'angular2-cookie/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
	public wpUsers: any;
	public cookieInfo: any = {};
	public displayedColumns: any;
  	public dataSource: any;
	constructor(public wpUserService: WpUserService, private _cookieService: CookieService) { }

	ngOnInit() {
		this.cookieInfo = {
			email: this._cookieService.get('email')
		}
		this.listWpUsers();
	}

	listWpUsers(){
		this.displayedColumns = ['userName', 'url', 'actions'];
		this.wpUserService.listWpUsers()
			.subscribe(wpUsers=>{
				if(wpUsers.success == true){
					this.dataSource = new WpUserDataSource(wpUsers.data);
				}
			}, wpUserError=>{
				console.log(wpUserError);
			});
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