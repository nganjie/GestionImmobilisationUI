import { inject, Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
  //constructor(private toastrService:ToastrService) {}
  private readonly injector = inject(Injector);
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let userFriendlyMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          userFriendlyMessage = `Erreur client: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          if(error.error.message){
            userFriendlyMessage = `Erreur serveur: ${error.error.message}`;
          }else{
            switch (error.status) {
            case 0:
              userFriendlyMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
              break;
            case 400:
              userFriendlyMessage = 'Requête invalide. Veuillez vérifier les informations saisies.';
              break;
            case 401:
              userFriendlyMessage = 'Non autorisé. Veuillez vous authentifier.';
              break;
            case 403:
              userFriendlyMessage = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
              break;
            case 404:
              userFriendlyMessage = 'Ressource non trouvée.';
              break;
            case 500:
              userFriendlyMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
              break;
            default:
              userFriendlyMessage = `Erreur ${error.status}: ${error.statusText}`;
              break;
          }
          }
          
        }
        console.log('Error Interceptor:', userFriendlyMessage);
        this.injector.get(MatSnackBar).open(userFriendlyMessage, 'Close', {
          duration: 5000,
          panelClass: ['custom-error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return throwError(() => new Error(userFriendlyMessage));
      })
    );
  }
}