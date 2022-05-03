module.exports = function (data){
    var requestString = [];
    var count = 1;
    for (var x in data){
        var test = {
            "primaryText": data[x].mtitle,
            "imageSource": data[x].image.smallImageUrl,
            "id": "moviechoice",
            "primaryAction":[
                {
                    "type": "SendEvent",
                    "arguments":[
                        count.toString()
                    ]
                }
            ]
        }
        requestString.push(test);
        count = count + 1;
    }
    return requestString;
};