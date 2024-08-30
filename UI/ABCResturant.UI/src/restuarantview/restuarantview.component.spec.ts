import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestuarantviewComponent } from './restuarantview.component';

describe('RestuarantviewComponent', () => {
  let component: RestuarantviewComponent;
  let fixture: ComponentFixture<RestuarantviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestuarantviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestuarantviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
