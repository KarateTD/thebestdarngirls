# thebestdarngirls
This code will create a movie review app for an Alexa skill

## Motivation
To create an Alexa skill to coincide with my website, thatdarngirlmovie.reviews.  User will get the last 5 reviews for movies that are <b>In The Theater</b>, <b>Made for TV</b>, <b>Video on Demand</b>, and <b>Must Buy</b>.  

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
	<li>GitHub</li>
	<li>NodeJS 8.10</li>
</ul>

## Features
When this code is git pushed to master branch, it triggers thebestdarngirlsSkillPipeline CodePipeline to build the code in the Development Lambda Function.  Once built, it waits for the user to manually test in the Alexa Skills Kit.  If the test is labeled successful, the CodePipeline will build the code in the Production Lambda Function.  This will change the skill to all users.  

## Code
<ul>
	<li>Data Folder
		<ul>
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
	<li>index.js</li>
</ul>

## Installation
First, you must have an account on <a href="https://developer.amazon.com/alexa/console/ask" target="_blank">Alexa Developer Console</a>.  Then create a new skill.  The following are the Intents, followed by their sample utterences, and their slots

| Intent | Sample Utterances | Slot Name | Slot Type |
| -------- | ------------------- | ------- |
| Commands | {command}<br/>Please {command} | command } USER_COMMAND |