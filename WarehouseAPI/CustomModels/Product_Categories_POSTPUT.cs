using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.Models
{


    public class Product_Categories_POSTPUT
    {


        [Key]
        
        public string Prod_CategoryName { get; set; } = string.Empty;
       
    }
}
