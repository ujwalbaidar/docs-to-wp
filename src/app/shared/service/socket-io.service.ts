import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SocketIoService {
	private socket;
	public notifications: any = [];
	private subject = new Subject<any>();

	constructor() { 
		this.socket = io();
		this.broadCastSocketValue();
	}

	broadCastSocketValue(){
		console.log(location.origin);
		this.socket = io(location.origin);

		this.socket.on('ins-data-obj', (insObj)=>{
			this.subject.next({ text: insObj });
		});

		/*this.socket.on('transfer-cookie', (data) => {
			this.socket.emit('user-cookie', this._cookieService.get('authToken'));
		});
		this.socket.on('updateRemainingDays', (billing)=>{
			if(billing.remainingDays>0) {
				this.validatedUser = true;
			}else{
				this.validatedUser = false;
			}
			this._cookieService.put('remainingDays', billing.remainingDays, {path:'/'});
			this._cookieService.put('packageType', billing.packageType, {path:'/'});
		});
		let email = this._cookieService.get('email')+'_notifications';
		this.socket.on(email, data =>{
			this.notifications.push(data);
		});*/
	}

	getMessage(): Observable<any> {
        return this.subject.asObservable();
    }		

	handleInsMessages(){
		var self = this;
		this.socket.on('ins-message', (insData)=>{
			console.log(insData);
		});
	}
}
