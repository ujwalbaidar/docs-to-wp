import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
	selector: 'app-root',
  	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	constructor(private router: Router, private location: Location) { }

	ngOnInit(){
		let publicPath = ['/home', '/pricing'];
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
				}else{
					this.router.navigate(['/app/documents']);
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
			}else{
				localStorage.removeItem('currentUser');
				this.router.navigate(['/home']);
			}
		}
	}
}
