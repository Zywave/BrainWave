define(["plugins/http", "durandal/app", "knockout", "jqwidget/jqx-all", "isFileSupported"], function (http, app, ko, jqxAll, supported) {
    var out = this;
    var ctor = function () {
        this.displayName = "Welcome, User";
        this.description = "Welcome";
        this.userId = 0;    //When registration is implemented, will set to a given user's established ID
        this.courseProgress = ko.observableArray();

        this.courses = ko.observableArray([]);

        var that = this;

        this.DummyCourse = function (title, description) {
            this.CourseName = title;
            this.CourseDescription = description;
        };

        this.selectedCourse = ko.observable(new this.DummyCourse("", ""));

        this.selectedCourseName = ko.computed(function () {
            return that.selectedCourse().CourseName;
        });
        this.selectedCourseDescription = ko.computed(function () {
            return that.selectedCourse().CourseDescription;
        });

        this.attached = function () {
            //Retrieve course info
            http.get('/api/brainwavecourses', { format: 'json' }, 'jsoncallback').then(function (response) {
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

            //Save the display type so that it can be used when making the course details visible again.
            $("#courseDetails").hide();

            //Creating data for the grid to display
            var source =
            {
                localdata: that.courses,
                datatype: "array"
            };
            // to create a jqxGrid you need a dataAdapter. This basically just has the array of data, localdata,
            // and two functions that do nothing right now but if we want to add functionality for the grid to 
            // do something on load complete or fail this is where we can do that.
            var dataAdapter = new $.jqx.dataAdapter(source, {
                loadComplete: function (data) { },
                loadError: function (xhr, status, error) { }
            });

            //filling grid with the data
            $("#jqxgrid").jqxGrid(
            {
                //We can add more functionality here if we wanted drag and drop
                source: dataAdapter,
                sortable: true, //makes the grid sortable
                filterable: true,// makes the grid filterable
                selectionmode: 'singlerow',
                columnsresize: true,
                autoheight: true,
                width: '98%',
                columns: [  //these are the columns that the grid will contain.  dynamic width with %'s 
                    { text: "Course Name", datafield: "CourseName", resizable: true },
                    { text: "Estimated Time", datafield: "CourseEstimatedTime", resizable: true },
                    { text: "Status", datafield: "Progress", resizable: true }
                ]
            });

            $("#jqxgrid").on('rowselect', function (event) {
                //Get selected course data
                var data = event.args.row;
                that.selectedCourse(data);
                that.selectedCourse.valueHasMutated();
                $("#courseDetails").show();
            });

        }
        this.takeCourse = function () {
            window.location.replace("/#takeCourse?userId=0&courseId=" + that.selectedCourse().CourseId);
        }
        
    }
    return ctor;
});