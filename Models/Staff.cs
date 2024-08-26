namespace ABCResturant.Models
{
    public class Staff : User
    {
        public int WorkingRestaurantID { get; set; }
        public Restuarant WorkingRestaurant { get; set; }
    }
}
