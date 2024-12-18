import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  constructor(private router: Router) {}
  searchTerm: string = '';
  @Output() search = new EventEmitter<string>();

   onSearch() {
    this.search.emit(this.searchTerm);
    this.router.navigate(['user/jobs'], { queryParams: { search: this.searchTerm } });
  }
}
