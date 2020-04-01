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
				"sources": [
					{
						"url": data[x].image.smallImageUrl,
						"size": "small",
						"widthPixels": 0,
						"heightPixels": 0
					}
				]
		    },
		    "token":count
		}
		requestString.push(test);
		count = count + 1;
  	}

  	return requestString;
};