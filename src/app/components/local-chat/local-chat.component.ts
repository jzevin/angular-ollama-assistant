import { Component, ElementRef, ViewChild } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BehaviorSubject, Observable, last } from 'rxjs';
import { CommonModule } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import ollama, { ChatRequest } from 'ollama/dist/browser';
import { FormsModule } from '@angular/forms';
import { NewLinePipe } from '../../services/new-line-pipe.pipe';
import { Markdown2htmlPipe } from '../../services/markdown2html.pipe';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { LocalChatMessage, LocalChatViewModel } from '../../models/local-chat.model';
import { LocalChatStorageService } from '../../services/local-chat-storage.service';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'zevai-local-chat',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    NewLinePipe,
    Markdown2htmlPipe,
    DropdownModule,
    CheckboxModule,
    FileUploadModule,
    SidebarModule
  ],
  templateUrl: './local-chat.component.html',
  styleUrl: './local-chat.component.scss',
})
export class LocalChatComponent {
  @ViewChild('promptInput') promptInput:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('fileInput') fileInput: | ElementRef<HTMLInputElement> | undefined;
  viewModel$: BehaviorSubject<LocalChatViewModel> =
    new BehaviorSubject<LocalChatViewModel>({
      messages: [],
      prompt: '',
      loading: false,
      selectedModel: 'llama3:8b',
      shouldAnswerAsMarkdown: false,
    });
  currentAttachment: string | null = null;

  modelSelections = [
    {
      name: 'llama3:8b',
      code: 'llama3:8b'
    },
    {
      name: 'llama2:13b',
      code: 'llama2:13b'
    },
    {
      name: 'gemma:latest',
      code: 'gemma:latest'
    },
    {
      name: 'mistral:latest',
      code: 'mistral:latest'
    },
    {
      name: 'moondream:latest',
      code: 'moondream:latest'
    }
  ];

  isSidebarVisible = false;

  constructor(private elementRef: ElementRef, private localChatStorageService: LocalChatStorageService ) {}

  ngAfterViewInit(): void {
    this.promptInput?.nativeElement.focus();
  }

  onSend(): void {
    const prompt = this.viewModel$.value.prompt;
    const currentAttachment = this.currentAttachment;
    const messages: LocalChatMessage[] = [...this.viewModel$.value.messages, { content: prompt, role: 'user', timestamp: new Date(), images: currentAttachment ? [currentAttachment as string] : []}];
    const selectedModel = this.viewModel$.value.selectedModel;
    const shouldAnswerAsMarkdown = this.viewModel$.value.shouldAnswerAsMarkdown;
    this.viewModel$.next({ messages, prompt: '', loading: true, selectedModel, shouldAnswerAsMarkdown: this.viewModel$.value.shouldAnswerAsMarkdown});
    this.currentAttachment = null;
    setTimeout(() => {
      this.scrollToBottomOfMessages();
    }, 10);
    ollama
      .chat({
        model: selectedModel,
        messages: [
          ...messages.slice(0, -1),
          { content: `${prompt} ${shouldAnswerAsMarkdown ? '-- Answer as markdown if it is warranted' : ''}`, role: 'user', images: currentAttachment ? [currentAttachment as string] : []},
        ],
      })
      .then((response) => {
        const newMessages: LocalChatMessage[] = [
          ...messages,
          {
            content: response.message.content,
            role: response.message.role as 'assistant',
            timestamp: new Date(),
          },
        ];
        this.viewModel$.next({
          messages: newMessages,
          prompt: '',
          loading: false,
          selectedModel,
          shouldAnswerAsMarkdown: this.viewModel$.value.shouldAnswerAsMarkdown,
        })
      
        setTimeout(() => {
          this.promptInput?.nativeElement.focus();
          this.scrollToBottomOfMessages();
        }, 10);
      })
      .finally(() => {
        this.viewModel$.next({ ...this.viewModel$.value, loading: false });
        // Clear the file input value
        if (this.fileInput && this.fileInput.nativeElement) {
          this.fileInput.nativeElement.value = '';
        }
      });
  }

  newChat(): void {
    this.saveChat();
    this.viewModel$.next({ messages: [], prompt: '', loading: false, selectedModel: this.viewModel$.value.selectedModel, shouldAnswerAsMarkdown: this.viewModel$.value.shouldAnswerAsMarkdown});
    setTimeout(() => this.promptInput?.nativeElement.focus(), 10);
  }

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result;
        this.currentAttachment = (dataUrl as string).split(',')[1];
      };
      // reader.readAsArrayBuffer(selectedFile);
      reader.readAsDataURL(selectedFile);
    }
  }

  onUpload(event: any) {
    this.fileInput?.nativeElement.click();
  }

  scrollToBottomOfMessages(): void {
    const messages = this.elementRef.nativeElement.querySelectorAll('.message-wrap');
    const lastMessage = messages[messages.length - 1];
    lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  toDataUrl(base64String: string | Uint8Array ): string {
    return `data:image/jpeg;base64,${base64String}`;
  }

  loadChat(messageTimestamp: Date | string): void {
    if ( messageTimestamp instanceof Date) {
      messageTimestamp = messageTimestamp.toISOString();
    }
    const key = this.localChatStorageService.getKetPrefix() + messageTimestamp;
    const chat = this.localChatStorageService.getChatState(key) as LocalChatViewModel;
    
    this.viewModel$.next(chat);
  }

  saveChat(): void {
    if (this.viewModel$.value.messages.length === 0 ) {
      return;
    }
    const prefix = this.localChatStorageService.getKetPrefix();
    const date = this.viewModel$.value.messages[this.viewModel$.value.messages.length - 1].timestamp
    const key = date.toISOString ? prefix + date.toISOString() : prefix + date;
    if (this.checkIfChatIsSaved(key)) {
      this.localChatStorageService.saveChatState(this.viewModel$.value);
    }
    this.localChatStorageService.saveChatState(this.viewModel$.value);
  }

  getAllChats(): LocalChatViewModel[] {
    return this.localChatStorageService.getAllChatStates();
  }

  checkIfChatIsSaved(key: string): boolean {
    return !!this.localChatStorageService.getChatState(key);
  }
}
