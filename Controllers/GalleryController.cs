using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ABCResturant.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private ApplicationDbContext _context;

        public GalleryController(ApplicationDbContext context)
        {
            _context = context;
        }


        // GET: api/<GalleryController>
        [HttpGet]
        public Task<List<Gallery>> Get()
        {
            return _context.Galleries.ToListAsync();
        }

        // GET api/<GalleryController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            Gallery dBEntity = await _context.Galleries.FindAsync(id);
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

        // POST api/<GalleryController>
        [HttpPost]
        public async Task<IActionResult> PostAsync([FromForm] IFormFile file, [FromForm] int restuarantId)
        {

            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "No file uploaded or file is empty."
                });
            }

            var uploadsFolder = Path.Combine("wwwroot","images");
            //Directory.CreateDirectory(uploadsFolder); // Ensure the directory exists

            var filePath = Path.Combine(uploadsFolder, $"{restuarantId}_{file.FileName}");
            var dbFilePath = Path.Combine("images", $"{restuarantId}_{file.FileName}");

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var gallery = new Gallery { Path = dbFilePath, RestuarantId = restuarantId };
            _context.Galleries.Add(gallery);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                StatusCode = 201,
                Message = "Gallery created successfully",
                Data = gallery
            });

        }

        // PUT api/<GalleryController>/5
        [HttpPut]
        public async Task<IActionResult> Put([FromForm] IFormFile file, [FromForm] long id)
        {
            Gallery dBEntity = await _context.Galleries.FindAsync(id);
            if (dBEntity != null)
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new
                    {
                        StatusCode = 400,
                        Message = "No file uploaded or file is empty."
                    });
                }

                var uploadsFolder = Path.Combine("wwwroot", "images");
                //Directory.CreateDirectory(uploadsFolder); // Ensure the directory exists

                var filePath = Path.Combine(uploadsFolder, $"{dBEntity.RestuarantId}_{file.FileName}");
                var dbFilePath = Path.Combine("images", $"{dBEntity.RestuarantId}_{file.FileName}");

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                dBEntity.Path = dbFilePath;

                _context.Galleries.Update(dBEntity);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    StatusCode = 201,
                    Message = "Gallery created Updated!",
                    Data = (object)null
                });
            }
            return BadRequest(new
            {
                StatusCode = 400,
                Message = "Not found."
            });
        }

        // DELETE api/<GalleryController>/5
        [HttpDelete("{id}")]
        public async Task DeleteAsync(long id)
        {
            Gallery dBEntity = await _context.Galleries.FindAsync(id);
            if (dBEntity != null)
            {
                _context.Galleries.Remove(dBEntity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
