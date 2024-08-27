using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABCResturant.Migrations
{
    /// <inheritdoc />
    public partial class removed_relationshipsWithrestaurantForOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OfferAndPromotions_Restuarants_RestuarantId",
                table: "OfferAndPromotions");

            migrationBuilder.DropIndex(
                name: "IX_OfferAndPromotions_RestuarantId",
                table: "OfferAndPromotions");

            migrationBuilder.DropColumn(
                name: "RestuarantId",
                table: "OfferAndPromotions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RestuarantId",
                table: "OfferAndPromotions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfferAndPromotions_RestuarantId",
                table: "OfferAndPromotions",
                column: "RestuarantId");

            migrationBuilder.AddForeignKey(
                name: "FK_OfferAndPromotions_Restuarants_RestuarantId",
                table: "OfferAndPromotions",
                column: "RestuarantId",
                principalTable: "Restuarants",
                principalColumn: "Id");
        }
    }
}
