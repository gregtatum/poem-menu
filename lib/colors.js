var Map = require('lodash.map');

var colors = {
	
	hexToArray : function( hexColor ) {
		
		var string = colors.hexToString( hexColor );
		
		return [
		    parseInt(string[1]+string[2], 16),
			parseInt(string[3]+string[4], 16),
			parseInt(string[5]+string[6], 16)
		];
		
	},
	
	arrayToHex : function( color ) {
		
		var stringResult = Map( color, function( c ) {
			
			var s = parseInt( c, 10 ).toString(16);
			
			return s.length > 1 ? s : "0"+s;
			
		}).join('');
		
		return parseInt( stringResult, 16 );
		
	},
	
	lightness : function( hexColor, unitI ) {
	
		// oh my dear lord
		
		if( typeof hexColor !== "number" ) throw new Error("hexColor must be in the form of 0x54AFFF");
		if( hexColor < 0x000000 || hexColor > 0xffffff ) throw new Error("hexColor is out of range");
		
		var color = colors.hexToArray( hexColor );
		var blendValue = 255;
	
		if( unitI < 0 ) {
			unitI *= -1;
			blendValue = 0;
		}
		
		var result = Map( color, function( c ) {
			
			return c * ( 1 - unitI ) + blendValue * unitI;
			
		});
		
		return colors.arrayToHex( result );
		
	},
	
	mix : function( hexColor1, hexColor2, unitI ) {
		
		var color1 = colors.hexToArray( hexColor1 );
		var color2 = colors.hexToArray( hexColor2 );
		
		var result = Map( color1, function( c1, i ) {
			
			return c1 * (1 - unitI) + color2[i] * unitI;
						
		});
		
		return colors.arrayToHex( result );
	},

	hexToString : function( hexColor ) {
	
		var string = parseInt(hexColor, 10).toString( 16 );
	
		while( string.length < 6 ) {
			string = "0" + string;
		}
	
		return "#" + string;
	}	
	
}

module.exports = colors;