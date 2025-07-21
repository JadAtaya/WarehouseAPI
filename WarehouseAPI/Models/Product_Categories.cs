using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.Models
{

    [Table("Product_Categories")]

    public class Product_Categories
    {


        [Key]
        public int CategoryID { get; set; }
        public string Prod_CategoryName { get; set; }
        public DateTime Created_at { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
