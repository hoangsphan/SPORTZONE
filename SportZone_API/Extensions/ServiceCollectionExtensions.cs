using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SportZone_API.Helpers;
using SportZone_API.Mappings;
using SportZone_API.Models;
using SportZone_API.Repositories;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSportZoneInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionString = ResolveConnectionString(configuration);

        services.AddDbContext<SportZoneContext>(options =>
        {
            options.UseSqlServer(connectionString);

            if (environment.IsDevelopment())
            {
                options.EnableDetailedErrors();
                options.EnableSensitiveDataLogging();
            }
        });

        services.AddAutoMapper(
            typeof(MappingField).Assembly,
            typeof(MappingOrder).Assembly,
            typeof(MappingBooking).Assembly);

        services.AddMemoryCache();
        services.Configure<SendEmail>(configuration.GetSection("SendEmail"));
        services.AddHttpContextAccessor();
        services.AddRouting(options => options.LowercaseUrls = true);

        if (environment.IsDevelopment())
        {
            services.AddDatabaseDeveloperPageExceptionFilter();
        }

        return services;
    }

    public static IServiceCollection AddSportZoneApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        services.AddScoped<IRegisterService, RegisterService>();
        services.AddScoped<IRegisterRepository, RegisterRepository>();

        services.AddScoped<IForgotPasswordService, ForgotPasswordService>();
        services.AddScoped<IForgotPasswordRepository, ForgotPasswordRepository>();

        services.AddScoped<IFacilityService, FacilityService>();
        services.AddScoped<IFacilityRepository, FacilityRepository>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAuthRepository, AuthRepository>();

        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IBookingRepository, BookingRepository>();

        services.AddScoped<IFieldService, FieldService>();
        services.AddScoped<IFieldRepository, FieldRepository>();

        services.AddScoped<IFieldBookingScheduleService, FieldBookingScheduleService>();
        services.AddScoped<IFieldBookingScheduleRepository, FieldBookingScheduleRepository>();

        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<IServiceRepository, ServiceRepository>();

        services.AddScoped<IFieldPricingService, FieldPricingService>();
        services.AddScoped<IFieldPricingRepository, FieldPricingRepository>();

        services.AddScoped<IOrderService, Services.OrderService>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        services.AddScoped<IOrderFieldIdService, OrderFieldIdService>();
        services.AddScoped<IOrderFieldIdRepository, OrderFieldIdRepository>();

        services.AddScoped<IOrderServiceService, OrderServiceService>();
        services.AddScoped<IOrderServiceRepository, OrderServiceRepository>();

        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IStaffRepository, StaffRepository>();

        services.AddScoped<ICategoryFieldService, CategoryFieldService>();
        services.AddScoped<ICategoryFieldRepository, CategoryFieldRepository>();

        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAdminRepository, AdminRepository>();

        services.AddScoped<IRegulationSystemService, RegulationSystemService>();
        services.AddScoped<IRegulationSystemRepository, RegulationSystemRepository>();

        services.AddScoped<IRegulationFacilityService, RegulationFacilityService>();
        services.AddScoped<IRegulationFacilityRepository, RegulationFacilityRepository>();

        services.AddScoped<IDiscountService, DiscountService>();
        services.AddScoped<IDiscountRepository, DiscountRepository>();

        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        services.AddScoped<IVNPayService, VNPayService>();

        return services;
    }

    public static IServiceCollection AddSportZoneBackgroundServices(this IServiceCollection services)
    {
        services.AddHostedService<ScheduleStatusUpdaterService>();
        services.AddHostedService<ReservationCleanupService>();
        return services;
    }

    private static string ResolveConnectionString(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MyCnn");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = configuration["SPORTZONE__CONNECTIONSTRING"];
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = "Server=(localdb)\\MSSQLLocalDB;Database=SportZone;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True";
        }

        return connectionString;
    }
}
