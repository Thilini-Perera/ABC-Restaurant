using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace ABCResturant.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ReservationType
    {
        NONE,
        DINEIN,
        DELIVERY
    }


    public class Reservation
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ReservationdOn { get; set; }
        public bool IsApproved { get; set; }
        public int? NumberOfPeople { get; set; }
        public ReservationType ReservationType { get; set; }
        public User User { get; set; }
        public int UserId { get; set; }
        public ICollection<RestuarantReservation>? RestuarantReservations { get; set; }
    }
}
