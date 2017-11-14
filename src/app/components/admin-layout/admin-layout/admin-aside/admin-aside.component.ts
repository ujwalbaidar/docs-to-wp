import { Component, OnInit } from '@angular/core';
import { WpUserService } from '../../../../shared/service/wp-user.service';

@Component({
  selector: 'app-admin-aside',
  templateUrl: './admin-aside.component.html',
  styleUrls: ['./admin-aside.component.css']
})
export class AdminAsideComponent implements OnInit {
	public displayAsideContents: boolean = false;

	constructor(public wpUserService: WpUserService) { }

	ngOnInit() {
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
			}, wpUserError=>{
				console.log(wpUserError);
			});
	}

}
