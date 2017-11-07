import { Component, OnInit } from '@angular/core';
import { AuthsService } from '../../../../../shared/service/auths.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
	public menuItems: any;

	constructor(public authsService: AuthsService) { }

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
			}, authUrlErr=>{

			});
	}
}