import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'status' | 'email' | 'custom';
  format?: (value: any) => string;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select';
  options?: { value: string; label: string; }[];
  placeholder?: string;
}

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent {
  @Input() title: string = '';
  @Input() searchPlaceholder: string = 'items';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() filterOptions: FilterOption[] = [];
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 2;
  @Input() currentPage: number = 1;
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  @Input() emptyStateMessage: string = 'No data available';
  @Input() actionsTemplate: any;

  @Output() onSearch = new EventEmitter<string>();
  @Output() onFilterChange = new EventEmitter<{ key: string; value: any }>();
  @Output() onFiltersApply = new EventEmitter<any>();
  @Output() onFiltersReset = new EventEmitter<void>();
  @Output() onPageChange = new EventEmitter<number>();

  isFiltersVisible = false;
  filters: any = {};

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  onSearchEvent(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.onSearch.emit(searchTerm);
  }

  applyFilters() {
    this.onFiltersApply.emit(this.filters);
  }

  resetFilters() {
    this.filters = {};
    this.onFiltersReset.emit();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
}
