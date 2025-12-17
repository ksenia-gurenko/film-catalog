import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Input() showDetails: boolean = false; // Добавили этот Input
  @Output() cardClick = new EventEmitter<number>();

  onCardClick(): void {
    this.cardClick.emit(this.movie.id);
  }

  // Простой метод для получения URL изображения
  getImageUrl(): string {
    if (!this.movie.poster) {
      return 'assets/images/posters/placeholder.jpg';
    }
    return `assets/images/posters/${this.movie.poster}`;
  }

  // Метод обработки ошибок изображения
  onImageError(event: any): void {
    console.log('Ошибка загрузки изображения');
    event.target.src = 'assets/images/posters/placeholder.jpg';
  }
}
