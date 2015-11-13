namespace BrainWave.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Blank : DbMigration
    {
        public override void Up()
        {
            /*DropPrimaryKey("dbo.BrainWaveStepFiles");
            DropPrimaryKey("dbo.BrainWaveCourseSteps");
            AddColumn("dbo.BrainWaveStepFiles", "CourseId", c => c.Int(nullable: false));
            AddColumn("dbo.BrainWaveStepFiles", "Index", c => c.Int(nullable: false));
            AddPrimaryKey("dbo.BrainWaveStepFiles", new[] { "CourseId", "Index", "FileId" });
            AddPrimaryKey("dbo.BrainWaveCourseSteps", new[] { "CourseId", "Index" });
            DropColumn("dbo.BrainWaveStepFiles", "StepId");
            DropColumn("dbo.BrainWaveCourseSteps", "StepId");*/
        }
        
        public override void Down()
        {
            /*AddColumn("dbo.BrainWaveCourseSteps", "StepId", c => c.Int(nullable: false, identity: true));
            AddColumn("dbo.BrainWaveStepFiles", "StepId", c => c.Int(nullable: false));
            DropPrimaryKey("dbo.BrainWaveCourseSteps");
            DropPrimaryKey("dbo.BrainWaveStepFiles");
            DropColumn("dbo.BrainWaveStepFiles", "Index");
            DropColumn("dbo.BrainWaveStepFiles", "CourseId");
            AddPrimaryKey("dbo.BrainWaveCourseSteps", "StepId");
            AddPrimaryKey("dbo.BrainWaveStepFiles", new[] { "StepId", "FileId" });*/
        }
    }
}
