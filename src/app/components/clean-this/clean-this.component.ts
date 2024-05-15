import { Component, ElementRef, HostListener, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import ollama, { GenerateResponse } from 'ollama/dist/browser';
import { Observable, finalize, from, mergeMap, scan } from 'rxjs';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { TabViewModule } from 'primeng/tabview';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { AnalysisSettings, AnalysisType } from './analyst-settings';
import { DropdownModule, DropdownChangeEvent } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-clean-this',
  standalone: true,
  imports: [
    FormsModule,
    InputTextareaModule,
    ButtonModule,
    TabViewModule,
    CommonModule,
    DividerModule,
    ButtonGroupModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
  ],
  templateUrl: './clean-this.component.html',
  styleUrl: './clean-this.component.scss',
})
export class AnalystsComponent {
  title = 'ollama-assist';
  output$: Observable<string[]> | undefined;
  loading = false;
  message = '';
  settings: AnalysisSettings[] = [
    {
        type: AnalysisType.Inclusivity,
        temperature: 0.7,
        top_p: 0.9,
        system: (numVersions, shouldExplain) => `Please analyze the following text for inclusivity and then provide ${numVersions} version${numVersions > 1 ? 's' : ''} of the revised text. ${this.getExplanationText(shouldExplain)} ${this.shouldFormatOutputAsJson ? this.getJsonOutputAddedToPrompt(this.outputSchema) : ''}`,
        examples: [
            'Each programmer should be able to demonstrate his ability to write clean code.',
            'Our company picnic will feature normal American food, so everyone can enjoy something familiar.',
            'Disabled people often need help to perform daily tasks.',
            'The scholarship fund was established to help disadvantaged urban youth overcome their challenges; these kids often come from backgrounds with limited opportunities.'
        ]
    },
    {
        type: AnalysisType.Grammar,
        temperature: 0.7,
        top_p: 0.9,
        system: (numVersions: number, shouldExplain: boolean) => 
          `Please correct the grammatical errors in the text below. Improve its readability and tone, ensuring it remains concise and friendly, while preserving the original sentiment. Please provide ${numVersions} version${numVersions > 1 ? 's' : ''} of the revised text. ${this.getExplanationText(shouldExplain)} ${this.shouldFormatOutputAsJson ? this.getJsonOutputAddedToPrompt(this.outputSchema) : ''}`,
        examples: [
            'Him and me was at the store yesterday, and we seen them things what you wanted.',
            'Why you ain\'t never listen to what I done told you?',
            'Them books is hers, ain\'t they?'
        ]
    },
    {
        type: AnalysisType.TechnicalAccuracy,
        temperature: 0.8,
        top_p: 0.9,
        system: (numVersions, shouldExplain) => 
          `Please verify and correct the technical accuracy of the text below, focusing on factual content and domain-specific information. Please provide ${numVersions} version${numVersions > 1 ? 's' : ''} of the revised text. ${this.getExplanationText(shouldExplain)} ${this.shouldFormatOutputAsJson ? this.getJsonOutputAddedToPrompt(this.outputSchema) : ''}`,
        examples: [
            'The sun revolves around the Earth, which is flat.',
            'You can safely open unknown email attachments if your antivirus is up to date.',
            'Adding salt to boiling water decreases its boiling point.'
        ]
    },
    {
        type: AnalysisType.Readability,
        temperature: 0.6,
        top_p: 0.9,
        system: (numVersions, shouldExplain) => `Please enhance the readability of the text below by simplifying complex sentences and clarifying vague expressions. Please provide ${numVersions} version${numVersions > 1 ? 's' : ''} of the revised text. ${this.getExplanationText(shouldExplain)} ${this.shouldFormatOutputAsJson ? this.getJsonOutputAddedToPrompt(this.outputSchema) : ''}`,
        examples: [
            'In light of the fact that we have been experiencing inclement weather, outdoor activities will be postponed.',
            'Utilization of robust methodologies will ensure alignment of core functionalities.',
            'It is incumbent upon stakeholders to facilitate dialogues pertaining to community engagements.'
        ]
    },
    {
        type: AnalysisType.Formality,
        temperature: 0.7,
        top_p: 0.8,
        system: (numVersions, shouldExplain) => `Please adjust the formality of the text below to suit a more formal or informal context as needed. Please provide ${numVersions} version${numVersions > 1 ? 's' : ''} of the revised text. ${this.getExplanationText(shouldExplain)} ${this.shouldFormatOutputAsJson ? this.getJsonOutputAddedToPrompt(this.outputSchema) : ''}`,
        examples: [
            'Hey, what’s up? Can’t wait to see ya!',
            'LOL, that was epic bro!',
            'Gonna grab some grub before the meeting.'
        ]
    }
  ];
  outputSchema = {
    analysis: {
      type: 'string',
      description: 'Analysis of the original Text.',
    },
    answers: [{
      newText: {
        type: 'string',
        desciption: 'The Revised text.',
      },
      explanation: {
        type: 'string',
        description: 'The explanation of the changes made.',
      }
      }]
  }
  analysisTypeValues = Object.values(AnalysisType);
  selectedSettings = this.settings.find(
    (setting) => setting.type === AnalysisType.Inclusivity
  );
  numVersionOptions: any[] = [
    { name: '3 Versions', value: 3 },
    { name: '2 Versions', value: 2 },
    { name: '1 Versions', value: 1 },
  ];
  numVersions: number = 2;
  hostElementHeight: number = 18;
  shouldExplainChanges = false;
  shouldFormatOutputAsJson = false;
  shouldStream = true;
  constructor(private elementRef: ElementRef) {}

  ngOnViewInit() {
    this.updateHostElementHeight();
    console.log(this.analysisTypeValues)
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateHostElementHeight();
  }

  private updateHostElementHeight() {
    this.hostElementHeight = window.innerHeight / 40;
  }

  private getExplanationText(shouldExplain: boolean) {
    return shouldExplain
      ? 'Explanations are required for those who may not understand the reasoning behind the changes and should be explained for a universal audience.'
      : 'No explanations are required.';
  }

  getJsonOutputAddedToPrompt(outputSchema: object) {
    return `Output in JSON using the schema defined here: ${JSON.stringify(outputSchema)}`;
  }

  send() {
    this.loading = true;
    this.output$ = this.shouldStream ?
    from(
      ollama.generate({
        model: 'llama3:8b',
        prompt: `${this.message}`,
        stream: true,
        format: this.shouldFormatOutputAsJson ? 'json' : undefined,
        system: this.selectedSettings?.system(this.numVersions, this.shouldExplainChanges, this.shouldFormatOutputAsJson),
        options: {
          temperature: this.selectedSettings?.temperature,
          top_p: this.selectedSettings?.top_p,
        },
      })
    ).pipe(
      mergeMap((promise) => from(promise)),
      scan<GenerateResponse, string[]>((acc, val) => {
        return [...acc, val.response];
      }, []),
      finalize(() => (this.loading = false))
    ) : from(
      ollama.generate({
        model: 'llama3:8b',
        prompt: `${this.message}`,
        stream: false,
        format: this.shouldFormatOutputAsJson ? 'json' : undefined,
        system: this.selectedSettings?.system(this.numVersions, this.shouldExplainChanges, this.shouldFormatOutputAsJson),
        options: {
          temperature: this.selectedSettings?.temperature,
          top_p: this.selectedSettings?.top_p,
        },
      })
    ).pipe(
      scan<GenerateResponse, string[]>((acc, val) => {
        return [...acc, val.response];
      }, []),
      finalize(() => (this.loading = false))
    );
  }

  onExample(example: string) {
    this.message = example;
  }

  onSettingsChange(event: DropdownChangeEvent) {
    this.updateSelectedSettings(event.value as AnalysisSettings);
  }

  private updateSelectedSettings(setting: AnalysisSettings) {
    const newSettings = this.settings.find(
      (s) => s.type === setting.type
    );
    if (newSettings) {
      this.selectedSettings = newSettings;
    }
  }

  foobar(event: any) {
    console.log(event)
  }
}
