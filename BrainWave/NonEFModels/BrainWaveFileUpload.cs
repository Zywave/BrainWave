using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BrainWave.Models
{
    public class BrainWaveFileUpload
    {
        public int Id { get; set; }
        public string DisplayName { get; set; }
        public DateTime DateUploaded { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string FileType { get; set; }
        public string Description { get; set; }
        public string Body { get; set; }
    }
}