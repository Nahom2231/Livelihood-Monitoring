import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the livelihoods landing page', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Better data.');
    expect(compiled.querySelector('a[href="#capabilities"]')).toBeTruthy();
    expect(compiled.querySelectorAll('#livelihoods article')).toHaveLength(6);
    expect(compiled.querySelector('#livelihoods img[alt="Sheep grazing in a green pasture"]')).toBeTruthy();
    expect(compiled.querySelector('section#capabilities')).toBeTruthy();
  });
});
