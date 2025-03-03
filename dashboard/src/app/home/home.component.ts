// home.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  stockData = [
    { symbol: 'AAPL', price: 182.63, change: 1.25 },
    { symbol: 'MSFT', price: 417.42, change: -2.31 },
    { symbol: 'GOOGL', price: 162.21, change: 0.89 },
    { symbol: 'AMZN', price: 183.75, change: -0.45 }
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const header = document.querySelector('.header-container') as HTMLElement;
    if (window.scrollY > 20) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  }

  ngOnInit() {
    this.animateStockTicker();
  }

  animateStockTicker() {
    // Animation is handled via CSS
  }
}
