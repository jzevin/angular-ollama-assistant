import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MainMenuBarComponent } from './components/main-menu-bar/main-menu-bar.component';
import { NewLinePipe } from './services/new-line-pipe.pipe';
import { LocalChatStorageService } from './services/local-chat-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MainMenuBarComponent],
  providers: [LocalChatStorageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor() {
  }
}
