import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { userInitializeApp } from './state/recruiter/recruiter.action';
import { recruiterInitializeApp } from './state/user/user.action';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'front-end';

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(userInitializeApp());
    this.store.dispatch(recruiterInitializeApp());
}
}