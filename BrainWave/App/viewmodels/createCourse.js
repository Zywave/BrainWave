define(["plugins/http", 'durandal/app', './fileSelectDisplayFilesModal', './fileSelectExistingView', 'isFileSupported', "course", "ckeditor/ckeditor", 'jqwidget/jqx-all'], function (http, app, fileSelectCustomDialog, fileSelectExisting, supported) {
    var ctor = function () {
        this.displayName = "Create a Course";
        this.description = "Add a new course";
        this.attachedFiles = ko.observableArray([]);
        this.allFiles = ko.observableArray([]);
        var that = this;

        this.courseName = function () {
            return courseDataKO().CourseName;
        };
        this.courseDescription = function () {
            return courseDataKO().CourseDescription;
        };
        this.courseEstimatedTime = function () {
            return courseDataKO().CourseEstimatedTime;
        };
        this.currentStepFiles = ko.computed(function () {
            return (courseDataKO().CourseSteps()[currentStepKO()] != undefined) ? courseDataKO().CourseSteps()[currentStepKO()].AttachedFiles() : ko.observableArray([]);
        }, this);
        this.currentStepTitle = ko.computed(function () {
            return (courseDataKO().CourseSteps()[currentStepKO()] != undefined) ? courseDataKO().CourseSteps()[currentStepKO()].Title.peek() : ko.observable("");
        }, this);
        this.currentStepContent = ko.computed(function () {
            return (courseDataKO().CourseSteps()[currentStepKO()] != undefined) ? courseDataKO().CourseSteps()[currentStepKO()].StepContent.peek() : ko.observable("");
        });
        this.steps = function () {
            return courseDataKO().CourseSteps();
        };
        this.activate = function (params) {
            if (params !== undefined && params != null) {
                that.courseID = params.courseID;
            }
            if (that.courseID !== undefined) {
                return http.get('/api/brainwavecourses/' + that.courseID, { format: 'json' }, 'jsoncallback').then(function(response) {
                    that.importedCourseData = response;
                });
            }
        };

        this.canDeactivate = function () {
            //the router's activator calls this function to see if it can leave the screen
            return app.showMessage('Are you sure you want to leave this page?', 'Navigate', ['Yes', 'No']);
        };

        this.deactivate = function () {
            // get rid of course data so the next time a course is created the data is empty
            resetCourseData();
        };

        this.attached = function () {
            if (that.courseID !== undefined) {
                setCourseData(that.importedCourseData);
            } else {
                that.courseID = -1;
            }
            // enable the CKEditor
            CKEDITOR.disableAutoInline = true;
            //TODO: advanced (html) options could break things
            var ck = CKEDITOR.inline('editor', {
                disableNativeSpellChecker: false,
                image_previewText: ' ',
                toolbar: [
                    { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'] },
                    { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
                    { name: 'editing', groups: ['find', 'selection'], items: ['Find', 'Replace', '-', 'SelectAll'] },
                    //TODO: forms are disabled currently because they can break things
                    //{ name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
                    '/',
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
                    //TODO: do we want create div - it may break things
                    //TODO: text direction is odd
                    //TODO: I don't know if language does anything
                    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
                    //TODO: limit link options - could break stuff
                    { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                    //TODO: limit image options, (possibly internal files only) - could break things
                    //TODO: do we really want flash??
                    //TODO: what worth is the page break
                    { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
                    '/',
                    { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                    { name: 'colors', items: ['TextColor', 'BGColor'] },
                    { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
                    { name: 'others', items: ['-'] },
                    { name: 'about', items: ['About'] }
                ],
                toolbarGroups: [
                    { name: 'document', groups: ['mode', 'document', 'doctools'] },
                    { name: 'clipboard', groups: ['clipboard', 'undo'] },
                    { name: 'editing', groups: ['find', 'selection'] },
                    { name: 'forms' },
                    '/',
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'] },
                    { name: 'links' },
                    { name: 'insert' },
                    '/',
                    { name: 'styles' },
                    { name: 'colors' },
                    { name: 'tools' },
                    { name: 'others' },
                    //TODO: is this really necessary?
                    { name: 'about' }
                ]
            });
            ck.on('instanceReady', function (ev) {
                var editor = ev.editor;
                editor.setReadOnly(false);
            });

            // paste as plaintext with no new lines
            // edited from http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
            $(".pseudoTextBox").on('paste', function (e) {
                e.preventDefault();
                var text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste something..');
                that.appendToCursorLocation(text);
            });

            $(".pseudoTextBox").on('drop', function(e) {
                e.preventDefault();
                var text = (e.originalEvent || e).dataTransfer.getData('text/plain') || prompt('Drag and drop something...');
                $(e.target).focus();
                that.appendToCursorLocation(text);
            });

            // disable enter creating new line
            $(".pseudoTextBox").on('keypress', function (e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                }
            });
            

            viewMetaDataEditor(false);
        };

        this.appendToCursorLocation = function (text) {
            window.document.execCommand('insertText', false, text);

            var titleHtml= $("#title").html();
            var tagStart = titleHtml.indexOf("<");
            var tagEnd = titleHtml.indexOf(">", tagStart);
            while (tagStart >= 0 && tagEnd >= 0) {
                var newText = "";
                if (tagStart > 0) {
                    newText += titleHtml.substring(0, tagStart);
                }
                if (tagEnd < titleHtml.length - 1) {
                    newText += titleHtml.substring(tagEnd + 1, titleHtml.length);
                }
                titleHtml = newText;

                tagStart = titleHtml.indexOf("<");
                tagEnd = titleHtml.indexOf(">", tagStart);
            }
            $("#title").html(titleHtml);
        };

        this.removeFile = function () {
            var idToRemove = this.Id;
            courseDataKO().CourseSteps()[currentStepKO()].AttachedFiles.remove(function (item) { return item.Id == idToRemove; });
        };

        //Creates the custom modal with the custom model
        this.showfileSelectDisplayFilesModal = function () {
            
            this.dialog = new fileSelectCustomDialog('Avalible Files', new fileSelectExisting(courseDataKO().CourseSteps()[currentStepKO()].AttachedFiles));

            this.dialog.show().then(function (response) {
                courseDataKO().CourseSteps()[currentStepKO()].AttachedFiles(response.FilesToInclude());
                //setFiles(response.FilesToInclude());
                //that.attachedFiles = response.FilesToInclude;
            });
        };
        this.submitCourse = function () {
            // save any potentially unsaved changes
            if (courseDataKO().CourseSteps()[currentStepKO()] != undefined) {
                courseDataKO().CourseSteps()[currentStepKO()].Title($('#title').html());
                courseDataKO().CourseSteps()[currentStepKO()].StepContent($('#editor').html());
            }

            var courseData = {
                CourseID: that.courseID,
                CourseName: courseDataKO().CourseName,
                CourseDescription: courseDataKO().CourseDescription,
                CourseEstimatedTime: courseDataKO().CourseEstimatedTime,
                Author: courseDataKO().Author,
                CourseSteps: []
            };
            for (var i = 0; i < courseDataKO().CourseSteps().length; i++) {
                courseData.CourseSteps[i] = courseDataKO().CourseSteps.peek()[i];
                courseData.CourseSteps[i] = {
                    Title: courseDataKO().CourseSteps()[i].Title(),
                    StepContent: courseDataKO().CourseSteps()[i].StepContent(),
                    AttachedFiles: courseDataKO().CourseSteps()[i].AttachedFiles()
            };
                // there is literally no reason for usefulName. if usefulName is replaced with what it equals, things break for absolutely no reason
                // this is magic
                var usefulName = courseDataKO().CourseSteps()[i].AttachedFiles();
                courseData.CourseSteps[i].AttachedFiles = [];
                for (var j = 0; j < usefulName.length; j++) {
                    courseData.CourseSteps[i].AttachedFiles[j] = usefulName[j].Id;
                }
            }

            try {
                // upload the course data
                var submit = that.courseID === -1 ? http.put : http.post;
                //var json = JSON.stringify(courseData);
                submit("api/BrainWaveCourses", courseData).then(
                    function (response) {
                        // navigate the page to the admin homepage
                        location.hash = "#adminHome";
                        that.courseID = response.CourseId;
                    }, function () {
                        alert("failed to create course");
                    });
            } catch (e) {
                alert(e);
            }

        };
    };

    return ctor;
});