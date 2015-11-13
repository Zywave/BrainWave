using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace BrainWave.Models
{
    public class BrainWaveCourse
    {
        [Key]
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseDescription { get; set; }
        public string CourseEstimatedTime { get; set; }
        public string CourseAuthor { get; set; }
    }
}