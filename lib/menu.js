var fs = require('fs');
var insertCss = require('insert-css');
var ClassList = require("class-list");
var EventEmitter = require('events').EventEmitter;
var colors = require('./colors');

var Pairs = require('lodash.pairs');
var Filter = require('lodash.filter');
var SortBy = require('lodash.sortby');
var ForEach = require('lodash.foreach');
var Template = require('lodash.template');
var MapValues = require('lodash.mapvalues');
var Reduce = require('lodash.reduce');
var IsElement = require('lodash.iselement');
var Extend = require('lodash.assign');

var _menuTemplate = null;
var _cssTemplate = null;
var _levelTemplate = null;


var sortAndFilterManifests = function( manifests ) {
	
	var pairs = Pairs( manifests )
	
	var visible = Filter( pairs, function(keypair) {
		return keypair[1].visible !== false;
	})
	
	var sorted = SortBy( visible, function( keypair ) {
		return keypair[1].order;
	})
	
	return sorted;
};

var handlers = (function() {
	
	var bodyClass = ClassList( document.body );
	var isOpen = false;
	var emitter = null;
	var preventDefault = false;
	
	var toggle = function( e ) {
		if( e ) e.preventDefault();
		isOpen ? close() : open();
	};
	
	var close = function() {
		bodyClass.remove('poem-menu-open');
		emitter.emit('close');
		isOpen = false;
	};
	
	var open = function() {
		bodyClass.add('poem-menu-open');
		emitter.emit('open');
		isOpen = true;
	};
	
	var loadLevel = function( e ) {
		emitter.emit('load', {
			slug : this.getAttribute('data-slug')
		});
		close();
	};
	
	return function( config, currentEmitter, div ) {

		emitter = currentEmitter;
		preventDefault = config.preventDefault;
		
		var button = div.getElementsByClassName('poem-menu-burger')[0];
		button.addEventListener( 'click', toggle, false );
		
		var levelLinks = div
			.getElementsByClassName('poem-menu-levels')[0]
			.getElementsByTagName('a');
		
		ForEach( levelLinks, function( el ) {
			el.addEventListener( 'click', loadLevel, false );
		});
		
		div	.getElementsByClassName('poem-menu-blocker')[0]
			.addEventListener( 'click', close, false );
		
		window.addEventListener('keydown', function toggleMenuHandler( e ) {
			if( e.keyCode !== config.toggleKey ) return;
			toggle(e);
		});
		
		return {
			close : close,
			open : open
		};
	};
	
})();

var loadTemplatesOnce = (function() {
	
	var firstRun = true;
	
	return function() {
		
		if( firstRun ) {
			
			firstRun = false;
			
			_menuTemplate = Template(
				fs.readFileSync( __dirname + '/../templates/menu.html' )
			);
			
			_levelTemplate = Template(
				fs.readFileSync( __dirname + '/../templates/level.html' )
			);
			
			_cssTemplate = Template(
				fs.readFileSync(__dirname + '/../templates/style.css')
			);
			
		}
	};
	
})();

var runCssTemplates = function( config ) {
	
	var direction = config.primaryColor > config.menuColor ? 1 : -1;
	
	var css = _cssTemplate(MapValues({
		
		hamburger		: config.hamburgerColor,
		primaryActive	: config.primaryColor,
		text			: config.textColor,
		menu			: config.menuColor,
		
		textActive		: colors.lightness( config.textColor,		direction * 0.1 ),
		menuDark		: colors.lightness( config.menuColor,		direction * -0.2 ),
		menuLight		: colors.lightness( config.menuColor,		direction * 0.2 ),
		
		primary			: colors.mix( config.primaryColor, config.menuColor, 0.2 ),
		level			: colors.mix( config.primaryColor, config.menuColor, 0.9 ),
		levelActive		: colors.mix( config.primaryColor, config.menuColor, 0.6 )
		
	}, colors.hexToString ));
	
	insertCss( css );
	
};

var runHtmlTemplates = function( manifestKeyValuePairs, config ) {
		
	var levels = Reduce( manifestKeyValuePairs, function( memo, keyPair ) {
		return memo + _levelTemplate({
			slug: keyPair[0],
			manifest: keyPair[1]
		})
	}, "");
	
	var html = _menuTemplate({
		levels : levels
	});
		
	//Attach elements
	var div = document.createElement('div');
	div.innerHTML = html;
	
	function appendOrSetInnerHtml( el, contents ) {
		if( IsElement( contents ) ) {
			el.appendChild( contents );
		} else {
			el.innerHTML = contents;
		}
	}
	
	appendOrSetInnerHtml( div.getElementsByClassName('poem-menu-top')[0],				config.top );
	appendOrSetInnerHtml( div.getElementsByClassName('poem-menu-levels-top')[0],		config.beforeLevels );
	appendOrSetInnerHtml( div.getElementsByClassName('poem-menu-levels-bottom')[0],		config.afterLevels );
	appendOrSetInnerHtml( div.getElementsByClassName('poem-menu-bottom')[0],			config.bottom );
	
	document.body.insertBefore( div, document.body.firstChild );
	
	return div;
};

module.exports = function menu( manifests, properties ) {

	loadTemplatesOnce();

	var config = Extend({
		hamburgerColor				: 0xffffff,
		primaryColor				: 0x54AFFF,
		textColor					: 0x9FC6E1,
		menuColor					: 0x272E34,
		top							: "Poem",
		beforeLevels				: "",
		afterLevels					: "",
		bottom						: "",
		preventDefaultLevelLinks	: true,
		toggleKey					: 27 //escape
	}, properties);
	
    var emitter = new EventEmitter();
	var manifestKeyValuePairs = sortAndFilterManifests( manifests )
	
	runCssTemplates( config );
	var div = runHtmlTemplates( manifestKeyValuePairs, config );
    var commands = handlers( config, emitter, div );
	
	return {
		emitter : emitter,
		close : commands.close,
		open : commands.open
	};
	
};