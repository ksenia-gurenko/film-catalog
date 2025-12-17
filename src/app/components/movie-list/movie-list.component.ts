import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { API_CONFIG } from '../../utils/constants';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  isLoading = true;
  error: string | null = null;
  searchQuery = '';

  private destroy$ = new Subject<void>();

  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMovies(): void {
    this.isLoading = true;
    this.error = null;

    this.movieService.getMovies({
      _page: 1,
      _limit: API_CONFIG.DEFAULT_PAGE_SIZE
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        this.movies = response.movies;
        this.filteredMovies = [...this.movies];
      },
      error: (error) => {
        this.error = error.message || 'Не удалось загрузить фильмы';
        console.error('Error loading movies:', error);
      }
    });
  }

  private setupSearch(): void {
    this.movieService.search$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          this.filteredMovies = movies;
        },
        error: (error) => {
          console.error('Search error:', error);
        }
      });
  }

  onSearch(query: string): void {
  this.searchQuery = query;
  this.movieService.setSearchQuery(query);
}

  onMovieClick(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery) {
      return `По запросу "${this.searchQuery}" ничего не найдено`;
    }
    return 'Фильмы не найдены';
  }
}
