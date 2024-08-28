using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private ApplicationDbContext _context;

        public ServiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/<ServiceController>
        [HttpGet]
        public async Task<List<Services>> Get()
        {
            return await _context.Services.ToListAsync();
        }

        // GET api/<ServiceController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            Services dBEntity = await _context.Services.FindAsync(id);
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

        // POST api/<ServiceController>
        [HttpPost]
        public async Task Post([FromBody] Services value)
        {
            value.CreatedOn = DateTime.Now;
            await _context.Services.AddAsync(value);
            await _context.SaveChangesAsync();
        }

        // PUT api/<ServiceController>/5
        [HttpPut]
        public async Task Put([FromBody] Services value)
        {
            Services dBEntity = await _context.Services.FindAsync(value.Id);
            if (dBEntity != null)
            {
                dBEntity.Name = value.Name;

                _context.Services.Update(dBEntity);
                await _context.SaveChangesAsync();
            }
        }

        // DELETE api/<ServiceController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            Services dBEntity = await _context.Services.FindAsync(id);
            if (dBEntity != null)
            {
                _context.Services.Remove(dBEntity);
                await _context.SaveChangesAsync();
            }
        }

        [Route("GetServicesByRestuarantId")]
        [HttpGet]
        public async Task<IActionResult> GetServicesByRestuarantId(int id)
        {
            List<Services> dBEntities = await _context.Services.Where(x=>x.RestuarantId==id).ToListAsync();
            if (dBEntities != null)
            {
                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Found",
                    Data = dBEntities
                });
            }
            return Ok(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });
        }
    }
}
