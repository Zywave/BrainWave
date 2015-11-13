using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace BrainWave.Models
{
    public class BrainWaveStepFile
    {
        [Key]
        [Column(Order = 1)]
        public int CourseId { get; set; }
        [Key]
        [Column(Order = 2)]
        public int Index { get; set; }
        [Key]
        [Column(Order = 3)]
        public int FileId { get; set; }
    }
}