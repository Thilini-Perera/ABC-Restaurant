using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ABCResturant.Models
{
    public class OfferNPromotion
    {
        public int Id { get; set; }
        public string Message { get; set; }
        public string Code { get; set; }
        public float Discount { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? OfferUntil { get; set; }
    }
}
