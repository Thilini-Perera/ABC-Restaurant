using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ABCResturant.Models
{
    public class Services
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedOn { get; set; }
        public Restuarant? Restuarant { get; set; }
        public int RestuarantId { get; set; }
    }
}
