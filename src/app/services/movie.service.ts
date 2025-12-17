import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, shareReplay, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IMovie, IMovieResponse, IMovieSearchParams } from '../interfaces/movie.interface';
import { Movie } from '../models/movie.model';
import { environment } from '../../environments/environment';
import { API_CONFIG } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = `${environment.apiUrl}${API_CONFIG.ENDPOINTS.MOVIES}`;
  private moviesCache = new Map<string, Movie[]>();
  private searchSubject = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  // Получить все фильмы с пагинацией
  getMovies(params?: IMovieSearchParams): Observable<{ movies: Movie[]; total: number }> {
    const cacheKey = this.generateCacheKey('all', params);

    if (this.moviesCache.has(cacheKey)) {
      return of({
        movies: this.moviesCache.get(cacheKey)!,
        total: this.moviesCache.get(cacheKey)!.length
      });
    }

    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof IMovieSearchParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<IMovie[]>(this.apiUrl, { params: httpParams, observe: 'response' }).pipe(
      map(response => {
        const movies = (response.body || []).map(movie => Movie.fromJson(movie));
        const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);

        // Кешируем результат
        this.moviesCache.set(cacheKey, movies);

        return { movies, total };
      }),
      catchError(this.handleError)
    );
  }

  // Получить фильм по ID
  getMovieById(id: number): Observable<Movie> {
    const cacheKey = this.generateCacheKey(`movie_${id}`);

    if (this.moviesCache.has(cacheKey)) {
      return of(this.moviesCache.get(cacheKey)![0]);
    }

    return this.http.get<IMovie>(`${this.apiUrl}/${id}`).pipe(
      map(movie => Movie.fromJson(movie)),
      tap(movie => {
        this.moviesCache.set(cacheKey, [movie]);
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  // Поиск фильмов по названию
  searchMovies(query: string): Observable<Movie[]> {
    if (!query.trim()) {
      return this.getMovies().pipe(map(result => result.movies));
    }

    const cacheKey = this.generateCacheKey(`search_${query}`);

    if (this.moviesCache.has(cacheKey)) {
      return of(this.moviesCache.get(cacheKey)!);
    }

    const params = new HttpParams().set('title_like', query);

    return this.http.get<IMovie[]>(this.apiUrl, { params }).pipe(
      map(movies => movies.map(movie => Movie.fromJson(movie))),
      tap(movies => {
        this.moviesCache.set(cacheKey, movies);
      }),
      catchError(this.handleError)
    );
  }

  // Оптимизированный поиск с debounce
  get search$(): Observable<Movie[]> {
    return this.searchSubject.pipe(
      debounceTime(API_CONFIG.SEARCH_DEBOUNCE),
      distinctUntilChanged(),
      switchMap(query => this.searchMovies(query))
    );
  }

  // Установить поисковый запрос
  setSearchQuery(query: string): void {
    this.searchSubject.next(query);
  }

  // Получить рекомендуемые фильмы (топ по рейтингу)
  getRecommendedMovies(limit: number = 4): Observable<Movie[]> {
    const cacheKey = this.generateCacheKey(`recommended_${limit}`);

    if (this.moviesCache.has(cacheKey)) {
      return of(this.moviesCache.get(cacheKey)!);
    }

    const params = new HttpParams()
      .set('_sort', 'rating')
      .set('_order', 'desc')
      .set('_limit', limit.toString());

    return this.http.get<IMovie[]>(this.apiUrl, { params }).pipe(
      map(movies => movies.map(movie => Movie.fromJson(movie))),
      tap(movies => {
        this.moviesCache.set(cacheKey, movies);
      }),
      catchError(this.handleError)
    );
  }

  // Очистка кеша
  clearCache(): void {
    this.moviesCache.clear();
  }

  // Генерация ключа для кеша
  private generateCacheKey(baseKey: string, params?: any): string {
    if (!params) return baseKey;

    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${baseKey}_${paramString}`;
  }

  // Обработка ошибок
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Произошла ошибка при загрузке данных';

    if (error.error instanceof ErrorEvent) {
      // Ошибка на клиенте
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      // Ошибка на сервере
      switch (error.status) {
        case 404:
          errorMessage = 'Фильм не найден';
          break;
        case 500:
          errorMessage = 'Ошибка сервера. Попробуйте позже';
          break;
        default:
          errorMessage = `Ошибка ${error.status}: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
