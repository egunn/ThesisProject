//called from page1.php
//loads template components using JQuery, based on tracker variable

//decide whether submitting the PHP form should reload the template or point to another page
//to use, replace HTML form in page1.php action with: "javascript:phpAction()"
//currently, conditional statement works, but returns only the text index.html or page1.php; doesn't load the new page
//function phpAction(){
    /*if(tracker[0].currentNode == "Z"){
        return "index.html";
    }
    else{
        return "page1.php";
    }*/
//}

function navButtonClicked(value){

    //d3.select('.to-collapse').attr('class','to-collapse out');
    var tempClass =  d3.select('.to-collapse').attr('class');
    //console.log(tempClass.substr(tempClass.length-3,tempClass.length));
    if (tempClass.substr(tempClass.length-3,tempClass.length) == "out"){
        d3.select('.to-collapse').attr('class','to-collapse in');
        d3.select('.collapse-button').html('Hide Nav');
        if(tracker[0].node == "D"){
            d3.select('.page-nav').style('background','#F8F8F8');
        }
    }
    else{
        d3.select('.to-collapse').attr('class','to-collapse out');
        d3.select('.collapse-button').html('Show Nav');
        if(tracker[0].node == "D"){
            d3.select('.page-nav').style('background','gray');
        }
    }
}


//read in the passed JSON in object format
tracker = JSON.parse(tracker);
if(tracker[0].node != "D"){

    //set header background color based on narrative selected
    if(tracker[0].narrative == "soil"){
        d3.select('#myNavbar').style('background','#f6eff7');//'#eadcef'
        //d3.select('.page-nav').style('background','#f6eff7');
    }
    else if(tracker[0].narrative == "population"){
        d3.select('#myNavbar').style('background','#eff8f9');//#edf8f9
    }
    else if(tracker[0].narrative == "food"){
        d3.select('#myNavbar').style('background','#f9f7ef');//#f9f7ef
    }
}

//reloadTemplate();

//function reloadTemplate() {


    //loads script but doesn't run it
    // var newScript = $(document.createElement('script'));
    // newScript.src="/scripts/landDegradation.js";
    //
    // console.log(newScript);

    //loads script once document is done, and runs automatically
    //faster without the document ready, but might cause loading problems??
    $(document).ready(function() {


        $("#include").load("./include.html");

        var currPage;


        if (typeof tracker[0].node == "undefined") {

            console.log('tracker node is not defined!!');

            $('#title').html('Some other page');

        }

        else {
            $.getJSON("template.json", function (json) {
                currPage = json.filter(function (d) {
                    return tracker[0].node == d.page;
                });

                if (typeof currPage != "undefined" && currPage.length > 0) {

                    $('.nav-title').html(currPage[0].title);

                    $('#body-text').html(currPage[0].text);

                    $('#myModalLabel').html(currPage[0].modalTitle);

                    $('#modal-text').html(currPage[0].modalContent);

                    $('#sbs-Modal-l-title').html(currPage[0].perspectiveLTitle);

                    $('#sbs-Modal-l-text').html(currPage[0].perspectiveLContent);

                    $('#sbs-Modal-r-title').html(currPage[0].perspectiveRTitle);

                    $('#sbs-Modal-r-text').html(currPage[0].perspectiveRContent);

                    console.log(tracker[0].node, currPage[0].page);

                    //load Crossfilter for countryExplorer page
                    if (tracker[0].node == "G") {
                        $.getScript("./scripts/vendor/crossfilter.js");
                    };

                    //don't load anything for Food Flow
                    if (tracker[0].node == "D") {
                        console.log('skip script Food flow');
                        $.getScript('./scripts/pageNav.js');
                    }

                    //for anything but Food Flow, just load the script from the file
                    else {
                        $.getScript(currPage[0].script);

                        $.getScript('./scripts/pageNav.js');
                    }

                }
                else {
                    console.log('node not found in template file!');

                    $('#title').html('Not found');

                    $('#body-text').html('Sorry, there is no data available for that node. Please go back to the index and select a new node. ' +
                        '<br><a href="./index.html">Index</a>');

                    //$('#synopsis').html(currPage[0].synopsis);

                    $("a#test-link").prop("href", "index.html");

                    $("a#test-link").text("Index");

                    //this may fire if the JSON has a syntax error - JSON load fails silently
                    console.log('unknown node')
                }


            });
        }
    });
//}



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

    console.log(tracker);

    //check whether node selected is foodFlow
    if(tracker[0].currentNode == "D"){
        console.log('food flow, phpFormD');
        document.phpFormD.tracker.value = packed;
        document.phpFormD.submit();
    }
    //when index node is selected
    else if(tracker[0].currentNode == "Z"){
        console.log('index, phpFormZ');
        document.phpFormZ.tracker=tracker;
        document.phpFormZ.tracker.value = packed;
        document.phpFormZ.submit();
    }
    else{
        if (tracker[0].prevNode == "D"){
            document.phpForm.tracker=tracker;
        }
        document.phpForm.tracker.value = packed;
        document.phpForm.submit();
    }


}

//****************************************************************************
