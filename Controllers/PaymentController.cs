using ABCResturant.Models;
using ABCResturant.Persistance;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MimeKit.Text;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public PaymentController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }



        // GET: api/<PaymentController>
        [HttpGet]
        public Task<List<Payment>> Get()
        {
            return _context.Payments.Include(x=>x.User).ToListAsync();
        }

        // GET api/<PaymentController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var dBEntity = await _context.Payments
            .Where(x => x.Id == id)
            .Include(x => x.User)
            .Include(x => x.Restuarant)
            .Select(x => new {
                x.Total,           
                UserName = x.User.Name, 
                RestaurantName = x.Restuarant.Name,
                CreatedOn = x.CreatedOn.ToLongDateString(),
                UpdatedOn =x.UpdatedOn.ToLongDateString(),
            })
            .FirstOrDefaultAsync();
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

        // POST api/<PaymentController>
        [HttpPost]
        public async Task Post([FromBody] Payment value)
        {
            value.CreatedOn = DateTime.Now;
            await _context.Payments.AddAsync(value);
            await _context.SaveChangesAsync();
        }

        [Route("Pay")]
        [HttpPost]
        public async Task Pay([FromForm] Payment value)
        {
            value.CreatedOn = DateTime.Now;
            await _context.Payments.AddAsync(value);
            await _context.SaveChangesAsync();


            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_config.GetSection("EmailUsername").Value));
            email.To.Add(MailboxAddress.Parse(_config.GetSection("EmailUsername").Value));
            email.Subject = "Reservation Booked ";
            email.Body = new TextPart(TextFormat.Plain) { Text = "You have paid for you booking" };

            using var smtp = new SmtpClient();
            smtp.Connect(_config.GetSection("EmailHost").Value, 587, SecureSocketOptions.StartTls);
            smtp.Authenticate(_config.GetSection("EmailUsername").Value, _config.GetSection("EmailPassword").Value);
            smtp.Send(email);
            smtp.Disconnect(true);
        }

        // PUT api/<PaymentController>/5
        [HttpPut]
        public async Task Put([FromBody] Payment value)
        {
            Payment dBEntity = await _context.Payments.FindAsync(value.Id);
            if (dBEntity != null)
            {
                dBEntity.UserId = value.UserId;
                dBEntity.Total = value.Total;
                dBEntity.UpdatedOn = DateTime.Now;

                _context.Payments.Update(dBEntity);
                await _context.SaveChangesAsync();
            }
        }

        // DELETE api/<PaymentController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            Payment dBEntity = await _context.Payments.FindAsync(id);
            if (dBEntity != null)
            {
                _context.Payments.Remove(dBEntity);
                await _context.SaveChangesAsync();
            }
        }


        [Route("SendEmail")]
        [HttpGet]
        public async Task SendEmail(string To, string From, string Body,string Subject)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_config.GetSection("EmailUsername").Value));
            email.To.Add(MailboxAddress.Parse(To));
            email.Subject = Subject;
            email.Body = new TextPart(TextFormat.Html) { Text = Body };

            using var smtp = new SmtpClient();
            smtp.Connect(_config.GetSection("EmailHost").Value, 587, SecureSocketOptions.StartTls);
            smtp.Authenticate(_config.GetSection("EmailUsername").Value, _config.GetSection("EmailPassword").Value);
            smtp.Send(email);
            smtp.Disconnect(true);
        }

    }
}
