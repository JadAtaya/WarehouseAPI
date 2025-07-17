using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.Models
{
    
    public class Companies_POSTPUT
    {
        [Key]
       
        public string Company_Name { get; set; } = string.Empty;
        
    }
}
