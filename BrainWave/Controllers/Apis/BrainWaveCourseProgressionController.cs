using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BrainWave.Models;
using System.Collections.Generic;
using BrainWave.NonEFModels;

namespace BrainWave.Controllers.Apis
{
    public class BrainWaveCourseProgressionController : ApiController
    {
        private readonly BrainWaveDb _db = new BrainWaveDb();

        // GET: api/BrainWaveCourseProgresses
        public IQueryable<BrainWaveCourseProgress> GetProgressions()
        {
            return _db.Progressions;
        }

        [ResponseType(typeof(BrainWaveCourseProgress))]
        [Route("api/BrainWaveCourses/{courseId:int}/progress/{userId:int}")]
        public IHttpActionResult GetBrainWaveCourseProgress(int courseId, int userId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            BrainWaveCourseProgress prog = _db.Progressions.FirstOrDefault(s => s.CourseId == courseId && s.UserId == userId);

            if (prog == null)
            {
                return NotFound();
            }
            return Ok(prog);
        }

        //Use this
        [ResponseType(typeof(BrainWaveCourseProgress))]
        [Route("api/BrainWaveCourses/progress/{userId:int}")]
        public IHttpActionResult GetBrainWaveCourseProgress(int userId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            List<BrainWaveCourseProgress> prog = _db.Progressions.Where(p => p.UserId == userId).ToList();
            _db.SaveChanges();
            return Ok(prog);

        }

        // PUT: api/BrainWaveCourseProgress
        [ResponseType(typeof(BrainWaveCourseProgress))] //was void
        [Route("api/BrainWaveCourses/{courseId:int}/progress/{userId:int}")]
        public IHttpActionResult PutBrainWaveCourseProgress(int courseId, int userId, BrainWaveCourseProgressUpload brainWaveCourseProgressUpload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            BrainWaveCourse brainWaveCourse = _db.Courses.Find(courseId);
            //Will need to check for user when registration is implemented

            if (brainWaveCourse == null)
            {
                return BadRequest();
            }

            var brainWaveCourseProgress = new BrainWaveCourseProgress
            {
                CourseId = brainWaveCourseProgressUpload.CourseId,
                UserId = brainWaveCourseProgressUpload.UserId,
                StepIndex = brainWaveCourseProgressUpload.StepIndex,
                MaxStep = brainWaveCourseProgressUpload.MaxStep,
                TotalTime = brainWaveCourseProgressUpload.TotalTime,
                Complete = brainWaveCourseProgressUpload.Complete
            };

            brainWaveCourseProgress = _db.Progressions.Add(brainWaveCourseProgress);

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (BrainWaveCourseProgressExists(courseId, userId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            CreatedAtRoute("DefaultAPI", new { courseId = brainWaveCourseProgress.CourseId, userId = brainWaveCourseProgress.UserId }, brainWaveCourseProgress);
            return Ok();
        }

        // POST: api/BrainWaveCourseProgresses
        [ResponseType(typeof(BrainWaveCourseProgress))]
        [Route("api/BrainWaveCourses/progress/")]
        public IHttpActionResult PostBrainWaveCourseProgress(BrainWaveCourseProgressUpload brainWaveCourseProgressUpload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            BrainWaveCourseProgress oldBrainWaveCourseProgress = _db.Progressions.FirstOrDefault(s => s.CourseId == brainWaveCourseProgressUpload.CourseId 
                && s.UserId == brainWaveCourseProgressUpload.UserId);

            if (brainWaveCourseProgressUpload.CourseId != oldBrainWaveCourseProgress.CourseId 
                || brainWaveCourseProgressUpload.UserId != oldBrainWaveCourseProgress.UserId)
            {
                return BadRequest();
            }

            oldBrainWaveCourseProgress.CourseId = brainWaveCourseProgressUpload.CourseId;
            oldBrainWaveCourseProgress.UserId = brainWaveCourseProgressUpload.UserId;
            oldBrainWaveCourseProgress.StepIndex = brainWaveCourseProgressUpload.StepIndex;
            oldBrainWaveCourseProgress.MaxStep = brainWaveCourseProgressUpload.MaxStep;
            oldBrainWaveCourseProgress.TotalTime = brainWaveCourseProgressUpload.TotalTime;
            oldBrainWaveCourseProgress.Complete = brainWaveCourseProgressUpload.Complete;

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BrainWaveCourseProgressExists(oldBrainWaveCourseProgress.CourseId, oldBrainWaveCourseProgress.UserId))
                {
                    return NotFound();
                }

                throw;
            }

            CreatedAtRoute("DefaultApi", new { courseId = oldBrainWaveCourseProgress.CourseId, userId = oldBrainWaveCourseProgress.UserId }, oldBrainWaveCourseProgress);
            return Ok();
        }

        // DELETE: api/BrainWaveCourseProgresses/5
        [ResponseType(typeof(BrainWaveCourseProgress))]
        [Route("api/BrainWaveCourses/{courseId:int}/progress/{userId:int}")]
        public IHttpActionResult DeleteBrainWaveCourseProgress(int courseId, int userId)
        {
            BrainWaveCourseProgress brainWaveCourseProgress = _db.Progressions.Find(courseId, userId);
            if (brainWaveCourseProgress == null)
            {
                return NotFound();
            }

            _db.Progressions.Remove(brainWaveCourseProgress);
            _db.SaveChanges();

            return Ok(brainWaveCourseProgress);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BrainWaveCourseProgressExists(int courseId, int userId)
        {
            return _db.Progressions.Count(e => e.CourseId == courseId && e.UserId == userId) > 0;
        }
    }
}