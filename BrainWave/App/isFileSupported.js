define([], function () {
    return {
        supportedExtentions: ["txt", "mp4"],

        isSupported: function(filename) {
            var fileExtention = filename.split(".").pop();
            return this.supportedExtentions.indexOf(fileExtention) > -1;
        },

        // a list of html special characters to be used to take plaintext and convert it to display as html-safe text that displays as it would in a basic text editor
        specialChars: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "/": "&frasl;",
            "\n": "<br/>",
            "\t": "&nbsp;&nbsp;&nbsp;&nbsp;",
            " ": "&nbsp;"
        },

        sanitize: function (text) {
            for (var key in this.specialChars) {
                text = text.replace(new RegExp(key, "g"), this.specialChars[key]);
            }
            return text;
        }
    };
});