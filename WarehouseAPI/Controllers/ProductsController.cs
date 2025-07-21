using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using WarehouseAPI.CustomModels;
using WarehouseAPI.Data;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using Microsoft.AspNetCore.Http;
using System.IO;

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
        var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == id);

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
            Created_at = DateTime.UtcNow,
            IsDeleted = false // Always false on creation
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProductById), new { id = product.ProductId }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, ProductUpdate updatedProduct)
    {
        var existingProduct = await _context.Products.FindAsync(id);

        if (existingProduct == null || existingProduct.IsDeleted)
        {
            return NotFound(new { error = "Product not found." });
        }

        existingProduct.PName = updatedProduct.PName;
        existingProduct.Description = updatedProduct.Description;
        existingProduct.Price = updatedProduct.Price;
        existingProduct.Quantity = updatedProduct.Quantity;
        existingProduct.CompanyID = updatedProduct.CompanyID;
        existingProduct.CategoryID = updatedProduct.CategoryID;
        existingProduct.IsDeleted = updatedProduct.IsDeleted;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Product updated successfully." });
    }

    [HttpGet("GetProductJOINS")]
    public async Task<ActionResult<IEnumerable<ProductJOINS>>> GetProductJOINS()
    {
        var query = from p in _context.Products
                    join c in _context.Companies on p.CompanyID equals c.CompanyID
                    join pc in _context.Product_Categories on p.CategoryID equals pc.CategoryID
                    where !p.IsDeleted
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
                    where p.PName.Contains(pname) && !p.IsDeleted
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

    [HttpPut("{id}/isdeleted")]
    public async Task<IActionResult> UpdateProductIsDeleted(int id, [FromBody] ProductIsDeletedUpdate update)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { error = "Product not found." });
        }
        // Only update IsDeleted, do not remove from DB
        product.IsDeleted = update.IsDeleted;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Product IsDeleted updated to {update.IsDeleted}." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { error = "Product not found." });
        }
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Product deleted permanently." });
    }

    [HttpPost("{id}/upload-image")]
    public async Task<IActionResult> UploadProductImage(int id, IFormFile image)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null || product.IsDeleted)
        {
            return NotFound(new { error = "Product not found." });
        }
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { error = "No image file provided." });
        }
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);
        var fileName = $"product_{id}_{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }
        product.ImagePath = $"images/{fileName}";
        await _context.SaveChangesAsync();
        return Ok(new { message = "Image uploaded successfully.", imagePath = product.ImagePath });
    }
}