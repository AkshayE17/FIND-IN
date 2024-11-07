import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterConfig {
  searchPlaceholder?: string;
  filters: {
    type: 'text' | 'select' | 'date-range';
    label: string;
    key: string;
    options?: { value: any; label: string }[];
    placeholder?: string;
  }[];
}

@Component({
  selector: 'app-admin-filter',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-filter.component.html',
  styleUrl: './admin-filter.component.scss'
})
export class AdminFilterComponent {
  @Input() title: string = 'Filters';
  @Input() config: FilterConfig = { filters: [] };
  
  @Output() search = new EventEmitter<string>();
  @Output() filtersApplied = new EventEmitter<any>();
  @Output() filtersReset = new EventEmitter<void>();

  isFiltersVisible = false;
  searchTerm = '';
  filterValues: { [key: string]: any } = {};

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.search.emit(searchTerm);
  }

  onFilterChange(key: string, value: any) {
    this.filterValues[key] = value;
  }

  applyFilters() {
    this.filtersApplied.emit(this.filterValues);
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterValues = {};
    this.search.emit('');
    this.filtersReset.emit();
  }
}
