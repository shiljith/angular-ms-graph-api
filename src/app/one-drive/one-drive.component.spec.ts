import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneDriveComponent } from './one-drive.component';

describe('OneDriveComponent', () => {
  let component: OneDriveComponent;
  let fixture: ComponentFixture<OneDriveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneDriveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneDriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
