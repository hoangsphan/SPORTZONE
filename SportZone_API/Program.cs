//using Microsoft.AspNetCore.Authentication.Cookies;
//using Microsoft.AspNetCore.Authentication.Google;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using SportZone_API.DTOs;
//using SportZone_API.Models;
//using SportZone_API.Repositories;
//using SportZone_API.Repositories.Interfaces;
//using SportZone_API.Services;
//using SportZone_API.Services.Interfaces;
//using SportZone_API.Mappings;
//using SportZone_API.Repository.Interfaces;
//using SportZone_API.Repository;
//using Microsoft.AspNetCore.Hosting;
//using Microsoft.IdentityModel.Tokens;
//using System.Text;
//using Microsoft.AspNetCore.Diagnostics;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.AspNetCore.SignalR;
//using SportZone_API.Hubs;

//var builder = WebApplication.CreateBuilder(args);
//var connectionString = builder.Configuration.GetConnectionString("MyCnn");
//builder.Services.AddSignalR();
//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//}).AddJwtBearer(options =>
//{
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = false,
//        ValidateAudience = false,
//        ValidateLifetime = true,
//        ValidateIssuerSigningKey = true,
//        IssuerSigningKey = new SymmetricSecurityKey(
//            Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-256-bit-secret-key-for-sportzone-application")),
//        ClockSkew = TimeSpan.Zero
//    };
//});

//builder.Services.AddControllers()
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
//        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
//        options.JsonSerializerOptions.WriteIndented = true;
//        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
//        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
//    });

//builder.Services.AddDbContext<SportZoneContext>(options =>
//    options.UseSqlServer(connectionString));

//builder.Services.AddAutoMapper(typeof(MappingField).Assembly);
//builder.Services.AddAutoMapper(typeof(MappingOrder).Assembly);
//builder.Services.AddAutoMapper(typeof(MappingBooking).Assembly);

//builder.Services.AddMemoryCache();
//builder.Services.Configure<SendEmail>(builder.Configuration.GetSection("SendEmail"));

//builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

//builder.Services.AddScoped<IRegisterService, RegisterService>();
//builder.Services.AddScoped<IRegisterRepository, RegisterRepository>();

//builder.Services.AddScoped<IForgotPasswordService, ForgotPasswordService>();
//builder.Services.AddScoped<IForgotPasswordRepository, ForgotPasswordRepository>();

//builder.Services.AddScoped<IFacilityService, FacilityService>();
//builder.Services.AddScoped<IFacilityRepository, FacilityRepository>();

//builder.Services.AddScoped<IAuthService, AuthService>();
//builder.Services.AddScoped<IAuthRepository, AuthRepository>();

//builder.Services.AddScoped<IBookingRepository, BookingRepository>();
//builder.Services.AddScoped<IBookingService, BookingService>();

//builder.Services.AddScoped<IFieldService, FieldService>();
//builder.Services.AddScoped<IFieldRepository, FieldRepository>();

//builder.Services.AddScoped<IFieldBookingScheduleRepository, FieldBookingScheduleRepository>();
//builder.Services.AddScoped<IFieldBookingScheduleService, FieldBookingScheduleService>();

//builder.Services.AddScoped<IServiceService, ServiceService>();
//builder.Services.AddScoped<IServiceRepository, ServiceRepository>();

//builder.Services.AddScoped<IFieldBookingScheduleRepository, FieldBookingScheduleRepository>();
//builder.Services.AddScoped<IFieldPricingRepository, FieldPricingRepository>();

//builder.Services.AddScoped<IFieldBookingScheduleService, FieldBookingScheduleService>();
//builder.Services.AddScoped<IFieldPricingService, FieldPricingService>();

//builder.Services.AddScoped<IOrderRepository, OrderRepository>();
//builder.Services.AddScoped<IOrderService, SportZone_API.Services.OrderService>();

//builder.Services.AddScoped<IOrderFieldIdRepository, OrderFieldIdRepository>();
//builder.Services.AddScoped<IOrderFieldIdService, OrderFieldIdService>();

//builder.Services.AddScoped<IOrderServiceRepository, OrderServiceRepository>();
//builder.Services.AddScoped<IOrderServiceService, OrderServiceService>();

//builder.Services.AddScoped<IStaffRepository, StaffRepository>();
//builder.Services.AddScoped<IStaffService, StaffService>();

//builder.Services.AddScoped<ICategoryFieldRepository, CategoryFieldRepository>();
//builder.Services.AddScoped<ICategoryFieldService, CategoryFieldService>();


//builder.Services.AddScoped<IAdminRepository, AdminRepository>();
//builder.Services.AddScoped<IAdminService, AdminService>();

//builder.Services.AddScoped<IRegulationSystemRepository, RegulationSystemRepository>();
//builder.Services.AddScoped<IRegulationSystemService, RegulationSystemService>();

//builder.Services.AddScoped<IRegulationFacilityRepository, RegulationFacilityRepository>();
//builder.Services.AddScoped<IRegulationFacilityService, RegulationFacilityService>();

//builder.Services.AddScoped<IDiscountRepository, DiscountRepository>();
//builder.Services.AddScoped<IDiscountService, DiscountService>();

//builder.Services.AddScoped<IVNPayService, VNPayService>();

//builder.Services.AddHostedService<ScheduleStatusUpdaterService>();
//// Đăng ký Notification services
//builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
//builder.Services.AddScoped<INotificationService, NotificationService>();

//// Đăng ký background service để cleanup expired reservations
//builder.Services.AddHostedService<ReservationCleanupService>();


//builder.Services.AddHttpContextAccessor();
//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
//})
//.AddCookie()
//.AddGoogle(options =>
//{
//    options.ClientId = "556790071077-0hk1p2ahlh1vllotj74ih98tbrft3esl.apps.googleusercontent.com";
//    options.ClientSecret = "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";
//    options.CallbackPath = "/signin-google";
//    options.SaveTokens = true;
//});

////builder.Services.AddCors(options =>
////{
////    options.AddPolicy("AllowAll", policy =>
////    {
////        policy.AllowAnyOrigin()
////              .AllowAnyHeader()
////              .AllowAnyMethod();
////    });
////});
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowSpecificOrigin", policy =>
//    {
//        policy.WithOrigins("http://localhost:5173", "https://your-domain.com")
//              .AllowAnyHeader()
//              .AllowAnyMethod()
//              .AllowCredentials();
//    });
//});

//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen(c =>
//{
//    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
//    {
//        Title = "SportZone API",
//        Version = "v1",
//        Description = "API cho ứng dụng SportZone - Hệ thống đặt sân thể thao"
//    });

//    // Bật hỗ trợ Swagger Annotations
//    c.EnableAnnotations();
//});

//var app = builder.Build();
//app.UseExceptionHandler(appBuilder =>
//{
//    appBuilder.Run(async context =>
//    {
//        context.Response.StatusCode = 500;
//        context.Response.ContentType = "application/json";
//        var error = context.Features.Get<IExceptionHandlerFeature>();
//        if (error != null)
//        {
//            await context.Response.WriteAsync(new
//            {
//                error = error.Error.Message
//            }.ToString());
//        }
//    });
//});


//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//    app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(origin => true));
//}
//app.UseStaticFiles();
//app.UseHttpsRedirection();
////app.UseCors("AllowAll");
//app.UseCors("AllowSpecificOrigin");
//app.UseAuthentication();
//app.UseAuthorization();
//app.MapControllers();
//app.MapHub<NotificationHub>("/notificationhub");
//app.Run();

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services;
using SportZone_API.Services.Interfaces;
using SportZone_API.Mappings;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Hubs;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("MyCnn");

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSignalR();

// Cấu hình cả JWT và Google/Cookie Authentication trong một khối duy nhất.
builder.Services.AddAuthentication(options =>
{
    // Đặt JWT là DefaultScheme cho các API
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    // Có thể đặt Cookie là Fallback để xác thực cho các yêu cầu khác nếu cần
    // options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-256-bit-secret-key-for-sportzone-application")),
        ClockSkew = TimeSpan.Zero
    };
})
.AddCookie()
.AddGoogle(options =>
{
    options.ClientId = "556790071077-0hk1p2ahlh1vllotj74ih98tbrft3esl.apps.googleusercontent.com";
    options.ClientSecret = "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";
    options.CallbackPath = "/signin-google";
    options.SaveTokens = true;
});


// Cấu hình DbContext
builder.Services.AddDbContext<SportZoneContext>(options =>
    options.UseSqlServer(connectionString));

// Cấu hình AutoMapper
builder.Services.AddAutoMapper(typeof(MappingField).Assembly);
builder.Services.AddAutoMapper(typeof(MappingOrder).Assembly);
builder.Services.AddAutoMapper(typeof(MappingBooking).Assembly);

builder.Services.AddMemoryCache();
builder.Services.Configure<SendEmail>(builder.Configuration.GetSection("SendEmail"));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IRegisterService, RegisterService>();
builder.Services.AddScoped<IRegisterRepository, RegisterRepository>();
builder.Services.AddScoped<IForgotPasswordService, ForgotPasswordService>();
builder.Services.AddScoped<IForgotPasswordRepository, ForgotPasswordRepository>();
builder.Services.AddScoped<IFacilityService, FacilityService>();
builder.Services.AddScoped<IFacilityRepository, FacilityRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IFieldService, FieldService>();
builder.Services.AddScoped<IFieldRepository, FieldRepository>();
builder.Services.AddScoped<IFieldBookingScheduleRepository, FieldBookingScheduleRepository>();
builder.Services.AddScoped<IFieldBookingScheduleService, FieldBookingScheduleService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IFieldBookingScheduleRepository, FieldBookingScheduleRepository>();
builder.Services.AddScoped<IFieldPricingRepository, FieldPricingRepository>();
builder.Services.AddScoped<IFieldBookingScheduleService, FieldBookingScheduleService>();
builder.Services.AddScoped<IFieldPricingService, FieldPricingService>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, SportZone_API.Services.OrderService>();
builder.Services.AddScoped<IOrderFieldIdRepository, OrderFieldIdRepository>();
builder.Services.AddScoped<IOrderFieldIdService, OrderFieldIdService>();
builder.Services.AddScoped<IOrderServiceRepository, OrderServiceRepository>();
builder.Services.AddScoped<IOrderServiceService, OrderServiceService>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<ICategoryFieldRepository, CategoryFieldRepository>();
builder.Services.AddScoped<ICategoryFieldService, CategoryFieldService>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IRegulationSystemRepository, RegulationSystemRepository>();
builder.Services.AddScoped<IRegulationSystemService, RegulationSystemService>();
builder.Services.AddScoped<IRegulationFacilityRepository, RegulationFacilityRepository>();
builder.Services.AddScoped<IRegulationFacilityService, RegulationFacilityService>();
builder.Services.AddScoped<IDiscountRepository, DiscountRepository>();
builder.Services.AddScoped<IDiscountService, DiscountService>();
builder.Services.AddScoped<IVNPayService, VNPayService>();
builder.Services.AddHostedService<ScheduleStatusUpdaterService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<ReservationCleanupService>();
builder.Services.AddHttpContextAccessor();

// Thêm các dịch vụ Endpoint API Explorer và Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SportZone API",
        Version = "v1",
        Description = "API cho ứng dụng SportZone - Hệ thống đặt sân thể thao"
    });
    c.EnableAnnotations();
});

var app = builder.Build();

app.UseExceptionHandler(appBuilder =>
{
    appBuilder.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<IExceptionHandlerFeature>();
        if (error != null)
        {
            await context.Response.WriteAsync(new
            {
                error = error.Error.Message
            }.ToString());
        }
    });
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Use the specific CORS policy for development to avoid conflicts
    app.UseCors("AllowSpecificOrigin");
}
else
{
    // Use the specific CORS policy for production
    app.UseCors("AllowSpecificOrigin");
}

app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseRouting(); // Thêm UseRouting

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationhub");

app.Run();
