namespace WarehouseAPI.Models
{
    public class Product
    {
        public int ProductId { get; set; } 
        public string PName { get; set; } 
        public string Description { get; set; }
        public int CompanyID { get; set; }
        public int CategoryID { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public DateTime Created_at { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? ImagePath { get; set; } // Path to product image
    }
}
