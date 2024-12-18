import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export function mobileValidator(http: HttpClient, endpoint: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }
        return http.post<{ message: string }>(`environment.backendUrl/${endpoint}/check-mobile`, { mobile: control.value }).pipe(
            debounceTime(300),
            map(() => null),
            catchError(err => {
                if (err.status === 400 && err.error?.message === 'Mobile number already exists.') {
                    return of({ mobileExists: true });
                }
                return of(null);
            })
        );
    };
}
