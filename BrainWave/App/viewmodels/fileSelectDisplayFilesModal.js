define(['plugins/dialog'], function (dialog) {
    var customFilesModal = function (title, model) {
        this.title = title;
        this.model = model;
    };
    //This is what is used to send data back when the window is closed
    customFilesModal.prototype.ok = function () {
        dialog.close(this, this.model);
    };
    //This is what is used to show the model sent
    customFilesModal.prototype.show = function () {
        return dialog.show(this);
    };

    return customFilesModal;
});