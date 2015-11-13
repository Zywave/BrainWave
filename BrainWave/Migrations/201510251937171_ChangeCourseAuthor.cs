namespace BrainWave.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeCourseAuthor : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BrainWaveCourses", "CourseAuthor", c => c.String());
            DropColumn("dbo.BrainWaveCourses", "Author");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BrainWaveCourses", "Author", c => c.String());
            DropColumn("dbo.BrainWaveCourses", "CourseAuthor");
        }
    }
}
