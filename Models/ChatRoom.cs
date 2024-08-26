namespace ABCResturant.Models
{
    public class ChatRoom
    {
        public int Id { get; set; }
        public List<CustomerResponse> CustomerResponses { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }

    }
}
