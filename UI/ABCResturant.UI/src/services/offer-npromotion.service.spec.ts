import { TestBed } from '@angular/core/testing';

import { OfferNPromotionService } from './offer-npromotion.service';

describe('OfferNPromotionService', () => {
  let service: OfferNPromotionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferNPromotionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
