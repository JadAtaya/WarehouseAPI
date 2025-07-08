using System.ComponentModel.DataAnnotations;

namespace WarehouseAPI.CustomModels
{
    public class ProductPost
    {
        [Key]

        
        public string PName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CompanyID { get; set; }
        public int CategoryID { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
       
    }
}
