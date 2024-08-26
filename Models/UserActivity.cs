namespace ABCResturant.Models
{
    public class UserActivity
    {
        public long Id { get; set; }
        public string Activity { get; set; }
        public User? User { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
