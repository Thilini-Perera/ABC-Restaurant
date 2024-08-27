using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABCResturant.Migrations
{
    /// <inheritdoc />
    public partial class Paymenttblupdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Total",
                table: "Payments",
                type: "float",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Total",
                table: "Payments",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "float")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
