import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadMovie(id);
  }

  loadMovie(id: number): void {
    this.movieService.getMovieById(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
        console.log('Movie loaded:', movie);
        console.log('Poster path:', this.getImageUrl());
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.isLoading = false;
      }
    });
  }

  // ВАЖНО: Этот метод должен быть ОДИНАКОВЫЙ с movie-card.component.ts
  getImageUrl(): string {
    if (!this.movie?.poster) {
      return 'assets/images/posters/placeholder.jpg';
    }

    // Если poster уже содержит полный путь
    if (this.movie.poster.includes('assets/')) {
      return this.movie.poster;
    }

    // Если это просто имя файла
    return `assets/images/posters/${this.movie.poster}`;
  }

  onImageError(event: any): void {
    console.log('Image error, using placeholder');
    event.target.src = 'assets/images/posters/placeholder.jpg';
  }
}
