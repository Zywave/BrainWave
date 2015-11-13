define(['plugins/router', 'durandal/app'], function (router, app) {
    return {
        router: router,
        activate: function () {
            router.map([
                //{ route: '', title:'Welcome', moduleId: 'viewmodels/welcome', nav: true },
                //{ route: 'flickr', moduleId: 'viewmodels/flickr', nav: true },
                { route: 'adminHome', title: 'Admin Home', moduleId: 'viewmodels/adminHome', nav: true },
                // Clean up auto navigation to adminHome
                { route: '', title: "Admin Home", moduleId: 'viewmodels/adminHome', nav: false },
                { route: 'createCourse', title: "Create a Course", moduleId: 'viewmodels/createCourse', nav: false },
                { route: 'modifyCourse', title: "Modify a Course", moduleId: 'viewmodels/createCourse', nav: false },
                { route: 'takeCourse', title: 'Take Course', moduleId: 'viewmodels/takeCourse', nav: false},
                { route: 'filesPage', title: 'Files', moduleId: 'viewmodels/filesPage', nav: true },
                { route: 'upload', moduleId: 'viewmodels/upload', nav: true },
                { route: 'userHome', title: 'User Home', moduleId: 'viewmodels/userHome', nav: true }
            ]).buildNavigationModel();
            
            return router.activate();
        }
    };
});