using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ABCResturant.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public float Total { get; set; }
        public User? User { get; set; }
        public int UserId { get; set; }
        public Restuarant? Restuarant { get; set; }
        public int RestuarantId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
    }
}
