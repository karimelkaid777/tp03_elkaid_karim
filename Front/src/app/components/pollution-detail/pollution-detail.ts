import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Pollution} from '../../models/pollution.model';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-pollution-detail',
  imports: [
    DatePipe
  ],
  templateUrl: './pollution-detail.html',
  styleUrl: './pollution-detail.scss'
})
export class PollutionDetail {
  @Input({ required: true }) pollution!: Pollution;

  @Output() back = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Pollution>();
  @Output() delete = new EventEmitter<number>();

  onBack() {
    this.back.emit();
  }

  onEdit() {
    this.edit.emit(this.pollution);
  }

  onDelete() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pollution ?')) {
      this.delete.emit(this.pollution.id);
    }
  }

  getTypeLabel(type: string): string {
    return type;
  }
}
