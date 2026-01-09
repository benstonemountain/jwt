using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private static List<UserDto> _users = new List<UserDto>();

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] UserDto request)
    {
        if (_users.Any(u => u.Username == request.Username))
            return Conflict("A felhasználó már létezik.");

        request.Role = request.Username.ToLower() == "admin" ? "admin" : "user";
        _users.Add(request);

        var token = GenerateToken(request);

        // Süti beállítása regisztráció után is
        AppendJwtCookie(token);

        return Ok(new { message = "Sikeres regisztráció", userRole = request.Role });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] UserDto request)
    {
        var user = _users.FirstOrDefault(u => u.Username == request.Username && u.Password == request.Password);

        if (user == null)
            return Unauthorized("Hibás felhasználónév vagy jelszó.");

        // Szerepkör frissítése (biztonság kedvéért)
        user.Role = user.Username.ToLower() == "admin" ? "admin" : "user";

        var token = GenerateToken(user);

        // Süti beállítása bejelentkezéskor
        AppendJwtCookie(token);

        // Itt már NEM küldjük vissza a tokent a JSON-ben!
        return Ok(new { message = "Sikeres belépés", userRole = user.Role });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwtToken");
        return Ok(new { message = "Sikeres kijelentkezés" });
    }



    // Segédmetódus a süti összeállításához, hogy ne kelljen kétszer leírni
    private void AppendJwtCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,        // XSS védelem: JS nem fér hozzá
            Secure = false,         // Fejlesztés alatt (Localhost HTTP) false, élesben (HTTPS) true kell!
            SameSite = SameSiteMode.Lax, // CSRF elleni alapvédelem
            Expires = DateTime.UtcNow.AddHours(1)
        };

        Response.Cookies.Append("jwtToken", token, cookieOptions);
    }

    private string GenerateToken(UserDto user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim("role", user.Role),
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
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [JsonPropertyName("password")]
    public required string Password { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; } = "user";
}