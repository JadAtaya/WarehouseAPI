using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.CustomModels
{
    public class UserEmailVerification
    {
        public int UserID { get; set; }
        public string Email { get; set; }
        public bool IsVerified { get; set; }
        public string VerificationToken { get; set; }
    }
}
