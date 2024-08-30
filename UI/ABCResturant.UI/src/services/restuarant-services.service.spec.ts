import { TestBed } from '@angular/core/testing';

import { RestuarantService } from './restuarant-services.service';

describe('RestuarantServicesService', () => {
  let service: RestuarantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestuarantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
