using ABCResturant.Models;
using Microsoft.EntityFrameworkCore;

namespace ABCResturant.Persistance
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasKey(x => x.Id);
            modelBuilder.Entity<User>().HasMany(x => x.Reservations);

            modelBuilder.Entity<Payment>().HasKey(x => x.Id);
            modelBuilder.Entity<Payment>().HasOne(x => x.Restuarant);
            modelBuilder.Entity<Payment>().HasOne(x => x.User);

            modelBuilder.Entity<Restuarant>().HasKey(x => x.Id);
            modelBuilder.Entity<Restuarant>().HasMany(x => x.Users);
            modelBuilder.Entity<Restuarant>().HasMany(x => x.Payments);
            modelBuilder.Entity<Restuarant>().HasMany(x => x.Galleries);
            modelBuilder.Entity<Restuarant>().HasMany(x => x.Services);

            modelBuilder.Entity<Services>().HasKey(x => x.Id);

            modelBuilder.Entity<CustomerResponse>().HasKey(x => x.Id);
            modelBuilder.Entity<CustomerResponse>().HasOne(x => x.User);
            modelBuilder.Entity<CustomerResponse>().HasOne(x => x.ChatRoom);

            modelBuilder.Entity<OfferNPromotion>().HasKey(x => x.Id);

            modelBuilder.Entity<Gallery>().HasKey(x => x.Id);

            modelBuilder.Entity<ChatRoom>().HasKey(x => x.Id);
            modelBuilder.Entity<ChatRoom>().HasMany(x => x.CustomerResponses);

            modelBuilder.Entity<Reservation>().HasKey(x => x.Id);
            modelBuilder.Entity<Reservation>().HasOne(x => x.User);

            modelBuilder.Entity<RestuarantReservation>().HasKey(x => new { x.RestuarantId,x.ReservationId});
            modelBuilder.Entity<RestuarantReservation>().HasOne(x => x.Restuarant)
                                                        .WithMany(x => x.RestuarantReservations)
                                                        .HasForeignKey(x => x.RestuarantId);
            modelBuilder.Entity<RestuarantReservation>().HasOne(x => x.Reservation)
                                                        .WithMany(x => x.RestuarantReservations)
                                                        .HasForeignKey(x => x.ReservationId);

            modelBuilder.Entity<Services>().HasKey(x => x.Id);
            modelBuilder.Entity<Services>().HasOne(x => x.Restuarant);

            modelBuilder.Entity<UserActivity>().HasKey(x => x.Id);
            modelBuilder.Entity<UserActivity>().HasOne(x => x.User);

        }



        public DbSet<User> Users { get; set; }
        public DbSet<UserActivity> UserActivities { get; set; }
        public DbSet<Restuarant> Restuarants { get; set; }
        public DbSet<Services> Services { get; set; }
        public DbSet<CustomerResponse> CustomerResponses { get; set; }
        public DbSet<OfferNPromotion> OfferAndPromotions { get; set; }
        public DbSet<Gallery> Galleries { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<RestuarantReservation> RestuarantReservations { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
    }
}
