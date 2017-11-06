import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
	public menuItems: any;

	constructor() { }

	ngOnInit() {
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
			},
			{
				name: 'Login',
				routerLink: '/login',
				toRedirect: false
			}
		];

		this.menuItems = menuItems;
	}
}
