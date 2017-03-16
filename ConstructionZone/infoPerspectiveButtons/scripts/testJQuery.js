
var tracker = 'A';

reloadTemplate();

function reloadTemplate() {

    if (tracker == 'A'){

        $.getJSON("template.json", function(json) {

            $('#title').html(json[0].title);

            $('#body-text').html(json[0].text);

            $("a#test-link").prop("href", json[0].link);

            //$('#synopsis').html(json[0].synopsis);

            $("a#test-link").text(json[0].linkText);

            $('.nav-title').html("Global C");

            $('#myModalLabel').html(json[0].modalTitle);

            $('#modal-text').html(json[0].modalContent);
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
        //$.getScript("./scripts/vendor/topojson.js");  //added to HTML template for now
        $.getScript("./scripts/globalC.js");
        //$.getScript("./scripts/bg-nav.js");

        //add a new button for map updating
        var r = $('<input/>', { type: "button", id: "changeMap", value: "1", onClick: "changeMap()" });
        $("body").append(r);
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

