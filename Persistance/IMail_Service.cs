using ABCResturant.Models;
using Org.BouncyCastle.Asn1.Pkcs;

namespace ABCResturant.Persistance
{
    public interface IMail_Service
    {
        bool SendMail(MailRequest mailData);
    }
}
