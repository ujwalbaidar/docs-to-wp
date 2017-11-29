import { Component, OnInit } from '@angular/core';
import { AuthsService } from '../../../../../shared/service/auths.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
	public menuItems: any;

	constructor(public authsService: AuthsService, public snackBar: MatSnackBar, private router: Router) { }

	ngOnInit() {
		this.getAuthUrls();
		this.getHeaderMenus();
	}

	getHeaderMenus(){
		let menuItems = [
			{
				name: 'Home',
				routerLink: '/home',
				toRedirect: false
			},
			{
				name: 'Pricing',
				routerLink: '/pricing',
				toRedirect: false
			}
		];

		this.menuItems = menuItems;
	}

	getAuthUrls(){
		this.authsService.getAuthUrls()
			.subscribe(authUrlObj=>{
				if(authUrlObj.success === true){
					this.menuItems.push({
						name: 'Login',
						routerLink: authUrlObj.data.google,
						toRedirect: true
					})
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
}