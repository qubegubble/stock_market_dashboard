import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import {HeaderComponent} from './header/header.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    HeaderComponent,
    RouterOutlet
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('headerContainer') headerContainer!: ElementRef;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 20) {
      this.headerContainer.nativeElement.classList.add('sticky');
    } else {
      this.headerContainer.nativeElement.classList.remove('sticky');
    }
  }
}
