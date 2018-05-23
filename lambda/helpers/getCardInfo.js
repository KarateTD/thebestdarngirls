module.exports = function (menu, option) {
	var retValue = '';

	for(var x in menu){
		if(option.toLowerCase() === menu[x].option){
			retValue += menu[x].review;
			break;
		}
	}
	if(retValue === ''){
		retValue = "Sorry I don't understand.  Please say your response again"
	}
	return retValue;
};