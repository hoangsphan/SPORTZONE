using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportZone_API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Category_field",
                columns: table => new
                {
                    category_field_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category_field_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Category__6A073F0901A6D904", x => x.category_field_id);
                });

            migrationBuilder.CreateTable(
                name: "RegulationSystem",
                columns: table => new
                {
                    regulation_system_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, defaultValue: "Active"),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Regulati__A01CA95F4FD41EDC", x => x.regulation_system_id);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Role__760965CC612A6DE8", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: true),
                    u_email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    u_password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    u_status = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    u_create_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    is_external_login = table.Column<bool>(type: "bit", nullable: true),
                    is_verify = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__User__B51D3DEA087664AB", x => x.u_id);
                    table.ForeignKey(
                        name: "FK__User__role_id__1AD3FDA4",
                        column: x => x.role_id,
                        principalTable: "Role",
                        principalColumn: "role_id");
                });

            migrationBuilder.CreateTable(
                name: "Admin",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    dob = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Admin__B51D3DEA39292CB8", x => x.u_id);
                    table.ForeignKey(
                        name: "FK__Admin__u_id__00200768",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Customer",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    dob = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Customer__B51D3DEA7606EDE3", x => x.u_id);
                    table.ForeignKey(
                        name: "FK__Customer__u_id__02FC7413",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "External_Logins",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false),
                    external_provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    external_user_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    access_token = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__External__B51D3DEAEC6BFCA3", x => x.u_id);
                    table.ForeignKey(
                        name: "FK__External_L__u_id__04E4BC85",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Field_Owner",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    dob = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Field_Ow__B51D3DEAF8FDD380", x => x.u_id);
                    table.ForeignKey(
                        name: "FK__Field_Owne__u_id__0A9D95DB",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Notification",
                columns: table => new
                {
                    noti_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    u_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    is_read = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__FDA4F30A6812B713", x => x.noti_id);
                    table.ForeignKey(
                        name: "FK__Notificati__u_id__0D7A0286",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    u_id = table.Column<int>(type: "int", nullable: false),
                    image_qr = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    bank_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    bank_num = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    account_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payment__ED1FC9EAE0436C99", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK__Payment__u_id__160F4887",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Facility",
                columns: table => new
                {
                    fac_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    u_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    open_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    close_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    subdescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Facility__978BA2C362C4F885", x => x.fac_id);
                    table.ForeignKey(
                        name: "FK__Facility__u_id__05D8E0BE",
                        column: x => x.u_id,
                        principalTable: "Field_Owner",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Discount",
                columns: table => new
                {
                    discount_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fac_id = table.Column<int>(type: "int", nullable: false),
                    discount_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    start_date = table.Column<DateOnly>(type: "date", nullable: true),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Discount__BDBE9EF97A91F459", x => x.discount_id);
                    table.ForeignKey(
                        name: "FK__Discount__fac_id__03F0984C",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                });

            migrationBuilder.CreateTable(
                name: "Field",
                columns: table => new
                {
                    field_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fac_id = table.Column<int>(type: "int", nullable: true),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    field_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_booking_enable = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Field__1BB6F43EB8A4DC8B", x => x.field_id);
                    table.ForeignKey(
                        name: "FK__Field__category___06CD04F7",
                        column: x => x.category_id,
                        principalTable: "Category_field",
                        principalColumn: "category_field_id");
                    table.ForeignKey(
                        name: "FK__Field__fac_id__07C12930",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                });

            migrationBuilder.CreateTable(
                name: "Image",
                columns: table => new
                {
                    img_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fac_id = table.Column<int>(type: "int", nullable: true),
                    imageURL = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Image__6F16A71C69A168F6", x => x.img_id);
                    table.ForeignKey(
                        name: "FK__Image__fac_id__0C85DE4D",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                });

            migrationBuilder.CreateTable(
                name: "RegulationFacility",
                columns: table => new
                {
                    regulation_facility_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fac_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, defaultValue: "Active"),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Regulati__B2AC1BDDE720DDB2", x => x.regulation_facility_id);
                    table.ForeignKey(
                        name: "FK__Regulatio__fac_i__17036CC0",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                });

            migrationBuilder.CreateTable(
                name: "Service",
                columns: table => new
                {
                    service_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fac_id = table.Column<int>(type: "int", nullable: true),
                    service_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    image = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Service__3E0DB8AF711966B6", x => x.service_id);
                    table.ForeignKey(
                        name: "FK__Service__fac_id__17F790F9",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                });

            migrationBuilder.CreateTable(
                name: "Staff",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false),
                    fac_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    dob = table.Column<DateOnly>(type: "date", nullable: true),
                    image = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    start_time = table.Column<DateOnly>(type: "date", nullable: true),
                    end_time = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Staff__B51D3DEAED68D5BF", x => x.u_id);
                    table.ForeignKey(
                        name: "FK__Staff__fac_id__18EBB532",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                    table.ForeignKey(
                        name: "FK__Staff__u_id__19DFD96B",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Booking",
                columns: table => new
                {
                    booking_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    field_id = table.Column<int>(type: "int", nullable: false),
                    u_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    status_payment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    guest_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    guest_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Booking__5DE3A5B1C8E67B89", x => x.booking_id);
                    table.ForeignKey(
                        name: "FK__Booking__field_i__01142BA1",
                        column: x => x.field_id,
                        principalTable: "Field",
                        principalColumn: "field_id");
                    table.ForeignKey(
                        name: "FK__Booking__u_id__02084FDA",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Field_Pricing",
                columns: table => new
                {
                    pricing_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    field_id = table.Column<int>(type: "int", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Field_Pr__A25A9FB7AF6DFA21", x => x.pricing_id);
                    table.ForeignKey(
                        name: "FK__Field_Pri__field__0B91BA14",
                        column: x => x.field_id,
                        principalTable: "Field",
                        principalColumn: "field_id");
                });

            migrationBuilder.CreateTable(
                name: "Field_booking_schedule",
                columns: table => new
                {
                    schedule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    field_id = table.Column<int>(type: "int", nullable: true),
                    booking_id = table.Column<int>(type: "int", nullable: true),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    date = table.Column<DateOnly>(type: "date", nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Field_bo__C46A8A6FA3713F4D", x => x.schedule_id);
                    table.ForeignKey(
                        name: "FK__Field_boo__booki__08B54D69",
                        column: x => x.booking_id,
                        principalTable: "Booking",
                        principalColumn: "booking_id");
                    table.ForeignKey(
                        name: "FK__Field_boo__field__09A971A2",
                        column: x => x.field_id,
                        principalTable: "Field",
                        principalColumn: "field_id");
                });

            migrationBuilder.CreateTable(
                name: "Order",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    u_id = table.Column<int>(type: "int", nullable: true),
                    fac_id = table.Column<int>(type: "int", nullable: false),
                    discount_id = table.Column<int>(type: "int", nullable: true),
                    booking_id = table.Column<int>(type: "int", nullable: true),
                    guest_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    guest_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    total_price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    total_service_price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    content_payment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    status_payment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order__46596229BA7F108B", x => x.order_id);
                    table.ForeignKey(
                        name: "FK__Order__booking_i__0E6E26BF",
                        column: x => x.booking_id,
                        principalTable: "Booking",
                        principalColumn: "booking_id");
                    table.ForeignKey(
                        name: "FK__Order__discount___0F624AF8",
                        column: x => x.discount_id,
                        principalTable: "Discount",
                        principalColumn: "discount_id");
                    table.ForeignKey(
                        name: "FK__Order__fac_id__10566F31",
                        column: x => x.fac_id,
                        principalTable: "Facility",
                        principalColumn: "fac_id");
                    table.ForeignKey(
                        name: "FK__Order__u_id__114A936A",
                        column: x => x.u_id,
                        principalTable: "User",
                        principalColumn: "u_id");
                });

            migrationBuilder.CreateTable(
                name: "Order_field_id",
                columns: table => new
                {
                    order_field_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    field_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_fi__3E76E2B5F30E7607", x => x.order_field_id);
                    table.ForeignKey(
                        name: "FK__Order_fie__field__123EB7A3",
                        column: x => x.field_id,
                        principalTable: "Field",
                        principalColumn: "field_id");
                    table.ForeignKey(
                        name: "FK__Order_fie__order__1332DBDC",
                        column: x => x.order_id,
                        principalTable: "Order",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "Order_Service",
                columns: table => new
                {
                    order_service_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    service_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: true),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_Se__88196EDD1C9AD496", x => x.order_service_id);
                    table.ForeignKey(
                        name: "FK__Order_Ser__order__14270015",
                        column: x => x.order_id,
                        principalTable: "Order",
                        principalColumn: "order_id");
                    table.ForeignKey(
                        name: "FK__Order_Ser__servi__151B244E",
                        column: x => x.service_id,
                        principalTable: "Service",
                        principalColumn: "service_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Booking_field_id",
                table: "Booking",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_u_id",
                table: "Booking",
                column: "u_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Category__A8D2A98070E7D032",
                table: "Category_field",
                column: "Category_field_name",
                unique: true,
                filter: "[Category_field_name] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Discount_fac_id",
                table: "Discount",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_Facility_u_id",
                table: "Facility",
                column: "u_id");

            migrationBuilder.CreateIndex(
                name: "IX_Field_category_id",
                table: "Field",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Field_fac_id",
                table: "Field",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_Field_booking_schedule_booking_id",
                table: "Field_booking_schedule",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_Field_booking_schedule_field_id",
                table: "Field_booking_schedule",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "IX_Field_Pricing_field_id",
                table: "Field_Pricing",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "IX_Image_fac_id",
                table: "Image",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_u_id",
                table: "Notification",
                column: "u_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_booking_id",
                table: "Order",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_discount_id",
                table: "Order",
                column: "discount_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_fac_id",
                table: "Order",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_u_id",
                table: "Order",
                column: "u_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_field_id_field_id",
                table: "Order_field_id",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_field_id_order_id",
                table: "Order_field_id",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Service_order_id",
                table: "Order_Service",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Service_service_id",
                table: "Order_Service",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_u_id",
                table: "Payment",
                column: "u_id");

            migrationBuilder.CreateIndex(
                name: "IX_RegulationFacility_fac_id",
                table: "RegulationFacility",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_Service_fac_id",
                table: "Service",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_Staff_fac_id",
                table: "Staff",
                column: "fac_id");

            migrationBuilder.CreateIndex(
                name: "IX_User_role_id",
                table: "User",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "UQ__User__3DF9EF22FFECCFC7",
                table: "User",
                column: "u_email",
                unique: true,
                filter: "[u_email] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "Customer");

            migrationBuilder.DropTable(
                name: "External_Logins");

            migrationBuilder.DropTable(
                name: "Field_booking_schedule");

            migrationBuilder.DropTable(
                name: "Field_Pricing");

            migrationBuilder.DropTable(
                name: "Image");

            migrationBuilder.DropTable(
                name: "Notification");

            migrationBuilder.DropTable(
                name: "Order_field_id");

            migrationBuilder.DropTable(
                name: "Order_Service");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "RegulationFacility");

            migrationBuilder.DropTable(
                name: "RegulationSystem");

            migrationBuilder.DropTable(
                name: "Staff");

            migrationBuilder.DropTable(
                name: "Order");

            migrationBuilder.DropTable(
                name: "Service");

            migrationBuilder.DropTable(
                name: "Booking");

            migrationBuilder.DropTable(
                name: "Discount");

            migrationBuilder.DropTable(
                name: "Field");

            migrationBuilder.DropTable(
                name: "Category_field");

            migrationBuilder.DropTable(
                name: "Facility");

            migrationBuilder.DropTable(
                name: "Field_Owner");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Role");
        }
    }
}
