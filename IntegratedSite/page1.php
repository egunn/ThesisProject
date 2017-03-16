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
                        <div class="container" id="navbar-container">
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
                    <div class="svg-row">
                        <div id="vis-div">
                            <svg class="vis-svg" id="vis"></svg>
                            <canvas class="vis-canvas" id="vis-canvas"></canvas>
                        </div>
                    </div>
                    <div class="row">
                        <div class="anim-div"></div>
                    </div>

                </div>
                <div class="col-md-3">
                    <!-- Button trigger modal -->
                    <button type="button" class="btn btn-default btn-sm" id="info-button" data-toggle="modal" data-target="#myModal">
                        <span class="glyphicon glyphicon-info-sign"></span>
                    </button>
                    <br>

                    <!-- Put text here -->
                    <!--<div id="synopsis"></div> -->
                    <div id="body-text"></div>

                </div>

            </div>

            <!--
            <div class="row nav-row no-gutter">
                <div class="col-md-12 nopadding">

                    <div id="nav-div">
                        <svg class="page-nav" id="nav"></svg>
                    </div>

                </div>

            </div>
            -->

        </div>
    </div>
</div>


</div>


<div class="navbar navbar-default navbar-fixed-bottom">
    <div class="container to-collapse collapse in nopadding">
        <button class="collapse-button" onClick="navButtonClicked()">Hide Nav</button>

        <div id="nav-div">
            <svg class="page-nav" id="nav"></svg>
        </div>

    </div>

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


<!-- Info Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
                <h4 class="modal-title" id="myModalLabel">Modal title</h4>
            </div>
            <div class="modal-body" id="modal-text">


            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>


<!-- Perspectives Modal -->
<div class="modal fade" id="myModal2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">

        <div class="modal-content modal-content-sbs">
            <div class="modal-header">
                <h4 class="modal-title" id="sbs-Modal-l-title">Modal title</h4>
            </div>
            <div class="modal-body" id="sbs-Modal-l-text">


            </div>
            <div class="modal-footer">

                <button type="button" class="btn btn-default btn-med vote" id="vote-up-button" onClick="voteClicked()">
                    <span class="glyphicon glyphicon-thumbs-up"></span>
                </button>
                <button type="button" class="btn btn-default btn-med vote" id="vote-down-button" onClick="voteClicked()">
                    <span class="glyphicon glyphicon-thumbs-down"></span>
                </button>
            </div>
        </div>

        <div class="modal-content modal-content-sbs">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
                <h4 class="modal-title" id="sbs-Modal-r-title">Modal title</h4>
            </div>
            <div class="modal-body" id="sbs-Modal-l-text">


            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default btn-med vote" id="vote-up-button" onClick="voteClicked()">
                    <span class="glyphicon glyphicon-thumbs-up"></span>
                </button>
                <button type="button" class="btn btn-default btn-med vote" id="vote-down-button onClick="voteClicked()"">
                    <span class="glyphicon glyphicon-thumbs-down"></span>
                </button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Done</button>
            </div>
        </div>
    </div>
</div>


</body>

<script src="./scripts/vendor/d3.v4.2.6.min.js"></script>
<script src="./scripts/vendor/topojson.v1.js"></script>
<script src="./scripts/vendor/jquery-3.1.1.js"></script>
<script src="./scripts/vendor/bootstrap-3.3.7-dist/js/bootstrap.js"></script>
<script src="./scripts/vendor/queue.min.js"></script>
<script src="./scripts/page1.js"></script>

</html>
