import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, finalize } from 'rxjs/operators';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie: Movie | null = null;
  isLoading = true;
  error: string | null = null;
  recommendedMovies: Movie[] = [];
  defaultImage = 'assets/images/placeholder.jpg';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.loadMovie();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMovie(): void {
    this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        this.isLoading = true;
        this.error = null;

        return this.movieService.getMovieById(id).pipe(
          finalize(() => {
            this.isLoading = false;
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loadRecommendedMovies();
      },
      error: (error) => {
        this.error = error.message || 'Не удалось загрузить информацию о фильме';
        console.error('Error loading movie:', error);
      }
    });
  }

  loadRecommendedMovies(): void {
    this.movieService.getRecommendedMovies(4)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          this.recommendedMovies = movies.filter(m => m.id !== this.movie?.id).slice(0, 3);
        },
        error: (error) => {
          console.error('Error loading recommended movies:', error);
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  onRecommendedMovieClick(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }

  getRatingStars(): number[] {
    if (!this.movie) return [];
    const fullStars = Math.floor(this.movie.rating / 2);
    return Array(5).fill(0).map((_, i) => i < fullStars ? 1 : 0.5);
  }

  getSafeImageUrl(url: string): string {
    if (!url || url.trim() === '') {
      return this.defaultImage;
    }

    if (url.startsWith('assets/')) {
      return url;
    }

    if (url.startsWith('/')) {
      return url;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `assets/images/${url}`;
  }

  handleImageError(event: any): void {
    console.warn(`Ошибка загрузки изображения: ${event.target.src}`);
    event.target.src = this.defaultImage;
    event.target.alt = 'Изображение временно недоступно';
    event.target.title = 'Изображение временно недоступно';
  }

  getMovieColor(): string {
    if (!this.movie) return '#1a237e';

    const colors = [
      '#1a237e', // Начало
      '#311b92', // Темный рыцарь
      '#004d40', // Интерстеллар
      '#3e2723', // Помни
      '#1b5e20', // Матрица
      '#bf360c'  // Криминальное чтиво
    ];
    return colors[this.movie.id % colors.length];
  }

  showColorFallback(): boolean {
    return !this.movie?.poster || this.movie.poster.trim() === '';
  }
}
