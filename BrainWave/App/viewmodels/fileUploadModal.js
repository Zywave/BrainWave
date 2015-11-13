define(['plugins/dialog'], function (dialog) {
    var uploadModal = function (replacing, model) {
        this.replacing = replacing; //Bool asking if the dialog is used for upload or replacement
        this.model = model;     //View being fed to the modal for display
        this.title = replacing ? "Replace File" : "Upload File";
    };
    //This is what is used to send data back when the window is closed
    uploadModal.prototype.ok = function () {
        if (this.model.canDeactivate()) {
            dialog.close(this, this.model);
        } else {
            $('.modal-footer-note').text(this.model.getCantDeactivateReason());
        }
    };
    //This is what is used to show the model sent
    uploadModal.prototype.show = function () {
        return dialog.show(this);
    };

    return uploadModal;
});