using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.CustomModels;
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

    [HttpPost]
    public async Task<ActionResult<Product_Categories>> PostProductCategory(Product_Categories_POSTPUT categoryModel)
    {
        if (string.IsNullOrWhiteSpace(categoryModel.Prod_CategoryName))
        {
            return BadRequest(new { error = "Category name is required." });
        }
        var category = new Product_Categories
        {
            Prod_CategoryName = categoryModel.Prod_CategoryName,
            Created_at = DateTime.UtcNow,
            IsDeleted = categoryModel.IsDeleted
        };
        _context.Product_Categories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduct_Categories), new { id = category.CategoryID }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutProductCategory(int id, Product_Categories_POSTPUT updatedCategoryModel)
    {
        var category = await _context.Product_Categories.FindAsync(id);
        if (category == null || category.IsDeleted)
        {
            return NotFound(new { error = "Category not found." });
        }
        if (string.IsNullOrWhiteSpace(updatedCategoryModel.Prod_CategoryName))
        {
            return BadRequest(new { error = "Category name is required." });
        }
        category.Prod_CategoryName = updatedCategoryModel.Prod_CategoryName;
        category.IsDeleted = updatedCategoryModel.IsDeleted;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Category updated successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductCategory(int id)
    {
        var category = await _context.Product_Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound(new { error = "Category not found." });
        }
        _context.Product_Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Category deleted permanently." });
    }

    [HttpPut("{id}/isdeleted")]
    public async Task<IActionResult> UpdateCategoryIsDeleted(int id, [FromBody] CategoryIsDeletedUpdate update)
    {
        var category = await _context.Product_Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound(new { error = "Category not found." });
        }
        category.IsDeleted = update.IsDeleted;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Category IsDeleted updated to {update.IsDeleted}." });
    }
}
