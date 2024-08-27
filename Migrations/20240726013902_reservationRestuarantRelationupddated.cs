using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABCResturant.Migrations
{
    /// <inheritdoc />
    public partial class reservationRestuarantRelationupddated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "RestuarantReservations",
                columns: table => new
                {
                    RestuarantId = table.Column<int>(type: "int", nullable: false),
                    ReservationId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestuarantReservations", x => new { x.RestuarantId, x.ReservationId });
                    table.ForeignKey(
                        name: "FK_RestuarantReservations_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RestuarantReservations_Restuarants_RestuarantId",
                        column: x => x.RestuarantId,
                        principalTable: "Restuarants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_RestuarantReservations_ReservationId",
                table: "RestuarantReservations",
                column: "ReservationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RestuarantReservations");

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
    }
}
