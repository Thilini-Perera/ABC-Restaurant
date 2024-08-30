using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ABCResturant.Models
{
    public class Restuarant
    {
        public int Id { get; set; }
        public int MaxReservations { get; set; }
        public int CurrentReservations { get; set; }
        public float CurrentRate { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string Telephone { get; set; }
        public List<User>? Users { get; set; }
        public List<Gallery>? Galleries { get; set; }
        public List<Payment>? Payments { get; set; }
        public List<Services>? Services { get; set; }
        public ICollection<RestuarantReservation>? RestuarantReservations { get; set; }
    }
}
