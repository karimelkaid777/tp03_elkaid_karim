import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Pollution} from '../../models/pollution.model';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.scss'
})
export class PollutionRecap {
  @Input({ required: true }) pollution!: Pollution;

  @Output() backToList = new EventEmitter<void>();

  onBackToList() {
    this.backToList.emit();
  }

  getTypeLabel(type: string): string {
    return type;
  }
}
