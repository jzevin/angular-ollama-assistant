import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalChatComponent } from './local-chat.component';

describe('LocalChatComponent', () => {
  let component: LocalChatComponent;
  let fixture: ComponentFixture<LocalChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocalChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
