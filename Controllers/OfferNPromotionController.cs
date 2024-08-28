using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfferNPromotionController : ControllerBase
    {
        private ApplicationDbContext context;
        private readonly IConfiguration _config;

        public OfferNPromotionController(ApplicationDbContext context)
        {
            this.context = context;
        }

        // GET: api/<OfferNPromotionController>
        [HttpGet]
        public async Task<List<OfferNPromotion>> Get()
        {
            return await context.OfferAndPromotions.ToListAsync();
        }

        [Route("GetPromoByCode")]
        [HttpGet]
        public async Task<IActionResult> GetByCode(string code)
        {
            OfferNPromotion dBEntity = await context.OfferAndPromotions.Where(x=>x.Code==code && x.OfferUntil >= DateTime.Now).FirstOrDefaultAsync();
            if (dBEntity != null)
            {
                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Found",
                    Data = dBEntity
                });
            }
            return BadRequest(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });
        }

        // GET api/<OfferNPromotionController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            OfferNPromotion dBEntity = await context.OfferAndPromotions.FindAsync(id);
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

        // POST api/<OfferNPromotionController>
        [HttpPost]
        public async Task Post([FromBody] OfferNPromotion value)
        {
            value.CreatedOn = DateTime.Now;
            await context.OfferAndPromotions.AddAsync(value);
            await context.SaveChangesAsync();
        }

        // PUT api/<OfferNPromotionController>/5
        [HttpPut]
        public async Task Put([FromBody] OfferNPromotion value)
        {
            OfferNPromotion dBEntity = await context.OfferAndPromotions.FindAsync(value.Id);
            if (dBEntity != null)
            {
                dBEntity.Message = value.Message;
                dBEntity.OfferUntil = value.OfferUntil.Value.ToLocalTime();
                dBEntity.Code = value.Code;
                dBEntity.Discount = value.Discount;

                context.OfferAndPromotions.Update(dBEntity);
                await context.SaveChangesAsync();
            }
        }
        // DELETE api/<OfferNPromotionController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            OfferNPromotion dBEntity = await context.OfferAndPromotions.FindAsync(id);
            if (dBEntity != null)
            {
                context.OfferAndPromotions.Remove(dBEntity);
                await context.SaveChangesAsync();
            }
        }
    }

}
