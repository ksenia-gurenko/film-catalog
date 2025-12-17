import { IMovie } from '../interfaces/movie.interface';

export class Movie implements IMovie {
  constructor(
    public id: number,
    public title: string,
    public originalTitle: string,
    public year: number,
    public description: string,
    public rating: number,
    public duration: number,
    public genres: string[],
    public director: string,
    public cast: string[],
    public poster: string,
    public background: string
  ) {}

  get durationFormatted(): string {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return `${hours}ч ${minutes}м`;
  }

  get ratingFormatted(): string {
    return this.rating.toFixed(1);
  }

  get genresFormatted(): string {
    return this.genres.join(', ');
  }

  get castFormatted(): string {
    return this.cast.slice(0, 3).join(', ');
  }

  static fromJson(json: any): Movie {
    return new Movie(
      json.id,
      json.title,
      json.originalTitle,
      json.year,
      json.description,
      json.rating,
      json.duration,
      json.genres,
      json.director,
      json.cast,
      json.poster,
      json.background
    );
  }
}
