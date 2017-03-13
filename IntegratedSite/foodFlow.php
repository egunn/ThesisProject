<!DOCTYPE html>

<html>

<link rel="stylesheet" href="./scripts/vendor/bootstrap-3.3.7-dist/css/bootstrap.min.css">
<link rel="stylesheet" href="./css/foodFlowStyle.css">

<body>

<div class="container-fluid">


      <nav id="myNavbar" class="navbar navbar-default navbar-inverse navbar-fixed-top" role="navigation">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="container">
                  <div class="navbar-header">
                        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbarCollapse">
                              <span class="sr-only">Toggle navigation</span>
                              <span class="icon-bar"></span>
                              <span class="icon-bar"></span>
                              <span class="icon-bar"></span>
                        </button>
                        <div class="nav-title">Food Flow</div>

                  </div>

                  <button class="nav-button selected" id="exportButton" onClick="exportClicked()">Exports</button>
                  <button class="nav-button" id="importButton" onClick="importClicked()">Imports</button>
                  <button class="nav-button" id="balanceButton" onClick="balanceClicked()">Balance</button>

                  <select class="type-list form-control countryDropdown">
                        <option id="countryDropdown" value="US">United States</option>
                  </select>

                  <select class="type-list form-control categoryDropdown">
                        <option id="categoryDropdown" value="totalTons">All Food Categories</option>
                  </select>



            </div>
      </nav>


      <div class="row">
            <div class="col-md-12">
                  <div class="row">

                        <!-- Map and timeline -->
                        <div class="col-md-10">

                              <div class="row" id="map-div">
                                    <canvas class="background" id="fpbkgrd"></canvas>
                                    <div class="animation-div">
                                          <button class="anim-button" id="playButton" onClick="playClicked()">Play</button>
                                          <br>
                                          <button class="anim-button" id="pauseButton" onClick="pauseClicked()">Pause</button>
                                    </div>
                                    <svg class="svgbackground" id="fpsvgbkgrd"></svg>

                              </div>

                        </div>
                        <!-- Sidebar -->
                        <div class="col-md-2" id="sidebar">
                              <div id="country-name"></div>
                              <div id="stats">
                                    <div id="totals-label"></div>
                                    <div id="export_totals"></div>
                              </div>
                              <div id="trade-partners">
                                    <div id="top-partners"></div>
                                    <div id="partner-list"></div>
                              </div>

                        </div>
                  </div>
                  <div class="row">
                        <!-- Timeline -->
                        <div class="col-md-12">

                              <!-- Contains all page structure and menus; floats on top of canvas background -->
                              <div class="floating" id="timeline">
                                    <h1></h1>

                                    <svg id="svgTimeline"></svg>
                              </div>

                        </div>

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

</body>





<script src="./scripts/vendor/jquery-3.1.1.js"></script>
<script src="./scripts/vendor/d3.v4.2.6.min.js"></script>
<script src="./scripts/vendor/queue.min.js"></script>
<script src="./scripts/vendor/topojson.v1.js"></script>
<script src="./scripts/vendor/d3-tip.js"></script>
<script src="./scripts/page1.js"></script>
<script src="./scripts/foodFlow.js"></script>
</html>
