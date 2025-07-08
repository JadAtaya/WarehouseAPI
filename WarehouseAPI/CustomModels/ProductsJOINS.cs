using System.ComponentModel.DataAnnotations;

namespace WarehouseAPI.CustomModels
{
    public class ProductJOINS
    {
        [Key]
        public int ProductId { get; set; }
        public string PName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Company_Name { get; set; } = string.Empty;
        public string Prod_CategoryName { get; set; } = string.Empty;
    }
}
