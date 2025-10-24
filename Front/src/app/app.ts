import { Component, signal } from '@angular/core';
import {Pollution} from './models/pollution.model';
import {PollutionService} from './services/pollution';
import {PollutionList} from './components/pollution-list/pollution-list';
import {PollutionDetail} from './components/pollution-detail/pollution-detail';
import {PollutionForm} from './components/pollution-form/pollution-form';

type View = 'list' | 'detail' | 'form';

@Component({
  selector: 'app-root',
  imports: [PollutionList, PollutionDetail, PollutionForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  title = 'Gestion des Pollutions';

  currentView = signal<View>('list');
  selectedPollution = signal<Pollution | null>(null);
  pollutionToEdit = signal<Pollution | null>(null);

  constructor(private pollutionService: PollutionService) {}

  onViewDetail(pollution: Pollution) {
    this.selectedPollution.set(pollution);
    this.currentView.set('detail');
  }

  onEditPollution(pollution: Pollution) {
    this.pollutionToEdit.set(pollution);
    this.currentView.set('form');
  }

  onCreateNew() {
    this.pollutionToEdit.set(null);
    this.currentView.set('form');
  }

  onBackToList() {
    this.selectedPollution.set(null);
    this.currentView.set('list');
  }

  onEditFromDetail(pollution: Pollution) {
    this.pollutionToEdit.set(pollution);
    this.currentView.set('form');
  }

  onDeleteFromDetail(id: number) {
    this.pollutionService.deletePollution(id).subscribe({
      next: () => {
        this.currentView.set('list');
        this.selectedPollution.set(null);
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
        console.error(err);
      }
    });
  }

  onCancelForm() {
    this.pollutionToEdit.set(null);
    this.currentView.set('list');
  }

  onSaved() {
    this.pollutionToEdit.set(null);
    this.currentView.set('list');
  }
}
