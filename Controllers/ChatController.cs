using ABCResturant.Models;
using ABCResturant.Persistance;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static ABCResturant.Server.Controllers.ResturantController;
using QuestPDF.Fluent;
using System.Net.Mail;
using System.Net;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public ChatController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/<ChatController>
        [HttpGet]
        public async Task<List<ChatRoom>> Get()
        {
            return await _context.ChatRooms.ToListAsync();
        }
        [Route("GetChats")]
        [HttpGet]
        public async Task<List<CustomerResponse>> GetChatsbyId(int Id)
        {
            return await _context.CustomerResponses.Where(x=>x.ChatRoomId==Id).ToListAsync();
        }

        // GET api/<ChatController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var dBEntity = await _context.ChatRooms.Where(x=>x.Id==id).Include(x => x.CustomerResponses).FirstOrDefaultAsync();
            if (dBEntity != null)
            {
                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Found",
                    Data = dBEntity
                });
            }
            return Ok(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });
        }

        // POST api/<ChatController>
        [HttpPost]
        public async Task Post([FromBody] ChatResponse value)
        {
            var user = await _context.Users.FindAsync(value.UserId);
            ChatRoom chatRoom = new ChatRoom
            {
                CreatedOn = DateTime.Now,
            };

            await _context.ChatRooms.AddAsync(chatRoom);
            await _context.SaveChangesAsync();
            var DbChatRoom = await _context.ChatRooms.OrderByDescending(x => x.Id).FirstOrDefaultAsync();

            CustomerResponse response = new CustomerResponse
            {
                ChatRoomId = DbChatRoom.Id,
                Response = value.Response,
                UserId = value.UserId,
                CustomerResponseType = (user.Role == "Customer") ? CustomerResponseType.QUERY : CustomerResponseType.RESPONSE,
                CreatedOn = DateTime.Now
            };

            await _context.CustomerResponses.AddAsync(response);
            await _context.SaveChangesAsync();

            

          
        }

        // PUT api/<ChatController>/5
        [HttpPut]
        public async Task Put([FromBody] ChatResponse value)
        {
            ChatRoom dBEntity = await _context.ChatRooms.Where(x=>x.Id==value.Id).Include(x=>x.CustomerResponses).ThenInclude(x=>x.User).FirstOrDefaultAsync();
            var user = await _context.Users.FindAsync(value.UserId);
            if (dBEntity != null)
            {
                CustomerResponse response = new CustomerResponse
                {
                    ChatRoomId = dBEntity.Id,
                    Response = value.Response,
                    UserId = value.UserId,
                    CustomerResponseType = (user.Role == "Customer") ? CustomerResponseType.QUERY : CustomerResponseType.RESPONSE,
                    CreatedOn = DateTime.Now
                };

                await _context.CustomerResponses.AddAsync(response);
                await _context.SaveChangesAsync();

                dBEntity = await _context.ChatRooms.Where(x => x.Id == value.Id).Include(x => x.CustomerResponses).ThenInclude(x => x.User).FirstOrDefaultAsync();

                var CustomerQuery = dBEntity.CustomerResponses.FirstOrDefault();
                var ReplyQuery = dBEntity.CustomerResponses.LastOrDefault();

                if (response.CustomerResponseType == CustomerResponseType.RESPONSE)
                {
                    using (SmtpClient client = new SmtpClient("localhost", 25))
                    {
                        client.UseDefaultCredentials = false;
                        //client.Credentials = new NetworkCredential("ally.kovacek8@ethereal.email", "PkGGFvVzre2Qk8dEcW");
                        client.EnableSsl = false;

                        using (MailMessage message = new MailMessage())
                        {
                            message.From = new MailAddress("ABCResturant@Service.email", "ABC Restuarant Support");
                            message.To.Add(new MailAddress(CustomerQuery.User.Email, CustomerQuery.User.Name));
                            message.Subject = $"Your Query has a Reply";
                            message.Body = $"Hello {CustomerQuery.User.Name}, My name is {ReplyQuery.User.Name}" +
                                $"\n" +
                                $"You have asked : '{CustomerQuery.Response}'" +
                                $"\n" +
                                $"{ReplyQuery.User.Name}: {ReplyQuery.Response}" +
                                $"\n" +
                                "Thank you for using our services";


                            await client.SendMailAsync(message);
                        }
                    }
                }
            }
        }

        // DELETE api/<ChatController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            ChatRoom dBEntity = await _context.ChatRooms.FindAsync(id);
            if (dBEntity != null)
            {
                _context.ChatRooms.Remove(dBEntity);
                await _context.SaveChangesAsync();
            }
        }


        [Route("GetReport")]
        [HttpGet]
        public async Task<IActionResult> GetReport(int id)
        {
            ChatRoom dBEntity = await _context.ChatRooms.Where(x => x.Id == id).Include(x => x.CustomerResponses).ThenInclude(x=>x.User).FirstOrDefaultAsync();
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
            List<ChatRoom> dBEntities = await _context.ChatRooms.Include(x => x.CustomerResponses).ThenInclude(x => x.User).ToListAsync();
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

        private static PdfReportFileInfo GenerateReport(ChatRoom dBEntity)
        {
            CustomerResponse? firstCustomerResponse = dBEntity.CustomerResponses.OrderBy(x => x.Id).FirstOrDefault();
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            Document document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                   
                    page.Header().Text($"Query Report from {firstCustomerResponse.User.Name}").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

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
                                columns.ConstantColumn(4, Unit.Centimetre); // Width for dates
                                columns.ConstantColumn(4, Unit.Centimetre); // Width for dates
                                columns.ConstantColumn(4, Unit.Centimetre); // Width for dates
                            });


                            // Add header row
                            table.Header(header =>
                            {
                                header.Cell().RowSpan(1).Text("Date").Bold();
                                header.Cell().RowSpan(1).Text("Message").Bold();
                                header.Cell().RowSpan(2).Text("Sent By").Bold();
                            });

                            // Add data rows
                            // Example data; replace with actual data

                            foreach (var entity in dBEntity.CustomerResponses)
                            {
                                table.Cell().Text(entity.CreatedOn.ToShortDateString());
                                table.Cell().Text(entity.Response);
                                table.Cell().Text(entity.User.Name);
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

            return new PdfReportFileInfo()
            {
                ByteArray = pdfBytes,
                FileName = $"Query Report on {firstCustomerResponse.User.Name}.pdf",
                MimeType = "application/pdf"
            };
        }

        private static PdfReportFileInfo GenerateReport(List<ChatRoom> dBEntities)
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            Document document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.Header().Text($"Query Report from the ABC Restuarant Chain").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

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
                                columns.ConstantColumn(4, Unit.Centimetre); // Width for dates

                                columns.ConstantColumn(80);
                                columns.ConstantColumn(90);
                            });


                            // Add header row
                            table.Header(header =>
                            {
                                header.Cell().RowSpan(1).Text("Date").Bold();
                                header.Cell().RowSpan(1).Text("Message").Bold();
                                header.Cell().RowSpan(1).Text("Sent By").Bold();

                            });

                            // Add data rows
                            // Example data; replace with actual data

                            float GrandTotal = 0;


                            foreach (var entity in dBEntities)
                            {
                                if (entity.CustomerResponses != null)
                                {
                                    foreach (var item in entity.CustomerResponses)
                                    {
                                        table.Cell().Text(item.CreatedOn.ToShortDateString());
                                        table.Cell().Text(item.Response);
                                        table.Cell().Text(item.User.Name);
                                    }
                                }
                                column.Item().Row(row =>
                                {
                                    row.AutoItem().PaddingHorizontal(10).LineVertical(1).LineColor(Colors.Blue.Medium);
                                });
                            }

                            table.Cell().Text("Queries ").Bold();
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

            return new PdfReportFileInfo()
            {
                ByteArray = pdfBytes,
                FileName = $"Query Report on ABC Restuarant.pdf",
                MimeType = "application/pdf"
            };
        }

    }

    public class ChatResponse
    {
        public int? Id { get; set; }
        public int UserId { get; set; }
        public string Response { get; set; }
    }
}
