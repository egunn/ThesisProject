<!DOCTYPE html>

<html>

<link rel="stylesheet" href="./scripts/vendor/bootstrap-3.3.7-dist/css/bootstrap.min.css">
<link rel="stylesheet" href="./css/style.css">

<body>

<!-- div to hold the template page -->
<div id="include"></div>


<?php
    //check whether the server has a value stored
    if(!empty($_POST['tracker']))
    {
        //if so, save it to the php variable $packed
        $packed = $_POST['tracker'];
    }
    else {
        //if not, make an empty JSON object (this keeps the JSON parse from being unhappy)
        $packed = "[{}]";
    }
?>

<script>
    //Communicating with next page via PHP (can't be in linked JS file; doesn't parse php

    //pull the data variable into JS from php's $packed variable
    var tracker = '<?php echo $packed; ?>';

    //do stuff with it, like a normal JS variable (JSON.parse reverses the JSON.stringify command in the sending page)
    console.log(tracker);
    console.log(JSON.parse(tracker));
</script>

<!-- PHP passing modified from https://www.boutell.com/newfaq/creating/scriptpass.html -->
<!-- Set up hidden HTML form to transmit the data when the link is clicked-->
<!-- Action parameter stores the link to open next (will need to auto-update, eventually)-->
<form name="phpForm" id="phpForm" method="POST" action="page1.php">
    <input type="hidden" name="tracker">
</form>

<!-- Alt form to load Food Flow page -->
<form name="phpFormD" id="phpFormD" method="POST" action="foodFlow.php">
    <input type="hidden" name="tracker">
</form>

<!-- Alt form to load index page -->
<form name="phpFormZ" id="phpFormZ" method="POST" action="index.php">
    <input type="hidden" name="tracker">
</form>



</body>

<script src="./scripts/vendor/d3.v4.2.6.min.js"></script>
<script src="./scripts/vendor/topojson.v1.js"></script>
<script src="./scripts/vendor/jquery-3.1.1.js"></script>
<script src="./scripts/vendor/bootstrap-3.3.7-dist/js/bootstrap.js"></script>
<script src="./scripts/vendor/queue.min.js"></script>
<script src="./scripts/page1.js"></script>

</html>
