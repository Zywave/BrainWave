define(["plugins/http", "knockout", "course", "isFileSupported"], function (http, ko, courseStuff, supported) {
    var ctor = function () {
        this.courseId;  //Store ID of selected course from user page
        this.name;      //Store name of selected course so it can be displayed      
        this.stepCount; //Currently selected step
        this.userId = 0;    //Current user taking course, is 0 for now for testing purposes
        this.steps = ko.observableArray([]);
        this.progress;  //Store reference to the progress on the DB so that it can be edited later
        this.startTime; //Time the user starts/restarts course
        this.maxStep;   //The furthest the user has gotten in a course

        var that = this;

        this.activate = function (params) {     //When site is requested
            that.userId = params.userId;
            that.courseId = params.courseId;
        }

        this.modifySteps = function (steps) {   //Gets steps ready to be viewed
            for (var i = 0; i < steps.length; i++) {
                if (that.progress.Complete) {   //If the user has already taken the course, then they've already visited all the steps
                    steps[i].stepState = "visited";
                } else if (i <= that.maxStep) {  //Has the user been here yet?
                    steps[i].stepState = "visited";         //All steps previously seen can be navigated to using sidebar
                } else {
                    steps[i].stepState = "unvisited";       //All steps start as unvisited so they cannot be navigated to using the sidebar
                }
                steps[i].stepLocation = i;                  //Index of step in the course
                steps[i].stepClicked = function (data, event) {         //Allows clicking on steps in the sidebar
                    if (data.stepState == "visited") {                  //Should only navigate to step if it's been visited before
                        var prevStepLocation = that.stepCount;          //Save current step
                        that.stepCount = data.stepLocation;             //Set current location to step being navigated to
                        that.viewStep(that.steps()[prevStepLocation], data);    //Navigate from current step to selected step
                    }
                }
            }
        }

        this.viewStep = function (fromStep, toStep) {       //Needs to know where you're coming from and where you're going
            $("#pageTitle").html('<h2>' + supported.sanitize(toStep.Title) + '</h2>');   //Set panel title to title of step
            $("#courseContent").html(toStep.StepContent);    //Set panel contents to the contents of the step (which are saved in html)

            if (that.stepCount == 0) {                        //First step
                $("#back").prop("disabled", true).addClass('disabled');        //Don't go further back than should be possible
            }
            else if (that.stepCount > 0) {                //Not first step?
                $("#back").prop("disabled", false).removeClass("disabled");       //Allow to go back
            }


            if (that.stepCount == that.steps().length - 1) { // Last step?
                $("#next").html("Finish");   //Change next button to finish button to let user know they are about to end the course
            } else {                                          // Not last step?
                $("#next").html("Next");     //Change next button back to next button
            }
            toStep.stepState = "current";       //Change step you're navigating to to be the current step

            if (fromStep != null) {              //If not the very first step, when initializing taking course there is no step being navigated from
                fromStep.stepState = "visited"; //Change step you were on to visited
            }
            if (that.progress.Complete) {       //If the course is completed the finish later button should be changed to just exit
                $("#finishLater").html("Leave");
            }

            that.refresh(that.steps);           //Tell knockout to update its info and redraw
        }

        this.attached = function () {           //When html is loaded for the page, get the steps from the selected course
            that.stepCount = 0;     //Start from beginning
            http.get('/api/brainwavecourses/' + that.courseId, { format: 'json' }, 'jsoncallback').then(function (response) {
                that.name = response.CourseName;                        //Set name of selected course
                http.get('/api/brainwavecourses/' + that.courseId + '/progress/' + that.userId, { format: 'json' }, 'jsoncallback').then(function (response2) {
                    that.progress = response2;  //Store user progress
                    if (!response2.Complete) { //Has user completed the course already?
                        that.stepCount = response2.StepIndex;           //If no, start at last step user visited
                        that.maxStep = response2.MaxStep;               //Save the furthest the user has gotten
                    }
                    that.modifySteps(response.CourseSteps);             //Get steps ready
                    that.steps(response.CourseSteps);                   //Set knockout array data
                    that.viewStep(null, that.steps()[that.stepCount]);  //Initialize view to established step
                }, function () {
                    that.progress = {
                        CourseId:that.courseId,
                        UserId:that.userId,
                        Complete: false,
                        StepIndex: 0,
                        MaxStep: 0,
                        TotalTime: 0
                    };
                    http.put('/api/brainwavecourses/' + that.courseId + '/progress/' + that.userId, that.progress);
                    that.modifySteps(response.CourseSteps);             //Get steps ready
                    that.steps(response.CourseSteps);                   //Set knockout array data
                    that.viewStep(null, that.steps()[that.stepCount]);  //Initialize view to established step
                });
            });
            that.startTime = new Date().getTime();  //Time user starts/restarts course
        }

        this.next = function () {               //Navigates to the next step
            if (that.stepCount < that.steps().length - 1) { //Not last step?
                that.viewStep(that.steps()[that.stepCount], that.steps()[++that.stepCount]);//Navigate to next step
                if (that.stepCount > that.maxStep)          //Has the user gotten further than they have before?
                    that.maxStep = that.stepCount;          //Set the user's new furthest point
            } else {                                        //Last step?
                that.closeCourse(true);
            }
        }

        this.back = function () {               //Navigates to previous step
            that.viewStep(that.steps()[that.stepCount], that.steps()[--that.stepCount]);    //Navigate to previous step
        }

        this.finishLater = function () {        //Allows a user to stop taking a course and resume later
            that.closeCourse(false);
        }

        this.closeCourse = function (finishing) {           //Executes when user finishes a course or clicks "Finish Later"
            if (!that.progress.Complete) {      //Save progress if the user hasn't already completed the course
                that.progress.Complete = finishing;
                that.progress.StepIndex = that.stepCount;   //Save user's current step
                that.progress.TotalTime += ((new Date().getTime()) - that.startTime);   //Update user's time spent
                that.progress.MaxStep = that.maxStep;
                http.post('api/BrainWaveCourses/progress/', that.progress);  //Update DB
            }
            location.hash = "#userPage";          //Return the user to the home page
        }

        this.refresh = function (obsArray) {    //Tells knockout to update data and redraw data
            var data = obsArray().slice(0);     //Dirty force knockout to acknowledge data change
            obsArray([]);                       //Reset array
            obsArray(data);                     //Reset array
        };
    }
    return ctor;
});