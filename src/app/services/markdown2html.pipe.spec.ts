import { Markdown2htmlPipe } from './markdown2html.pipe';

describe('Markdown2htmlPipe', () => {
  it('create an instance', () => {
    const pipe = new Markdown2htmlPipe();
    expect(pipe).toBeTruthy();
  });
});
