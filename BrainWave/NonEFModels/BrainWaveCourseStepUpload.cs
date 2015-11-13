using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BrainWave.NonEFModels
{
    public class BrainWaveCourseStepUpload
    {
        public String Title { get; set; }
        public String StepContent { get; set; }
        public List<int> AttachedFiles { get; set; }
        
    }
}