using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using WarehouseAPI.CustomModels;
using WarehouseAPI.Data;
using WarehouseAPI.Data;
using WarehouseAPI.Models;

namespace WarehouseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly WarehouseContext _context;

    public ProductsController(WarehouseContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products.ToListAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProductById(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            return NotFound(new { error = "Product not found." });
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct(ProductPost newproduct)
    {
        if (string.IsNullOrWhiteSpace(newproduct.PName) || string.IsNullOrWhiteSpace(newproduct.Description) || newproduct.CompanyID <= 0 || newproduct.CategoryID <= 0 || newproduct.Quantity <= 0 || newproduct.Price <= 0)
        {
            return BadRequest(new { error = "All fields are required and must be valid (non-empty, non-zero, and non-negative)." });
        }

        var product = new Product
        {
            PName = newproduct.PName,
            Description = newproduct.Description,
            CompanyID = newproduct.CompanyID,
            CategoryID = newproduct.CategoryID,
            Quantity = newproduct.Quantity,
            Price = newproduct.Price,
            Created_at = DateTime.UtcNow // Ensure correct creation time
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProductById), new { id = product.ProductId }, product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
        .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            return NotFound(new { error = "Product not found." });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully." });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, ProductUpdate updatedProduct)
    {
        var existingProduct = await _context.Products.FindAsync(id);

        if (existingProduct == null)
        {
            return NotFound(new { error = "Product not found." });
        }

        existingProduct.PName = updatedProduct.PName;
        existingProduct.Description = updatedProduct.Description;
        existingProduct.Price = updatedProduct.Price;
        existingProduct.Quantity = updatedProduct.Quantity;
        existingProduct.CompanyID = updatedProduct.CompanyID;
        existingProduct.CategoryID = updatedProduct.CategoryID;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Product updated successfully." });
    }

    [HttpGet("GetProductJOINS")]
    public async Task<ActionResult<IEnumerable<ProductJOINS>>> GetProductJOINS()
    {
        var query = from p in _context.Products
                    join c in _context.Companies on p.CompanyID equals c.CompanyID
                    join pc in _context.Product_Categories on p.CategoryID equals pc.CategoryID
                    select new ProductJOINS
                    {
                        ProductId = p.ProductId,
                        PName = p.PName,
                        Description = p.Description,
                        Company_Name = c.Company_Name,
                        Prod_CategoryName = pc.Prod_CategoryName
                    };

        return Ok(await query.ToListAsync());
    }

    [HttpGet("GetProductJOINSByPName/{pname}")]
    public async Task<ActionResult<ProductJOINS>> GetProductJOINSByPName(string pname)
    {
        var query = from p in _context.Products
                    join c in _context.Companies on p.CompanyID equals c.CompanyID
                    join pc in _context.Product_Categories on p.CategoryID equals pc.CategoryID
                    where p.PName.Contains(pname)
                    select new ProductJOINS
                    {
                        ProductId = p.ProductId,
                        PName = p.PName,
                        Description = p.Description,
                        Company_Name = c.Company_Name,
                        Prod_CategoryName = pc.Prod_CategoryName
                    };

        var result = await query.FirstOrDefaultAsync();

        if (result == null)
        {
            return NotFound(new { error = "Product not found." });
        }

        return Ok(result);
    }

}