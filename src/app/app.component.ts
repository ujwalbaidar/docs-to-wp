import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
	selector: 'app-root',
  	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	constructor(private router: Router, private location: Location, private activatedRoute: ActivatedRoute) { }

	ngOnInit(){
		let publicPath = ['/home', '/pricing', '/wp-admin/login'];
		let localStorageData = JSON.parse(localStorage.getItem('currentUser'));
		if(JSON.stringify(localStorage.getItem('currentUser')) !== '{}' &&  localStorageData !== null){
			if(localStorageData.token !== undefined && localStorageData.token !== ''){
				if(publicPath.includes(this.location.path())){
					this.router.navigate(['/app/documents']);
				}else if(this.location.path().startsWith('/app/google-auth/action/validate/loginType/google') && location.search){
						let queryUrl = {};
						location.search.substr(1).split("&")
							.forEach(item => {
								let [k,v] = item.split("="); 
								v = v && decodeURIComponent(v); 
								(queryUrl[k] = queryUrl[k] || []).push(v)
							});
						let navigateUrl = ['/app/google-auth/action/validate/loginType/google',queryUrl['code'][0], queryUrl['authuser'][0], queryUrl['prompt'][0], queryUrl['session_state'][0]]
						this.router.navigate(navigateUrl);
				}else if(this.location.path().startsWith('/app/billing-checkout/response') && location.search){
					let queryUrl = {};
						location.search.substr(1).split("&")
							.forEach(item => {
								let [k,v] = item.split("="); 
								v = v && decodeURIComponent(v); 
								(queryUrl[k] = queryUrl[k] || []).push(v)
							});
						this.router.navigate(['/app/packages/billing-response'], { queryParams: {salesId:queryUrl['order_number'][0], productId: queryUrl['li_0_product_id'][0]}});
				}else{
					if(this.location.path().startsWith('/app/packages/billing-response') && location.search){
						let urlQuery = {};
						let splitQuerySearch = location.search.substr(1).split("&");
						for(let i=0; i<splitQuerySearch.length;i++){
							let [k,v] = splitQuerySearch[i].split("=");
							v = v && decodeURIComponent(v);
							(urlQuery[k] = urlQuery[k] || []).push(v)
						}
						this.router.navigate(['/app/packages/billing-response'], { queryParams: {salesId:urlQuery['salesId'][0], productId: urlQuery['productId'][0]} });
					}else if(this.location.path().startsWith('/app/billing/details') && location.search){
						let urlQuery = {};
						let splitQuerySearch = location.search.substr(1).split("&");
						for(let i=0; i<splitQuerySearch.length;i++){
							let [k,v] = splitQuerySearch[i].split("=");
							v = v && decodeURIComponent(v);
							(urlQuery[k] = urlQuery[k] || []).push(v)
						}
						this.router.navigate(['/app/billing/details'], { queryParams: {sales_id:urlQuery['sales_id'][0]} });
					}else{
						this.router.navigate([this.location.path()]);
					}
				}
			}else{
				this.router.navigate(['/home']);
			}
		}else{
			if(this.location.path().startsWith('/app/google-auth/action/validate/loginType/google') && location.search){
				let queryUrl = {};
				location.search.substr(1).split("&")
					.forEach(item => {
						let [k,v] = item.split("="); 
						v = v && decodeURIComponent(v); 
						(queryUrl[k] = queryUrl[k] || []).push(v)
					});
				let navigateUrl = ['/app/google-auth/action/validate/loginType/google',queryUrl['code'][0], queryUrl['authuser'][0], queryUrl['prompt'][0], queryUrl['session_state'][0]]
				this.router.navigate(navigateUrl);
			}else if(publicPath.includes(this.location.path())){
				this.router.navigate([this.location.path()]);
			}else{
				localStorage.removeItem('currentUser');
				this.router.navigate(['/home']);
			}
		}
	}
}
