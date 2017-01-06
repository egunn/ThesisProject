var tracker = 'A';


console.log('here');

reloadTemplate();

function reloadTemplate() {
    if (tracker == 'A'){

        $.getJSON("text.json", function(json) {

            $('#title').html(json[0].title);

            $('#body-text').html(json[0].text);

            $("a#test-link").prop("href", json[0].link);

            $("a#test-link").text(json[0].linkText);
        });
    }
    else if (tracker == 'B'){

        $.getJSON("text.json", function(json) {

            $('#title').html(json[1].title);

            $('#body-text').html(json[1].text);

            $("a#test-link").prop("href", json[1].link);

            $("a#test-link").text(json[1].linkText);
        });
    }
    else {
        $('#title').html('Some other page');
    }
}



function nextClicked(){
    if (tracker == "A"){
        tracker = "B";
    }
    else if(tracker == "B"){
        tracker = "A";
    }
    reloadTemplate();
}