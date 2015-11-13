define(["plugins/http", 'durandal/app'], function (http,app) {

    var ctor = function (attachedFiles) {
        this.title = 'Files';
        //All avalible files to attach
        this.allFiles = ko.observableArray();
        var that = this;
        this.FilesToInclude = ko.observableArray(attachedFiles());

        this.activate = function() {
            return this.showFiles();
        }
        this.attached = function () {
                //Creating data for the grid to display
                var source =
                {
                    localdata: that.allFiles,
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
                mygrid = $("#jqxgrid");
                $("#jqxgrid").jqxGrid(
                {
                    //We can add more functionality here if we wanted drag and drop
                    source: dataAdapter,
                    sortable: true, //makes the grid sortable
                    filterable: true,// makes the grid filterable
                    selectionmode: 'checkbox',// makes the grid selectable
                    columns: [  //these are the columns that the grid will contain.  dynamic width with %'s 
                        { text: "File name", datafield: "DisplayName", width: "100%" }
                       
                    ],
                    ready: function () {

                        var gridDictionary = {};
                        for (var i = 0; i < $('#jqxgrid').jqxGrid('getrows').length ; i++) {
                            gridDictionary[$('#jqxgrid').jqxGrid('getrowdata', i).Id] = i;
                        }
                        for (var i = 0; i < that.FilesToInclude().length; i++) {
                            $('#jqxgrid').jqxGrid('selectrow', gridDictionary[that.FilesToInclude()[i].Id]);
                            
                        }
                    }
                });
                $("#jqxgrid").on('rowselect', function (event) {
                    //Get selected course data
                    var data = event.args.row;
                    that.FilesToInclude.push(data);
                });
                $("#jqxgrid").on('rowunselect', function (event) {
                    //Get selected course data
                    var data = event.args.row;
                    that.FilesToInclude.remove(function (item) { return item.Id == data.Id });
                });
        }
        //Gets all of the avalible files to include
        this.showFiles = function () {
            return http.get('/api/brainwavefiles', { format: 'json' }, 'jsoncallback').then(function (response) {              
                that.allFiles(response);
            });
        };
    };

    return ctor;
});