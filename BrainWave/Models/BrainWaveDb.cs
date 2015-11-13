using System.Data.Entity;

namespace BrainWave.Models
{
    public class BrainWaveDb : DbContext
    {
        public DbSet<BrainWaveFile> Files { get; set; }
        public DbSet<BrainWaveCourse> Courses { get; set; }
        public DbSet<BrainWaveCourseStep> Steps { get; set; }
        public DbSet<BrainWaveCourseProgress> Progressions { get; set; }

        public DbSet<BrainWaveCourseFile> CourseFiles { get; set; }

        public DbSet<BrainWaveStepFile> StepFiles { get; set; }
    }
}