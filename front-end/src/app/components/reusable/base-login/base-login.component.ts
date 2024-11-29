import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface LoginPageConfig {
  title: string;
  subtitle: string;
  welcomeTitle: string;
  welcomeMessage: string;
  brandIcon: string;
  backgroundImage: string;
  signUpRoute: string;
  signUpText?: string;
  forgotPasswordRoute?: string;
  forgotPasswordText?: string;
}

@Component({
  selector: 'app-base-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './base-login.component.html',
  styleUrl: './base-login.component.scss'
})
export class BaseLoginComponent {
  @Input() config!: LoginPageConfig;
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Output() submitForm = new EventEmitter<{email: string, password: string}>();

  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmitForm() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitForm.emit(this.loginForm.value);
  }
}