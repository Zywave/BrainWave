requirejs.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'ckeditor': '../Scripts/ckeditor',
        'jqwidget' : '../Scripts/jqwidgets'
    }
});

define('jquery', function () { return jQuery; });
define('knockout', ko);

var htmlChangeHandler = function (event) {
    if (event.data != undefined) {
        accessor = event.data.accessor;
        if (typeof accessor() === "function") {
            accessor = accessor();
        }
        accessor($(event.target).html());
    }
};

ko.bindingHandlers.htmlInput = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(element).keyup({ accessor : valueAccessor, viewModel : viewModel }, htmlChangeHandler);
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        if (valueAccessor != undefined && valueAccessor() != undefined) {
            if (typeof valueAccessor() === "function") {
                $(element).html(valueAccessor()());
            } else if (valueAccessor()) {
                $(element).html(valueAccessor());
            }
        }
    }
};

define(['durandal/system', 'durandal/app', 'durandal/viewLocator'],  function (system, app, viewLocator) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'BrainWave';

    app.configurePlugins({
        router: true,
        dialog: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});