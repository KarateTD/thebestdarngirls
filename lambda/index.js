//https://developer.amazon.com/en-US/docs/alexa/alexa-shopping/implement-shopping-actions.html

const aws = require('aws-sdk');
const RDS = new aws.RDSDataService();

const Alexa = require('ask-sdk-core');
const Welcome = require('./json/welcome.json');
const LibraryWelcome = require('./json/librarywelcome.json');
const MovieOptions = require('./json/movieoptions.json');
const Review = require('./json/review.json');
const Background = require('./json/background.json');

const premLocaleVar = {
	welcome: 'Welcome to The Best Darn Girls Movie Reviews on Alexa.  '+ process.env.skillAdds +'  For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the top rated movies in stores, say In Stores.  For Video on Demand reviews, say Video on Demand. For movies not yet in the theater, say Early Screening. To search The Best Darn Girls Library, say Library.',
	mainOptions: '\t* In The Theater\n\t* Made For TV\n\t* In Stores\n\t* Video On Demand\n\t* Early Screening - Premium Access Only\n\t* Library - Premium Access Only',
	mainScreen: '* In The Theater<br/>* Made for TV<br/>* In Stores<br/>* Video On Demand<br/>* Early Screening - Premium Access Only<br/>* Library - Premium Access Only',
	mainMenu: 'For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the top rated movies in stores, say In Stores.   For Video on Demand reviews, say Video on Demand.  For movies not yet in the theater, say Early Screening.  To search The Best Darn Girls Library, say Library.',
	helpMessage: "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  To search the app's library or gain access to exclusive reviews, you must purchase Premium Access.  For an indepth review, go to https:// that darn girl movie dot reviews.  ",
	helpScreen:  "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  To search the app's library or gain access to exclusive reviews, you must purchase Premium Access.  For an indepth review, go to https://thatdarngirlmovie.reviews."

}

const regLocaleVar = {
	welcome: 'Welcome to The Best Darn Girls Movie Reviews on Alexa.  '+ process.env.skillAdds +'  For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the top rated movies in stores, say In Stores.  For Video on Demand reviews, say Video on Demand',
	mainOptions: '\t* In The Theater\n\t* Made For TV\n\t* In Stores\n\t* Video On Demand',
	mainScreen: '* In The Theater<br/>* Made for TV<br/>* In Stores<br/>* Video On Demand',
	mainMenu: 'For the latest reviews of movies in the theater, say In The Theater.  For the latest TV movies, say Made for TV.  For the top rated movies in stores, say In Stores. For Video on Demand reviews, say Video on Demand.',
	helpMessage: "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https:// that darn girl movie dot reviews.  ",
	helpScreen:  "This is an Alexa app for The Best Darn Girls Movie Review website.  It will give a brief overview of the last 5 movies reviewed along with a short critique and a rating.  For an indepth review, go to https://thatdarngirlmovie.reviews."

}

const repeatGoBack = '  To hear the review again, say repeat.  To go back to the movie options, say movie options.  To go back to the main menu, say main menu.  To exit, say good bye.';
const sorry = 'Sorry I don\'t understand.  Say your response again';
const skillName='The Best Darn Girls'
const goodbyeSpeak='Come back or visit The Best Darn Girls Movie Review website at https:// that darn girl movie dot reviews. Good bye!'
const goodbyeScreen='* Site: https://thatdarngirlmovie.reviews<br/>* Instagram: @thebestdarngirls<br/>* Twitter: @thebestdarngirl<br/>* Facebook: @thebestdarngirls<br/>* Tumblr: @thebestdarngirls<br/>* Email: thebestdarngirls@gmail.com'
const goodbyeCard='\t* Site: https://thatdarngirlmovie.reviews\n\t* Instagram: @thebestdarngirls\n\t* Twitter: @thebestdarngirl\n\t* Facebook: @thebestdarngirls\n\t* Email: thebestdarngirls@gmail.com'
const libHints=['Look for', 'Look up', 'Find', 'How about', 'Search for' ];
const smallLogo='https://thebestdarngirls.s3.amazonaws.com/library/small-image/APP_ICON.jpg';

let inTheTheater = require('./data/inTheTheater');
let madeForTV = require('./data/madeForTV');
let mustBuy = require('./data/mustBuy');
let videoOnDemand = require('./data/videoOnDemand');
let earlyScreening = require('./data/earlyScreening');
let libraryList;

let getOptions = require('./helpers/getOptions');
let getCardInfo = require('./helpers/getCardInfo');
let getList = require('./helpers/getList');

let menu;
let searchChoice = "";
let choice;
let repeat=false
let offset=0;
let maxResults = 5;
let recommended=[true, true, true, true, true];
let sku;
///add array to track what things were advertised

let product = null;
let firstTime = true;

const WelcomeHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'LaunchRequest'
			|| (request.type === 'IntentRequest'
			&& request.intent.name === 'AMAZON.NavigateHomeIntent');
	},
	handle(handlerInput) {
		console.log("In Welcome Intent");
		const request = handlerInput.requestEnvelope.request;
		resetAll();
		let mySettings = makeSettings(request.locale);
		console.log(request.locale);
		repeat=false;

		let greeting = mySettings.mainMenu;
		if(firstTime){
			firstTime=false;
			greeting = mySettings.welcome
		}

		if (supportsAPL(handlerInput)) {
			handlerInput.responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				document: Welcome,
				datasources: {
					"longTextTemplateData": {
						"type": "object",
						"objectId": "longTextSample",
						"properties":{
							"backgroundImage":{
								"sources":Background
							},
							"title":"Main Menu",
							"subtitle": "The Best Darn Girls",
							"textContent":{
								"primaryText":{
									"type":"PlainText",
									"text": mySettings.mainScreen
								}
							},
							"logoUrl": smallLogo,
							"movieSpeechSSML":"<speak>"+greeting+"</speak>"
						},
						"transformers": [
							{
								"inputPath":"movieSpeechSSML",
								"transformer":"ssmlToSpeech",
								"outputName":"movieInfoSpeech"
							}
						]
					}
				}
			});
		}
		
		return handlerInput.responseBuilder
			.reprompt(greeting)
			.withShouldEndSession(false)
			.withSimpleCard(skillName, mySettings.mainOptions)
			.getResponse();

	}

};

function resetAll(){
	menu;
	searchChoice = "";
	choice;
	repeat=false
	offset=0;
	maxResults = 5;

let product = null;
}

function makeSettings(myLocale){
	//console.log("local: "+ myLocale)
	if(myLocale == "en-US" || myLocale == "en-GB" || myLocale == "en-CA"){
		//console.log("with locale and in if");
		return premLocaleVar;
	}else{
		//console.log("with locale and else");
		return regLocaleVar;
	}
}

function isProduct(product)
{
  return product && product.length > 0;
}

function isEntitled(product)
{
  return isProduct(product) && product[0].entitled == 'ENTITLED';
}

const MainMenuHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && request.intent.name === 'MenuSelection');
	},
	handle(handlerInput){
		console.log("In Main Menu Intent");
		const request = handlerInput.requestEnvelope.request;
		if(request.intent.slots.menu){
			menu = request.intent.slots.menu.value;
		}

		let starter = "To hear a movie review, pick the corresponding number.\n\n";
  		let requestList;
		let isLibrary = false;
		  
		const locale = request.locale;
		const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
		
		let mySettings = makeSettings(locale);
		
		if(typeof menu === 'undefined'){
			console.log("**undefinded type");
			if(supportsAPL(handlerInput)){
				console.log("****in if in main menu intent");
				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: Welcome,
					datasources:{
						"longTextTemplateData":{
							"type":"object",
							"objectId":"longTextSample",
							"properties":{
								"backgroundImage":{
									"sources":Background
								},
								"title":"Main Menu",
								"subtitle": "The Best Darn Girls",
								"textContent":{
									"primaryText":{
										"type":"PlainText",
										"text": mySettings.mainScreen
									}
								},
								"logoUrl":smallLogo,
								"movieSpeechSSML":"<speak>Sorry, your response was not understood.  Going back to the main menu.  " + mySettings.mainMenu+"</speak>"
							},
							"transformers":[
								{
									"inputPath":"movieSpeechSSML",
									"transformer":"ssmlToSpeech",
									"outputName":"movieInfoSpeech"
								}
							]
						}
					}
				});
			}
			resetAll();
			return handlerInput.responseBuilder
			.withShouldEndSession(false)
      		.getResponse();
		}

		return ms.getInSkillProducts(locale).then(function(res) {
			console.log("** in return");
			product = res.inSkillProducts.filter(record => record.referenceName == process.env.productName);
			
  			if(menu.toLowerCase() === 'in the theater'){
				console.log("**** in the theater");
      			starter += getOptions(inTheTheater);
 	     		requestList = getList(inTheTheater);
  			}else if(menu.toLowerCase() === 'made for tv'){
				console.log("**** made for tv");
      			starter += getOptions(madeForTV);
      			requestList = getList(madeForTV);
 	 		}else if(menu.toLowerCase() === 'in stores'){
				console.log("**** in stores");
  				starter += getOptions(mustBuy);
  				requestList = getList(mustBuy);
 	 		}else if(menu.toLowerCase() === 'video on demand'){
				console.log("**** video on demand");
  				starter += getOptions(videoOnDemand);
				requestList = getList(videoOnDemand);
			}else if(menu.toLowerCase() === 'early screening'){
				console.log("**** early screening");
				if(isEntitled(product)){
					console.log("****** if product is entitiled");
					starter += getOptions(earlyScreening);
					requestList = getList(earlyScreening);
				}else{
					console.log("****** product not entitled");
					const upsell = "To hear early screening reviews, you must own Premium Access.  Do you want to learn more?"

					return handlerInput.responseBuilder
						.addDirective({
							'type': 'Connections.SendRequest',
							'name':'Upsell',
							'payload': {
								'InSkillProduct': {
									'productId': product[0].productId
								},
								'upsellMessage': upsell
							},
							'token': 'correlationToken'
						}).getResponse();
				}
  			}else if(menu.toLowerCase() === 'library'){
				console.log("**** library");
				if(isEntitled(product)){
					console.log("****** entitled");
  		    		if(repeat == true){
						console.log("******** repeating");
						repeat=false;
						return LibraryHandler.handle(handlerInput);
  		    		}else{
						console.log("******** not repeating");
						phrase = getRandomNumber(libHints, libHints.length, false)
  		 	        	starter = "Welcome to The Best Darn Girls Library.  To search, say \""+ phrase + "\" and the title of the movie. For example, "+phrase+" F9 the fast saga";
 	 		    	    isLibrary = true;
						isEnd=false;
						repeat = false;
						searchChoice = "";
  		        		offset=0;
					}
				}else{
					console.log("****** not entitled");
					const upsell = "Before you can search the library, you must own Premium Access.  Do you want to learn more?"

					return handlerInput.responseBuilder
						.addDirective({
							'type': 'Connections.SendRequest',
							'name':'Upsell',
							'payload': {
								'InSkillProduct': {
									'productId': product[0].productId
								},
								'upsellMessage': upsell
							},
							'token': 'correlationToken'
						}).getResponse();
				}
  			}else{
				console.log("**** something is wrong");
      			starter = `${sorry}`;
 			}

 			if(supportsAPL(handlerInput) && requestList){
				console.log("****** has screen and not library")

				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					token: "movieOptions",
					document: MovieOptions,
					datasources: {
						"gridListData":{
							"type":"object",
							"objectId": "gridListSample",
							"backgroundImage": {
								"sources": Background
							},
							"title": "Movie Options",
							"listItems": requestList,
							"logoUrl": smallLogo
						}
					}
				})

 			}else if(supportsAPL(handlerInput) && isLibrary){
				console.log("****** has screen and is library")
 			    handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: LibraryWelcome,
					datasources: {
						"headlineTemplateData":{
							"type": "object",
							"objectId": "headlineSample",
							"properties":{
								"backgroundImage":{
									"sources": Background
								},
								"textContent":{
									"primaryText":{
										"type": "PlainText",
										"text": "Welcome to The Best Darn Girls Library"
									}
								},
								"logoUrl": smallLogo,
								"hintText": "Try, \""+ phrase + " Hailey Dean Mysteries\"",
								"welcomeSpeechSSML":"<speak>"+starter+"</speak>"
							},
							"transformers": [
								{
									"inputPath": "welcomeSpeechSSML",
									"transformer": "ssmlToSpeech",
									"outputName": "welcomeSpeech"
								}
							]
						}
					}
        	    });

				return handlerInput.responseBuilder
		    	.reprompt(starter)
		    	.withShouldEndSession(false)
		    	.withSimpleCard(skillName, starter)
		    	.getResponse();
			}
			
			return handlerInput.responseBuilder
			.speak(starter)
		    .reprompt(starter)
		    .withShouldEndSession(false)
		    .withSimpleCard(skillName, starter)
		    .getResponse();
 			
		})
	
	}
};

const WhatCanIBuyHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && (request.intent.name === 'WhatCanIBuy'
		  || request.intent.name === 'BuyIntent' ));
	},
	handle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		const locale = request.locale;
		const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

		let mySettings = makeSettings(request.locale);

		return ms.getInSkillProducts(locale).then(function(res) {
			product = res.inSkillProducts.filter(record => record.referenceName == process.env.productName);
			const speakResponse = "You have Premium Access.  There are no other products to purchase.  ";

			if (isEntitled(product)){
				if (supportsAPL(handlerInput)) {
					handlerInput.responseBuilder.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						document: Welcome,
						datasources: {
							"longTextTemplateData":{
								"type":"object",
								"objectId":"longTextSample",
								"properties":{
									"backgroundImage":{
										"sources":Background
									},
									"title":"Main Menu",
									"subtitle":"The Best Darn Girls",
									"textContent":{
										"primaryText":{
											"type":"PlainText",
											"text":mySettings.mainScreen
										}
									},
									"logoUrl":smallLogo,
									"movieSpeechSSML":"<speak>" + speakResponse + mySettings.mainMenu + "</speak>"
								},
								"transformer":[
									{
										"inputPath":"movieSpeechSSML",
										"transformer":"ssmlToSpeech",
										"outputName":"movieInfoSpeech"
									}
								]
							}
						}
					});
				}

				resetAll();
				return handlerInput.responseBuilder
				  .withShouldEndSession(false)
				  .reprompt(mySettings.mainMenu)
				  .getResponse();
			}else{
				return handlerInput.responseBuilder
				.addDirective({
					'type': 'Connections.SendRequest',
					'name': 'Buy',
					'payload':{
						'InSkillProduct': {
							'productId': product[0].productId
						}
					},
					'token': 'correlationToken'
				})
				.getResponse();
			}
		})
	}
}

const CancelPurchaseHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
		    && request.intent.name === 'CancelPurchaseIntent';
	},
	async handle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		const locale = request.locale;
		const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

		let mySettings = makeSettings(locale);

		return ms.getInSkillProducts(locale).then((res) => {
			const product = res.inSkillProducts.filter(record => record.referenceName === process.env.productName);
			if(isEntitled(product)){
				return handlerInput.responseBuilder
				  .addDirective({
					  'type': 'Connections.SendRequest',
					  'name': 'Cancel',
					  'payload':{
						  'InSkillProduct': {
							  'productId': product[0].productId,
						  },
					  },
					  'token': 'correlationToken',
				  })
				  .getResponse();
			}else{
				const speakResponse = "You do not own Premium Access.  If you would like to purchase it say, Alexa ask The Best Darn Girls to purchase Premium Access.  ";
				if(supportsAPL(handlerInput)){
					handlerInput.responseBuilder.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						document: Welcome,
						datasources: {
							"longTextTemplateData":{
								"type":"object",
								"objectId":"longTextSample",
								"properties":{
									"backgroundImage":{
										"sources":Background
									},
									"title": "Main Menu",
									"subtitle": "The Best Darn Girls",
									"textContent":{
										"primaryText":{
											"type":"PlainText",
											"text":mySettings.mainScreen
										}
									},
									"logoUrl":smallLogo,
									"movieSpeechSSML":"<speak>"+speakResponse+mySettings.mainMenu+"</speak>"
								},
								"transformers":[
									{
										"inputPath":"movieSpeechSSML",
										"transformer":"ssmlToSpeech",
										"outputName":"movieInfoSpeech"
									}
								]
							}
						}
					});
				}
				resetAll();
				
				return handlerInput.responseBuilder
				  .withShouldEndSession(false)
				  .reprompt(mySettings.mainMenu)
				  .getResponse();

			}
		});
	},
};

const UpsellResponseHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;

		return request.type === 'Connections.Response'
		  && (request.name === 'Upsell' || request.name === 'Buy');
	},
	handle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		let locale = request.locale;

		let mySettings = makeSettings(locale);
		let speakResponse = "";

		if(request.payload.purchaseResult == 'DECLINED'){
			speakResponse = "You cannot search the library or hear early screening reviews without Premium Access.  However, you can still get the latest reviews.  If you would like to purchase Premium Access say, Alexa ask The Best Darn Girls to purchase Premium Access.  ";
		}else if(request.payload.purchaseResult == 'ACCEPTED'){
			speakResponse = "Congratulations, you have Premium Access!  You can search the library and have access to exclusive reviews.  Happy searching! ";
		}

		if(request.status.code = 200) {
			if (supportsAPL(handlerInput)) {
				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: Welcome,
					datasources:{
						"longTextTemplateData":{
							"type":"object",
							"objectId":"longTextSample",
							"properties":{
								"backgroundImage":{
									"sources":Background
								},
								"title":"Main Menu",
								"subtitle":"The Best Darn Girls",
								"textContent":{
									"primaryText":{
										"type":"PlainText",
										"text":mySettings.mainScreen
									}
								},
								"logoUrl":smallLogo,
								"movieSpeechSSML":"<speak>" + speakResponse + mySettings.mainMenu + "</speak>"
							},
							"transformers":[
								{
									"inputPath":"movieSpeechSSML",
									"transformer":"ssmlToSpeech",
									"outputName":"movieInfoSpeech"
								}
							]
						}
					}
				});
			}

			resetAll();
			return handlerInput.responseBuilder
			.reprompt(mySettings.mainMenu)
			.withShouldEndSession(false)
			.getResponse();

			
		}else{
			console.log("Connections.Response failure.  Error is: " + request.status.message);
			return handlerInput.responseBuilder
			  .speak("I did not understand.  Say your response again.")
			  .withShouldEndSession(false)
			  .getResponse();
		}
	}
}

const MovieChoicesHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && request.intent.name === 'MovieChoices')
		  || request.type === 'Alexa.Presentation.APL.UserEvent';
	},
	handle(handlerInput){
		console.log("in movie choice intent")
		const request = handlerInput.requestEnvelope.request;
		console.log(request)
		if (request.type === 'Alexa.Presentation.APL.UserEvent') {
			choice = request.arguments[0];
		}else if(request.intent.slots.choice){
			choice = request.intent.slots.choice.value;
		}

		let element;
		let starter = '';

		let mySettings = makeSettings(request.locale);
		
		if(typeof menu === 'undefined'){
			console.log("** im menu is undefined")
			let apology = "Sorry, your response was not understood.  Going back to the main menu.  ";
			if(supportsAPL(handlerInput)){
				console.log("**** if it has a screen")
				handlerInput.responseBuilder.addDirective({
					type:'Alexa.Presentation.APL.RenderDocument',
					document: Welcome,
					datasources:{
						"longTextTemplateData":{
							"type":"object",
							"objectId": "longTextSample",
							"properties":{
								"backgroundImage":{
									"sources": Background
								},
								"title": "Main Menu",
								"subtitle": "The Best Darn Girls",
								"textContent":{
									"primaryText":{
										"type":"PlainText",
										"text": mySettings.mainScreen
									}
								},
								"logoUrl":smallLogo,
								"movieSpeechSSML":"<speak>" + apology + mySettings.mainMenu+"</speak>"
							}
						}
					}
				});
			
			}
			resetAll();
			return handlerInput.responseBuilder
			.withShouldEndSession(false)
      		.getResponse();
		}

		console.log(choice)

  		if(menu.toLowerCase() === 'in the theater'){
			console.log("** in the theater")
			element = getCardInfo(inTheTheater, choice);
			starter += getOptions(inTheTheater);
			maxResults = 5;
	  	}else if(menu.toLowerCase() === 'made for tv'){
			console.log("** made for tv" )
			element = getCardInfo(madeForTV, choice);
			starter += getOptions(madeForTV);
			maxResults = 5;
 	 	}else if(menu.toLowerCase() === 'in stores'){
			console.log("** in stores")
			element = getCardInfo(mustBuy, choice);
			starter += getOptions(mustBuy);
			maxResults = 5;
	  	}else if(menu.toLowerCase() === 'video on demand'){
			console.log("** video on demand")
			element = getCardInfo(videoOnDemand, choice);
			starter += getOptions(videoOnDemand);
			maxResults = 5;
		}else if(menu.toLowerCase() === 'early screening'){
			console.log("**  early screening")
			element = getCardInfo(earlyScreening, choice);
			starter += getOptions(earlyScreening);
			maxResults = earlyScreening.length;
  		}else if(menu.toLowerCase() === 'library'){
			console.log("** library")
			element = getCardInfo(libraryList, choice);
			starter += getOptions(libraryList);
			maxResults = libraryList.length;
		}
 
		console.log(element);
		console.log(starter);

    	if(typeof element !== 'undefined'){
			console.log("** if element is not undefined")
			//and if not advertised
			if( menu.toLowerCase() === 'in stores' && recommended[parseInt(element.option)]){
				speechConcat = element.review.replace(/<br\/>/g,'\n').replace(/_/g,'\n').concat(" Would you like to own ").concat(element.mtitle).concat("? ")
				if(request.locale == "en-US") {
					sku = element.asin.re;
				}else{
					sku = ""
				}
				console.log("INFO: sku is "+sku);
				if(sku == ""){
					speechConcat = element.review.replace(/<br\/>/g,'\n').replace(/_/g,'\n').concat(repeatGoBack)
				}
				recommended[parseInt(element.option)] = false;
			}else{
				//if in stores and adverstise (change array)
				speechConcat = element.review.replace(/<br\/>/g,'\n').replace(/_/g,'\n').concat(repeatGoBack)
			}
    		if(supportsAPL(handlerInput)){
				console.log("**** if it has screen")

				console.log("Saying: "+speechConcat)
				console.log(element.image.largeImageUrl)
				console.log(element.image.smallImageUrl)
				console.log(element.mtitle)
				console.log("Seeing: "+element.review)

				//Don't use Background for image.  This section uses the promo photo for the background
				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: Review,
					datasources: {
						"longTextTemplateData": {
							"type": "object",
							"objectId": "longTextSample",
							"properties": {
								"backgroundImage": {
									"sources": [
										{
											"url": element.image.largeImageUrl,
											"size": "large"
										},
										{
											"url": element.image.smallImageUrl,
											"size":"small"
										}
									]
								},
								"title": element.mtitle,
								"textContent": {
									"primaryText": {
										"type": "PlainText",
										"text": element.review
									}
								},
								"logoUrl": smallLogo,
								"movieSpeechSSML": "<speak>"+speechConcat+"</speak>"
							},
							"transformers":[
								{
									"inputPath": "movieSpeechSSML",
									"transformer": "ssmlToSpeech",
									"outputName": "movieInfoSpeech"
								}
							]
						}
					}
				});

 			
				console.log("returning")
      			return handlerInput.responseBuilder
				  .withShouldEndSession(false)
      			  .withStandardCard(element.mtitle, element.review.replace(/<br\/>/g,'\n'), element.image.smallImageUrl, element.image.largeImageUrl)
      			  .getResponse();
			}else{
				console.log("returning")
      			return handlerInput.responseBuilder
				  .speak(speechConcat)
				  .withShouldEndSession(false)
      			  .withStandardCard(element.mtitle, element.review.replace(/<br\/>/g,'\n'), element.image.smallImageUrl, element.image.largeImageUrl)
      		 	  .getResponse();
			} //end else no screen
      	}else{
			console.log("** else element is defined")
			  let speakOutput = "You have made an incorrect selection. Pick ";
			  if(maxResults > 1){
				  speakOutput += "a number between 1 and " + maxResults+". ";
			  }else{
				  speakOutput += "one."
			  }
			  return handlerInput.responseBuilder
			  .speak(speakOutput + starter)
			  .withShouldEndSession(false)
      		  .getResponse();
    	}
	}
};

const YesAndNoIntentHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
		  && (request.intent.name === 'AMAZON.YesIntent'
		  ||  request.intent.name === 'AMAZON.NoIntent');
	},
	handle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		const intentName = request.intent.name;
		console.log("User said: " + intentName);
		console.log("***** in yes no")
		console.log(request)

		if (intentName === 'AMAZON.YesIntent'){
			var actionText = "Staging item with Amazon"
			let actionTask = {
				'type': 'Connections.StartConnection',
				'uri': 'connection://AMAZON.AddToShoppingCart/1',
				'input':{
					'products':[
						{
							'asin': sku,
							'attribution':{
								'associateId': process.env.associateID, 
								'trackingId': process.env.associateID
							}
						}
					]
				},
				'onCompletion': 'RESUME_SESSION',
				'token': 'AddToShoppingCartToken'
			};
			console.log(actionTask)
			return handlerInput.responseBuilder
			  .speak(actionText)
			  .addDirective(actionTask)
			  .getResponse()
		}else if(intentName === 'AMAZON.NoIntent'){
			var actionText = "Ok, this product will not be recommended for the rest of your session. ".concat(repeatGoBack);

			return handlerInput.responseBuilder
			  .speak(actionText)
			  .getResponse();
		}
	}
}

const SessionResumedRequestHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'SessionResumedRequest';
	},
	handle(handlerInput){
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		console.log("handlerInput: " + JSON.stringify(handlerInput));
		console.log("attributesManager: " + JSON.stringify(handlerInput.attributesManager));
		console.log("sessionAttributes: " + JSON.stringify(sessionAttributes));
		const token = handlerInput.requestEnvelope.request.cause.token;

		let request = handlerInput.requestEnvelope.request;
		let speechText = "Sorry, I had trouble doing what you asked. Please try again. ";

		if(request.cause){
			const token = request.cause.token;
			const status = request.cause.status;
			const code = status.code;
			const message = status.message;
			const payload = request.cause.result;

			console.info(`[Shopping Response] ${JSON.stringify(request)}`);
			console.info(`[INFO] Shopping Action Result: Code = ${code}, Message - ${message}, Payload - ${payload}`);
			
			switch(code){
				case '200':
					if (typeof payload !== "undefined"){
						console.log("in first if");
						if (payload.code === 'AlexaShopping.RetryLaterError'){
							console.log("in if's if");
							speechText = "Looks like there was an issue. Let's get back to the skill. Please go to amazon.com for this transaction. ".concat(repeatGoBack);
						}
						else{
							console.log("in if's else");
							speechText = "I'm sorry, shopping indicated an issue while performing your request. Please try again later. Please go to amazon.com for this transaction. ".concat(repeatGoBack);
							console.info(`[INFO] Shopping Action had an issue while performing the request. ${payload.message}`);
						}
					}
					else if(token === 'AddToShoppingCartToken'){
						console.log("in first else");
						console.info(`[INFO] Shopping Action: Add to cart action was a success for ${token}.`);
						speechText = "If you added an item to your cart, you can finish purchasing, modify, or remove the item on Amazon.com. Let's get back to the reviews! ".concat(repeatGoBack);
						console.info(`[INFO] Said ${speechText}`);
					}
				break;
				default:
					console.log("in default");
					console.info(`[INFO] Shopping Action: There was a problem performing the shopping action.`);
					speechText = "There was a problem adding the item to your cart. Please go to amazon.com for this transaction. ".concat(repeatGoBack);
			}
		}
		console.log("returning after 200");
		return handlerInput.responseBuilder.speak(speechText).getResponse();
	},
};

const LibraryHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest'
          && request.intent.name === 'Library');
    },
    async handle(handlerInput){
		console.log("Library intent")
        const request = handlerInput.requestEnvelope.request;
        if(request.intent.slots && offset == 0){
			console.log("** if slots defined and offset is 0")

			if(request.intent.slots.MovieList != null && request.intent.slots.query != null){
				console.log("**** movielist and query have values")
           		if (request.intent.slots.MovieList.value != null){
					console.log("****** if movie list has value")
                	choice = request.intent.slots.MovieList.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            	}else if(request.intent.slots.query.value != null){
					console.log("****** if query has value")
                	choice = request.intent.slots.query.value;
            	}
			}
		}

		if(typeof menu === 'undefined'){
			menu = "library"
		}

		let rows;
		let parsedChoice;

		if(request.intent.slots != null){
			console.log("** if slots are not null")
			if(request.intent.slots.MovieList != null || request.intent.slots.query != null){
				console.log("**** if movie list is not null or query is not null")
				console.log("choice is "+ choice)
				parsedChoice = choice.toLowerCase().replace('/ /g','%');
				searchChoice = parsedChoice;
			}else{
				console.log("**** both were empty")
				parsedChoice = searchChoice;
			}
		}else{
			parsedChoice = searchChoice;
		}
		console.log("parsedChoice is " + parsedChoice + " and search choice is "+searchChoice);
		let starter = null;
		try{
			console.log("** in try")
			const paramsSecond = {
				secretArn: process.env.secretArn,
				resourceArn: process.env.resourceArn,
				sql: `select count(id) as count from reviews where title like :title`,
				parameters:[
					{
						name: 'title',
						value:{
							"stringValue": '%'+parsedChoice+'%'
						}
					}
				],
				database: process.env.database
			}// end paramSecond

			//get number of rows
			let retRowCount = await RDS.executeStatement(paramsSecond).promise();
			let rowCount = retRowCount.records[0][0]['longValue'];

			let phrase = "";

			if(offset < 0){
				offset = 0;
				phrase = "You are at the beginning of your search.  Please, make your selection.  ";
			}

			if(offset >= rowCount && rowCount != Number(0)){
				offset = offset - 10;
            	phrase = "You are at the end of your search.  Please, make your selection.  ";
			}

			const paramsFirst = {
				secretArn: process.env.secretArn, 
				resourceArn: process.env.resourceArn, 
				sql: `select * from reviews where title like :title order by title limit 10 offset :offset`,
				parameters:[
					{
						name: 'title',
						value: {
							"stringValue": '%'+parsedChoice+'%'
						}
					},
					{
						name: 'offset',
						value: {
							"longValue": offset
						}
					}
				], //end params
				database: process.env.database
			} //end const paramsFirst
			let rowReturns = await RDS.executeStatement(paramsFirst).promise();
			rows = parseResults(rowReturns, rowCount, phrase);

		}catch(e){
			console.log(e);
			return ErrorHandler.handle(handlerInput);
		} //end try catch block
		const locale = request.locale;
		const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
		
		return ms.getInSkillProducts(locale).then(function(res) {
			product = res.inSkillProducts.filter(record => record.referenceName == process.env.productName);
			console.log("** in return")
			if(isEntitled(product)){
				console.log("**** product owned")
				starter = rows[0];
		        let requestList = rows[1];
        		libraryList = rows[2];
				if(supportsAPL(handlerInput) && rows[0] != ""){
					console.log("******* has screen")

					handlerInput.responseBuilder.addDirective({
						type:'Alexa.Presentation.APL.RenderDocument',
						document: MovieOptions,
						datasources:{
							"gridListData":{
								"type":"object",
								"objectId":"gridListSample",
								"backgroundImage":{
									"sources":Background
								},
								"title":"Search Results",
								"listItems": requestList,
								"logoUrl":smallLogo

							}
						}
					});

		        }else if(supportsAPL(handlerInput) && rows[0] == "" && offset == 0){
        		    starter = "Your search has returned 0 results.  You can request another search by saying " + getRandomNumber(libHints, libHints.length, false) + " and the movie's title.  "+ process.env.libraryAdds;
					let myscreen = "Your search has returned 0 results. "+ process.env.libraryAdds;
					console.log("******* no serch values Parsed: " + parsedChoice + " Choice: " + choice + " Search: " + searchChoice)
					handlerInput.responseBuilder.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						document: LibraryWelcome,
						datasources:{
							"headlineTemplateData":{
								"type":"object",
								"objectId": "headlineSample",
								"properties":{
									"backgroundImage":{
										"sources": Background
									},
									"textContent":{
										"primaryText":{
											"type":"PlainText",
											"text": myscreen
										}
									},
									"logoUrl":smallLogo,
									"hintText": "Try, \""+ getRandomNumber(libHints, libHints.length, false) + " Hailey Dean Mysteries\"",
									"welcomeSpeechSSML": "<speak>"+ starter + "</speak>"
								},
								"transformers":[
									{
										"inputPath":"welcomeSpeechSSML",
										"transformer":"ssmlToSpeech",
										"outputName":"welcomeSpeech"
									}
								]
							}
						}
					});
					return handlerInput.responseBuilder
					.reprompt(starter)
					.withShouldEndSession(false)
        			.withSimpleCard(skillName, starter)
        			.getResponse();
        		}else if(!supportsAPL(handlerInput) && rows[0] == "" && offset == 0){
					starter = "Your search has returned 0 results.  You can request another search by saying " + getRandomNumber(libHints, libHints.length, false) + " and the movie's title.  "+ process.env.libraryAdds;
					return handlerInput.responseBuilder
					.speak(starter)
					.reprompt(starter)
					.withShouldEndSession(false)
        			.withSimpleCard(skillName, starter)
        			.getResponse();
				}

        		return handlerInput.responseBuilder
					.speak(starter)
					.reprompt(starter)
					.withShouldEndSession(false)
        			.withSimpleCard(skillName, starter)
        			.getResponse();
    		}else{
				const upsell = "To seach the library, you must own Premium Access.  Do you want to learn more?"
				console.log("**** upsell")
				return handlerInput.responseBuilder
					.addDirective({
						'type': 'Connections.SendRequest',
						'name':'Upsell',
						'payload': {
							'InSkillProduct': {
								'productId': product[0].productId
							},
							'upsellMessage': upsell
						},
						'token': 'correlationToken'
					}).getResponse();
			
			}

		})
	}
};

const CommandsHandler = {
	canHandle(handlerInput){
		const request = handlerInput.requestEnvelope.request;
		return (request.type === 'IntentRequest'
		  && request.intent.name === 'Commands');
	},
	handle(handlerInput){
		const request = handlerInput.requestEnvelope.request
		let com = request.intent.slots.command.value;
		let locale = request.locale
		let mySettings = makeSettings(locale);

		if(com.toLowerCase() === 'repeat'){
		    repeat=true;
			return MovieChoicesHandler.handle(handlerInput);
		}else if(com.toLowerCase() === 'movie options'){
			repeat=true;
			return MainMenuHandler.handle(handlerInput);
		}else if(com.toLowerCase() === 'main menu'){
			return WelcomeHandler.handle(handlerInput);
		}else{

			if(supportsAPL(handlerInput)){
				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: Welcome,
					datasources:{
						"longTextTemplateData":{
							"type": "object",
							"objectId":"longTextSample",
							"properties":{
								"backgroundImage":{
									"sources": Background
								},
								"title":"Main Menu",
								"subtitle":"The Best Darn Girls",
								"textContent":{
									"primaryText":{
										"type":"PlainText",
										"text":mySettings.mainScreen
									}
								},
								"logoUrl":smallLogo,
								"movieSpeechSSML":"<speak>Sorry your response was not understood.  Going back to the main menu. "+ mySettings.mainMenu+"</speak>"
							},
							"transformers":[
								{
									"inputPath":"movieSpeechSSML",
									"transformer":"ssmlToSpeech",
									"outputName":"movieInfoSpeech"
								}
							]
						}
					}
				});
			}
			resetAll();
			return handlerInput.responseBuilder
			.withShouldEndSession(false)
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
            offset=offset-10;
            return LibraryHandler.handle(handlerInput);
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
		return (request.type === 'IntentRequest'
		  && (request.intent.name === 'AMAZON.CancelIntent'
		  || request.intent.name === 'AMAZON.StopIntent')) 
		  ||
		  (request.type === 'Connections.Response' 
		  && request.name === 'Cancel');
	},
	handle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		let mySettings = makeSettings(request.locale);
		console.log("exit intent")
		if(request.type === 'IntentRequest'){
			console.log("** if intent reqeust")
			if(supportsAPL(handlerInput)){
				console.log("**** if supports apl")
				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: Welcome,
					datasources:{
						"longTextTemplateData":{
							"type":"object",
							"objectId":"longTextSample",
							"properties":{
								"backgroundImage":{
									"sources": Background
								},
								"title":"Good Bye",
								"subtitle":"The Best Darn Girls",
								"textContent":{
									"primaryText":{
										"type":"PlainText",
										"text":goodbyeScreen
									}
								},
								"logoUrl":smallLogo,
								"movieSpeechSSML":"<speak>" + goodbyeSpeak + "</speak>"
							},
							"transformers":[
								{
									"inputPath":"movieSpeechSSML",
									"transformer":"ssmlToSpeech",
									"outputName":"movieInfoSpeech"
								}
							]
						}
					}
				});
			}

			return handlerInput.responseBuilder
		  	.withSimpleCard(skillName,goodbyeCard)
		  	.withShouldEndSession(true)
		  	.getResponse();
		}else if(request.type === 'Connections.Response'){
			console.log("** if connections response ")
			let speakResponse = null;

			if(request.payload.purchaseResult === 'ACCEPTED'){
				speakResponse = "I am sorry to see you go.  You can renew your Premium Access in the future.  ";			
			}else if(request.payload.purchaseResult === 'DECLINED'){
				speakResponse = "You still have Premium Access.  ";
			}else{
				speakResponse = "I did not understand.  Say your response again. "
			}

			if (supportsAPL(handlerInput)) {
				console.log("**** if supports apl")
				handlerInput.responseBuilder.addDirective({
					type: 'Alexa.Presentation.APL.RenderDocument',
					document: Welcome,
					datasources:{
						"longTextTemplateData":{
							"type":"object",
							"objectId":"longTextSample",
							"properties":{
								"backgroundImage":{
									"sources":Background
								},
								"title":"Main Menu",
								"subtitle":"The Best Darn Girls",
								"textContent":{
									"primaryText":{
										"type":"PlainText",
										"text":mySettings.mainScreen
									}
								},
								"logoUrl":smallLogo,
								"movieSpeechSSML":"<speak>"+speakResponse+mySettings.mainMenu+"</speak>"
							},
							"transformers":[
								{
									"inputPath":"movieSpeechSSML",
									"transformer":"ssmlToSpeech",
									"outputName":"movieInfoSpeech"
								}
							]
						}
					}
				});
			}

			return handlerInput.responseBuilder
				.withShouldEndSession(false)
				.reprompt(mySettings.mainMenu)
				.getResponse();
		}else{
			console.log("** else do not understand")
			return handlerInput.responseBuilder
			.speak("I did not understand.  Say your response again.")
				.withShouldEndSession(false)
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
		
		const request = handlerInput.requestEnvelope.request;
		let mySettings = makeSettings(request.locale);

		if(supportsAPL(handlerInput)){
			handlerInput.responseBuilder.addDirective({
				type:'Alexa.Presentation.APL.RenderDocument',
				document: Welcome,
				datasources:{
					"longTextTemplateData":{
						"type":"object",
						"objectId":"longTextSample",
						"properties":{
							"backgroundImage":{
								"sources":Background
							},
							"title":"Help & Main Menu",
							"subtitle":"The Best Darn Girls",
							"textContent":{
								"primaryText":{
									"type":"PlainText",
									"text":mySettings.mainScreen
								}
							},
							"logoUrl":smallLogo,
							"movieSpeechSSML":"<speak>"+mySettings.helpMessage.concat(mySettings.mainMenu)+"</speak>"
						},
						"transformers":[
						{
							"inputPath":"movieSpeechSSML",
							"transformer":"ssmlToSpeech",
							"outputName":"movieInfoSpeech"
						}
						]
					}
				}
			});
        }

		return handlerInput.responseBuilder
			.withShouldEndSession(false)
	  	    .reprompt(mySettings.mainOptions)
	  	    .withSimpleCard(skillName, mySettings.mainOptions)
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
		firstTime = true;
		return handlerInput.responseBuilder
		.withShouldEndSession(true)
		.getResponse();
	}
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error){
	  console.log(`Error handled: ${error.message}`);
	  firstTime = true;
	  return handlerInput.responseBuilder
	    .speak('Sorry, an error occurred.')
		.reprompt('Sorry, an error occurred.')
		.withShouldEndSession(true)
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
	CancelPurchaseHandler,
	ExitHandler,
	UpsellResponseHandler,
	YesAndNoIntentHandler,
	SessionResumedRequestHandler,
	WhatCanIBuyHandler,
    PrevHandler,
    NextHandler,
	HelpHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();

  // returns true if the skill is running on a device with a display (show|spot)
function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
	//return false;
    return aplInterface != null && aplInterface != undefined;
}

function getRandomNumber(array, length, ifNext){
    let num = Math.floor(Math.random() * length);
    let nextNum = num+1;

    if(ifNext){
        return array[num]+nextNum;
    }else{
        return array[num]
    }
}

function parseResults(rowReturns, rowCount, phrase){
	let resultString = "[";
	let count = 1;
	let newData = null;
	let starter = phrase;
	let requestList = null;

	
	//creates the JSON String to create movie listing
	rowReturns.records.forEach(function(obj){
		let keys = Object.keys(obj);
		let myMtitle = obj[keys[1]]['stringValue']; let myReview = obj[keys[4]]['blobValue'];
		let myRating = obj[keys[2]]['doubleValue']; let myImage = obj[keys[3]]['stringValue'];

		resultString += "{\n\"option\":\""+count+"\",\n\"mtitle\":\""+ myMtitle+"\",\n\"review\":\""+myReview+"<br/><br/>"+myRating+" out of 5 stars.\",\n\"image\":{\n\"smallImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+myImage+"\",\n\"largeImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/large-image/"+myImage+"\"\n}\n},";
		count = count + 1;
	});

	
	//removes the last comma and adds a braket
	resultString = resultString.slice(0,-1);
	resultString += "]";
	
	if(rowCount != 0){
		//parse JSON from string
		console.log(resultString);
		newData = JSON.parse(resultString);

		if(rowCount == Number(1)){
			starter += "You have one result.  Pick the corresponding number.\n\n";
			maxResults = 1;
		}else if(rowCount > Number(10) && offset == Number(0)){
			starter += "You have "+rowCount+" results.  Here are your first 10 results. For the next 10, say skip.  Pick the corresponding number.\n\n";
			maxResults = 10;
		}else if(rowCount > Number(10) && ((offset + 10) >= rowCount)){
			starter += "You have "+rowCount+" results.  Here are your final results.  For the previous 10, say previous.  Pick the corresponding number.\n\n";
			maxResults = rowCount - offset;
		}else if(rowCount > 10 && offset > 0){
			starter += "You have "+rowCount+" results.  Here are your next 10 results.  For more results, say skip.  For the previous 10, say previous.  Pick the corresponding number.\n\n";
			maxResults = 10;
		}else{
			starter += "You have "+rowCount+" results.  Pick the corresponding number.\n\n";
			maxResults = rowCount;
		}

		starter += getOptions(newData);
		requestList = getList(newData);
	}

	return [starter, requestList, newData];
}
