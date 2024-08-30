import { CommonModule } from '@angular/common';
import { OfferNPromotion } from './../models/OfferNPromotion';
import { OfferNPromotionService } from './../services/offer-npromotion.service';
import { Component, OnInit, inject } from '@angular/core';

@Component({
  selector: 'app-offerpromoview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offerpromoview.component.html',
  styleUrl: './offerpromoview.component.css'
})
export class OfferpromoviewComponent implements OnInit {
offerpromos: OfferNPromotion[] =[];

  constructor(private OfferNPromotionService:OfferNPromotionService){}

  ngOnInit(): void {
    this.OfferNPromotionService.getOfferNPromotions().subscribe(
      (OfferPromos) => (this.offerpromos = OfferPromos)
    );
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}
