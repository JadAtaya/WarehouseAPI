using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.CustomModels
{
    public class ForgotPasswordRequest
    {
        
        public string Email { get; set; } = string.Empty;
        
        
    }
}
