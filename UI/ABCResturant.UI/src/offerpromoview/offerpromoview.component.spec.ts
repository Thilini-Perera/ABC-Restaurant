import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferpromoviewComponent } from './offerpromoview.component';

describe('OfferpromoviewComponent', () => {
  let component: OfferpromoviewComponent;
  let fixture: ComponentFixture<OfferpromoviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferpromoviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferpromoviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
