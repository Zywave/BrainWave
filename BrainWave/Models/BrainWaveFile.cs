using System;
using System.ComponentModel.DataAnnotations;

namespace BrainWave.Models
{
    public class BrainWaveFile
    {
        [Key]
        public int Id { get; set; }
        public string DisplayName { get; set; }
        public DateTime DateUploaded { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string FileType { get; set; }
        public string Description { get; set; }

        public BrainWaveFile()
        {
            
        }

        public BrainWaveFile(string displayName, string authorId, string fileType)
        {
            
        }
    }
}