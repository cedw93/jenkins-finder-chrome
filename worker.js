var currentBackgroundUrl = "";
var currentBaseUrl = "";
var jobResultsList =  document.getElementById("job-results-list");

// Allows links from extensions to open in new tab
window.addEventListener('click',function(e) {
  if(e.target.href !== undefined){
    chrome.tabs.create({url:e.target.href})
  }
});

function publishResults(jenkinsUrl, jobName, matchedBuilds){
	console.log('Your matched builds are: ' + JSON.stringify(matchedBuilds));  
	matchedBuilds.forEach(function(buildNo) {
		var li = document.createElement("li");
		var a = document.createElement('a');


  		a.setAttribute('href', jenkinsUrl + '/job/' + jobName + '/' + buildNo);
  		a.innerText=buildNo;

  		li.appendChild(a);
		jobResultsList.appendChild(li);
	});


}

function checkParamAgainstCrieta(params, criteria) {
	switch(criteria.type){
		case 'regex':
			var regex = new RegExp(criteria.value);
			return regex.test(params[criteria.name]);
		case 'exact':
			return params[criteria.name] == criteria.value;
		default:
			return params[criteria.name].toLowerCase() == criteria.value.toLowerCase();
	}
}

function checkParams(params, criteria){
	var matched = 0;
	criteria.forEach(function (crit) {	
		if(checkParamAgainstCrieta(params, crit)){
			matched++;
		}
	});

	return matched == criteria.length;
}

function getParamsByBuildNum(jenkinsUrl, jobName, criteria, buildNos) {
	var matchedBuilds = [];
	buildNos.forEach(function(buildNo) {
		$.ajax({
			url: jenkinsUrl + '/job/' + jobName + '/' + buildNo + '/api/json?tree=actions[parameters[*]]',
			success: function(response){
				 if(checkParams(
				 	response.actions[0].parameters.reduce(
				 		function(result, currentObject) {
							result[currentObject['name']] = currentObject['value'];
							return result;
						}, {}),
				 	criteria)){
				 		matchedBuilds.push(buildNo);
				 }
			},
			async: false
		});
	});

	publishResults(jenkinsUrl, jobName, matchedBuilds);
}

function process(url, jobName, criteria){
	$.get(url + '/job/' + jobName + '/api/json?tree=builds[number]', function(response) {
		getParamsByBuildNum(url, jobName, criteria, 
			response.builds.map(element => {
				return element.number
			})
		);
	});
}

function execute() {

	var criteria = [];
	var jobName = $('#job-name').val();
	var rawCriteriaString = $('#job-params').val();

	if(rawCriteriaString){
		var subCriteia=rawCriteriaString.split(',');
		criteria = subCriteia.map((element) => {
			var parts = element.split('=');
				return $.extend({}, {
					"name" : parts[0],
					"value" : parts[1],
					"type" : parts.length == 3 ? parts[2] : undefined 
				})
		});

	}

	process(currentBaseUrl, jobName, criteria);
}

function getBackgroundURL(){
	var deferred = new $.Deferred();

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		deferred.resolve(tabs[0].url);
	});

	return deferred.promise();
}

function populate (url) {
	var regex = /.*com/g;
	var jobNameRegex =  /job\/([^\/]+)/g;
	currentBaseUrl = regex.exec(url)[0];
	backgroundURL = url;
	if(url.indexOf('/job/') > -1){
		$('#job-name').val(jobNameRegex.exec(url)[1]);
	}
}

getBackgroundURL().done(function(backgroundURL) {
	populate(backgroundURL);
});

document.getElementById('find-builds').addEventListener('click', execute);