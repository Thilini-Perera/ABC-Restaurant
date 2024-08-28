using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static ABCResturant.Server.Controllers.ResturantController;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserActivityController : ControllerBase
    {
        private ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public UserActivityController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }


        // GET: api/<UserActivityController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<UserActivityController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<UserActivityController>
        [HttpPost]
        public async Task Post(UserActivity value)
        {

            value.CreatedOn = DateTime.Now.ToLocalTime();
            await _context.AddAsync(value);
            await _context.SaveChangesAsync();
        }

        // PUT api/<UserActivityController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UserActivityController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        [Route("GetReport")]
        [HttpGet]
        public async Task<IActionResult> GetReport(int id)
        {
            List<UserActivity> dBEntities = await _context.UserActivities.Where(x => x.UserId == id).Include(x => x.User).ToListAsync();
            if (dBEntities != null)
            {
                var pdfReportInfo = GenerateReport(dBEntities,true);
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
            List<UserActivity> dBEntities = await _context.UserActivities.Include(x => x.User).ToListAsync();
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

        private static PdfReportFileInfo GenerateReport(List<UserActivity> dBEntities, bool isSingle = false)
        {
            User? user = dBEntities.OrderBy(x => x.Id).FirstOrDefault().User;
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
                        page.Header().Text($"User Activity Report from the {user.Name}").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                    }
                    else
                    {
                        page.Header().Text($"User Activity Report from the ABC Restuarant Chain").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                    }

                    page.Content()
                    .PaddingVertical(5, Unit.Centimetre)
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
                                columns.ConstantColumn(6, Unit.Centimetre); // Width for dates
                                if (isSingle)
                                {
                                    columns.RelativeColumn(); // Width for numbers
                                }
                                columns.RelativeColumn(); // Width for numbers
                            });


                            // Add header row
                            table.Header(header =>
                            {
                                header.Cell().RowSpan(1).Text("Date").Bold();
                                if (isSingle)
                                {
                                    header.Cell().RowSpan(1).Text("User").Bold();
                                }
                                header.Cell().RowSpan(1).Text("Activity").Bold();

                            });

                            // Add data rows
                            // Example data; replace with actual data

                            foreach (var entity in dBEntities)
                            {
                                if (entity != null)
                                {
                                    table.Cell().Text(entity.CreatedOn.ToShortDateString());
                                    if (isSingle)
                                    {
                                        table.Cell().Text(entity.User?.Name);
                                    }
                                    table.Cell().Text(entity.Activity);
                                }
                               
                            }

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
                    FileName = $"User Activity Report on {user.Name}.pdf",
                    MimeType = "application/pdf"
                };
            
            }

            return new PdfReportFileInfo()
            {
                ByteArray = pdfBytes,
                FileName = $"User Activity on ABC Restuarant.pdf",
                MimeType = "application/pdf"
            };
        }

        public class UserActivityModel
        {
            public int UserId { get; set;}
            public string Activity { get; set;}
            public DateTime CreatedOn { get; set;}
        }
    }


}
