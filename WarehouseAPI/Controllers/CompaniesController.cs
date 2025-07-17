using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Data;
using WarehouseAPI.Models;

namespace WarehouseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly WarehouseContext _context;

    public CompaniesController(WarehouseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Companies>>> GetCompanies()
    {
        return await _context.Companies.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Companies>> PostCompany(Companies_POSTPUT companyModel)
    {
        if (string.IsNullOrWhiteSpace(companyModel.Company_Name))
        {
            return BadRequest(new { error = "Company name is required." });
        }
        var company = new Companies
        {
            Company_Name = companyModel.Company_Name,
            Created_at = DateTime.UtcNow
        };
        _context.Companies.Add(company);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCompanies), new { id = company.CompanyID }, company);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCompany(int id, Companies_POSTPUT updatedCompanyModel)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null)
        {
            return NotFound(new { error = "Company not found." });
        }
        if (string.IsNullOrWhiteSpace(updatedCompanyModel.Company_Name))
        {
            return BadRequest(new { error = "Company name is required." });
        }
        company.Company_Name = updatedCompanyModel.Company_Name;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Company updated successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null)
        {
            return NotFound(new { error = "Company not found." });
        }
        _context.Companies.Remove(company);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Company deleted successfully." });
    }
}
