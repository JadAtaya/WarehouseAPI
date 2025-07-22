using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.CustomModels
{
    public class Login_HistoryPOST
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime Loggedin_at { get; set; }
        public bool IsActive { get; set; }
    }
}
