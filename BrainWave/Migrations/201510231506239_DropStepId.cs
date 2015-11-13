using System.Linq;
using BrainWave.Models;
using WebGrease.Css.Extensions;

namespace BrainWave.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class DropStepId : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BrainWaveStepFiles", "CourseId", c => c.Int(nullable: false));
            AddColumn("dbo.BrainWaveStepFiles", "Index", c => c.Int(nullable: false));
            Console.WriteLine("Updating StepFile.CourseId");
            Sql("UPDATE sfu SET sfu.CourseId = (SELECT cs.CourseId FROM dbo.BrainWaveCourseSteps as cs, dbo.BrainWaveStepFiles as sf WHERE cs.StepId = sf.StepId AND sf.StepId = sfu.StepId) FROM dbo.BrainWaveStepFiles as sfu");
            Console.WriteLine("Updating StepFile.Index");
            Sql("UPDATE sfu SET sfu.[Index] = (SELECT cs.[Index] FROM dbo.BrainWaveCourseSteps as cs, dbo.BrainWaveStepFiles as sf WHERE cs.StepId = sf.StepId AND sf.StepId = sfu.StepId) FROM dbo.BrainWaveStepFiles as sfu");
            DropPrimaryKey("dbo.BrainWaveStepFiles");
            DropPrimaryKey("dbo.BrainWaveCourseSteps");
            AddPrimaryKey("dbo.BrainWaveStepFiles", new[] { "CourseId", "Index", "FileId" });
            AddPrimaryKey("dbo.BrainWaveCourseSteps", new[] { "CourseId", "Index" });
            DropColumn("dbo.BrainWaveStepFiles", "StepId");
            DropColumn("dbo.BrainWaveCourseSteps", "StepId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BrainWaveCourseSteps", "StepId", c => c.Int(nullable: false, identity: true));
            AddColumn("dbo.BrainWaveStepFiles", "StepId", c => c.Int(nullable: false));
            Sql("UPDATE sfu SET sfu.StepId = (SELECT cs.StepId FROM dbo.BrainWaveCourseSteps as cs WHERE cs.CourseId = sfu.CourseId AND cs.[Index] = sfu.[Index]) FROM dbo.BrainWaveStepFiles as sfu");
            DropPrimaryKey("dbo.BrainWaveCourseSteps");
            DropPrimaryKey("dbo.BrainWaveStepFiles");
            DropColumn("dbo.BrainWaveStepFiles", "Index");
            DropColumn("dbo.BrainWaveStepFiles", "CourseId");
            AddPrimaryKey("dbo.BrainWaveCourseSteps", "StepId");
            AddPrimaryKey("dbo.BrainWaveStepFiles", new[] { "StepId", "FileId" });
        }
    }
}
