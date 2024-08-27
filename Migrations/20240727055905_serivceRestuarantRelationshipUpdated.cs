using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABCResturant.Migrations
{
    /// <inheritdoc />
    public partial class serivceRestuarantRelationshipUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RestuarantId",
                table: "Services",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Services_RestuarantId",
                table: "Services",
                column: "RestuarantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Restuarants_RestuarantId",
                table: "Services",
                column: "RestuarantId",
                principalTable: "Restuarants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Restuarants_RestuarantId",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Services_RestuarantId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "RestuarantId",
                table: "Services");
        }
    }
}
