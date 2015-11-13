using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace BrainWave.Models
{
    public class BrainWaveCourseStep
    {
        [Key]
        [Column(Order = 1)]
        public int CourseId { get; set; }
        [Key]
        [Column(Order = 2)]
        public int Index { get; set; }
        public String Html { get; set; }
        public String Title { get; set; }
        public int[] AttachedFiles { get; set; }
    }
}