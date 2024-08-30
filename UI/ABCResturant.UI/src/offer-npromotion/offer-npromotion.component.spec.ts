import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferNPromotionComponent } from './offer-npromotion.component';

describe('OfferNPromotionComponent', () => {
  let component: OfferNPromotionComponent;
  let fixture: ComponentFixture<OfferNPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferNPromotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferNPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
