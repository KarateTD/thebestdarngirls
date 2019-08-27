module.exports = function (data){
	var requestString = '';
	for (var x in data){
  		requestString += "\t"+data[x].option + ". " + data[x].mtitle +".\n"
  	}

  	return requestString;
};