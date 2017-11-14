import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { WpUserService } from '../../../shared/service/wp-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
	user: User = <User>{};
	constructor(public wpUserService: WpUserService, private router: Router) { }
	ngOnInit() {
	}

	submitWpUser(){
		this.wpUserService.createWpUser(this.user)
			.subscribe(userCreateResp=>{
				if(userCreateResp.success===true){
					window.location.href = 'http://localhost:3000/app/documents';
				}
			}, userCreateErr=>{
				console.log(userCreateErr);
			});
	}

}