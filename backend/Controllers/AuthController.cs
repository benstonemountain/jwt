using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization; // Ezt add hozzá a using-okhoz a fájl tetején!

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
        {
            if (_users.Any(u => u.Username == request.Username))
                return Conflict("A felhasználó már létezik.");

            _users.Add(request);

            // 🔑 TOKEN GENERÁLÁS REGISZTRÁCIÓ UTÁN
            var token = GenerateToken(request);

            return Ok(new { token });
        }

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
    [JsonPropertyName("username")] // Megmondjuk, hogy a JSON-ben "username" lesz
    public required string Username { get; set; }

    [JsonPropertyName("password")] // Megmondjuk, hogy a JSON-ben "password" lesz
    public required string Password { get; set; }
}