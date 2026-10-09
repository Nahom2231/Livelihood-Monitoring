using LivelihoodMonitoring.Infrastructure;
using LivelihoodMonitoring.Application.Transactions.Commands;

var builder = WebApplication.CreateBuilder(args);

// Register Application services (MediatR)
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(SyncTransactionsCommand).Assembly));

// Register Infrastructure services (PostgreSQL EF Core)
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();