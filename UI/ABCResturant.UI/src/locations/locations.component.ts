import { CommonModule } from '@angular/common';
import { Restuarant } from '../models/restuarants';
import { RestuarantService } from './../services/restuarant-services.service';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.css'
})
export class LocationsComponent implements OnInit{

  restuarants: Restuarant[] = [];

  constructor(private RestuarantService:RestuarantService){}
  ngOnInit(): void {
    this.RestuarantService.getRestuarants().subscribe(
      (Restuarants) => (this.restuarants = Restuarants)
    );
  }

}
