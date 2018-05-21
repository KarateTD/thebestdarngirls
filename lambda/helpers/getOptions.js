module.exports = function (data){
	var requestString = '';
	for (var x in data){
  		requestString += data[x].option + ". " + data[x].mtitle +". "
  	}

  	return requestString;
};