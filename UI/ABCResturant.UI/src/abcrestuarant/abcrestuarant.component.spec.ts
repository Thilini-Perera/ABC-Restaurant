import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbcrestuarantComponent } from './abcrestuarant.component';

describe('AbcrestuarantComponent', () => {
  let component: AbcrestuarantComponent;
  let fixture: ComponentFixture<AbcrestuarantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbcrestuarantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbcrestuarantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
