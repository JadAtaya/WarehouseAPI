using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Win32;
using MimeKit;
using System.Security.Cryptography;
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
    private readonly IConfiguration _configuration;

    public UsersController(WarehouseContext context, IOptions<EmailSettings> emailSettings, IConfiguration configuration)
    {
        _context = context;
        _emailSettings = emailSettings.Value;
        _configuration = configuration;
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
        Console.WriteLine($"[Register] Called for email: {register.Email}");
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
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes);
        var newUser = new Users
        {
            FirstName = register.FirstName,
            LastName = register.LastName,
            Email = register.Email,
            Password = register.Password,
            Created_at = DateTime.UtcNow,
            IsVerified = false,
            VerificationToken = token
        };
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();
        var baseUrl = _configuration["AppBaseUrl"];
        var verificationUrl = $"{baseUrl}/api/users/verify?token={token}";
        Console.WriteLine($"[Register] Sending verification link: {verificationUrl}");
        await SendEmailAsync(newUser.Email, "Verify your account", $"Click here to verify your account: {verificationUrl}");
        return Ok(new { message = "Registered successfully. Please check your email to verify your account." });
    }

    [HttpGet("verify")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        Console.WriteLine($"[VerifyEmail] Received token: {token}");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);
        if (user == null)
        {
            var allTokens = await _context.Users.Where(u => !u.IsVerified).Select(u => u.VerificationToken).ToListAsync();
            Console.WriteLine($"[VerifyEmail] Existing tokens for unverified users: {string.Join(", ", allTokens)}");
            return BadRequest(new { error = "Invalid or expired verification token." });
        }
        user.IsVerified = true;
        user.VerificationToken = null;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Email verified successfully. You can now log in." });
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

        if (!user.IsVerified)
        {
            return Unauthorized(new { error = "Please verify your email before logging in." });
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
        Console.WriteLine($"[SendEmailAsync] Sending email to: {toEmail}, subject: {subject}");
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
    }

    public class SendVerificationLinkRequest
    {
        public string Email { get; set; }
    }

    [HttpPost("SendVerificationLink")]
    public async Task<IActionResult> SendVerificationLink([FromBody] SendVerificationLinkRequest request)
    {
        Console.WriteLine($"[SendVerificationLink] Called for email: {request.Email}");
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { error = "Email is required." });
        }
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return NotFound(new { error = "User not found." });
        }
        if (user.IsVerified)
        {
            return BadRequest(new { error = "User is already verified." });
        }
        // Generate new token
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes);
        user.VerificationToken = token;
        await _context.SaveChangesAsync();
        var baseUrl = _configuration["AppBaseUrl"];
        var verificationUrl = $"{baseUrl}/api/users/verify?token={token}";
        Console.WriteLine($"[SendVerificationLink] Sending verification link: {verificationUrl}");
        await SendEmailAsync(user.Email, "Verify your account", $"Click here to verify your account: {verificationUrl}");
        return Ok(new { message = "Verification link sent to your email." });
    }

    public class CheckEmailVerifiedRequest
    {
        public string Email { get; set; }
    }

    [HttpPost("CheckEmailVerified")]
    public async Task<IActionResult> CheckEmailVerified([FromBody] CheckEmailVerifiedRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { error = "Email is required." });
        }
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return NotFound(new { error = "User not found." });
        }
        return Ok(new { isVerified = user.IsVerified });
    }

    [HttpPost("SendVerificationLinksToUnverified")]
    public async Task<IActionResult> SendVerificationLinksToUnverified()
    {
        var baseUrl = _configuration["AppBaseUrl"];
        var unverifiedUsers = await _context.Users
            .Where(u => !u.IsVerified)
            .ToListAsync();
        int sentCount = 0;
        foreach (var user in unverifiedUsers)
        {
            if (string.IsNullOrEmpty(user.VerificationToken))
            {
                var tokenBytes = RandomNumberGenerator.GetBytes(32);
                var token = Convert.ToBase64String(tokenBytes);
                user.VerificationToken = token;
                var verificationUrl = $"{baseUrl}/api/users/verify?token={token}";
                await SendEmailAsync(user.Email, "Verify your account", $"Click here to verify your account: {verificationUrl}");
                sentCount++;
            }
        }
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Verification links sent to {sentCount} unverified users." });
    }
}

