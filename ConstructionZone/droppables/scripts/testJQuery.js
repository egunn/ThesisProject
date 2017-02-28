
var tracker = 'A';

reloadTemplate();

function reloadTemplate() {

    if (tracker == 'A'){

        $.getJSON("template.json", function(json) {

            $('.nav-title').html(json[0].title);

            $('#body-text').html(json[0].text);

            $('#synopsis').html(json[0].synopsis);

            $("a#test-link").prop("href", json[0].link);

            $("a#test-link").text(json[0].linkText);
        });
    }
    else if (tracker == 'B'){

        $.getJSON("template.json", function(json) {

            $('#title').html(json[1].title);

            $('#body-text').html(json[1].text);

            $("a#test-link").prop("href", json[1].link);

            $("a#test-link").text(json[1].linkText);
        });
    }
    else {
        $('#title').html('Some other page');
    }

    //loads script but doesn't run it
    // var newScript = $(document.createElement('script'));
    // newScript.src="/scripts/landDegradation.js";
    //
    // console.log(newScript);

    //loads script once document is done, and runs automatically
    //faster without the document ready, but might cause loading problems
    $(document).ready(function(){

        //dynamically add jQuery UI css
        var linkElem = document.createElement('link');
        document.getElementsByTagName('head')[0].appendChild(linkElem);
        linkElem.rel = 'stylesheet';
        linkElem.type = 'text/css';
        linkElem.href = './scripts/vendor/jquery-ui-1.12.1/jquery-ui.css';


        //$.getScript("./scripts/vendor/topojson.js");  //added to HTML template for now
        $.getScript("./scripts/vendor/crossfilter.js");

        //timing problem? Doesn't complete load; throws warning/error
        //$.getScript("./scripts/vendor/jquery-ui-1.12.1/jquery-ui.js");

        $.getScript("./scripts/droppables.js");

        /*var testDrop = $('<input/>', { type: "button", id: "droppable", class:"ui-widget-content", value: "drop on me"});
        $("#vis-div").append(testDrop);*/

        //add a new button for map updating
        //var r = $('<input/>', { type: "button", id: "changeMap", value: "1", onClick: "changeMap()" });
        //$("body").append(r);
    });
}


function nextClicked(){
    if (tracker == "A"){
        tracker = "B";
    }
    else if(tracker == "B"){
        tracker = "A";
    }
    //reloadTemplate();
}

