define(["plugins/http", "isFileSupported", "durandal/app", "knockout", "./fileUploadModal", "./uploadView"], function (http, isFileSupported, app, ko, modal, view) {
    var ctor = function () {
        this.files = ko.observableArray([]);

        var that = this;

        this.view = function (file) {
            var jfile = file;//JSON.parse(file);
            if (jfile.FileType.toLowerCase() === ".mp4") {
                //change src to the location of the file to change the file displayed.   
                var filesrc = jfile.Src;  //"/api/BrainWaveFiles/" + jfile.Id + "/contents";
                $("#display").html(" <video controls> <source src='" + filesrc + "' type='video/mp4'></video>");
            } else if (jfile.FileType.toLowerCase() === ".pdf") {
                $("#display").html(" <iframe src='/api/BrainWaveFiles/" + jfile.Id + "/contents' seemless></iframe>");
            }
            else {
                $.get(jfile.Src, function (data, status) {
                    var fileContents = data;
                    fileContents = isFileSupported.sanitize(fileContents);
                    $("#display").html(fileContents);
                });
            }

        };

        this.download = function (file) {
            var a = $("#" + file.Id)[0];
            if (!that.downloadSupported()) {
                a.target = "_blank";
            }
            a.click();
        };

        this.deleteFile = function (file) {
            var confirm = window.confirm("Are you sure you want to delete " + file.DisplayName + "?");
            if (confirm) {
                http.remove("api/BrainWaveFiles/" + file.Id).then(function(response) {
                    that.files.remove(file); //Removing from database, update the ObservableArray as well
                });
            }
        };

        this.replaceFile = function (file) {
            this.dialog = new modal(true, new view(file, true, that));  //Create the modal dialog
            this.dialog.show();
        };

        // checks if the browser supports the "download" attribute on an "a" tag
        this.downloadSupported = function () {
            var a = document.createElement('a');
            return typeof a.download != "undefined";
        };

        this.modifyResponse = function (response) {
            for (var i = 0; i < response.length; i++) {
                var file = response[i];
                file.authorDisplay = "";
                file.Src = "/api/BrainWaveFiles/" + file.Id + "/contents";
                file.Filename = file.DisplayName + file.FileType;
                if (file.AuthorName !== "" && file.AuthorName != null) {
                    file.authorDisplay = "Uploaded by: " + file.AuthorName;
                }
                file.DisplayType = isFileSupported.isSupported(file.FileType.toLowerCase()) ? "View" : "Download";
                file.OnClickEvent = isFileSupported.isSupported(file.FileType.toLowerCase()) ? that.view : that.download;
                file.DeleteName = "Delete";
                file.Delete = that.deleteFile;
                file.ReplaceName = "Replace";
                file.Replace = that.replaceFile;
            }
            return response;
        };

        this.activate = function () {
            http.get('/api/brainwavefiles', { format: 'json' }, 'jsoncallback').then(function (response) {
                response = that.modifyResponse(response);   //Sanitize files
                that.files(response);                       //Put files in the ObservableArray
            });
        };

    };


    return ctor;
});
