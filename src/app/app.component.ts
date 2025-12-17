import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Каталог фильмов';
  showBackButton = false;
  currentRoute = '';
  isDarkTheme = false;
  showScrollTop = false;
  currentYear: number = new Date().getFullYear();

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.setupTheme();
    this.checkScrollPosition();
  }

  private setupTheme(): void {
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.enableDarkTheme();
    } else if (savedTheme === 'light') {
      this.enableLightTheme();
    } else {
      // Проверяем системные настройки
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.enableDarkTheme();
      } else {
        this.enableLightTheme();
      }
    }
  }

  toggleTheme(): void {
    if (this.isDarkTheme) {
      this.enableLightTheme();
    } else {
      this.enableDarkTheme();
    }
  }

  private enableDarkTheme(): void {
    this.renderer.addClass(document.body, 'dark-theme');
    this.isDarkTheme = true;
    localStorage.setItem('theme', 'dark');
  }

  private enableLightTheme(): void {
    this.renderer.removeClass(document.body, 'dark-theme');
    this.isDarkTheme = false;
    localStorage.setItem('theme', 'light');
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    // Используем window.location для надежности
    window.location.href = '/';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    this.showScrollTop = window.pageYOffset > 300;
  }
}
