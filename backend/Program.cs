using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. CORS KONFIGURÁCIÓ
// Nagyon fontos: Sütik használatakor az .AllowCredentials() kötelező, 
// és a .WithOrigins() nem lehet "*" (minden), pontos URL kell!
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        b => b.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()); 
});

// 2. JWT ÉS AUTHENTICATION KONFIGURÁCIÓ
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };

        // EZ AZ ÚJ RÉSZ: Megmondjuk a JWT kezelőnek, hogy a sütiből vegye ki a tokent
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // A sütit "jwtToken" névvel mentettük el az AuthControllerben
                context.Token = context.Request.Cookies["jwtToken"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

// 3. CSP (Content Security Policy) MIDDLEWARE
// Ez az "utasítás" a böngészőnek, hogy csak biztonságos forrásból engedjen scriptet futni
app.Use(async (context, next) =>
{
    // Az Append biztonságosabb, mint az Add, nem dob hibát duplikáció esetén
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self';");
    await next();
});

// MIDDLEWARE SORREND (A sorrend kritikus!)
app.UseCors("AllowAngular");

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();