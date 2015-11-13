var courseDataKO = ko.observable({
    CourseName: ko.observable(""), CourseDescription: ko.observable(""), CourseEstimatedTime: ko.observable(""), Author: ko.observable(""), CourseSteps: ko.observableArray([])
});
var currentStepKO = ko.observable(0);
var currentView;
var META_DATA = 1;
var STEPS = 2;

function resetCourseData() {
    setCourseData();
    currentView = null;
}

function setCourseData(data, step) {
    // Here the || operator is used for null coalescing
    // It allows the function to be called with missing parameters
    data = data || {};
    courseDataKO().CourseName(data.CourseName || "");
    courseDataKO().CourseDescription(data.CourseDescription || "");
    courseDataKO().CourseEstimatedTime(data.CourseEstimatedTime || "");
    courseDataKO().Author(data.Author || "");
    for (var i = 0; i < (data.CourseSteps || []).length; i++) {
        data.CourseSteps[i].Title = ko.observable(data.CourseSteps[i].Title);
        data.CourseSteps[i].StepContent = ko.observable(data.CourseSteps[i].StepContent);
        data.CourseSteps[i].AttachedFiles = ko.observableArray(data.CourseSteps[i].AttachedFiles || []);
    }
    courseDataKO().CourseSteps(data.CourseSteps || []);
    currentStepKO(step || 0);
}

function setStepColor(step, hasFocus) {
    var color;
    if (hasFocus) {
        color = 'gray';
    } else {
        color = 'inherit';
    }
    // color the step button based on which is selected
    $("#step" + step).css('background', color);
}

function viewMetaDataEditor(save) {
    if (save == undefined || save === true) {
        saveCurrentStep();
    }

    if (currentView === STEPS) { 
        // indicate that no step is selected
        setStepColor(currentStepKO(), false);
    }
    currentView = META_DATA;

    $("#step").css("display", "none");
    $("#metaData").css("display", "inline");

    $("#attachedFileDiv").hide();
    $("#attachFileButton").hide();
}

function viewStepEditor() {
    currentView = STEPS;

    $("#metaData").css("display", "none");
    $("#step").css("display", "inline");

    $("#attachedFileDiv").show();
    $("#attachFileButton").show();
}

function swapSteps(a, b) {
    if (a === currentStepKO() || b === currentStepKO()) {
        saveCurrentStep();
    }

    // switch the course data
    // Done attribute by attribute to update the knockout data bindings
    var tempTitle = courseDataKO().CourseSteps()[a].Title();
    courseDataKO().CourseSteps()[a].Title(courseDataKO().CourseSteps()[b].Title());
    courseDataKO().CourseSteps()[b].Title(tempTitle);

    var tempContent = courseDataKO().CourseSteps()[a].StepContent();
    courseDataKO().CourseSteps()[a].StepContent(courseDataKO().CourseSteps()[b].StepContent());
    courseDataKO().CourseSteps()[b].StepContent(tempContent);

    var tempAttachedFiles = courseDataKO().CourseSteps()[a].AttachedFiles();
    courseDataKO().CourseSteps()[a].AttachedFiles(courseDataKO().CourseSteps()[b].AttachedFiles());
    courseDataKO().CourseSteps()[b].AttachedFiles(tempAttachedFiles);
}

function moveCurStepUp() {
    if (currentStepKO() === 0) {
        return;
    }

    swapSteps(currentStepKO() - 1, currentStepKO());

    // keep focus on the same step, just in a different spot
    selectStep(currentStepKO() - 1, false);
}

function moveCurStepDown() {
    if (currentStepKO() === courseDataKO().CourseSteps().length - 1) {
        return;
    }

    swapSteps(currentStepKO(), currentStepKO() + 1);

    // keep focus on the same step, just in a different spot
    selectStep(currentStepKO() + 1, false);
}

function setStepData(id, title, content) {
    if (courseDataKO().CourseSteps().length <= id) {
        // add the data
        courseDataKO().CourseSteps.push({ Title: ko.observable(title), StepContent: ko.observable(content), AttachedFiles: ko.observableArray([]) });
    }
}

function selectStep(id, save) {
    if (save === undefined || save) {
        saveCurrentStep();
    }
    if (currentView !== STEPS) {
        viewStepEditor();
    }

    if (id >= courseDataKO().CourseSteps().length || id < 0) {
        return;
    }

    // update the colors to indicate which step is selected
    viewStep(id);
}

function deleteStep(id) {
    courseDataKO().CourseSteps.splice(id, 1);

    if (courseDataKO().CourseSteps().length === 0) {
        viewMetaDataEditor(false);
        currentStepKO(0);
    } else if (id < currentStepKO()) {
        selectStep(currentStepKO() - 1, false);
    } else if (id === currentStepKO()) {
        var nextCurrentStep = currentStepKO();

        if (nextCurrentStep >= courseDataKO().CourseSteps().length) {
            nextCurrentStep--;
        }

        selectStep(nextCurrentStep, false);
        currentStepKO(nextCurrentStep);
    }
}

function viewStep(id) {
    setStepColor(currentStepKO(), false);
    currentStepKO(-1); // Set current step to null so knockout is comparing to a blank slate and always updates
    currentStepKO(id);
    setStepColor(currentStepKO(), true);
}

function addStep(setFocus) {
    // make sure the step is saved before potentially navigating away from the step
    
    var id = courseDataKO().CourseSteps().length;
    var defaultTitle = "Title";

    // display default step data
    setStepData(id, defaultTitle, "&lt;Add content here&gt;");

    if (setFocus) {
        // navigate away from the current step to the new step
        selectStep(id);
    }
}

function setFiles(files) {
    courseDataKO().CourseSteps()[currentStepKO()].AttachedFiles(files);
}

function saveCurrentStep() {
    courseDataKO().CourseSteps()[currentStepKO()].Title($('#title').html());
    courseDataKO().CourseSteps()[currentStepKO()].StepContent($('#editor').html());
}