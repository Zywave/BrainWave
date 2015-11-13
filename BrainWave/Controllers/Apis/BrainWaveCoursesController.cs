using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Description;
using BrainWave.Models;
using BrainWave.NonEFModels;
using WebGrease.Css.Extensions;

namespace BrainWave.Controllers.Apis
{
    [RoutePrefix("api/brainwavecourses")]
    public class BrainWaveCoursesController : ApiController
    {
        private readonly BrainWaveDb _db = new BrainWaveDb();

        #region API Methods

        // GET: api/BrainWaveCourses
        public IQueryable<BrainWaveCourseUpload> GetCourses()
        {
            return _db.Courses.Select(c => new BrainWaveCourseUpload
            {
                CourseId = c.CourseId,
                CourseName = c.CourseName,
                CourseAuthor = c.CourseAuthor,
                CourseDescription = c.CourseDescription,
                CourseEstimatedTime = c.CourseEstimatedTime
            });
        }

        // GET: api/BrainWaveCourses/5
        [ResponseType(typeof(BrainWaveCourseDownload))]
        [Route("{courseId:int}")]
        public IHttpActionResult GetBrainWaveCourse(int courseId)
        {
            // Get requested course from the database
            BrainWaveCourse brainWaveCourse = _db.Courses.Find(courseId);
            if (brainWaveCourse == null)
            {
                return NotFound();
            }

            // Get the Step data from the database and convert it to transfer format
            var brainWaveCourseStepDownloads = _db.Steps
                .Where(s => s.CourseId == brainWaveCourse.CourseId)
                .Select(s => new BrainWaveCourseStepDownload
                {
                    StepContent = s.Html,
                    Title = s.Title,
                    AttachedFiles = _db.StepFiles.Where(sf => sf.CourseId == s.CourseId && sf.Index == s.Index)
                                        .Join(_db.Files, sf => sf.FileId, f => f.Id, (sf, f) => new BrainWaveFileInfoDownload
                                                    {
                                                        AuthorId = f.AuthorId,
                                                        AuthorName = f.AuthorName,
                                                        DateUploaded = f.DateUploaded,
                                                        Id = f.Id,
                                                        Description = f.Description,
                                                        DisplayName = f.DisplayName,
                                                        FileType = f.FileType
                                                    }).ToList()
                }).ToList();

            // Puts the course data into transfer format
            var brainWaveCourseDownload = new BrainWaveCourseDownload
            {
                CourseId = brainWaveCourse.CourseId,
                CourseDescription = brainWaveCourse.CourseDescription,
                CourseName = brainWaveCourse.CourseName,
                CourseSteps = brainWaveCourseStepDownloads,
                CourseAuthor = brainWaveCourse.CourseAuthor,
                CourseEstimatedTime = brainWaveCourse.CourseEstimatedTime
            };  

            return Ok(brainWaveCourseDownload);
        }

        // PUT: api/BrainWaveCourses
        [ResponseType(typeof(BrainWaveCourse))] //was void
        public IHttpActionResult PutBrainWaveCourse(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var brainWaveCourse = AddCourse(brainWaveCourseUpload);

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (BrainWaveCourseExists(brainWaveCourse.CourseId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultAPI", new { courseId = brainWaveCourse.CourseId}, brainWaveCourse);
        }

        // POST: api/BrainWaveCourses
        [ResponseType(typeof(BrainWaveCourse))]
        public IHttpActionResult PostBrainWaveCourse(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            BrainWaveCourse brainWaveCourse = ModifyCourse(brainWaveCourseUpload);

            _db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = brainWaveCourse.CourseId }, brainWaveCourse);
        }

        // DELETE: api/BrainWaveCourses/5
        [ResponseType(typeof(BrainWaveCourse))]
        [Route("{id:int}")]
        public IHttpActionResult DeleteBrainWaveCourse(int id)
        {
            BrainWaveCourse brainWaveCourse = _db.Courses.Find(id);
            if (brainWaveCourse == null)
            {
                return NotFound();
            }

            DeleteBrainWaveCourseFiles(id);
            DeleteBrainWaveCourseSteps(id);
            DeleteBrainWaveStepFiles(id);

            _db.Courses.Remove(brainWaveCourse);
            _db.SaveChanges();

            return Ok(brainWaveCourse);
        }

        [ResponseType(typeof(BrainWaveCourseStep))]
        [Route("{courseId:int}/steps/{stepIndex:int}")]
        public IHttpActionResult GetBrainWaveCourseStep(int courseId, int stepIndex)
        {
            // Get the first step that matches the courseId and stepIndex requested.
            BrainWaveCourseStep courseStep = _db.Steps.FirstOrDefault(s => s.CourseId == courseId && s.Index == stepIndex);
            if (courseStep == null)
            {
                return NotFound();
            }
            return Ok(courseStep);
        }

        #endregion
        #region Helper Methods

        private BrainWaveCourse AddCourse(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            var brainWaveCourse = AddBrainWaveCourseEntry(brainWaveCourseUpload);

            AddCourseStepsEntries(brainWaveCourse.CourseId, brainWaveCourseUpload.CourseSteps);

            _db.SaveChanges();

            return brainWaveCourse;
        }

        private BrainWaveCourse AddBrainWaveCourseEntry(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            // Assemble the database object from the transfer object
            var brainWaveCourse = new BrainWaveCourse()
            {
                CourseName = brainWaveCourseUpload.CourseName,
                CourseDescription = brainWaveCourseUpload.CourseDescription,
                CourseEstimatedTime = brainWaveCourseUpload.CourseEstimatedTime,
                CourseAuthor = brainWaveCourseUpload.CourseAuthor
            };

            _db.Courses.Add(brainWaveCourse);
            _db.SaveChanges();

            return brainWaveCourse;
        }

        private void AddCourseStepsEntries(int courseId, List<BrainWaveCourseStepUpload> brainWaveCourseSteps)
        {
            // Create the list of steps to be added to the database from the transfer object
            if (brainWaveCourseSteps != null)
            {
                var courseSteps = brainWaveCourseSteps.Select((t, i) => new BrainWaveCourseStep
                {
                    Title = t.Title,
                    Html = t.StepContent,
                    CourseId = courseId,
                    Index = i

                }).ToList();

                _db.Steps.AddRange(courseSteps);
                _db.SaveChanges();

                foreach (var courseStep in brainWaveCourseSteps)
                {
                    foreach (var attachedFile in courseStep.AttachedFiles)
                    {
                        _db.StepFiles.Add(new BrainWaveStepFile
                        {
                            FileId = attachedFile,
                            CourseId = courseId,
                            Index = brainWaveCourseSteps.IndexOf(courseStep)
                        });
                    }
                }
            }
        }

        private BrainWaveCourse ModifyCourse(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            ModifyCourseSteps(brainWaveCourseUpload);

            var courseInDb = UpdateBrainWaveCourseEntry(brainWaveCourseUpload);

            return courseInDb;
        }

        private void ModifyCourseSteps(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            var stepsInDb = _db.Steps.Where(step => step.CourseId == brainWaveCourseUpload.CourseId);
            int i = -1;
            brainWaveCourseUpload.CourseSteps.ForEach(step => {
                i++;
                var dbStepUpdate = stepsInDb.SingleOrDefault(dbStep => dbStep.Index == i);
                if (dbStepUpdate == null)
                {
                    _db.Steps.Add(new BrainWaveCourseStep
                    {
                        CourseId = brainWaveCourseUpload.CourseId,
                        Index = i,
                        Html = step.StepContent,
                        Title = step.Title
                    });
                }
                else
                {
                    dbStepUpdate.Html = step.StepContent;
                    dbStepUpdate.Title = step.Title;
                }
                ModifyStepFiles(step, brainWaveCourseUpload.CourseId, i);
            });
            stepsInDb.Where(step => step.Index > i)
                     .ToList()
                     .ForEach(step => _db.Steps.Remove(step));
        }

        private void ModifyStepFiles(BrainWaveCourseStepUpload brainWaveCourseStepUpload, int courseId, int stepIndex)
        {
            var filesInDb = _db.StepFiles.Where(file => file.CourseId == courseId && file.Index == stepIndex).ToList();
            int i = -1;
            brainWaveCourseStepUpload.AttachedFiles.ForEach(file => {
                i++;
                var dbStepFileUpdate = filesInDb.SingleOrDefault(dbStepFile => dbStepFile.Index == i);
                if (dbStepFileUpdate == null)
                {
                    _db.StepFiles.Add(new BrainWaveStepFile
                    {
                        CourseId = courseId,
                        Index = stepIndex,
                        FileId = file
                    });
                }
                else
                {
                    dbStepFileUpdate.FileId = file;
                }
            });
            filesInDb.Where(file => file.Index > i)
                        .ToList()
                        .ForEach(file => _db.StepFiles.Remove(file));
        }

        private BrainWaveCourse UpdateBrainWaveCourseEntry(BrainWaveCourseUpload brainWaveCourseUpload)
        {
            var courseInDb =
                _db.Courses.FirstOrDefault(course => course.CourseId == brainWaveCourseUpload.CourseId);

            if (courseInDb == null)
            {
                return null;
            }

            courseInDb.CourseAuthor = brainWaveCourseUpload.CourseAuthor;
            courseInDb.CourseDescription = brainWaveCourseUpload.CourseDescription;
            courseInDb.CourseEstimatedTime = brainWaveCourseUpload.CourseEstimatedTime;
            courseInDb.CourseName = brainWaveCourseUpload.CourseName;

            return courseInDb;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BrainWaveCourseExists(int id)
        {
            return _db.Courses.Count(e => e.CourseId == id) > 0;
        }

        private void DeleteBrainWaveCourseFiles(int courseId)
        {
            _db.CourseFiles.RemoveRange(_db.CourseFiles.Where(cf => cf.CourseId == courseId));
        }

        private void DeleteBrainWaveCourseSteps(int courseId)
        {
            _db.Steps.RemoveRange(_db.Steps.Where(s => s.CourseId == courseId));
        }

        private void DeleteBrainWaveStepFiles(int courseId)
        {
            _db.StepFiles.RemoveRange(_db.StepFiles.Where(sf => sf.CourseId == courseId));
        }

        #endregion
    }
}