module.exports = function (data){
	var requestString = [];
	var count = 1;
	for (var x in data){
		var test = {
			"token":count,
			"image":{
				"contentDescription":null,
				"smallSourceUrl":data[x].image.smallImageUrl,
				"largeSourceUrl":data[x].image.largeImageUrl
			},
			"textContent":{
				"primaryText":{
					"type":"RichText",
					"text":data[x].mtitle
				}
			}
		}
		requestString.push(test);
		count = count + 1;
  	}

  	return requestString;
};