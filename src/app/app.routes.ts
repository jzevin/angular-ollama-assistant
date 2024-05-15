import { Routes } from '@angular/router';
import { AnalystsComponent } from './components/clean-this/clean-this.component';
import { LocalChatComponent } from './components/local-chat/local-chat.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'local-chat'
    },
    {
        path: 'analysts',
        pathMatch: 'full',
        component: AnalystsComponent
    },
    {
        path: 'local-chat',
        pathMatch: 'full',
        component: LocalChatComponent
    }
];
