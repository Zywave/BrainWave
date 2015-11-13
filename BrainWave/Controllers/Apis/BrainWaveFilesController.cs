using System;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Description;
using BrainWave.Models;
using ClouDeveloper.Mime;

namespace BrainWave.Controllers.Apis
{
    [RoutePrefix("api/brainwavefiles")]
    public class BrainWaveFilesController : ApiController
    {
        private BrainWaveDb _db = new BrainWaveDb();

        // GET: api/BrainWaveFiles
        public IQueryable<BrainWaveFile> GetFiles()
        {
            return _db.Files;
        }

        // GET: api/BrainWaveFiles/5
        [ResponseType(typeof(BrainWaveFile))]
        public IHttpActionResult GetBrainWaveFile(int id)
        {
            BrainWaveFile brainWaveFile = _db.Files.Find(id);
            if (brainWaveFile == null)
            {
                return NotFound();
            }

            return Ok(brainWaveFile);
        }

        [Route("{id:int}/contents")]
        public HttpResponseMessage GetBrainWaveFileContent(int id)
        {
            var brainWaveFile = _db.Files.Find(id);
            if (brainWaveFile == null)
            {
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }

            var uploadFileInfo = new FileInfo(GetFilePath(brainWaveFile));
            byte[] fileBytes = new byte[uploadFileInfo.Length];
            var uploadedFile = uploadFileInfo.OpenRead();
            uploadedFile.Read(fileBytes, 0, fileBytes.Length);
            
            var responseBody = new ByteArrayContent(fileBytes);
            responseBody.Headers.ContentType = new MediaTypeHeaderValue(MediaTypeNames.GetMediaTypeNames(brainWaveFile.FileType.Substring(1)).First());

            var response = new HttpResponseMessage(HttpStatusCode.OK) {Content = responseBody};

            return response;
        }

        // PUT: api/BrainWaveFiles
        [ResponseType(typeof(BrainWaveFileUpload))] //was void
        public IHttpActionResult PutBrainWaveFile(BrainWaveFileUpload brainWaveFileUpload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var brainWaveFile = new BrainWaveFile
            {
                FileType = brainWaveFileUpload.FileType.ToLower(),
                AuthorId = brainWaveFileUpload.AuthorId,
                AuthorName = brainWaveFileUpload.AuthorName,
                DisplayName = brainWaveFileUpload.DisplayName,
                Description = brainWaveFileUpload.Description,
                DateUploaded = DateTime.Now
            };

            if (brainWaveFile.FileType == null)
            {
                brainWaveFile.FileType = "";
            }

            if (!brainWaveFile.FileType.StartsWith(".") && brainWaveFile.FileType != String.Empty)
            {
                brainWaveFile.FileType = "." + brainWaveFile.FileType;
            }

            brainWaveFile = _db.Files.Add(brainWaveFile);

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (BrainWaveFileExists(brainWaveFile.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            var fileContents = brainWaveFileUpload.Body.ToCharArray();
            byte[] fileBytes = new byte[fileContents.Length];

            for (int i = 0; i < fileContents.Length; i++)
            {
                fileBytes[i] = (byte)fileContents[i];
            }

            var uploadFileInfo = new FileInfo("Files/" + brainWaveFile.Id + brainWaveFile.FileType);
            uploadFileInfo.Directory.Create();
            var uploadedFile = uploadFileInfo.Create();
            uploadedFile.Write(fileBytes, 0, fileBytes.Length);
            uploadedFile.Close();

            return CreatedAtRoute("DefaultApi", new { id = brainWaveFile.Id }, brainWaveFile);
        }

        // POST: api/BrainWaveFiles
        [ResponseType(typeof(BrainWaveFileUpload))]
        public IHttpActionResult PostBrainWaveFile(BrainWaveFileUpload brainWaveFileUpload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            if (brainWaveFileUpload.FileType == null)
            {
                brainWaveFileUpload.FileType = "";
            }

            if (!brainWaveFileUpload.FileType.StartsWith(".") && brainWaveFileUpload.FileType != String.Empty)
            {
                brainWaveFileUpload.FileType = "." + brainWaveFileUpload.FileType;
            }

            BrainWaveFile oldBrainWaveFile = _db.Files.Find(brainWaveFileUpload.Id);

            if (brainWaveFileUpload.Id != oldBrainWaveFile.Id)
            {
                return BadRequest();
            }

            File.Delete(GetFilePath(oldBrainWaveFile));

            oldBrainWaveFile.FileType = brainWaveFileUpload.FileType.ToLower();
            oldBrainWaveFile.AuthorId = brainWaveFileUpload.AuthorId;
            oldBrainWaveFile.AuthorName = brainWaveFileUpload.AuthorName;
            oldBrainWaveFile.DisplayName = brainWaveFileUpload.DisplayName;
            oldBrainWaveFile.Description = brainWaveFileUpload.Description;
            oldBrainWaveFile.DateUploaded = DateTime.Now;

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BrainWaveFileExists(oldBrainWaveFile.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var fileContents = brainWaveFileUpload.Body.ToCharArray();
            byte[] fileBytes = new byte[fileContents.Length];
                
            for (int i = 0;i < fileContents.Length;i++)
            {
                fileBytes[i] = (byte)fileContents[i];
            }

            var uploadFileInfo = new FileInfo(GetFilePath(oldBrainWaveFile));
            uploadFileInfo.Directory.Create();
            var uploadedFile = uploadFileInfo.Create();
            uploadedFile.Write(fileBytes, 0, fileBytes.Length);
            uploadedFile.Close();

            return CreatedAtRoute("DefaultApi", new { id = oldBrainWaveFile.Id }, oldBrainWaveFile);
        }

        // DELETE: api/BrainWaveFiles/5
        [ResponseType(typeof(BrainWaveFile))]
        public IHttpActionResult DeleteBrainWaveFile(int id)
        {
            BrainWaveFile brainWaveFile = _db.Files.Find(id);
            if (brainWaveFile == null)
            {
                return NotFound();
            }

            _db.StepFiles.RemoveRange(_db.StepFiles.Where(stepFile => stepFile.FileId == id));

            _db.Files.Remove(brainWaveFile);
            _db.SaveChanges();

            File.Delete(GetFilePath(brainWaveFile));

            return Ok(brainWaveFile);
        }

        private String GetFilePath(BrainWaveFile brainWaveFile)
        {
            return "Files/" + brainWaveFile.Id + brainWaveFile.FileType;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BrainWaveFileExists(int id)
        {
            return _db.Files.Count(e => e.Id == id) > 0;
        }
    }
}