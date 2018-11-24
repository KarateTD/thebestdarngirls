const Alexa = require('ask-sdk');

const welcome = 'Welcome to The Best Darn Girls Movie Reviews on Alexa.  For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the Must Buy movie of the week, say Must Buy.  For Video on Demand reviews, say Video on Demand.';
const mainOptions = '\t* In The Theater\n\t* Made For TV\n\t* Must Buy\n\t* Video On Demand';
const repeatGoBack = '  To hear the review again, say repeat.  To go back to the movie options, say movie options.  To go back to the main menu, say main menu.  To exit, say good bye';
const sorry = 'Sorry I don\'t understand.  Please say your response again';
const skillName='The Best Darn Girls Version 2'
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

		if(supportsDisplay(handlerInput)){
			handlerInput.responseBuilder.addRenderTemplateDirective({
 				type:'BodyTemplate1',
 				token:'Start',
 				backButton:'HIDDEN',
 				title:'Main Menu',
 				textContent:{
 						primaryText:{
							type:"RichText",
							text:mainOptions.replace(/\n\t/g,"<br/>")
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

 		if(supportsDisplay(handlerInput) && requestList){
 			handlerInput.responseBuilder.addRenderTemplateDirective({
 				type:'ListTemplate2',
 				token:'List',
 				backButton:'HIDDEN',
 				title:'Movie Options',
 				listItems: requestList
 			});

 			var num = Math.floor(Math.random() * 5);
 			var nextNum = num+1;
 			var output = hints[num]+nextNum;

 			handlerInput.responseBuilder.addHintDirective(output);
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
    		if(supportsDisplay(handlerInput)){
 				handlerInput.responseBuilder.addRenderTemplateDirective({
 					type:'BodyTemplate3',
 					token:'MovieSelected',
 					backButton:'HIDDEN',
 					title:element.mtitle,
 					image:{
 						contentDescription:null,
 						smallSourceUrl:element.image.smallImageUrl,
						largeSourceUrl:element.image.largeImageUrl
 					},
 					textContent:{
 						primaryText:{
							type:"RichText",
							text:element.review
						}
 					}
 				});
 			}

      		return handlerInput.responseBuilder
      		  .speak(element.review.replace("<br/>","\n\n").concat(repeatGoBack))
      		  .reprompt(repeatGoBack)
      		  .withStandardCard(element.mtitle, element.review.replace("<br/>","\n\n"), element.image.smallImageUrl, element.image.largeImageUrl)
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
			if(supportsDisplay(handlerInput)){
				handlerInput.responseBuilder.addRenderTemplateDirective({
 					type:'BodyTemplate1',
 					token:'Start',
 					backButton:'HIDDEN',
 					title:'Main Menu',
 					textContent:{
 						primaryText:{
							type:"RichText",
							text:mainOptions.replace(/\n\t/g,"<br/>")
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

const HelpHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest' 
		  && request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput){
		var helpMessage = "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https:// that darn girl movie dot reviews.  "
		var helpScreen = "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https://thatdarngirlmovie.reviews.  "
		var screenMessage = helpScreen.concat("<br/><br/>").concat(mainOptions.replace(/\n\t/g,"<br/>"));
		if(supportsDisplay(handlerInput)){
			handlerInput.responseBuilder.addRenderTemplateDirective({
 				type:'BodyTemplate1',
 				token:'Start',
 				backButton:'HIDDEN',
 				title:'Help and Main Menu',
 				textContent:{
 						primaryText:{
							type:"RichText",
							text:screenMessage
						}
 					}
 			});
		}

		return handlerInput.responseBuilder
	  	  .speak(helpMessage.concat(welcome))
	  	  .reprompt(mainOptions)
	  	  .withSimpleCard(skillName, mainOptions)
	  	  .getResponse();
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
		if(supportsDisplay(handlerInput)){
			handlerInput.responseBuilder.addRenderTemplateDirective({
 				type:'BodyTemplate1',
 				token:'End',
 				backButton:'HIDDEN',
 				title:'Good Bye',
 				textContent:{
 						primaryText:{
							type:"RichText",
							text:goodbyeScreen
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

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'SessionEndedRequest';
	},
	handle(handlerInput){
		console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

		return handlerInput.responseBuilder.getResponse();
	}
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error){
	  console.log(`Error handled: ${error.message}`);

	  return handlerInput.responseBuilder
	    .speak('Sorry, an error occurred.')
	    .reprompt('Sorry, an error occured.')
	    .getResponse();
	}
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    WelcomeHandler,
    MainMenuHandler,
    MovieChoicesHandler,
    CommandsHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

  // returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay(handlerInput) {
  var hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
  console.log("Supported Interfaces are" + JSON.stringify(handlerInput.requestEnvelope.context.System.device.supportedInterfaces));
  return hasDisplay;
}