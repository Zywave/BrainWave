namespace BrainWave.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.BrainWaveCourseFiles",
                c => new
                    {
                        CourseId = c.Int(nullable: false),
                        FileId = c.Int(nullable: false),
                        Order = c.Int(nullable: false),
                        Start = c.Int(nullable: false),
                        End = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.CourseId, t.FileId, t.Order });
            
            CreateTable(
                "dbo.BrainWaveCourses",
                c => new
                    {
                        CourseId = c.Int(nullable: false, identity: true),
                        CourseName = c.String(),
                        CourseDescription = c.String(),
                        CourseEstimatedTime = c.String(),
                        Author = c.String(),
                    })
                .PrimaryKey(t => t.CourseId);
            
            CreateTable(
                "dbo.BrainWaveFiles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DisplayName = c.String(),
                        DateUploaded = c.DateTime(nullable: false),
                        AuthorId = c.Int(nullable: false),
                        AuthorName = c.String(),
                        FileType = c.String(),
                        Description = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.BrainWaveCourseProgresses",
                c => new
                    {
                        CourseId = c.Int(nullable: false),
                        UserId = c.Int(nullable: false),
                        StepIndex = c.Int(nullable: false),
                        MaxStep = c.Int(nullable: false),
                        TotalTime = c.Int(nullable: false),
                        Complete = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => new { t.CourseId, t.UserId });
            
            CreateTable(
                "dbo.BrainWaveStepFiles",
                c => new
                    {
                        StepId = c.Int(nullable: false),
                        FileId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.StepId, t.FileId });
            
            CreateTable(
                "dbo.BrainWaveCourseSteps",
                c => new
                    {
                        StepId = c.Int(nullable: false, identity: true),
                        CourseId = c.Int(nullable: false),
                        Index = c.Int(nullable: false),
                        Html = c.String(),
                        Title = c.String(),
                    })
                .PrimaryKey(t => t.StepId);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.BrainWaveCourseSteps");
            DropTable("dbo.BrainWaveStepFiles");
            DropTable("dbo.BrainWaveCourseProgresses");
            DropTable("dbo.BrainWaveFiles");
            DropTable("dbo.BrainWaveCourses");
            DropTable("dbo.BrainWaveCourseFiles");
        }
    }
}
