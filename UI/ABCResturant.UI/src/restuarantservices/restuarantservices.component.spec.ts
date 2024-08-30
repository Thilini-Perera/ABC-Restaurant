import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestuarantservicesComponent } from './restuarantservices.component';

describe('RestuarantservicesComponent', () => {
  let component: RestuarantservicesComponent;
  let fixture: ComponentFixture<RestuarantservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestuarantservicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestuarantservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
