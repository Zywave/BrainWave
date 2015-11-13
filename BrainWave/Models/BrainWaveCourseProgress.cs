using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BrainWave.Models
{
    public class BrainWaveCourseProgress
    {
        [Key]
        [Column(Order = 1)]
        public int CourseId { get; set; }
        [Key]
        [Column(Order = 2)]
        public int UserId { get; set; }
        public int StepIndex { get; set; }
        public int MaxStep { get; set; }
        public int TotalTime { get; set; }
        public bool Complete { get; set; }
    }
}