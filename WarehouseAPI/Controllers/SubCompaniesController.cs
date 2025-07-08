using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Data;
using WarehouseAPI.Models;

namespace WarehouseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubCompaniesController : ControllerBase
{
    private readonly WarehouseContext _context;

    public SubCompaniesController(WarehouseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubCompanies>>> GetSubCompanies()
    {
        return await _context.SubCompanies.ToListAsync();
    }
}
