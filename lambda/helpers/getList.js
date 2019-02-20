module.exports = function (data){
	var requestString = [];
	var count = 1;
	for (var x in data){
		var test = {
		    "listItemIdentifier": data[x].mtitle,
		    "ordinalNumber": count,
		    "textContent":{
		        "primaryText": {
		            "type": "PlainText",
		            "text": data[x].mtitle
		        }
		    },
		    "image": {
		        "smallSourceUrl": data[x].image.smallImageUrl,
		        "largeSourceUrl": data[x].image.largeImageUrl
		    },
		    "token":count
		}
		requestString.push(test);
		count = count + 1;
  	}

  	return requestString;
};