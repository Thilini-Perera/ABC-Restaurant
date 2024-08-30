import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestuarantsComponent } from './restuarants.component';

describe('RestuarantsComponent', () => {
  let component: RestuarantsComponent;
  let fixture: ComponentFixture<RestuarantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestuarantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestuarantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
