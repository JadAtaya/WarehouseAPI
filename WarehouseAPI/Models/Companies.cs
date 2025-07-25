﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseAPI.Models
{
    [Table("Companies")]
    public class Companies
    {
        [Key]
        public int CompanyID { get; set; }
        public string Company_Name { get; set; }
        public DateTime Created_at { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
