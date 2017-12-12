import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketIoService } from '../../../../shared/service/socket-io.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'app-admin-header',
	templateUrl: './admin-header.component.html',
	styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {
	subscription: Subscription;
	notifications: any = [];

	constructor(private router: Router, public socketIoService: SocketIoService) {
		this.subscription = this.socketIoService.getMessage()
			.subscribe(notificationObj => {
				this.notifications.push(notificationObj);
			});
	}

	ngOnInit() {
		console.log(this.socketIoService.notifications.length);
	}

	logout(){
		localStorage.removeItem('currentUser');
		this.router.navigate(['/home']);
	}
}
