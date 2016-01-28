var biermanTools = {};

// check multiple properties if exist
biermanTools.hasOwnProperties = function(obj, props){
	if(Array.isArray(props)) {
		for (var i = 0; i < props.length; i++)
			if (!obj.hasOwnProperty(props[i])){
				console.log(obj, props[i]);
				return false;

			}
		return true;
	}
	else
		return false;
};