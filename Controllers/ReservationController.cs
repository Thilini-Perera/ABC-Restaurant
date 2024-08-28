using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static ABCResturant.Server.Controllers.ResturantController;
using System.Net.Mail;
using System.Net;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private ApplicationDbContext _context;


        public ReservationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/<ReservationController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var reservations = await _context.RestuarantReservations.Include(x => x.Restuarant).Include(x => x.Reservation).ThenInclude(x => x.User).Select(x => new
            {
                Id = x.ReservationId,
                Name = x.Reservation.Name,
                RestuarantName = x.Restuarant.Name,
                NumberOfPeople = x.Reservation.NumberOfPeople,
                ReservationOn = x.Reservation.ReservationdOn,
                ReservationType = x.Reservation.ReservationType,
                IsApproved = x.Reservation.IsApproved,
                CreatedOn = x.Reservation.CreatedOn,
                UserId = x.Reservation.UserId,
                UserName = x.Reservation.User.Name,
                RestuarantId = x.RestuarantId
            }).ToListAsync();

            return Ok(new
            {
                StatusCode = 200,
                Message = "Reservation created successfully",
                Data = reservations
            });



        }

        // GET api/<ReservationController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var dBEntity = await _context.RestuarantReservations.Where(x => x.ReservationId == id).Include(x => x.Restuarant).Include(x => x.Reservation).ThenInclude(x => x.User).Select(x => new
            {
                Name = x.Reservation.Name,
                RestuarantName = x.Restuarant.Name,
                NumberOfPeople = x.Reservation.NumberOfPeople,
                ReservationOn = x.Reservation.ReservationdOn.ToLongDateString() + " " + x.Reservation.ReservationdOn.ToShortTimeString(),
                ReservationType = x.Reservation.ReservationType,
                IsApproved = x.Reservation.IsApproved,
                CreatedOn = x.Reservation.CreatedOn.ToLongDateString(),
                UserName = x.Reservation.User.Name,
            }).FirstOrDefaultAsync();

            return Ok(new
            {
                StatusCode = 200,
                Message = "Reservation created successfully",
                Data = dBEntity
            });

        }

        // POST api/<ReservationController>

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ReservationModel value)
        {
            try
            {
                if (value.ReservationType == ReservationType.NONE)
                {
                    return BadRequest(new
                    {
                        StatusCode = 400,
                        Message = "Cannot be None"
                    });
                }


                var restuarant = await _context.Restuarants.FindAsync(value.RestuarantId);
                if (restuarant == null)
                {
                    return BadRequest(new
                    {
                        StatusCode = 400,
                        Message = "Invalid ID"
                    });
                }

                Reservation reservation = new Reservation
                {
                    Name = value.Name,
                    CreatedOn = DateTime.Now.ToLocalTime(),
                    NumberOfPeople = value.NumberOfPeople,
                    ReservationType = value.ReservationType,
                    ReservationdOn = value.ReservationOn.ToLocalTime(),
                    IsApproved = true,
                    UserId = value.UserId
                };

                await _context.Reservations.AddAsync(reservation);
                await _context.SaveChangesAsync();

                Reservation DbReservation = await _context.Reservations.OrderByDescending(x => x.Id).FirstOrDefaultAsync();

                RestuarantReservation restuarantReservation = new RestuarantReservation
                {
                    ReservationId = DbReservation.Id,
                    RestuarantId = value.RestuarantId
                };

                await _context.AddAsync(restuarantReservation);
                await _context.SaveChangesAsync();


                if (restuarant.CurrentReservations <= restuarant.MaxReservations)
                {
                    restuarant.CurrentReservations++;
                    _context.Restuarants.Update(restuarant);
                    await _context.SaveChangesAsync();
                }


                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Reservation created successfully",
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = ex.Message
                });
            }
        }
        [Route("Reserve")]
        [HttpPost]
        public async Task<IActionResult> Reserve(ReservationModel value)
        {
            try
            {
                if (value.ReservationType == ReservationType.NONE)
                {
                    return BadRequest(new
                    {
                        StatusCode = 400,
                        Message = "Cannot be None"
                    });
                }
                var restuarant = await _context.Restuarants.FindAsync(value.RestuarantId);
                if (restuarant == null)
                {
                    return BadRequest(new
                    {
                        StatusCode = 400,
                        Message = "Invalid ID"
                    });
                }

                Reservation reservation = new Reservation
                {
                    Name = value.Name,
                    CreatedOn = DateTime.Now.ToLocalTime(),
                    NumberOfPeople = value.NumberOfPeople,
                    ReservationType = value.ReservationType,
                    ReservationdOn = value.ReservationOn.ToLocalTime(),
                    UserId = value.UserId
                };

                await _context.Reservations.AddAsync(reservation);
                await _context.SaveChangesAsync();

                Reservation DbReservation = await _context.Reservations.OrderByDescending(x => x.Id).FirstOrDefaultAsync();

                RestuarantReservation restuarantReservation = new RestuarantReservation
                {
                    ReservationId = DbReservation.Id,
                    RestuarantId = value.RestuarantId
                };
                if (restuarant.CurrentReservations <= restuarant.MaxReservations)
                {
                    restuarant.CurrentReservations++;
                    _context.Restuarants.Update(restuarant);
                    await _context.SaveChangesAsync();
                }
                await _context.AddAsync(restuarantReservation);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Reservation created successfully",
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = ex.Message
                });
            }
        }

        [Route("Approve")]
        [HttpPost]
        public async Task<IActionResult> Approve([FromBody] int value)
        {
            try
            {
                Reservation dBEntity = await _context.Reservations.Where(x => x.Id == value).Include(x => x.User).FirstAsync();
                if (dBEntity != null)
                {
                    dBEntity.IsApproved = true;

                    _context.Reservations.Update(dBEntity);
                    await _context.SaveChangesAsync();



                    using (SmtpClient client = new SmtpClient("localhost", 25))
                    {
                        client.UseDefaultCredentials = false;
                        //client.Credentials = new NetworkCredential("ally.kovacek8@ethereal.email", "PkGGFvVzre2Qk8dEcW");
                        client.EnableSsl = false;

                        using (MailMessage message = new MailMessage())
                        {
                            message.From = new MailAddress("ABCResturant@Service.email", "ABC Restuarant Support");
                            message.To.Add(new MailAddress(dBEntity.User.Email, dBEntity.User.Name));
                            message.Subject = $"You Reservation has being Approved";
                            message.Body = $"Hello {dBEntity.User.Name}," +
                                $"\n" +
                                $"Your reservation name {dBEntity.Name} has being approved by our staff and it will be held on {dBEntity.ReservationdOn}." +
                                $"\n" +
                                "Thank you for using our services";


                            await client.SendMailAsync(message);
                        }
                    }


                    return Ok(new
                    {
                        StatusCode = 200,
                        Message = "Reservation created successfully",
                    });
                }
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Not Found",
                });


            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = ex.Message
                });
            }





        }

        [Route("Check")]
        [HttpGet]
        public async Task<bool> CheckAvailability(int id)
        {
            var dbEntity = await _context.Restuarants.FindAsync(id);

            if (dbEntity != null)
            {
                if (dbEntity.MaxReservations == dbEntity.CurrentReservations)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            return false;
        }

        // PUT api/<ReservationController>/5
        [HttpPut]
        public async Task Put([FromBody] ReservationModel value)
        {
            Reservation dBEntity = await _context.Reservations.FindAsync(value.Id);

            if (dBEntity != null)
            {
                dBEntity.Name = value.Name;
                dBEntity.ReservationdOn = value.ReservationOn.ToLocalTime();
                dBEntity.NumberOfPeople = value.NumberOfPeople;

                _context.Reservations.Update(dBEntity);
                await _context.SaveChangesAsync();
            }
        }

        // DELETE api/<ReservationController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            var restuarant = await _context.RestuarantReservations.Where(x => x.ReservationId == id).Include(x => x.Restuarant).Select(x => x.Restuarant).FirstOrDefaultAsync();
            Reservation dBEntity = await _context.Reservations.FindAsync(id);

            if (dBEntity != null)
            {
                _context.Reservations.Remove(dBEntity);
                await _context.SaveChangesAsync();

                if (restuarant !=null)
                {
                    if (restuarant.CurrentReservations != 0)
                    {
                        restuarant.CurrentReservations--;
                    }
                    _context.Restuarants.Update(restuarant);
                    await _context.SaveChangesAsync(); 
                }
            }
        }

        [Route("GetReport")]
        [HttpGet]
        public async Task<IActionResult> GetReport(int id)
        {
            List<RestuarantReservation> dBEntities = await _context.RestuarantReservations.Where(x => x.RestuarantId == id).Include(x => x.Reservation).Include(x => x.Restuarant).ToListAsync();
            if (dBEntities != null)
            {
                var pdfReportInfo = GenerateReport(dBEntities, true);
                return File(pdfReportInfo.ByteArray, pdfReportInfo.MimeType, pdfReportInfo.FileName);
            }
            return Ok(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });
        }
        [Route("GetExtReport")]
        [HttpGet]
        public async Task<IActionResult> GetExtReport()
        {
            List<RestuarantReservation> dBEntities = await _context.RestuarantReservations.Include(x => x.Reservation).Include(x => x.Restuarant).ToListAsync();
            if (dBEntities != null)
            {
                var pdfReportInfo = GenerateReport(dBEntities);
                return File(pdfReportInfo.ByteArray, pdfReportInfo.MimeType, pdfReportInfo.FileName);
            }
            return Ok(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });
        }

        private static PdfReportFileInfo GenerateReport(List<RestuarantReservation> dBEntities, bool isSingle = false)
        {

            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            Document document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    if (isSingle)
                    {
                        var restuarnat = dBEntities.FirstOrDefault();
                        page.Header().Text($"Reservation Report from the ABC {restuarnat.Restuarant.Name}").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                    }
                    else
                    {
                        page.Header().Text($"Reservation Report from the ABC Restuarant Chain").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                    }


                    page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        // Add a horizontal line right below the header
                        column.Item().Height(5).Background(Colors.Grey.Medium); // Adjust height, color, and margin as needed

                        // Add a row for additional content or spacing
                        column.Item().Row(row =>
                        {
                            row.AutoItem().PaddingHorizontal(10).LineVertical(1).LineColor(Colors.Grey.Medium);
                        });

                        // Main content area
                        column.Item().Text("This report is generated.");

                        // Create a table for the profit report
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(3, Unit.Centimetre); // Width for dates
                                if (!isSingle)
                                {
                                    columns.ConstantColumn(70);
                                }
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(70);
                            });


                            // Add header row
                            table.Header(header =>
                            {
                                header.Cell().RowSpan(1).Text("Date").Bold();
                                if (!isSingle)
                                {
                                    header.Cell().RowSpan(1).Text("Restaurant Name").Bold();
                                }
                                header.Cell().RowSpan(1).Text("Reservation Name").Bold();
                                header.Cell().RowSpan(1).Text("Reservation Date").Bold();
                                header.Cell().RowSpan(1).Text("Reservation Type").Bold();
                                header.Cell().RowSpan(1).Text("Reservation Attendees").Bold();
                            });

                            // Add data rows
                            // Example data; replace with actual data

                            int GrandTotal = 0;

                            foreach (var entity in dBEntities)
                            {
                                if (entity.Reservation != null)
                                {
                                    table.Cell().Text(entity.Reservation.CreatedOn.ToShortDateString());
                                    if (!isSingle && entity.Restuarant != null)
                                    {
                                        table.Cell().Text(entity.Restuarant.Name);
                                    }
                                    table.Cell().Text(entity.Reservation.Name);
                                    table.Cell().Text(entity.Reservation.ReservationdOn.ToShortDateString());
                                    table.Cell().Text(entity.Reservation.ReservationType == ReservationType.DINEIN ? "Dine In" : "Delivery");
                                    table.Cell().Text(entity.Reservation.NumberOfPeople.ToString());
                                    GrandTotal++;
                                }

                            }

                            table.Cell().Text("Total Reservations ").Bold();
                            table.Cell().Text($"{GrandTotal}").Bold();
                        });

                    });

                    page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                    });

                });
            });
            byte[] pdfBytes = document.GeneratePdf();

            if (isSingle)
            {
                return new PdfReportFileInfo()
                {
                    ByteArray = pdfBytes,
                    FileName = $"Query Report on {dBEntities.Select(x => x.Restuarant.Name)}.pdf",
                    MimeType = "application/pdf"
                };
            }

            return new PdfReportFileInfo()
            {
                ByteArray = pdfBytes,
                FileName = $"Query Report on ABC Restuarant.pdf",
                MimeType = "application/pdf"
            };
        }


    }



    public class ReservationModel
    {
        public int? Id { get; set; }
        public string Name { get; set; }

        public ReservationType ReservationType { get; set; }
        public DateTime ReservationOn { get; set; }
        public int? NumberOfPeople { get; set; }
        public int UserId { get; set; }
        public int RestuarantId { get; set; }
    }
}
