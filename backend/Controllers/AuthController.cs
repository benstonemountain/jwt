using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    // Demo adatbázis (memóriában)
    private static List<UserDto> _users = new List<UserDto>();

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] UserDto request)
    {
        // Egyszerűsített regisztráció (jelszó hash-elés nélkül a példa kedvéért)
        if (_users.Any(u => u.Username == request.Username))
            return BadRequest("A felhasználó már létezik.");

        _users.Add(request);
        return Ok("Sikeres regisztráció!");
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] UserDto request)
    {
        var user = _users.FirstOrDefault(u => u.Username == request.Username && u.Password == request.Password);
        if (user == null)
            return Unauthorized("Hibás felhasználónév vagy jelszó.");

        var token = GenerateToken(user);
        return Ok(new { token });
    }

    private string GenerateToken(UserDto user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class UserDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}