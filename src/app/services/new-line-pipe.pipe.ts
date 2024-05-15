import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newLinePipe',
  standalone: true,
})
export class NewLinePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/::nl::?/g, '\n');
  }
}
