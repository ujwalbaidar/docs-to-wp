import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
	selector: 'app-domain-details',
	templateUrl: './domain-details.component.html',
	styleUrls: ['./domain-details.component.css']
})
export class DomainDetailsComponent implements OnInit {
	userDomainInfo:any;
	displayedColumns:any;

	constructor(private route: ActivatedRoute, private router: Router, public userService: UserService, public snackBar: MatSnackBar) {
	}

	ngOnInit() {
		this.route.params.subscribe(params=>{
			if(params && params['user-id']){
				this.wpUserDomains(params['user-id']);
			}else{
				this.router.navigate(['/app/admin-users']);
			}
		});
	}

	wpUserDomains(userId){
		this.userService.wpUserDomains([{userId:userId}])
			.subscribe(userDomainLists=>{
				console.log(userDomainLists.data)
				this.displayedColumns = ['domainName', 'exportedData', 'userDomain'];
				this.userDomainInfo = new DomainDataDataSource(userDomainLists.data);
			}, error=>{
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
			})
	}
}

export interface DomainDetails {
	domainName: string;
	exportedData: number;
	userDomain: any;
}


export class DomainDataDataSource extends DataSource<any> {
	constructor(public domainData){
		super();
	}

	connect(): Observable<DomainDetails[]> {
		const domainData: DomainDetails [] = this.domainData;
		return Observable.of(domainData);
		
	}

	disconnect() {}
}