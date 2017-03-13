<!DOCTYPE html>

<html>

<link rel="stylesheet" href="./scripts/vendor/bootstrap-3.3.7-dist/css/bootstrap.min.css">
<link rel="stylesheet" href="./css/style.css">


<body>

<div class="roots-image">
    <!--<img src="./roots.png">-->
    <svg class="roots-svg" id="roots-svg" xmlns:xlink="./index_roots.svg"></svg>
</div>

<!-- See http://stackoverflow.com/questions/17382979/responsive-background-image-in-div-full-width -->
<div class="bg-image">
    <!--<img src="./roots.png">-->
    <svg class="index-svg" id="index-svg"></svg>
</div>

<div class="container-fluid">

    <div class="row">
        <div class="col-md-12">
            <div class="row">

                <div class="col-md-6 controls">
                    <div class="title">
                        <h1>Talking Dirt</h1>
                        <h4>An exploration of soil, <br> and how it relates to human concerns</h4>
                        <div class="button-div">
                            <button class="button" id="ecosystemButton" value="soil" onmouseover="buttonHover(value)" onmouseout="buttonLeave()" onClick="ecosystemClicked()">Soil ecosystems</button>
                            <button class="button" id="populationButton" value="population" onmouseover="buttonHover(value)" onmouseout="buttonLeave()" onClick="populationClicked()">Population</button>
                            <button class="button" id="foodButton" value="food" onmouseover="buttonHover(value)" onmouseout="buttonLeave()" onClick="foodClicked()">World food supply</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">

                </div>
            </div>
            <div class="row">
                <div class="col-md-12">

                    <!--
                    <div id="nav-div">
                        <svg class="nav-svg" id="index-nav"></svg>
                    </div>
                    -->

                </div>
                <!--<a href="./page1.php">Link to page 1</a>
                <br>-->
            </div>
        </div>
    </div>


</div>

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


<!-- link that activates the sendData function and sends the data to the server -->
<!--<a href="javascript:sendData();">Next page</a>-->

</body>

<script src="./scripts/vendor/d3.v4.2.6.min.js"></script>
<script src="./scripts/vendor/queue.min.js"></script>
<script src="./scripts/index.js"></script>
</html>
