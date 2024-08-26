namespace ABCResturant.Models
{
    public class Gallery
    {
        public long Id { get; set; }
        public string Path { get; set; }
        public Restuarant Restuarant { get; set; }
        public int RestuarantId { get; set; }
    }
}
