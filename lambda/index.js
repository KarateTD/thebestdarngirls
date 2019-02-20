const Alexa = require('ask-sdk-core');
const Welcome = require('welcome.json');
const MovieOptions = require('movieoptions.json');
const Review = require('review.json');

const welcome = 'Welcome to The Best Darn Girls Movie Reviews on Alexa.  For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the Must Buy movie of the week, say Must Buy.  For Video on Demand reviews, say Video on Demand.';
const mainOptions = '\t* In The Theater\n\t* Made For TV\n\t* Must Buy\n\t* Video On Demand';
const repeatGoBack = '  To hear the review again, say repeat.  To go back to the movie options, say movie options.  To go back to the main menu, say main menu.  To exit, say good bye';
const sorry = 'Sorry I don\'t understand.  Please say your response again';
const skillName='The Best Darn Girls'
const goodbyeSpeak='Please come back or visit The Best Darn Girls Movie Review website at https:// that darn girl movie dot reviews. Good bye!'
const goodbyeScreen='Please visit https://thatdarngirlmovie.reviews'
const mainMenu='For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the Must Buy movie of the week, say Must Buy.  For Video on Demand reviews, say Video on Demand.'
const hints=[' show me ',' tell me about ', ' I choose ', ' select ', ' '];


var inTheTheater = require('./data/inTheTheater');
var madeForTV = require('./data/madeForTV');
var mustBuy = require('./data/mustBuy');
var videoOnDemand = require('./data/videoOnDemand');

var getOptions = require('./helpers/getOptions');
var getCardInfo = require('./helpers/getCardInfo');
var getList = require('./helpers/getList');

var menu;
var choice;
var savedHandle;

const WelcomeHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'LaunchRequest'
		  || (request.type === 'IntentRequest'
		  && request.intent.name === 'AMAZON.NavigateHomeIntent');
	},
	handle(handlerInput) {

		if(supportsAPL(handlerInput)){
		    handlerInput.responseBuilder.addDirective({
		        type : 'Alexa.Presentation.APL.RenderDocument',
		        document : Welcome,
		        datasources : {
                    "HomeTemplate":{
                        "type":"object",
                        "objectId":"ht",
                        "title":"Main Menu",
                        "textContent":{
                            "primaryText": {
                                "type": "PlainText",
                                "text": "* In The Theater<br/>* Made for TV<br/>* Must Buy<br/>* Video On Demand"
                            }
                        },
                        "logoSmallUrl":"https://s3.amazonaws.com/thebestdarngirls/library/small-image/APP_ICON.png",
                        "logoLargeUrl":"https://s3.amazonaws.com/thebestdarngirls/library/large-image/APP_ICON_LARGE.png"

                    }
		        }
		    });
		}

		return handlerInput.responseBuilder
		  .speak(welcome)
		  .reprompt(mainMenu)
		  .withSimpleCard(skillName, mainOptions)
		  .getResponse();
	}
};

const MainMenuHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && request.intent.name === 'MenuSelection');
	},
	handle(handlerInput){
		if(handlerInput.requestEnvelope.request.intent.slots.menu){
			menu = handlerInput.requestEnvelope.request.intent.slots.menu.value;
		}

		var starter = "To hear a movie review, please pick the corresponding number.\n\n";
  		var requestList;

  		if(menu.toLowerCase() === 'in the theater'){
      		starter += getOptions(inTheTheater);
      		requestList = getList(inTheTheater);
  		}else if(menu.toLowerCase() === 'made for tv'){
      		starter += getOptions(madeForTV);
      		requestList = getList(madeForTV);
  		}else if(menu.toLowerCase() === 'must buy'){
  			starter += getOptions(mustBuy);
  			requestList = getList(mustBuy);
  		}else if(menu.toLowerCase() === 'video on demand'){
  			starter += getOptions(videoOnDemand);
  			requestList = getList(videoOnDemand)
  		}else{
      		starter = `${sorry}`;
 		}

 		if(supportsAPL(handlerInput) && requestList){

 			var num = Math.floor(Math.random() * 5);
            var nextNum = num+1;
            var output = hints[num]+nextNum;

            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document : MovieOptions,
                datasources : {
                    "MovieOptionsTemplateMetadata": {
                        "type": "object",
                        "objectId": "moMetadata",
                        "title": "Movie Options",
                        "logoSmallUrl":"https://s3.amazonaws.com/thebestdarngirls/library/small-image/APP_ICON.png",
                        "logoLargeUrl":"https://s3.amazonaws.com/thebestdarngirls/library/large-image/APP_ICON_LARGE.png"
                    },
                    "MovieOptionsListData": {
                        "type": "list",
                        "listId": "moList",
                        "totalNumberOfItems": 5,
                        "hintText": output,
                        "listPage": {
                            "listItems": requestList
                        }
                    }
                }
            });

 		}

 		return handlerInput.responseBuilder
 		  .speak(starter)
 		  .reprompt(starter)
 		  .withSimpleCard(skillName, starter)
 		  .getResponse();
	}
};

const MovieChoicesHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && request.intent.name === 'MovieChoices')
		  || request.type === 'Display.ElementSelected';
	},
	handle(handlerInput){
		if (handlerInput.requestEnvelope.request.token) {
			choice = handlerInput.requestEnvelope.request.token;
		}else if(handlerInput.requestEnvelope.request.intent.slots.choice){
			choice = handlerInput.requestEnvelope.request.intent.slots.choice.value;
		}

    	var review = "Sorry I don't understand.  Please say your response again.  ";
    	var element;

  		if(menu.toLowerCase() === 'in the theater'){
  			element = getCardInfo(inTheTheater, choice);
	  	}else if(menu.toLowerCase() === 'made for tv'){
  			element = getCardInfo(madeForTV, choice);
 	 	}else if(menu.toLowerCase() === 'must buy'){
  			element = getCardInfo(mustBuy, choice);
	  	}else if(menu.toLowerCase() === 'video on demand'){
  			element = getCardInfo(videoOnDemand, choice);
	  	}

    	if(element){
    		if(supportsAPL(handlerInput)){
 				handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document : Review,
                    datasources : {
                        "ReviewTemplate": {
                            "type": "object",
                            "objectId": "reviewSample",
                            "title": "Movie Review",
                            "image": {
                                "smallSourceUrl": element.image.smallImageUrl,
                                "largeSourceUrl": element.image.largeImageUrl
                            },
                            "textContent":{
                                "title": {
                                    "type": "PlainText",
                                    "text": element.mtitle
                                },
                                "primaryText": {
                                    "type": "PlainText",
                                    "text": element.review
                                }
                            },
                            "logoSmall": "https://s3.amazonaws.com/thebestdarngirls/library/small-image/APP_ICON.png",
                            "logoLarge": "https://s3.amazonaws.com/thebestdarngirls/library/large-image/APP_ICON_LARGE.png"
                        }
                    }
                });

 			}

      		return handlerInput.responseBuilder
      		  .speak(element.review.replace(/<br\/>/g,'\n').concat(repeatGoBack))
      		  .reprompt(repeatGoBack)
      		  .withStandardCard(element.mtitle, element.review.replace(/<br\/>/g,'\n'), element.image.smallImageUrl, element.image.largeImageUrl)
      		  .getResponse();
      	}else{
      		return handlerInput.responseBuilder
      		.speak(review)
      		.getResponse();
    	}
	}
};

const CommandsHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && request.intent.name === 'Commands');
	},
	handle(handlerInput){
		var com = handlerInput.requestEnvelope.request.intent.slots.command.value;

		if (com.toLowerCase() === 'goodbye'){
			return ExitHandler.handle(handlerInput);
		}else if(com.toLowerCase() === 'repeat'){
			return MovieChoicesHandler.handle(handlerInput);
		}else if(com.toLowerCase() === 'movie options'){
			return MainMenuHandler.handle(handlerInput);
		}else if(com.toLowerCase() === 'main menu'){
			return WelcomeHandler.handle(handlerInput);
		}else{
			if(supportsAPL(handlerInput)){
			    handlerInput.responseBuilder.addDirective({
 				    type : 'Alexa.Presentation.APL.RenderDocument',
 				    document : Welcome,
 				    datasources : {
 				        "HomeTemplate":{
 				            "type": "object",
 			    	        "objectId": "command",
 				            "title": "Main Menu",
 				            "textContent": {
 				                "primaryText": {
 				                    "type": "PlainText",
                                    "text": "* In The Theater<br/>* Made for TV<br/>* Must Buy<br/>* Video On Demand"
 		    		            }
 			    	        },
 				            "logoSmallUrl":"https://s3.amazonaws.com/thebestdarngirls/library/small-image/APP_ICON.png",
                            "logoLargeUrl":"https://s3.amazonaws.com/thebestdarngirls/library/large-image/APP_ICON_LARGE.png"
 				        }
 				    }
			    });
            }
			return handlerInput.responseBuilder
      		.speak("Sorry, your response was not understood.  Going back to the main menu.  " + mainMenu)
      		.getResponse();
		}
	}
};

const ExitHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
		  && (request.intent.name === 'AMAZON.CancelIntent'
		  || request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		if(supportsAPL(handlerInput)){
		    handlerInput.responseBuilder.addDirective({
		        type : 'Alexa.Presentation.APL.RenderDocument',
		        document : Welcome,
		        datasources : {
		            "HomeTemplate":{
		                "type": "object",
		                "objectId": "exit",
		                "title": "Good Bye",
		                "textContent": {
		                    "primaryText": {
		                        "type": "PlainText",
		                        "text": goodbyeScreen
		                    }
		                },
		                "logoSmallUrl":"https://s3.amazonaws.com/thebestdarngirls/library/small-image/APP_ICON.png",
                        "logoLargeUrl":"https://s3.amazonaws.com/thebestdarngirls/library/large-image/APP_ICON_LARGE.png"
		            }
		        }
		    });
		}

		return handlerInput.responseBuilder
		  .speak(goodbyeSpeak)
		  .withSimpleCard(skillName,goodbyeScreen)
		  .getResponse();
	}
};
/*
add ErrorHandler
add SessionEndedRequestHandler
add HelpHandler
add background
  dark purple background
*/

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    WelcomeHandler,
    MainMenuHandler,
    MovieChoicesHandler,
    CommandsHandler,
    ExitHandler
  )
  .lambda();

  // returns true if the skill is running on a device with a display (show|spot)
function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}