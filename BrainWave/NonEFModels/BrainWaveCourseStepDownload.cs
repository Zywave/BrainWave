using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BrainWave.NonEFModels
{
    public class BrainWaveCourseStepDownload
    {
        public String Title { get; set; }
        public String StepContent { get; set; }
        public List<BrainWaveFileInfoDownload> AttachedFiles { get; set; }
    }
}