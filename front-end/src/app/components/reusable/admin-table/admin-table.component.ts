// base-admin-table.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
  template: `
    <div class="admin-table-container">
      <div class="page-header">
        <h1>{{ title }}</h1>
        <div class="header-actions">
          <div class="search-box">
            <input 
              type="text" 
              [placeholder]="'Search ' + searchPlaceholder + '...'"
              (input)="onSearch($event)"
              [(ngModel)]="filters.searchTerm"
            >
            <i class="fas fa-search"></i>
          </div>
          <button class="btn-filter" (click)="toggleFilters()">
            <i class="fas fa-filter"></i> Filters
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="filters-panel" [class.visible]="isFiltersVisible">
        <div class="filters-content">
          <ng-content select="[filters]"></ng-content>
          <div class="filter-actions">
            <button class="btn-apply" (click)="applyFilters()">
              Apply Filters
            </button>
            <button class="btn-reset" (click)="resetFilters()">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div *ngIf="!(data$ | async)?.length && !loading" class="empty-state">
          <i class="fas fa-users"></i>
          <p>{{ emptyStateMessage }}</p>
        </div>

        <table *ngIf="(data$ | async)?.length" class="data-table">
          <thead>
            <tr>
              <th *ngFor="let col of columns">{{ col.label }}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of (data$ | async)">
              <td *ngFor="let col of columns">
                <ng-container [ngSwitch]="col.type">
                  <ng-container *ngSwitchCase="'date'">
                    {{ item[col.key] | date }}
                  </ng-container>
                  <ng-container *ngSwitchCase="'status'">
                    <span [ngClass]="getStatusClass(item[col.key])">
                      {{ getStatusLabel(item[col.key]) }}
                    </span>
                  </ng-container>
                  <ng-container *ngSwitchCase="'email'">
                    <div class="email-cell">
                      <i class="fas fa-user-tie"></i>
                      {{ item[col.key] }}
                    </div>
                  </ng-container>
                  <ng-container *ngSwitchCase="'custom'">
                    <ng-container 
                      *ngTemplateOutlet="col.customTemplate; context: { $implicit: item }">
                    </ng-container>
                  </ng-container>
                  <ng-container *ngSwitchDefault>
                    {{ item[col.key] }}
                  </ng-container>
                </ng-container>
              </td>
              <td class="actions-cell">
                <ng-container 
                  *ngTemplateOutlet="actionTemplate; context: { $implicit: item }">
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div *ngIf="totalItems > pageSize" class="pagination-controls">
          <button 
            (click)="changePage(currentPage - 1)" 
            [disabled]="currentPage === 1"
            class="btn-pagination"
          >
            <i class="fas fa-chevron-left"></i> Previous
          </button>
          <span>Page {{currentPage}} of {{totalPages}}</span>
          <button 
            (click)="changePage(currentPage + 1)" 
            [disabled]="currentPage === totalPages"
            class="btn-pagination"
          >
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
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