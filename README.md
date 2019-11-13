# thebestdarngirls
This code will create a movie review app for an Alexa skill

## Motivation
To create an Alexa skill to coincide with my website, <a href="https://thatdarngirlmovie.reviews/" target="_blank" rel="noopener">thatdarngirlmovie.reviews</a>.  User will get the last 5 reviews for movies that are <b>In The Theater</b>, <b>Made for TV</b>, <b>Video on Demand</b>, and <b>In Stores</b>.  For English Speaking Great Britain and the United States, uses can purchase access to <b>Early Screening</b> reviews and a searchable <b>Library</b>.  Some reviews in the Library will be exclusives because they will never be featured in the main app.

## Technology Used
Built with
<ul>
	<li><a href="https://aws.amazon.com/s3/" target="_blank" rel="noopener">Amazon S3</a></li>
	<li><a href="https://developer.amazon.com/alexa-skills-kit" target="_blank" rel="noopener">Alexa Skill Kit</a></li>
	<li><a href="https://aws.amazon.com/lambda/" target="_blank" rel="noopener">AWS Lambda</a></li>
	<li><a href="https://aws.amazon.com/codepipeline/" target="_blank" rel="noopener">AWS CodePipeline</a>
		<ul>
			<li><a href="https://aws.amazon.com/codecommit/" target="_blank" rel="noopener">AWS CodeCommit</a></li>
			<li><a href="https://aws.amazon.com/codebuild/" target="_blank" rel="noopener">AWS CodeBuild</a></li>
		</ul>
	</li>
	<li><a href="https://aws.amazon.com/rds/aurora/" target="_blank" rel="noopener">Amazon Aurora</a></li>
	<li><a href="https://developer.amazon.com/en-US/alexa/alexa-skills-kit/learn/build-a-business/in-skill-purchasing" target="_blank" rel="noopener">In Skill Purchasing</a></li>
	<li><a href="https://aws.amazon.com/secrets-manager/" target="_blank" rel="noopener">AWS Secrets Manager</a></li>
	<li>GitHub</li>
	<li>NodeJS 10.x</li>
</ul>

## Features
When this code is git push'ed to master branch, it triggers your CodePipeline to build the code in the Development Lambda Function.  Once built, it waits for the user to manually test in the Alexa Development Console.  If the test is labeled successful, the CodePipeline will build the code in the Production Lambda Function.  This will change the skill to all production customers. 

## Releases
<ul>
	<li><b>Release-1.0.0</b>: Uses Node.js 6.10 without Alexa Skills Cards</li>
	<li><b>Release-1.1.0</b>: Uses Node.js 6.10 with Alexa Skills Cards</li>
	<li><b>Release-2.0.0</b>: Uses Node.js 8.10 with Alexa Skills Cards and optimized for the Echo Show and the Echo Spot</li>
	<li><b>Release-2.0.1</b>: Release-2.0.0 with bug fixes</li>
	<li><b>Release-3.0.0</b>: Updated with the <a href="https://developer.amazon.com/docs/alexa-presentation-language/apl-overview.html" target="_blank">Alexa Presentation Language</a> (APL) which optimizes this skill for <a href="https://amzn.to/2IsxHJZ" target="_blank">Echo Spot</a>, <a href="https://amzn.to/2E39VPz" target="_blank">Echo Show 1st Gen</a>, <a href="https://amzn.to/2ItCx9S" target="_blank">Echo Show 2nd Gen</a>, and <a href="https://amzn.to/2DYuP29" target="_blank">Fire TV</a> (<span style="color: #0000ff;"><a style="color: #0000ff;" href="https://thatdarngirlmoviereviews.wordpress.com/about/#disclaimer"><u>FTC Affiliate Disclaimer</u></a></span>)</li>
	<li><b>Release-4.0.0</b>: Uses Node.js 10.15 with In Skill Purchasing for English speaking US and English Speaking Great Britian.  Adds a library backed by Aurora DB and Early Screening Reviews.  Changed Must Buy to In Stores</li>
</ul> 

## Code
<ul>
	<li>Data Folder
		<ul>
			<li>earlyScreening.js - contains data for the <i>Early Screening</i> section
			<li>inTheTheater.js - contains data for the <i>In The Theater</i> section</li>
			<li>madeForTV.js - contains data for the <i>Made For TV</i> section</li>
			<li>mustBuy.js - contains data for the <i>Must Buy</i> section</li>
			<li>videoOnDemand.js - contains data for the <i>Video On Demand</i> section</li>
		</ul>
	</li>
	<li>Helpers Folder
		<ul>
			<li>getCardInfo.js - returns information about a specific movie for the Alexa Skills Card</li>
			<li>getList.js - returns the json for Alexa devices with screens</li>
			<li>getOptions.js - creates a string for Alexa to say</li>
			<li>getReview.js - returns the review in the data file</li>
		</ul>
	</li>
	<li>JSON Folder
	    <ul>
	        <li>background.json - sets background images for APL design.  If you change the image here, it will change everywhere</li>
	        <li>librarywelcome.json - sets up APL design for the library home page</li>
			<li>movieoptions.json - sets up APL design for the movie options section</li>
	        <li>review.json - sets up APL design for the movie review</li>
	        <li>welcome.json - sets up APL deign for the home, help, and goodbye screen</li>
	    </ul>
	</li>
	<li>index.js</li>
	This contains the code with helper functions for each Intent listed in the next section.
</ul>

## Installation
First, you must have an account on the <a href="https://developer.amazon.com/alexa/console/ask" target="_blank">Alexa Developer Console</a>.  Then create a new skill.  The following are the Intents, followed by their sample utterences, and their slots.  Also, you need a a development and production Lambda function for the system to call.  And you need the images in a public S3 bucket with CORS turned off. <i>Italics are for EN-US and EN-GB only.</i>

|  Intent  |   Sample Utterances          | Slot Name | Slot Type |
| -------- | ---------------------------- | --------- | --------- |
| Commands | {command}<br/>Please {command} | command | USER_COMMAND |
| MenuSelection | {menu} | menu | MENU_OPTIONS |
| MovieChoices | show me {choice}<br/>tell me about {choice}<br/>select {choice}<br/>i choose {choice}<br/>{choice} | choice | LETTER_CHOICE | 
| <i>CancelPurchaseIntent</i>|<i>{Verbs} my subscription<br/>{Verbs} my {ProductName} subscription<br/>{Verbs} {ProductName} subscription<br/>{verbs} subscription<br/>to {Verbs} my subscription<br/>etc</i>|<i>Verbs<br/>ProductName</i>|<i>LIST_OF_VERBS<br/>LIST_OF_PRODUCT_NAMES</i>|
|<i>BuyIntent</i>|<i>to purchase {ProductName}<br/>to buy {ProductName}<br/>i would like {ProductName}<br/>i want {ProductName}<br/>would like {ProductName}</i>|<i>ProductName</i>|<i>LIST_OF_PRODUCT_NAMES</i>|
|<i>WhatCanIBuy</i>|<i>purchase<br/>what can i buy<br/>what can i shop for<br/>tell me what can i buy<br/>etc</i>|||
|<i>Library</i>|<i>look for {query}<br/>look for {MovieList}<br/>search for {query}<br/>search for {MovieList}<br/>lookup {query}<br/>etc</i>|<i>query<br/>MovieList</i>|<i>Amazon.SearchQuery<br/>LIST_OF_MOVIES</i>}

| Slot Types | Value | 
| ---------- | ----- |
| USER_COMMAND | main menu<br/>movie options<br/>repeat |
| MENU_OPTIONS | Video on Demand<br/>In Stores<br/>Made for TV<br/>In The Theater<br/><i>Early Screening<br/>Library</i> |
| LETTER_CHOICE | 1 through 5<br/><i>6 through 10</i> |
|<i> LIST_OF_VERBS</i> | <i>stop<br/>refund<br/>return<br/>end</br>cancel</i>|
|<i>LIST_OF_PRODUCT_NAMES</i>| <i>Premium Access</i>|
|<i>LIST_OF_MOVIES</i>|<i>List of all the movies in the database</i>|
|<i>Amazon.SearchQuery</i>|<i>Name the slot query</i>|

Create a subscription product and note its ARN and Product Name.


## Test
First, you must have an account on the <a href="https://developer.amazon.com/alexa/console/ask" target="_blank">Alexa Developer Console</a> to test.  Open your Alexa skill and click the "Test" tab.  To start, say the following invocation "Open [Invocation of your choice]".  Then follow the prompts.  Listen for grammar and spelling errors.

## How to use
Create an account on the Alexa Developer Console and the AWS Management Console.  In the Alexa Developer Console, create a skill with the above mention intents, sample utterances, and slots.  First create a Role with the following permissions
<ul>
	<li>SecretsManagerReadWrite</li>
	<li>AmazonRDSDataFullAccess</li>
	<li>AWSLambdaBasicExecutonRole</li>
	<li>AWSLambdaVPCAccessExecutionRole</li>
</ul>
Then create an Aurora MySQL 5.6 DB cluster with the following following table setup:

```sql
CREATE TABLE reviews (
	ID int NOT NULL AUTO_INCREMENT,
	Title varchar(255) NOT NULL,
	Rating float NOT NULL,
	Image varchar(255) NOT NULL,
	Review blob(4000) NOT NULL,
	PRIMARY KEY (ID)
);

```

Next, create an AWS Secrets Manager with the automatic rotation disabled.  Then, in the AWS Management Console, create 2 Lambda functions with
<ul>
	<li>Trigger: Alexa Skills Kit</li>
	<li>Runtime: Node.js 10.x</li>
	<li><b>Environment Variables</b>
	<ul>
		<li>database: Database name</li>
		<li>productID: ARN number of the ISP created</li>
		<li>productName: Name used when ISP was created</li>
		<li>resourceArn: Aurora ARN</li>
		<li>secretArn: Secret Manager ARN</li>
	</ul>
	</li>
	<li>Code entry type: Upload a .zip file</li>
	<li>Timeout: 0 to 8 seconds</li>
	<li>Execution Role: Role created above</li>
</ul>

Create a CodePipeline.  The CodeCommit should use your GitHub Repo with this code.  The CodeBuild should run the following steps:

```bash
cd lambda
npm install
zip -r ../OOOOOOO.zip *
cd ..
aws lambda update-function-code --function-name DDDDDDD  --zip-file fileb://OOOOOOO.zip 

```
Replace the DDDDDDD with your Lambda Dev function name.  Replace the OOOOOOO with your desired zip file name.
Add a manual Testing step to the CodePipeline.  The Test section above will explain how to use the Alexa Developer Console to test.  Finally, add a CodeBuild step to push your code to production. 
```bash
cd lambda
npm install
zip -r ../OOOOOOO.zip *
cd ..
aws lambda update-function-code --function-name PPPPPPP  --zip-file fileb://OOOOOOO.zip 

```
Replace the PPPPPPP with your Lambda Prod function name.  

## Suggestions
To make suggestions for code changes, fixes, or updates, please email thebestdarngirls@gmail.com

## Credits
That Darn Girl