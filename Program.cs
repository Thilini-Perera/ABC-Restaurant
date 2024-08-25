using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddTransient<IMail_Service, MailService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddPolicy(name: "ABCRestuarant",
    policy =>
    {
        policy.WithOrigins("http://localhost:4200").AllowAnyMethod().AllowAnyHeader();
    }));

string _GetConnStringName = builder.Configuration.GetConnectionString("DefaultConnectionMySQL");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
options.UseMySql(_GetConnStringName, ServerVersion.AutoDetect(_GetConnStringName)));

builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseCors("ABCRestuarant");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
