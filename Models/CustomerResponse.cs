using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ABCResturant.Models
{
    public enum CustomerResponseType
    {
        NONE,
        QUERY,
        RESPONSE
    }

    public class CustomerResponse
    {
        public int Id { get; set; }
        public string Response { get; set; }
        public CustomerResponseType CustomerResponseType { get; set; }
        public DateTime CreatedOn { get; set; }

        public User User { get; set; }
        public int UserId { get; set; }
        public ChatRoom ChatRoom { get; set; }
        public int ChatRoomId { get; set; }
    }
}
