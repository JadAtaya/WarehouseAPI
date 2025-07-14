using Microsoft.EntityFrameworkCore;
using WarehouseAPI.CustomModels;
using WarehouseAPI.Models;

namespace WarehouseAPI.Data
{
    public class WarehouseContext : DbContext
    {
        public WarehouseContext(DbContextOptions<WarehouseContext> options) : base(options) { }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Companies> Companies => Set<Companies>();
        public DbSet<Users> Users => Set<Users>(); 
        public DbSet<GetSingleUser> GetoneUsers => Set<GetSingleUser>();
        public DbSet<Product_Categories> Product_Categories => Set<Product_Categories>();
        public DbSet<SubCompanies> SubCompanies => Set<SubCompanies>();
        public DbSet<ProductJOINS> ProductJOINS => Set<ProductJOINS>();
        public DbSet<ProductPost> ProductPost => Set<ProductPost>();
    }


}
