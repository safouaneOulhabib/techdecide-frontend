import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly confirmationService = inject(ConfirmationService);

  confirm(message: string, onAccept: () => void) {
    this.confirmationService.confirm({
      message,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: onAccept
    });
  }
}