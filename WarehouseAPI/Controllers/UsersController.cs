using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Win32;
using MimeKit;
using System.Text.RegularExpressions;
using WarehouseAPI.CustomModels;
using WarehouseAPI.Data;
using WarehouseAPI.Data;
using WarehouseAPI.Models;

namespace WarehouseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly WarehouseContext _context;
    private readonly EmailSettings _emailSettings;

    public UsersController(WarehouseContext context, IOptions<EmailSettings> emailSettings)
    {
        _context = context;
        _emailSettings = emailSettings.Value;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Users>>> GetUsers()
    {
        
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [HttpGet("GetSingleUser/{Email}")]
    public async Task<ActionResult<GetSingleUser>> GetSingleUser(string Email)
    {
        var user = await _context.Users
            .Where(u => u.Email == Email)
            .Select(u => new GetSingleUser
            {
                UserID = u.UserID,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { error = "User not found." });
        }

        return Ok(user);
    }

    [HttpGet("CheckEmail")]
    public async Task<ActionResult<bool>> CheckIfEmailExists([FromQuery] string Email)
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            return BadRequest(new { error = "Email is required." });
        }

        if (!Email.Contains("@"))
        {
            return BadRequest(new { error = "Invalid email address" });
        }

        bool exists = await _context.Users.AnyAsync(u => u.Email == Email);

        return Ok(new { exists });
    }

    [HttpPost("Register")]
    public async Task<ActionResult<string>> Register([FromBody] Register register)
    {
        if (string.IsNullOrWhiteSpace(register.Email) ||
            string.IsNullOrWhiteSpace(register.Password) ||
            string.IsNullOrWhiteSpace(register.FirstName) ||
            string.IsNullOrWhiteSpace(register.LastName))
        {
            return BadRequest(new { error = "All fields are required" });
        }

        if (!IsValidEmail(register.Email))
        {
            return BadRequest(new { error = "Invalid email address" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == register.Email);

        if (user != null)
        {
            return BadRequest(new { error = "Email already exists." });
        }

        var newUser = new Users
        {
            FirstName = register.FirstName,
            LastName = register.LastName,
            Email = register.Email,
            Password = register.Password
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registered successfully." });
    }

    private bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        
        string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, pattern, RegexOptions.IgnoreCase);
    }

    [HttpPost("Login")]
    public async Task<ActionResult<string>> Login([FromBody] WarehouseAPI.CustomModels.LoginRequest loginRequest)
    {
        if (string.IsNullOrWhiteSpace(loginRequest.Email) || string.IsNullOrWhiteSpace(loginRequest.Password))
        {
            return BadRequest(new { error = "Email and password are required" });
        }

        if (!loginRequest.Email.Contains("@") || !loginRequest.Email.Contains("."))
        {
            return BadRequest(new { error = "Invalid email address" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

        if (user == null)
        {
            return BadRequest(new { error = "Email does not exist." });
        }

        if (user.Password != loginRequest.Password)
        {
            return BadRequest(new { error = "Invalid password." });
        }

        return Ok(new { message = "Login successful." });
    }

    [HttpDelete("{Email}")]
    public async Task<IActionResult> DeleteProduct(string Email)
    {
        var User = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == Email);

        if (User == null)
        {
            return NotFound(new { error = "User not found." });
        }

        _context.Users.Remove(User);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully." });
    }

    [HttpPost("ForgotPassword")]
    public async Task<ActionResult<string>> ForgotPassword([FromBody] Microsoft.AspNetCore.Identity.Data.ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { error = "Email is required." });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return BadRequest(new { error = "Email does not exist." });
        }

       
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&";
        var stringChars = new char[6];
        var random = new Random();

        for (int i = 0; i < stringChars.Length; i++)
        {
            stringChars[i] = chars[random.Next(chars.Length)];
        }

        var newPassword = new String(stringChars);

        
        user.Password = newPassword;

        await _context.SaveChangesAsync();

        await SendEmailAsync(user.Email, "Password Reset",$"Your new password is: {newPassword}");

        return Ok(new { message = "A new password has been sent to your email." });
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_emailSettings.SenderEmail));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Plain) { Text = body };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
        smtp.DisconnectAsync(true);
    }
}

