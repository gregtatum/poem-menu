#poem-menu

Build a hamburger sidebar menu out of a [poem-manifest](https://www.npmjs.com/package/poem-manifests). It is easily configured with some default colors and places to insert custom content. Additional tweaks can be made through custom stylesheets.

![Example menu](http://gregtatum.com/tmp/poem-menu.jpg)

Part of the [programming-poem](https://www.npmjs.com/browse/keyword/programming-poem) module series.

## Configuration Defaults

	var createMenu = require('poem-menu');
	
	var menu = createMenu({
		
		// Colors:
		hamburgerColor				: 0xffffff,
		primaryColor				: 0x54AFFF,
		textColor					: 0x9FC6E1,
		menuColor					: 0x272E34,
		
		// Text or DOM Elements to insert into menu:
		top							: "Poem",
		beforeLevels				: "",
		afterLevels					: "",
		bottom						: "",
		
		// Set false to follow links on the generated level links:
		preventDefaultLevelLinks	: true,
		
		// Toggle the menu with this key:
		toggleKey					: 27 //escape
		
	});

## Interface

### `menu.emitter` EventEmitter

	menu.emitter.on( 'open', callback )
	menu.emitter.on( 'close', callback )
	menu.emitter.on( 'load', handleLevelLoad )

### `menu.close()` function

Close the menu.

### `menu.open()` function

Open the menu.