import {Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from "@angular/forms";
import {PollutionService} from '../../services/pollution';
import {Pollution} from '../../models/pollution.model';
import {PollutionRecap} from '../pollution-recap/pollution-recap';
import { isAfter, endOfDay, parseISO, format } from 'date-fns';

function noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const selectedDate = parseISO(control.value);
  const today = endOfDay(new Date());

  if (isAfter(selectedDate, today)) {
    return { futureDate: true };
  }

  return null;
}

@Component({
  selector: 'app-pollution-form',
  imports: [
    ReactiveFormsModule,
    PollutionRecap
  ],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.scss'
})
export class PollutionForm implements OnChanges {
  private fb = inject(FormBuilder);
  private pollutionService = inject(PollutionService);

  @Input() pollutionToEdit: Pollution | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  pollutionForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  showForm = signal(true);
  submittedPollution = signal<Pollution | null>(null);

  constructor() {
    this.pollutionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      type: ['Plastique', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateObservation: ['', [Validators.required, noFutureDateValidator]],
      location: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]+)?$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]+)?$/)]],
      photoUrl: [''],
      severity: ['medium'],
      status: ['reported']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pollutionToEdit'] && this.pollutionForm) {
      const pollution = this.pollutionToEdit;
      if (pollution) {
        this.pollutionForm.patchValue({
          title: pollution.title,
          type: pollution.type,
          description: pollution.description,
          dateObservation: this.formatDateForInput(pollution.dateObservation),
          location: pollution.location,
          latitude: pollution.latitude,
          longitude: pollution.longitude,
          photoUrl: pollution.photoUrl || '',
          severity: pollution.severity || 'medium',
          status: pollution.status || 'reported'
        });
      } else {
        this.pollutionForm.reset({
          type: 'Plastique',
          severity: 'medium',
          status: 'reported'
        });
      }
    }
  }

  // Convertit la date au format YYYY-MM-DD requis par l'input HTML type="date", sinon la valeur n'est pas affichée
  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd');
  }

  get isEditMode(): boolean {
    return this.pollutionToEdit !== null;
  }

  onSubmit() {
    if (this.pollutionForm.valid) {
      if (this.isEditMode) {
        this.loading.set(true);
        this.error.set(null);

        const formData = {
          ...this.pollutionForm.value
        };

        const id = this.pollutionToEdit!.id;
        this.pollutionService.updatePollution(id, formData).subscribe({
          next: () => {
            this.loading.set(false);
            this.saved.emit();
          },
          error: (err) => {
            this.error.set('Erreur lors de la modification');
            this.loading.set(false);
            console.error(err);
          }
        });
      } else {
        this.loading.set(true);
        this.error.set(null);

        const { severity, status, ...formDataTP02 } = this.pollutionForm.value;

        this.pollutionService.createPollution(formDataTP02).subscribe({
          next: (createdPollution) => {
            this.loading.set(false);
            this.submittedPollution.set(createdPollution);
            this.showForm.set(false);
          },
          error: (err) => {
            this.error.set('Erreur lors de la création de la pollution');
            this.loading.set(false);
            console.error(err);
          }
        });
      }
    } else {
      Object.keys(this.pollutionForm.controls).forEach(key => {
        this.pollutionForm.controls[key].markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackToList() {
    this.cancel.emit();
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.pollutionForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}
