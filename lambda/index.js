const Alexa = require('ask-sdk-core');
const Welcome = require('welcome.json');
const MovieOptions = require('movieoptions.json');

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

            console.log("in if");

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


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    WelcomeHandler,
    MainMenuHandler
  )
  .lambda();

  // returns true if the skill is running on a device with a display (show|spot)
function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}