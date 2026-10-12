using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using LivelihoodMonitoring.Infrastructure;
using LivelihoodMonitoring.Infrastructure.Persistence;
using LivelihoodMonitoring.Application.Transactions.Commands;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(SyncTransactionsCommand).Assembly));

builder.Services.AddInfrastructureServices(builder.Configuration);

// Configure CORS for mobile apps and web dashboards
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireStaff", policy => 
        policy.RequireRole("SocialWorker", "BranchCoordinator", "HeadOfficeMAndE", "Admin"));
    options.AddPolicy("RequireBeneficiary", policy => 
        policy.RequireRole("Beneficiary"));
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(namingPolicy: null, allowIntegerValues: true));
    });
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with Bearer Token Authorization UI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Livelihood Monitoring API", 
        Version = "v1",
        Description = "Enterprise Backend API for ABC Company Livelihoods Monitoring Mobile Application & Web Monitoring Dashboard"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

var app = builder.Build();

// Automatically apply database migrations and seed initial users and sample livelihood data
await DatabaseSeeder.SeedDatabaseAsync(app.Services);

// Always enable Swagger UI for easy exploration and testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Livelihood Monitoring API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();