import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, Observable, Subscription, throwError, of, map } from 'rxjs';
import { IJobCategory } from '../../../state/job/job.state';
import { AdminService } from '../../../services/adminService';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './job-category.component.html',
  styleUrls: ['./job-category.component.scss'], 
})
export class JobCategoryComponent implements OnInit, OnDestroy {
  categories$!: Observable<IJobCategory[]>;
  categoryForm: FormGroup;
  editMode = false;
  selectedFile: File | null = null;
  loading = false;
  showForm = false;
  imagePreview: string | undefined | null = null;
  searchTerm = ''; 
  selectedCategoryId: string | null | undefined = null;
  currentPage = 1;
  pageSize = 5;
  totalCategories = 0;
  totalPages = 0;
  private subscriptions = new Subscription(); // Add a Subscription property

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService 
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
  }

  ngOnInit() { 
    this.loadCategories();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions
  }

  loadCategories() {
    this.loading = true;
    this.categories$ = this.adminService.getJobCategories(this.currentPage, this.pageSize, this.searchTerm).pipe(
      map(data => {
        this.totalCategories = data.total;
        this.totalPages = Math.ceil(this.totalCategories / this.pageSize);
        this.loading = false;
        return data.categories; 
      })
    );
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const formData = new FormData();
      if (this.categoryForm.get('name')?.value) formData.append('name', this.categoryForm.get('name')?.value);
      if (this.categoryForm.get('description')?.value) formData.append('description', this.categoryForm.get('description')?.value);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      } else if (this.categoryForm.get('imageUrl')?.value) {
        formData.append('imageUrl', this.categoryForm.get('imageUrl')?.value);
      }
  
      let operation;
      if (this.editMode && this.selectedCategoryId) {
        operation = this.adminService.updateJobCategory(this.selectedCategoryId, formData);
      } else {
        operation = this.adminService.createJobCategory(formData);
      }
  
      const submitSubscription = operation.pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          Swal.fire({
            title: 'Error!',
            text: error.status === 409 ? 'This category already exists.' : 'An unexpected error occurred. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return throwError(error);
        })
      ).subscribe(() => {
        this.resetForm();
        this.loadCategories();
        Swal.fire({
          title: 'Success!',
          text: this.editMode ? 'Category updated successfully!' : 'Category added successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      });

      this.subscriptions.add(submitSubscription); // Add the subscription to the Subscription object
    }
  }
  
  editCategory(category: IJobCategory) {
    this.showForm = true;
    this.editMode = true;
    this.selectedCategoryId = category._id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl
    });
    this.imagePreview = category.imageUrl;
    this.selectedFile = null;
  }  

  deleteCategory(category: IJobCategory) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteSubscription = this.adminService.deleteJobCategory(category.name).pipe(
          catchError((error) => {
            console.error('Error occurred:', error);
            Swal.fire({
              title: 'Error!',
              text: 'An unexpected error occurred while deleting the category.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return throwError(error);
          })
        ).subscribe(() => {
          this.loadCategories();
          Swal.fire({
            title: 'Success!',
            text: 'Category deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        });

        this.subscriptions.add(deleteSubscription); // Add delete operation subscription
      }
    });
  }
  
  onFileChange(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  resetForm() {
    this.categoryForm.reset();
    this.editMode = false;
    this.selectedFile = null;
    this.showForm = false;
    this.imagePreview = null;
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadCategories();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories();
    }
  }
}
