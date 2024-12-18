
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BaseFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
  [key: string]: any;
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'status' | 'email' | 'custom';
  customTemplate?: any;
}

@Component({
  selector: 'app-base-admin-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class BaseAdminTableComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() searchPlaceholder: string = 'items';
  @Input() emptyStateMessage: string = 'No items available';
  @Input() columns: TableColumn[] = [];
  @Input() data$: Observable<any[]> = new Observable<any[]>();
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() loading: boolean = false;
  @Input() filters: BaseFilters = {
    searchTerm: '',
    startDate: '',
    endDate: ''
  };
  @Input() actionTemplate: any;

  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() filtersChange = new EventEmitter<BaseFilters>();

  currentPage: number = 1;
  isFiltersVisible: boolean = false;
  private searchSubject: Subject<string> = new Subject<string>();
  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    const searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchChange.emit(term);
    });

    this.subscriptions.add(searchSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  applyFilters() {
    this.filtersChange.emit(this.filters);
  }

  resetFilters() {
    this.filters = {
      searchTerm: '',
      startDate: '',
      endDate: ''
    };
    this.filtersChange.emit(this.filters);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getStatusClass(status: any): string {
    return `status-badge ${status ? 'blocked' : 'unblocked'}`;
  }

  getStatusLabel(status: any): string {
    return status ? 'Blocked' : 'Unblocked';
  }
}