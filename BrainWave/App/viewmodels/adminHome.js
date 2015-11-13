define(["plugins/http", "durandal/app", "knockout", "jqwidget/jqx-all"], function (http, app, ko, jqxAll) {
    var ctor = function () {
        var that = this;
        this.courses = ko.observableArray();

        this.DummyCourse = function(title, description) {
            this.CourseName = title;
            this.CourseDescription = description;
        };

        this.selectedCourse = ko.observable(new this.DummyCourse("", ""));
        this.selectedCourseName = ko.computed(function() {
            return that.selectedCourse().CourseName;
        });
        this.selectedCourseDescription = ko.computed(function() {
            return that.selectedCourse().CourseDescription;
        });

        this.courseProgress = ko.observableArray();
        this.activate = function () {
            return http.get('/api/brainwavecourses', { format: 'json' }, 'jsoncallback').then(function (response) {
                that.courses(response);
                that.userID = 0;
                //when we have more users, the 0 will be a variable for the specific user that is looking at the page.  This is the default user 0 
                http.get('api/BrainWaveCourses/progress/' + that.userID, { format: 'json' }, 'jsoncallback').then(function (response) {
                    that.courseProgress(response);
                    var courseDictionary = {};
                    for (var i = 0; i < that.courseProgress().length; i++) {
                        courseDictionary[that.courseProgress()[i].CourseId] = that.courseProgress()[i].Complete;
                    }
                    for (var i = 0; i < that.courses().length; i++) {
                        that.courses()[i].Progress = courseDictionary[that.courses()[i].CourseId];
                        if (that.courses()[i].Progress == true) {
                            that.courses()[i].Progress = "Completed";
                        } else {
                            if (that.courses()[i].Progress == false) {
                                that.courses()[i].Progress = "In Progress";
                            } else {
                                that.courses()[i].Progress = "Not Started";
                            }
                        }
                    }
                    $("#jqxgrid").jqxGrid({ source: { localdata: that.courses, datatype: "array" } });
                });
            });
        }
        this.attached = function () {
            //Creating data for the grid to display
            that.source =
            {
                localdata: that.courses,
                datatype: "array"
            };
            // to create a jqxGrid you need a dataAdapter. This basically just has the array of data, localdata,
            // and two functions that do nothing right now but if we want to add functionality for the grid to 
            // do something on load complete or fail this is where we can do that.
            var dataAdapter = new $.jqx.dataAdapter(that.source);

            //Save the display type so that it can be used when making the course details visible again.
            $("#courseDetails").hide();

            //filling grid with the data
            $("#jqxgrid").jqxGrid(
            {
                //We can add more functionality here if we wanted drag and drop
                source: dataAdapter,
                sortable: true, //makes the grid sortable
                filterable: true,// makes the grid filterable
                selectionmode: 'singlerow',// makes the frid selectable
                autoheight: true,
                columnsresize: true,
                width: '98%',
                columns: [  //these are the columns that the grid will contain.  dynamic width with %'s 
                    { text: "Course Name", datafield: "CourseName", resizable: true },
                    { text: "Estimated Time", datafield: "CourseEstimatedTime", resizable: true },
                    { text: "Author", datafield: "CourseAuthor", resizable: true },
                ]
            });
            $("#jqxgrid").on('rowselect', function (event) {
                //Get selected course data
                var data = event.args.row;
                that.selectedCourse(data);
                that.selectedCourse.valueHasMutated();

                $("#modifyCourse").click(function() {
                    location.hash = "#modifyCourse?courseID=" + data.CourseId;
                });
                $("#close").click(function () {
                    $('#courseDetails').hide();
                }); //Effectively used to "close" the course details
                $("#courseDetails").show(); //Display course details
            });
        }

        this.takeCourse = function () {
            window.location.replace("/#takeCourse?userId=0&courseId=" + that.selectedCourse().CourseId);
        }

        this.uploadFiles = function () {
            location.hash = "#upload";
        };

        //changes page to createCourse when the create course button is pressed
        this.createCourse = function () {
            // if id exists, append it
            location.hash = "#createCourse";
        };

        this.modifyCourse = function () {
            location.hash = "#modifyCourse?courseID=" + that.selectedCourse().CourseId;
        }

        // Prompts to delete currently selected course
        this.deleteCourse = function() {
            app.showMessage("Are you sure you want to delete course \'" + that.selectedCourseName() + "\'", "Delete Course", ["Yes", "No"]).then(function(option) {
                if (option === "Yes") {
                    http.remove('/api/brainwavecourses/' + that.selectedCourse().CourseId).then(function() {
                        that.courses.remove(function(course) {
                            return course.CourseId === that.selectedCourse().CourseId;
                        });
                        that.source._localdata.slice(that.selectedCourse().uid, 1);
                        $("#courseDetails").hide();
                        $("#jqxgrid").jqxGrid('clearselection');
                    });
                }
            });
        }
    };

    return ctor;
});