using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace BrainWave.Models
{
    public class BrainWaveUser
    {
        [Key]
        public int UserId { get; set; }
        public String UserStatus { get; set; }
    }
}