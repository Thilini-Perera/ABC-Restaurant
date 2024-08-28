using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;
using static QuestPDF.Helpers.Colors;

namespace ABCResturant.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResturantController : ControllerBase
    {
        private ApplicationDbContext context;

        public ResturantController(ApplicationDbContext context)
        {
            this.context = context;
        }

        // GET: api/<ResturantController>
        [HttpGet]
        public async Task<List<Restuarant>> Get()
        {
            return await context.Restuarants.ToListAsync();
        }

        // GET api/<ResturantController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            Restuarant dBEntity = await context.Restuarants.Where(x => x.Id == id).Include(x=>x.Payments).Include(x=>x.Services).Include(x => x.Galleries).FirstOrDefaultAsync();
            if (dBEntity != null)
            {
                float total = 0;
                foreach (var item in dBEntity.Payments)
                {
                    total+= item.Total;
                }

                RestuarantViewModel viewModel = new RestuarantViewModel
                {
                    Name = dBEntity.Name,
                    Location = dBEntity.Location,
                    Telephone = dBEntity.Telephone,
                    MaxReservations = dBEntity.MaxReservations,
                    CurrentRate = dBEntity.CurrentRate,
                    CurrentReservations = dBEntity.CurrentReservations,
                    Galleries = dBEntity.Galleries.Select(x => x.Path).ToList(),
                    Services = dBEntity.Services.Select(x=>x.Name).ToList(),
                    TotalAmountGenerated = total
                };

                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Found",
                    Data = viewModel
                });
            }
            return Ok(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });
        }

        // POST api/<ResturantController>
        [HttpPost]
        public async Task Post([FromBody] Restuarant value)
        {
            value.CreatedOn = DateTime.Now;
            await context.Restuarants.AddAsync(value);
            await context.SaveChangesAsync();
        }

        // PUT api/<ResturantController>/5
        [HttpPut]
        public async Task Put([FromBody] Restuarant value)
        {
            Restuarant dBEntity = await context.Restuarants.FindAsync(value.Id);
            if (dBEntity != null)
            {
                dBEntity.Name = value.Name;
                dBEntity.Telephone = value.Telephone;
                dBEntity.Location = value.Location;
                dBEntity.MaxReservations = value.MaxReservations;
                dBEntity.CurrentRate = value.CurrentRate;
                dBEntity.UpdatedOn = DateTime.Now;

                context.Restuarants.Update(dBEntity);
                await context.SaveChangesAsync();
            }
        }

        // DELETE api/<ResturantController>/5
        [HttpDelete("{id}")]
        public async Task DeleteAsync(int id)
        {
            Restuarant dBEntity = await context.Restuarants.FindAsync(id);
            if (dBEntity != null)
            {
                context.Restuarants.Remove(dBEntity);
                await context.SaveChangesAsync();
            }

        }

        [Route("GetReport")]
        [HttpGet]
        public async Task<IActionResult> GetReport(int id)
        {
            Restuarant dBEntity = await context.Restuarants.Where(x => x.Id == id).Include(x => x.Payments).FirstOrDefaultAsync();
            if (dBEntity != null)
            {
                var pdfReportInfo = GenerateReport(dBEntity);
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
            List<Restuarant> dBEntities = await context.Restuarants.Include(x => x.Payments).ToListAsync();
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

        private static PdfReportFileInfo GenerateReport(Restuarant dBEntity)
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            Document document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.Header().Text($"Profit Report from {dBEntity.Name}").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

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
                                columns.ConstantColumn(12, Unit.Centimetre); // Width for dates
                                columns.RelativeColumn(); // Width for numbers
                            });


                            // Add header row
                            table.Header(header =>
                            {
                                header.Cell().RowSpan(1).Text("Date").Bold();
                                header.Cell().RowSpan(1).Text("Profit").Bold();
                            });

                            // Add data rows
                            // Example data; replace with actual data

                            float Total = 0;
                            foreach (var payment in dBEntity.Payments)
                            {
                                Total += payment.Total;
                                table.Cell().Text(payment.CreatedOn.ToShortDateString());
                                table.Cell().Text($"Rs.{payment.Total}");
                            }
                            table.Cell().Text("Total").Bold();
                            table.Cell().Text($"Rs.{Total}").Bold();
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

            return new PdfReportFileInfo()
            {
                ByteArray = pdfBytes,
                FileName = $"Profit Report on {dBEntity.Name}.pdf",
                MimeType = "application/pdf"
            };
        }

        private static PdfReportFileInfo GenerateReport(List<Restuarant> dBEntities)
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            Document document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.Header().Text($"Profit Report from the ABC Restuarant Chain").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

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
                                columns.ConstantColumn(12, Unit.Centimetre); // Width for dates
                                columns.RelativeColumn(); // Width for numbers
                            });


                            // Add header row
                            table.Header(header =>
                            {
                                header.Cell().RowSpan(1).Text("Date").Bold();
                                header.Cell().RowSpan(1).Text("Profit").Bold();
                            });

                            // Add data rows
                            // Example data; replace with actual data

                            float GrandTotal = 0;


                            foreach (var restuarant in dBEntities)
                            {
                                if(restuarant.Payments == null)
                                {
                                    table.Cell().Text(restuarant.Name);
                                    table.Cell().Text($"Rs.0");
                                }
                                else
                                {
                                    float Total = 0;
                                    table.Cell().Text(restuarant.Name);
                                    foreach (var payment in restuarant.Payments)
                                    {
                                        Total += payment.Total;
                                    }
                                    table.Cell().Text($"Rs.{Total}");
                                    GrandTotal += Total;
                                }
                               
                            }

                            table.Cell().Text("Total").Bold();
                            table.Cell().Text($"Rs.{GrandTotal}").Bold();
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

            return new PdfReportFileInfo()
            {
                ByteArray = pdfBytes,
                FileName = $"Profit Report on ABC Restuarant.pdf",
                MimeType = "application/pdf"
            };
        }

        public class PdfReportFileInfo
        {
            public byte[] ByteArray { get; set; }
            public string MimeType { get; set; }
            public string FileName { get; set; }
        }

        public class RestuarantViewModel
        {
            public string Name { get; set; }
            public string Location { get; set; }
            public string Telephone { get; set; }
            public int MaxReservations { get; set; }
            public int CurrentReservations { get; set; }
            public List<string>? Galleries { get; set; }
            public List<string>? Services { get; set; }
            public float TotalAmountGenerated { get; set; }
            public float CurrentRate { get;  set; }
        }
    }

}