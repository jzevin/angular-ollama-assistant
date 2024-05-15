import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown2html',
  standalone: true
})
export class Markdown2htmlPipe implements PipeTransform {

  transform(value: string): string{
    if (value && value.length > 0) {
      return marked(value) as string;
    }
    return value;
  }

}
