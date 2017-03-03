//called from page1.php
//loads template components using JQuery, based on tracker variable

function navButtonClicked(value){

    //d3.select('.to-collapse').attr('class','to-collapse out');
    var tempClass =  d3.select('.to-collapse').attr('class')
    //console.log(tempClass.substr(tempClass.length-3,tempClass.length));
    if (tempClass.substr(tempClass.length-3,tempClass.length) == "out"){
        d3.select('.to-collapse').attr('class','to-collapse in');
        d3.select('.collapse-button').html('Hide Nav');
    }
    else{
        d3.select('.to-collapse').attr('class','to-collapse out');
        d3.select('.collapse-button').html('Show Nav');
    }
}


//read in the passed JSON in object format
tracker = JSON.parse(tracker);

reloadTemplate();

function reloadTemplate() {

    var currPage;

    console.log(tracker);

    if (typeof tracker[0].node == "undefined"){

        console.log('tracker node is not defined!!');

        $('#title').html('Some other page');

    }
    /*else if (tracker == 'B'){

        $.getJSON("template.json", function(json) {

            $('#title').html(json[1].title);

            $('#body-text').html(json[1].text);

            $("a#test-link").prop("href", json[1].link);

            $("a#test-link").text(json[1].linkText);
        });
    }*/
    else {
        //$('#title').html('Some other page');

        $.getJSON("template.json", function(json) {

            currPage = json.filter(function(d){
                return tracker[0].node == d.page;
            });

            if (typeof currPage != "undefined" && currPage.length > 0){

                $('.nav-title').html(currPage[0].title);

                $('#body-text').html(currPage[0].text);

                $('#synopsis').html(currPage[0].synopsis);

                $("a#test-link").prop("href", currPage[0].link);

                $("a#test-link").text(currPage[0].linkText);
            }
            else {
                console.log('node not found in template file!');

                $('#title').html('Not found');

                $('#body-text').html('Sorry, there is no data available for that node. Please go back to the index and select a new node. ' +
                    '<br><a href="./index.html">Index</a>');

                //$('#synopsis').html(currPage[0].synopsis);

                $("a#test-link").prop("href", "index.html");

                $("a#test-link").text("Index");
            }

        });

    }

    //loads script but doesn't run it
    // var newScript = $(document.createElement('script'));
    // newScript.src="/scripts/landDegradation.js";
    //
    // console.log(newScript);

    //loads script once document is done, and runs automatically
    //faster without the document ready, but might cause loading problems??
    $(document).ready(function() {

        //$.getScript("./scripts/vendor/topojson.js");  //added to HTML template for now
        if (typeof currPage != "undefined" && currPage.length > 0){
            console.log(tracker[0].node, currPage[0].page);

            $.getScript(currPage[0].script);

            $.getScript('./scripts/pageNav.js');
        }
        else {
            console.log('unknown node')
        }


        //add a new button for map updating
        //var r = $('<input/>', { type: "button", id: "changeMap", value: "1", onClick: "changeMap()" });
        //$("body").append(r);
    });
}



function nextClicked(){
    console.log('next clicked');

    if (tracker == "A"){
        tracker = "B";
    }
    else if(tracker == "B"){
        tracker = "A";
    }
    reloadTemplate();
}



//JS function to preprocess and send the data to the server
function sendData(tracker)
{
    //console.log(tracker);
    //create a JSON object for passing between webpages via PHP (to record user choices and prev. history)
    if (!tracker){

        console.log('tracker overwritten!');

        var tracker = [{"narrative":"none"}];

    }

    //convert the JSON object to a string using JS
    packed = JSON.stringify(tracker);
    document.phpForm.tracker.value = packed;
    document.phpForm.submit();
}

//****************************************************************************
