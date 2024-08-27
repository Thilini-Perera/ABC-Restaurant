using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABCResturant.Migrations
{
    /// <inheritdoc />
    public partial class restuarantshaveReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RestuarantId",
                table: "Reservations",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_RestuarantId",
                table: "Reservations",
                column: "RestuarantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Restuarants_RestuarantId",
                table: "Reservations",
                column: "RestuarantId",
                principalTable: "Restuarants",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Restuarants_RestuarantId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_RestuarantId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "RestuarantId",
                table: "Reservations");
        }
    }
}
