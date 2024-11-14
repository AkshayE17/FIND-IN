import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IJobCategory } from '../../../state/job/job.state';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-job-category',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
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
  private subscriptions = new Subscription();

  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService 
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, this.nonWhitespaceValidator]],
      description: ['', [Validators.required, this.nonWhitespaceValidator]],
      imageUrl: ['', Validators.required],
    });
    
  }

  ngOnInit() { 
    this.loadCategories();

    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300),  
        distinctUntilChanged()  
      ).subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.loadCategories();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm); 
  }

  async onSubmit() {
    if (this.categoryForm.valid) {
      try {
        if (this.selectedFile) {
          const uploadUrl = await this.adminService.getUploadUrl(this.selectedFile.name, this.selectedFile.type).toPromise();
          if (uploadUrl) {
            const { url } = uploadUrl;
            await this.adminService.uploadFileToS3(url, this.selectedFile);
            const imageUrl = url.split('?')[0];
            this.categoryForm.get('imageUrl')?.setValue(imageUrl); // Ensure this field is updated before submitting
          }
        }
  
        const formData = this.categoryForm.value;
        let operation;
  
        if (this.editMode && this.selectedCategoryId) {
          operation = this.adminService.updateJobCategory(this.selectedCategoryId, formData);
        } else {
          operation = this.adminService.createJobCategory(formData);
        }  
  
        const submitSubscription = operation.pipe(
          catchError((error) => {
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
  
        this.subscriptions.add(submitSubscription);
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to upload image. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
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
        const deleteSubscription = this.adminService.deleteJobCategory(category._id).pipe(
          catchError((error) => {
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

        this.subscriptions.add(deleteSubscription);
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
  
      // Update the imageUrl form control immediately
      this.categoryForm.get('imageUrl')?.setValue(this.selectedFile.name);  // Temporarily set it
    }
  }
  
  resetForm() {
    this.categoryForm.reset();
    this.editMode = false;
    this.selectedFile = null;
    this.showForm = false;
    this.imagePreview = null;
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

  // Custom validator to disallow whitespace-only inputs
  nonWhitespaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
