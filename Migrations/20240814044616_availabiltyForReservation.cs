using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABCResturant.Migrations
{
    /// <inheritdoc />
    public partial class availabiltyForReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentReservations",
                table: "Restuarants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxReservations",
                table: "Restuarants",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentReservations",
                table: "Restuarants");

            migrationBuilder.DropColumn(
                name: "MaxReservations",
                table: "Restuarants");
        }
    }
}
