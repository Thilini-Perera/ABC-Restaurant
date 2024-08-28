using ABCResturant.Models;
using ABCResturant.Persistance;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABCResturant.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }


        // GET: api/<UsersController>
        [HttpGet]
        public async Task<List<User>> Get()
        {
            return await _context.Users.ToListAsync();
        }

        // GET api/<UsersController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var dBEntity = await _context.Users.Where(x => x.Id == id).Select(x => new
            {
                x.Password,
                x.Email,
                CreatedOn = x.CreatedOn.ToLongDateString(),
                UpdatedOn = x.UpdatedOn.Value.ToLongDateString(),
                x.Name,
                x.Telephone,
                x.Role,
            }).FirstOrDefaultAsync();
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

        [Route("GetByRole")]
        [HttpGet]
        public async Task<List<User>> GetByRole(string role)
        {
            return await _context.Users.Where(x => x.Role == role).ToListAsync();
        }

        // POST api/<UsersController>
        [HttpPost]
        public async Task Post([FromBody] User value)
        {
            value.CreatedOn = DateTime.Now;
            await _context.Users.AddAsync(value);
            await _context.SaveChangesAsync();
        }

        // PUT api/<UsersController>/5
        [HttpPut]
        public async Task Put([FromBody] User value)
        {
            User dBEntity = await _context.Users.FindAsync(value.Id);
            if (dBEntity != null)
            {
                dBEntity.Name = value.Name;
                dBEntity.Password = value.Password;
                dBEntity.Email = value.Email;
                dBEntity.Role = value.Role;
                dBEntity.Telephone = value.Telephone;
                dBEntity.UpdatedOn = DateTime.Now;

                _context.Users.Update(dBEntity);
                await _context.SaveChangesAsync();
            }
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            User dBEntity = await _context.Users.FindAsync(id);
            if (dBEntity != null)
            {
                _context.Users.Remove(dBEntity);
                await _context.SaveChangesAsync();
            }
        }

        [Route("Login")]
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == model.Email && x.Password == model.Password);
            if (user != null)
            {
                User defaultUser = new();
                switch (user.Role)
                {
                    case "Admin":
                        Admin admin = new Admin
                        {
                            Name = user.Name,
                            Email = user.Email,
                            Id = user.Id,
                        };

                        return Ok(new
                        {
                            StatusCode = 200,
                            Message = "User Found",
                            Data = admin
                        });

                    case "Staff":
                        Staff staff = new Staff
                        {
                            Name = user.Name,
                            Email = user.Email,
                            Id = user.Id,
                            Role = user.Role,
                        };

                        return Ok(new
                        {
                            StatusCode = 200,
                            Message = "User Found",
                            Data = staff
                        });

                    case "Customer":
                        Customer customer = new Customer
                        {
                            Name = user.Name,
                            Email = user.Email,
                            Id = user.Id,
                            Role = user.Role,
                        };

                        return Ok(new
                        {
                            StatusCode = 200,
                            Message = "User Found",
                            Data = customer
                        });

                    default:
                        break;
                }

                return Ok(new
                {
                    StatusCode = 200,
                    Message = "User Found",
                    Data = defaultUser
                });
            }
            return BadRequest(new
            {
                StatusCode = 400,
                Message = "Not found",
                Data = (object)null
            });

        }

        [Route("Logout")]
        [HttpGet]
        public async Task<IActionResult> Logout([FromBody] string email, int id)
        {
            return Ok(new
            {
                StatusCode = 201,
                Message = "Log out Compelete",
                Data = (object)null
            });

        }

        [Route("Register")]
        [HttpPost]
        public async Task Register([FromBody] User value)
        {
            value.CreatedOn = DateTime.Now;
            value.Role = "Customer";
            await _context.Users.AddAsync(value);
            await _context.SaveChangesAsync();
        }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }

    }
}
