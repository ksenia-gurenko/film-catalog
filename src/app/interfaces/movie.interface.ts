export interface IMovie {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  description: string;
  rating: number;
  duration: number;
  genres: string[];
  director: string;
  cast: string[];
  poster: string;
  background: string;
}

export interface IMovieResponse {
  movies: IMovie[];
  total: number;
}

export interface IMovieSearchParams {
  title?: string;
  year?: number;
  genre?: string;
  _page?: number;
  _limit?: number;
}
