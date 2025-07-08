using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WarehouseAPI.Models
{
    [Table("SubCompanies")]
    public class SubCompanies
    {   
        [Key]
        public int SubID { get; set; }
        public int CompanyID { get; set; }
        public string Sub_Name { get; set; } = string.Empty;
        public DateTime Created_at { get; set; }
    }
}