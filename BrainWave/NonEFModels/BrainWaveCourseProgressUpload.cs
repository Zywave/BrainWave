using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BrainWave.NonEFModels
{
    public class BrainWaveCourseProgressUpload
    {
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public int StepIndex { get; set; }
        public int MaxStep { get; set; }
        public int TotalTime { get; set; }
        public bool Complete { get; set; }
    }
}