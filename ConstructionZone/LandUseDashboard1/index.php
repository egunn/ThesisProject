<!DOCTYPE html>

<html>

<link rel="stylesheet" href="./scripts/vendor/bootstrap-3.3.7-dist/css/bootstrap.min.css">
<link rel="stylesheet" href="./css/style.css">

<body>

<div class="container-fluid">

    <div class="row">
        <div class="col-md-12">
            <div class="row title-row">
                    <div class="col-md-9 title-col">
                        <nav id="myNavbar" class="navbar navbar-default navbar-inverse navbar-fixed-top  navbar-row" role="navigation">

                        <!-- <h1 id="title">Test Template Page</h1> -->
                        <!-- Brand and toggle get grouped for better mobile display -->
                        <div class="container">
                            <div class="navbar-header">

                                <div class="nav-title">Title</div>

                            </div>

                        </div>

                        </nav>
                    </div>

                    <!--<div id="rule-div"></div>
                    <hr>-->
            </div>

            <div class="row vis-row">
                <div class="col-md-9">

                    <div id="vis-div">
                        <svg class="vis-svg" id="vis"></svg>
                        <canvas class="vis-canvas" id="vis-canvas"></canvas>
                    </div>

                </div>
                <div class="col-md-3">
                    <!-- Put text here -->
                    <div id="synopsis"></div>
                    <div id="body-text"></div>

                </div>
            </div>

            <div class="row nav-row">
                <div class="col-md-9">

                    <div id="nav-div">
                        <svg class="page-nav" id="nav"></svg>
                    </div>

                </div>

            </div>

        </div>
    </div>
</div>


<a id="test-link" href="./index.html">Index</a>

<button class="button" id="next-page" onClick="nextClicked()">Next Page</button>

</div>

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
</body>

<script src="./scripts/vendor/d3.v4.2.6.min.js"></script>
<script src="./scripts/vendor/topojson.v1.js"></script>
<script src="./scripts/vendor/jquery-3.1.1.js"></script>
<script src="./scripts/vendor/queue.min.js"></script>
<script src="./scripts/testJQuery.js"></script>

</html>
