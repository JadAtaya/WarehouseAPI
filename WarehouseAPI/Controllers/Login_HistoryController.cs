using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.CustomModels;

namespace WarehouseApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Login_HistoryController : ControllerBase
    {
        private readonly WarehouseContext _context;
        public Login_HistoryController(WarehouseContext context)
        {
            _context = context;
        }

        // GET: api/Login_History
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Login_History>>> GetLoginHistory()
        {
            var history = await _context.Login_History.ToListAsync();
            return Ok(history);
        }

        // POST: api/Login_History
        [HttpPost]
        public async Task<ActionResult<Login_History>> PostLoginHistory([FromBody] Login_HistoryPOST loginHistoryPost)
        {
            if (loginHistoryPost == null)
                return BadRequest();
            var loginHistory = new Login_History
            {
                UserID = loginHistoryPost.UserID,
                Username = loginHistoryPost.Username,
                Loggedin_at = loginHistoryPost.Loggedin_at,
                IsActive = loginHistoryPost.IsActive
            };
            _context.Login_History.Add(loginHistory);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLoginHistory), new { id = loginHistory.Id }, loginHistory);
        }
    }
}

