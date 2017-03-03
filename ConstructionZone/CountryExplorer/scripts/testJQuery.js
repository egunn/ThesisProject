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
//tracker = JSON.parse(tracker);


/*
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
*/

reloadTemplate();

function reloadTemplate() {

    //var currPage;

    /*console.log(tracker);

    if (typeof tracker[0].node == "undefined"){

        console.log('tracker node is not defined!!');

        $('#title').html('Some other page');

    }
   else if (tracker == 'B'){

     $.getJSON("template.json", function(json) {

     $('#title').html(json[1].title);

     $('#body-text').html(json[1].text);

     $("a#test-link").prop("href", json[1].link);

     $("a#test-link").text(json[1].linkText);
     });
     }*/
    //else {
        //$('#title').html('Some other page');

        $.getJSON("template.json", function(json) {

            $.getJSON("template.json", function(json) {

                $('#body-text').html(json[0].text);

                $("a#test-link").prop("href", json[0].link);

                $('#synopsis').html(json[0].synopsis);

                $("a#test-link").text(json[0].linkText);

                $('.nav-title').html(json[0].title);
            });


        });

    //}

    //loads script but doesn't run it
    // var newScript = $(document.createElement('script'));
    // newScript.src="/scripts/landDegradation.js";
    //
    // console.log(newScript);

    //loads script once document is done, and runs automatically
    //faster without the document ready, but might cause loading problems??
    $(document).ready(function() {

        //$.getScript("./scripts/vendor/topojson.js");  //added to HTML template for now
        //if (typeof currPage != "undefined" && currPage.length > 0){
            //console.log(tracker[0].node, currPage[0].page);
            $.getScript("./scripts/vendor/crossfilter.js");
            $.getScript('./scripts/countryExplorer.js');

            //$.getScript('./scripts/pageNav.js');
        //}
        /*else {
            console.log('unknown node')
        }*/


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
