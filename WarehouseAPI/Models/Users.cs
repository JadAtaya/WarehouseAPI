﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WarehouseAPI.Models
{

    [Table("Users")]

    public class Users
    {

        [Key]
        public int UserID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime Created_at { get; set; }
        public bool IsVerified { get; set; } = false;
        public string? VerificationToken { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? ImagePath { get; set; } // Path to user image
    }
}
