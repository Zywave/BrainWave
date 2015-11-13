define(["plugins/http"], function (http) {
    var ctor = function () {

        this.handleSelectedFile = function() {     //Formats file when selected
            if ($("#fileUpload")[0].files[0]) {
                if (($("#fileUpload").val().split(".").pop() !== "txt") && ($("#fileUpload").val().split(".").pop() !== "mp4")) {       //If file not supported
                    $("#warning").html("Warning, ." +
                        $("#fileUpload").val().split(".").pop() +
                        " is an unsupported file extension for viewing in the browser. Users will still be allowed to download it.");   //Warn user about file
                } else {                                //If file is supported
                    $("#warning").html("");             //Remove warning
                }

                $("#submit").prop("disabled", false); //Enable submit

                $("#required").hide();
            } else {
                $("#submit").prop("disabled", true); //Disable submit

                $("#warning").html("");
                $("#required").html("Select a file to upload.");

                $("#required").show();
            }

            // clear upload confirmation as it is no longer relevent
            $("#confirmation").html("");
        };

        this.upload = function(event) {            //Upload selected file
            $("#confirmation").html("");            //Clear upload confirmation
            
            var file = $("#fileUpload")[0].files[0];    //Get the file
            var displayName = $("#displayName").val();  //Get display name of file
            if (displayName == null || displayName === "") {    //If no display name given, set to file name
                displayName = file.name;
            }
            var description = $("#description").val();  //Get description of file
            var authorName = "Sam";

            var fileType = "." + file.name.split(".").pop();    //Get the file type from the file name
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
                    http.put("api/BrainWaveFiles", data).then( //Send file to database
                        function () {           //After upload
                            $("#confirmation").html("Upload Confirmed");    //Notify the user that the upload succeeded

                            // clear old data
                            $("#displayName").val("");
                            $("#warning").html("");
                            $("#fileUpload").val("");
                            $("#description").val("");
                            $("#submit").prop("disabled", true);
                            $("#required").show();
                        }).fail(
                        function () {
                            $("#confirmation").html("Upload Failed");
                        });
                } catch (e) {
                    alert(e);   //Error? Notify the user
                }
            };

            r.readAsBinaryString(file);         //Read file
        };


    };
    return ctor;
});