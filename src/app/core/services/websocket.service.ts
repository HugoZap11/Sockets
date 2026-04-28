import {Injectable} from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Observable} from 'rxjs';
import {io,Socket} from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: Socket;

  //Iniciamos pasando el token 
  public conectar(token: string): void {
    this.socket = io('http://localhost:3500', {
      auth: {
        token
      },
        transports: ['websocket']
    });
}

    public listen(event:string): Observable<any> {
        return new Observable((subscriber) => {
            this.socket.on(event, (data) => {   