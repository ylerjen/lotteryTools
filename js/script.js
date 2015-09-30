(function(window,document,undefined){

var service = "/ResultsService.asmx/GetResultsForDate";	//GET with ?drawType=string&drawDate=string
var host = "resultsservice.lottery.ie";

function checkNumeros(){
	param = {
		drawType = "EuroMillions",
		drawDate = "2015-09-22"
	}

	$.ajax({
	  url: host+service,
	  param: param
	  context: document.body
	}).done(function() {
	  alert( "done" );
	});
}

$( "#checkNbrs" ).on( "submit", function( event ) {
  event.preventDefault();
  console.log( $( this ).serialize() );
});

$('#checkNbrs').on('submit',checkNumeros,false);

})(window, document);