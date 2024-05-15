import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'zevai-main-menu-bar',
  standalone: true,
  imports: [MenubarModule],
  templateUrl: './main-menu-bar.component.html',
  styleUrl: './main-menu-bar.component.scss',
})
export class MainMenuBarComponent {
  items: MenuItem[] | undefined;
  ngOnInit() {
    this.items = [
      {
        label: 'Analysts',
        icon: 'pi pi-bolt',
        routerLink: '/analysts',
      },
      {
        label: 'Local Chat',
        icon: 'pi pi-star',
        routerLink: '/local-chat',
      }
    ];
  }
}
