'use strict';

const mysql = require('mysql');
const aws = require('aws-sdk');
const fs = require('fs');

const Alexa = require('ask-sdk-core');
const Welcome = require('./json/welcome.json');
const LibraryWelcome = require('./json/librarywelcome.json');
const MovieOptions = require('./json/movieoptions.json');
const Review = require('./json/review.json');
const Background = require('./json/background.json');

const welcome = 'Welcome to The Best Darn Girls Movie Reviews on Alexa.  For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the Must Buy movie of the week, say Must Buy.  For Video on Demand reviews, say Video on Demand. To search The Best Darn Girls Library, say Library.';
const mainOptions = '\t* In The Theater\n\t* Made For TV\n\t* Must Buy\n\t* Video On Demand\n\t* Library';
const mainScreen = '* In The Theater<br/>* Made for TV<br/>* Must Buy<br/>* Video On Demand<br/>* Library';
const repeatGoBack = '  To hear the review again, say repeat.  To go back to the movie options, say movie options.  To go back to the main menu, say main menu.  To exit, say good bye';
const sorry = 'Sorry I don\'t understand.  Please say your response again';
const skillName='The Best Darn Girls'
const goodbyeSpeak='Please come back or visit The Best Darn Girls Movie Review website at https:// that darn girl movie dot reviews. Good bye!'
const goodbyeScreen='Please visit https://thatdarngirlmovie.reviews'
const mainMenu='For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the Must Buy movie of the week, say Must Buy.  For Video on Demand reviews, say Video on Demand. To search The Best Darn Girls Library, say Library.'
const hints=[' show me ',' tell me about ', ' I choose ', ' select ', ' '];
const libHints=['Look for', 'I would like', 'Find', 'How about', 'Search for' ];
const background='https://s3.amazonaws.com/thebestdarngirls/library/small-image/darkbluebg.jpeg';
const smallLogo='https://s3.amazonaws.com/thebestdarngirls/library/small-image/APP_ICON.png';
const largeLogo='https://s3.amazonaws.com/thebestdarngirls/library/large-image/APP_ICON.png';

var inTheTheater = require('./data/inTheTheater');
var madeForTV = require('./data/madeForTV');
var mustBuy = require('./data/mustBuy');
var videoOnDemand = require('./data/videoOnDemand');
var libraryList;

var getOptions = require('./helpers/getOptions');
var getCardInfo = require('./helpers/getCardInfo');
var getList = require('./helpers/getList');

var menu;
var choice;
var offset=0;
var isEnd=false;

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
                        "backgroundImage": {
                            "sources": Background
                        },
                        "title":"Main Menu",
                        "textContent":{
                            "primaryText": {
                                "type": "PlainText",
                                "text": mainScreen
                            }
                        },
                        "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo

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
  		var isLibrary = false;

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
  		}else if(menu.toLowerCase() === 'library'){
  		    starter = "Welcome to The Best Darn Girls Movie Review Library.  Please say \""+ getRandomNumber(libHints, libHints.length, false) + "\" and the title of the movie";
  		    isLibrary = true;
  		    isEnd=false;
  		    offset=0;
  		}else{
      		starter = `${sorry}`;
 		}

 		if(supportsAPL(handlerInput) && requestList){

            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document : MovieOptions,
                datasources : {
                    "MovieOptionsTemplateMetadata": {
                        "type": "object",
                        "objectId": "moMetadata",
                        "backgroundImage": {
                            "sources": Background
                        },
                        "title": "Movie Options",
                        "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo
                    },
                    "MovieOptionsListData": {
                        "type": "list",
                        "listId": "moList",
                        "totalNumberOfItems": requestList.length,
                        "hintText": getRandomNumber(hints, requestList.length, true),
                        "listPage": {
                            "listItems": requestList
                        }
                    }
                }
            });

 		}else if(supportsAPL(handlerInput) && isLibrary){
 		    handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document : LibraryWelcome,
                datasources : {
                    "WelcomeLibTemplate": {
                        "type": "object",
                        "objectId": "wlMetadata",
                        "backgroundImage": {
                            "sources": Background
                        },
                        "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo,
                        "textContent": {
                            "primaryText":{
                                "type":"PlainText",
                                "text": starter
                            }
                        },
                        "hintText": "Try, \""+ getRandomNumber(libHints, libHints.length, false) + "\" Hailey Dean Mysteries\""
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

    	var review = `${sorry}`;
    	var element;

  		if(menu.toLowerCase() === 'in the theater'){
  			element = getCardInfo(inTheTheater, choice);
	  	}else if(menu.toLowerCase() === 'made for tv'){
  			element = getCardInfo(madeForTV, choice);
 	 	}else if(menu.toLowerCase() === 'must buy'){
  			element = getCardInfo(mustBuy, choice);
	  	}else if(menu.toLowerCase() === 'video on demand'){
  			element = getCardInfo(videoOnDemand, choice);
  		}else if(menu.toLowerCase() === 'library'){
  		    console.log(libraryList);
  		    console.log(videoOnDemand);
  		    element = getCardInfo(libraryList, choice);
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
                            "backgroundImage": {
                                "sources": Background
                            },
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
                            "logoSmall": smallLogo,
                            "logoLarge": largeLogo
                        }
                    }
                });

 			}

      		return handlerInput.responseBuilder
      		  .speak(element.review.replace(/<br\/>/g,'\n').replace(/_/g,'\n').concat(repeatGoBack))
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

const LibraryHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest'
          && request.intent.name === 'Library');
    },
    async handle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        if(offset == 0){
            if (request.intent.slots.selection.value){
                choice = request.intent.slots.selection.value;
            }else if(request.intent.slots.query.value){
                choice = request.intent.slots.query.value;
            }
        }
        console.log("choice is: "+ choice+" and offset is "+offset);
        const rows = await getResults(choice.toLowerCase().replace(/ /g,'%'));

        if(supportsAPL(handlerInput) && rows[0] != null){

            var starter = rows[0];
            var requestList = rows[1];
            libraryList = rows[2];

            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document : MovieOptions,
                datasources : {
                    "MovieOptionsTemplateMetadata": {
                        "type": "object",
                        "objectId": "moMetadata",
                        "backgroundImage": {
                            "sources": Background
                        },
                        "title": "Search Results",
                        "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo
                    },
                    "MovieOptionsListData": {
                        "type": "list",
                        "listId": "moList",
                        "totalNumberOfItems": requestList.length,
                        "hintText": getRandomNumber(hints, requestList.length, true),
                        "listPage": {
                            "listItems": requestList
                        }
                    }
                }
            }); //end handler
        }else if(supportsAPL(handlerInput) && rows[0] == null && offset == 0){
            starter = "Your search has returned 0 results.   You can request another search by saying " + getRandomNumber(libHints, libHints.length, false) + " and a movie title or say main menu.";
            console.log("in else");
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document : LibraryWelcome,
                datasources : {
                    "WelcomeLibTemplate": {
                        "type": "object",
                        "objectId": "wlMetadata",
                        "backgroundImage": {
                            "sources": Background
                        },
                        "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo,
                        "textContent": {
                            "primaryText":{
                                "type":"PlainText",
                                "text": starter
                            }
                        },
                        "hintText": "Try, \""+ getRandomNumber(libHints, libHints.length, false) + "\" Hailey Dean Mysteries\""
                    }
                }
            });
        }else if(rows[0] == null && offset != 0){
            isEnd=true;
            starter="You are at the end of your selection.  Please say previous or search again";
        }

        return handlerInput.responseBuilder
        .speak(starter)
        .reprompt(starter)
        .withSimpleCard(skillName, starter)
        .getResponse();
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
 			    	        "backgroundImage": {
                                "sources": Background
                            },
 				            "title": "Main Menu",
 				            "textContent": {
 				                "primaryText": {
 				                    "type": "PlainText",
                                    "text": mainScreen
 		    		            }
 			    	        },
 				            "logoSmallUrl":smallLogo,
                            "logoLargeUrl":largeLogo
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

const PrevHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
          && (request.intent.name === 'AMAZON.PreviousIntent');
    },
    handle(handlerInput) {
        var starter=null;
        if(offset != 0){
            offset=offset-10;
            return LibraryHandler.handle(handlerInput);
        }else{
            return handlerInput.responseBuilder
            .speak("You are at the beginning of your search.  Please make your selection")
            .getResponse();
        }
    }
}

const NextHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
          && (request.intent.name === 'AMAZON.NextIntent');
    },
    handle(handlerInput) {
        offset=offset+10;
        return LibraryHandler.handle(handlerInput);
    }
}

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
		                "backgroundImage": {
                           "sources": Background
                        },
		                "title": "Good Bye",
		                "textContent": {
		                    "primaryText": {
		                        "type": "PlainText",
		                        "text": goodbyeScreen
		                    }
		                },
		                "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo
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

const HelpHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
		  && request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput){
		var helpMessage = "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https:// that darn girl movie dot reviews.  "
		var helpScreen = "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https://thatdarngirlmovie.reviews.<br/><br/>"

		if(supportsAPL(handlerInput)){
            handlerInput.responseBuilder.addDirective({
        	    type : 'Alexa.Presentation.APL.RenderDocument',
        		document : Welcome,
        		datasources : {
        		    "HomeTemplate":{
            		    "type": "object",
            		    "objectId": "help",
        	    	    "backgroundImage": {
                            "sources": Background
                        },
        		        "title": "Help and Main Menu",
            		    "textContent": {
            		        "helpText": {
            		            "type": "PlainText",
            		            "text": helpScreen
            		        },
                  		    "primaryText": {
            	    	        "type": "PlainText",
        	    	            "text": mainScreen
        		            }
        		        },
            		    "logoSmallUrl":smallLogo,
                        "logoLargeUrl":largeLogo
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
	    .reprompt('Sorry, an error occurred.')
	    .getResponse();
	}
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    WelcomeHandler,
    MainMenuHandler,
    MovieChoicesHandler,
    CommandsHandler,
    LibraryHandler,
    ExitHandler,
    PrevHandler,
    NextHandler,
    HelpHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

  // returns true if the skill is running on a device with a display (show|spot)
function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}

function getRandomNumber(array, length, ifNext){
    var num = Math.floor(Math.random() * length);
    var nextNum = num+1;

    if(ifNext){
        return array[num]+nextNum;
    }else{
        return array[num]
    }
}

function getResults(searchFor){
    return new Promise(function(resolve, reject){
        var connection = mysql.createConnection({
            host: process.env.host,
            user: process.env.username,
            password: process.env.password,
            database: process.env.database
        });

        var rowcount;

        var query_str = 'select * from reviews where title like \'%'+searchFor+'%\' order by title  limit 10 offset '+offset;
        var rowcount_str = 'select count(id) as count from reviews where title like \'%'+searchFor+'%\''
        connection.query(rowcount_str, function(err,result){
           // connection.end();
           // rowcount = result.length;
           console.log("result is "+result.count);
           rowcount = Number(result.count);
           console.log("count is "+rowcount)
        });
        console.log(query_str);
        connection.query(query_str, function (err, rows, fields){
            connection.end();
            var resultString = "[";
            var count = 1;
            if(err){
                console("hit an error: " +err);
                reject(err);
            }else{
                Object.keys(rows).forEach(function(key){
                    var row = rows[key];
                    resultString += "{\n\"option\":\""+count+"\",\n\"mtitle\":\""+ row.title+"\",\n\"review\":\""+row.review+"<br/><br/>"+row.rating+" out of 5 stars.\",\n\"image\":{\n\"smallImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+row.image+"\",\n\"largeImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+row.image+"\"\n}\n},";
                    count = count + 1;
                }) //end forEach
                resultString = resultString.slice(0, -1);
                resultString += "]";

                //if(rows.length != 0){
                if(rowcount != 0){
                    var newData = JSON.parse(resultString);
                    var starter;
                    //if(rows.length == 1){
                    if(rowcount == 1){
                        starter = "You have one result.  Please pick the corresponding number.\n\n";
                    //}else if(rows.length > 10){
                    }else if(rowcount > 10 && offset == 0){
                        starter = "You have "+rowcount+" results.  Here are your first 10 results. For the next 10, say skip.  Please pick the corresponding number.\n\n";
                    }else if(rowcount > 10 && offset > 0){
                        starter = "You have "+rowcount+" results.  Here are your next 10 results.  For the more results, say skip.  For the previous 10, say previous.  Please pick the corresponding numbers.\n\n";
                    }else if(rowcount > 10 && (offset + 10) > rowcount){
                        starter = "You have "+rowcount+" results.  Here are your final 10 results.  For the previous 10, say previous.  Please pick the corresponding number.\n\n";
                    }else{
                        starter = "You have "+rows.length+" results.  Please pick the corresponding number.\n\n";
                    }
                    var requestList;

                    starter += getOptions(newData);
                    requestList = getList(newData);

                    resolve([starter, requestList, newData]);
                }else{
                    resolve([null,null,null]);
                }
            }
        });
    });
}