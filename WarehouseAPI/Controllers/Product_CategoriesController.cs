using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Data;
using WarehouseAPI.Models;

namespace WarehouseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Product_CategoriesController : ControllerBase
{
    private readonly WarehouseContext _context;

    public Product_CategoriesController(WarehouseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product_Categories>>> GetProduct_Categories()
    {
        return await _context.Product_Categories.ToListAsync();
    }
}
