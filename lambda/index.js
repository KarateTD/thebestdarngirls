var Alexa = require('alexa-sdk');

var path = [];
var welcome = "Welcome to The Best Darn Girls Movie Reviews on Alexa.  For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the Must Buy movie of the week, say Must Buy.  For Video on Demand reviews, say Video on Demand.";
var repeatGoBack = 'To repeat the choices, say Please repeat. To go back, say Please go back';
var menu;

var inTheTheater = require('./data/inTheTheater');
var madeForTV = require('./data/madeForTV');
var mustBuy = require('./data/mustBuy');
var videoOnDemand = require('./data/videoOnDemand');

var getOptions = require('./helpers/getOptions');
var getCardInfo = require('./helpers/getCardInfo');

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {

  'LaunchRequest': function () {
  	path.push(welcome)
    this.emit(':ask', `${welcome}`, 'To repeat the choices, say repeat');
  },

  'Commands': function () {
  	var command = this.event.request.intent.slots.command.value;

  	if(command.toLowerCase() === 'repeat'){
    	this.emit(':ask', path[path.length - 1], '${repeatGoBack}');
 	}else if(command.toLowerCase() === 'go back'){
	  	if(path.length != 0){
  			this.emit(':ask', path[path.length - 1], '${repeatGoBack}');
  			path.pop();
  		}else{
  			this.emit(':ask', `You are at the beginning. ${welcome}`, 'To repeat the choices, say repeat');
  		}

  	}else{
  		this.emit(':ask', `Sorry I don't understand.  Please say your response again`, 'To repeat the choices, say repeat');
  	}
  },

  'MenuSelection': function () {
  	menu = this.event.request.intent.slots.menu.value;
  	var requestString = "To hear a movie review, please pick the corresponding letter.  ";

  	if(menu.toLowerCase() === 'in the theater'){
  		requestString += getOptions(inTheTheater);
  		path.push(requestString);
  	}else if(menu.toLowerCase() === 'made for tv'){
  		requestString += getOptions(madeForTV);
  		path.push(requestString);
  	}else if(menu.toLowerCase() === 'must buy'){
  		requestString += getOptions(mustBuy);
  		path.push(requestString);
  	}else if(menu.toLowerCase() === 'video on demand'){
  		requestString += getOptions(videoOnDemand);
  		path.push(requestString);
  	}else{
  		requestString = "Sorry I don't understand.  Please say your response again";
 	}

  	this.emit(':ask', `${requestString}`,'${repeatGoBack}');
  
  },

  'MovieChoices': function() {
  	var choice = this.event.request.intent.slots.choice.value;
    var review = "Sorry I don't understand.  Please say your response again.  "+ path[path.length - 1];
    var element;

  	if(menu.toLowerCase() === 'in the theater'){
  		element = getCardInfo(inTheTheater, choice);
  	}else if(menu.toLowerCase() === 'made for tv'){
  		element = getCardInfo(madeForTV, choice);
  	}else if(menu.toLowerCase() === 'must buy'){
  		element = getCardInfo(mustBuy, choice);
  	}else if(menu.toLowerCase() === 'video on demand'){
  		element = getCardInfo(videoOnDemand, choice);
  	}else{
  		
 	  }  
  	//this.emit(':ask',`${review}`, '${repeatGoBack}');
    if(element){
      var imageObj = {
        smallImageUrl: `${element.image.smallImageUrl}`,
        largeImageUrl: `${element.image.largeImageUrl}`
      };
      this.emit(':askWithCard', `${element.review}`,`${repeatGoBack}`,`${element.mtitle}`,`${element.review}`, imageObj);
    }else{
      this.emit(':ask',`${review}`, "Please try your selection again");
    }
  },

  'AMAZON.HelpIntent': function() {
    this.emit(':ask', `This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https://thatdarngirlmovie.reviews/. ${welcome}`,'${repeatGoBack}');
  },

  'AMAZON.StopIntent': function() {
    this.emit(':tell', 'Please come back or visit The Best Darn Girls Movie Review website at https://thatdarngirlmovie.reviews/. Good bye!');
  },

  'AMAZON.CancelIntent': function(){
    this.emit(':tell', 'Please come back or visit The Best Darn Girls Movie Review website at https://thatdarngirlmovie.reviews/. Good bye!');
  },

  'Unhandled':function(){
    this.emitWithState('AMAZON.HelpIntent');
  }


};
