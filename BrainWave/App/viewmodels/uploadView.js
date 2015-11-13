define(["plugins/http", 'durandal/app'], function (http, app) {
    var ctor = function (file, replacing, brainWave) {
        var that = this;

        this.file = file;           //File to be replaced, if replacing
        this.replacing = replacing; //Bool asking if replacing
        this.brainWave = brainWave; //Reference to brainwave.js
        this.processing = false;

        this.attached = function () {
            if (that.replacing) {
                $("#displayName").attr("value", file.DisplayName);
                $("#description").attr("value", file.Description);
            }
        };

        this.canDeactivate = function () {
            return !that.processing;
        };

        this.getCantDeactivateReason = function () {
            return "Please wait for the dialog to finish processing before closing.";
        }

        this.handleSelectedFile = function () {
            $("#submit").prop("disabled", false);
            $("#required").hide();
            $("#confirmation").html("");            //Clear upload confirmation
        };

        this.submit = function () {
            $("#confirmation").html("");            //Clear upload confirmation

            var file = $("#fileUpload")[0].files[0];    //Get the new file
            var displayName = $("#displayName").val();  //Get display name of file
            if (displayName == null || displayName === "") {    //If no display name given, set to file name
                displayName = file.name;
            }
            var description = $("#description").val();  //Get description of file
            var authorName = "Sam";
            var fileType = "." + file.name.split(".").pop();    //Get the file type from the file name

            if (that.replacing) {
                that.replace(file, displayName, description, fileType, authorName);
            } else {
                that.upload(file, displayName, description, fileType, authorName);
            }
        };

        this.replace = function (file, displayName, description, fileType, authorName) {
            var r = new FileReader();

            r.onload = function (fileEvent) {   //Based off of old code
                var readFile = fileEvent.target.result;         //Get file from binary string reading
                var data = {                    //Create http post header file
                    Id: that.file.Id,
                    Body: readFile,             //File to be uploaded
                    DisplayName: displayName,   //File's name
                    AuthorId: 1,                //Authored by admin x
                    AuthorName: authorName,     //Author's name (potentially resolved by login, but for now is a dummy user)
                    FileType: fileType,         //Type of the file
                    Description: description    //File description
                };

                try {
                    fileEvent.preventDefault(); //Prevent stuff
                    that.processing = true;
                    http.post("api/BrainWaveFiles", data).then( //Send file to database
                        function (response) {   //After upload
                            that.messageResponse(response, true);
                        }).fail(
                        function () {
                            $("#confirmation").html("Upload Failed");
                        }).always(function() {
                            that.processing = false;
                        });
                } catch (e) {
                    alert(e);   //Error? Notify the user
                }
            }

            r.readAsBinaryString(file);         //Read file
        };

        this.upload = function (file, displayName, description, fileType, authorName) {
            var r = new FileReader();

            r.onload = function (fileEvent) {   //Based off of old code
                var readFile = fileEvent.target.result;         //Get file from binary string reading
                var data = {                    //Create http post header file
                    Body: readFile,             //File to be uploaded
                    DisplayName: displayName,   //File's name
                    AuthorId: 1,                //Authored by admin x
                    AuthorName: authorName,     //Author's name (potentially resolved by login, but for now is a dummy user)
                    FileType: fileType,         //Type of the file
                    Description: description    //File description
                };

                try {
                    fileEvent.preventDefault(); //Prevent stuff
                    that.processing = true;
                    http.put("api/BrainWaveFiles", data).then( //Send file to database
                        function (response) {   //After upload
                            that.messageResponse(response, false);
                        }).fail(
                        function () {
                            $("#confirmation").html("Upload Failed");

                        }).always(function () {
                            that.processing = false;
                        });
                } catch (e) {
                    alert(e);   //Error? Notify the user
                }
            }

            r.readAsBinaryString(file);         //Read file
        };

        this.messageResponse = function (response, replace) {
            $("#confirmation").html("Upload Confirmed");    //Notify the user that the upload succeeded
            response = that.brainWave.modifyResponse([response]);   //The post returns the file, sanitize it
            response = response[0];
            var index = that.brainWave.files.indexOf(that.file);    //Find the place the new file will be taking
            var data = that.brainWave.files.slice(0);               //Get the array
            data[index] = response;                         //Add the new file in place of the old
            that.brainWave.files([]);                       //Dirty refresh
            that.brainWave.files(data);

            if (!replace) {
                // clear old data
                $("#displayName").val("");
                $("#warning").html("");
                $("#fileUpload").val("");
                $("#description").val("");
                $("#submit").prop("disabled", true);
                $("#required").show();
            }
        }
    }

    return ctor;
});