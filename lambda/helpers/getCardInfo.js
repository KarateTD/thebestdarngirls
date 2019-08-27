module.exports = function (menu, option) {
	var retValue;

	for(var x in menu){
		if(option.toLowerCase() === menu[x].option){
			retValue = menu[x];
			break;
		}
	}
	
	return retValue;
};