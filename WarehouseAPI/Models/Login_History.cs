using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.Models
{
    [Table("Login_History")]
    public class Login_History
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime Loggedin_at { get; set; }
        public bool IsActive { get; set; }
    }
}
