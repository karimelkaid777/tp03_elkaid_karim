import {Component, inject, Output, EventEmitter, signal, OnInit} from '@angular/core';
import {Pollution} from '../../models/pollution.model';
import {PollutionService} from '../../services/pollution';
import {FormsModule} from '@angular/forms';
import {NgClass, DatePipe} from '@angular/common';

@Component({
  selector: 'app-pollution-list',
  imports: [
    FormsModule,
    NgClass,
    DatePipe
  ],
  templateUrl: './pollution-list.html',
  styleUrl: './pollution-list.scss'
})
export class PollutionList implements OnInit {
  private pollutionService = inject(PollutionService);

  pollutions = signal<Pollution[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filterType = signal<string>('');
  filterSeverity = signal<string>('');
  filterStatus = signal<string>('');

  @Output() viewDetail = new EventEmitter<Pollution>();
  @Output() editPollution = new EventEmitter<Pollution>();
  @Output() createNew = new EventEmitter<void>();

  constructor() {
    this.loadPollutions();
  }

  ngOnInit() {
  }

  loadPollutions() {
    this.loading.set(true);
    this.pollutionService.getAllPollutions().subscribe({
      next: (data) => {
        this.pollutions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des pollutions');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  applyFilters() {
    this.loading.set(true);
    const filters = {
      type: this.filterType() || undefined,
      severity: this.filterSeverity() || undefined,
      status: this.filterStatus() || undefined
    };

    this.pollutionService.filterPollutions(filters).subscribe({
      next: (data) => {
        this.pollutions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du filtrage des pollutions');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onViewDetail(pollution: Pollution) {
    this.viewDetail.emit(pollution);
  }

  onEdit(pollution: Pollution, event: Event) {
    event.stopPropagation();
    this.editPollution.emit(pollution);
  }

  onDelete(id: number, event: Event) {
    event.stopPropagation();

    if (confirm('Êtes-vous sûr de vouloir supprimer cette pollution ?')) {
      this.pollutionService.deletePollution(id).subscribe({
        next: () => {
          this.pollutions.update(list => list.filter(p => p.id !== id));
        },
        error: (err) => {
          alert('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  }

  onCreateNew() {
    this.createNew.emit();
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity}`;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Plastique': '♻️',
      'Chimique': '⚗️',
      'Dépôt sauvage': '🗑️',
      'Eau': '💧',
      'Air': '🌫️',
      'Autre': '⚠️'
    };
    return icons[type] || '⚠️';
  }

  getTypeLabel(type: string): string {
    return type;
  }
}
