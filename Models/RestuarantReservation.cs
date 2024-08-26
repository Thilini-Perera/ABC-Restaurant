namespace ABCResturant.Models
{
    public class RestuarantReservation
    {
        public Restuarant Restuarant { get; set; }
        public int RestuarantId { get; set; }
        public Reservation Reservation { get; set; }
        public int ReservationId { get; set;}
    }
}
