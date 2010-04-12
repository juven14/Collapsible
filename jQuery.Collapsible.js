/**
 * Collapsible - jQuery Plugin
 * 
 * This plugin enables the management of 
 * collapsibles on the page with cookie support.
 * 
 * Copyright (c) 2010 John Snyder (snyderplace.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($) {
	$.fn.collapsible = function(cmd, arg) {
		if (typeof cmd == 'string') {
			$.fn.collapsible.dispatcher[cmd](this, arg);
		} else {
			$.fn.collapsible.dispatcher['_create'](this, cmd);
		}
	};

	$.fn.collapsible.dispatcher = {
		_create : function(obj, arg) {
			createCollapsable(obj, arg);
		}
	};

	function createCollapsable(obj, options) {
		// build main options before element iteration
		var opts = $.extend({}, $.fn.collapsible.defaults, options);
		// store any opened default values to set cookie later
		var opened = new Array();
		
		// iterate and reformat each matched element
		obj.each(function() {
			var $this = $(this);
			
			//lets bind it to mouseenter
			if (opts.bind == 'mouseenter') {
				$this.bind('mouseenter', function(e) {
					e.preventDefault(); //stop links from firing
					toggle($this, opts); //toggle open/close
				});
			}
			
			//lets bind it to mouseover
			if (opts.bind == 'mouseover') {
				$this.bind('mouseover',function(e) {
					e.preventDefault(); //stop links from firing
					toggle($this, opts); //toggle open/close
				});
			}
			
			//lets bind it to click
			if (opts.bind == 'click') {
				$this.bind('click', function(e) {
					e.preventDefault(); //stop links from firing
					toggle($this, opts); //toggle open/close
				});
			}
			
			//lets bind it to dblclick
			if (opts.bind == 'dblclick') {
				$this.bind('dblclick', function(e) {
					e.preventDefault(); //stop links from firing
					toggle($this, opts); //toggle open/close
				});
			}
			
			//lets initialize the collapsibles
			//get the id for this element
			id = $this.attr('id');
			//do we use cookies
			if (!useCookies(opts)) { //no just open the defaults
				//is this collapsible in the default open array?
				dOpenIndex = inDefaultOpen(id, opts);
				if (dOpenIndex === false) { //no, close it
					$this.addClass(opts.cssClose); //append the close class
					$this.next().hide(); 
				} else { //yes open it
					$this.addClass(opts.cssOpen); //append the open class
					$this.next().show();
					opened.push(id);
				}
			} else { //we can use cookies, let do so
				//has a cookie been set, this overrides default open
				if (issetCookie(opts)) {
					cookieIndex = inCookie(id, opts);
					if (cookieIndex === false) { 
						$this.addClass(opts.cssClose);//append the close class
						$this.next().hide();
					} else {
						$this.addClass(opts.cssOpen);//append the open class
						$this.next().show();
						opened.push(id);
					}
				} else { //a cookie hasn't been set open defaults, add them to opened array
					dOpenIndex = inDefaultOpen(id, opts);
					if (dOpenIndex === false) {
						$this.addClass(opts.cssClose);//append the close class
						$this.next().hide();
					} else {
						$this.addClass(opts.cssOpen);//append the open class
						$this.next().show();
						opened.push(id);
					}
				}
			}
		});
		//now that the loop is done, lets set the cookie
		if (opened.length > 0 && useCookies(opts)) {
			setCookie(opened.toString(), opts);
		} else {
			setCookie('', opts);
		}
		return obj;
	};
	//Toggle a collapsible on an event
	function toggle($this, opts)
	{
		// open a closed item
		if ($this.hasClass(opts.cssClose)) {
			$this.removeClass(opts.cssClose).addClass(opts.cssOpen);
			$this.next().slideDown(opts.speed);
			//do cookies if plugin available
			if (useCookies(opts)) {
				// split the cookieOpen string by ","
				id = $this.attr('id');
				appendCookie(id, opts);
			}
			//return false; //skipped this element
		} else {
			//give the proper class to the heading
			$this.addClass(opts.cssClose).removeClass(opts.cssOpen);
			//still here, close an open item
			$this.next().slideUp(opts.speed); //no animation as its a page load initalization
			//return false; //just incase its a link, lets not let it fire off
			//do cookies if plugin available
			if (useCookies(opts)) {
				// split the cookieOpen string by ","
				id = $this.attr('id');
				unsetCookieId(id, opts);	
			}
		}
		return false;
	}
	//do we use cookies
	function useCookies(opts)
	{
		//return false if cookie plugin not present or if a cookie name is not provided
		if (!$.cookie || opts.cookieName == '') {
			return false;
		}
		//we can use cookies
		return true;
	}	
	//append a collapsible to the cookie
	function appendCookie(value, opts)
	{
		//check if cookie plugin available and cookiename is set
		if (!useCookies(opts)) {
			return false;
		}
		//does a cookie already exist
		if (!issetCookie(opts)) { 
			//no lets set one
			setCookie(value, opts);
			return true;
		}
		//cookie already exists, is this collapsible already set?
		if (inCookie(value, opts)) { //yes, quit here
			return true;
		}
		//still here, we have a cookie and need to append our collapsible
		//get the cookie
		cookie = $.cookie(opts.cookieName);
		//unescape it
		cookie = unescape(cookie);
		//turn it into an array
		cookieArray = cookie.split(',');
		//add it to list
		cookieArray.push(value);
		//save it
		setCookie(cookieArray.toString(), opts);
		return true;	
	}
	//unset a collapsible from the cookie
	function unsetCookieId(value, opts)
	{
		//check if cookie plugin available and cookiename is set
		if (!useCookies(opts)) {
			return false;
		}
		//if its not there we don't need to remove from it
		if (!issetCookie(opts)) { //quit here, don't have a cookie 
			return true;
		}
		//we have a cookie, is this collapsible in it
		cookieIndex = inCookie(value, opts);
		if (cookieIndex === false) { //not in the cookie quit here
			return true;
		}
		//still here get the cookie
		cookie = $.cookie(opts.cookieName);
		//unescape it
		cookie = unescape(cookie);
		//turn it into an array
		cookieArray = cookie.split(',');
		//lets pop it out of the array
		cookieArray.splice(cookieIndex, 1);
		setCookie(cookieArray.toString(), opts);
	}
	//set a cookie
	function setCookie(value, opts)
	{
		//can use the cookie plugin
		if (!useCookies(opts)) { //no, quit here
			return false;
		}
		//cookie plugin is available, lets set the cookie
		$.cookie(opts.cookieName, value, opts.cookieOptions);
	}
	//check if a collapsible is in the cookie
	function inCookie(value, opts)
	{
		//can use the cookie plugin
		if (!useCookies(opts)) {
			return false;
		}
		//if its not there we don't need to remove from it
		if (!issetCookie(opts)) { //quit here, don't have a cookie 
			return false;
		}
		//unescape it
		cookie = unescape($.cookie(opts.cookieName));
		//turn it into an array
		cookieArray = cookie.split(',');
		//get the index of the collapsible if in the cookie array
		cookieIndex = $.inArray(value, cookieArray);
		//is this value in the cookie arrray
		if (cookieIndex == -1) { //no, quit here
			return false;
		}
		//yes, return the index
		return cookieIndex;
	}
	//check if a cookie is set
	function issetCookie(opts)
	{
		//can we use the cookie plugin
		if (!useCookies(opts)) { //no, quit here
			return false;
		}
		//is the cookie set
		if ($.cookie(opts.cookieName) == null) { //no, quit here
			return false;
		}
		//the cookie is set and we can use the cookie plugin
		return true;
	}
	//check if a collapsible is in the list of collapsibles to be opened by default
	function inDefaultOpen(id, opts)
	{
		//get the array of open collapsibles
		defaultOpen = getDefaultOpen(opts);
		//is it in the default open array
		index = $.inArray(id, defaultOpen);
		if (index == -1) { //nope, quit here
			return false;
		}
		//it is a default open item, return its index
		return index;
	}
	//get the default open collapsibles and return array
	function getDefaultOpen(opts)
	{
		//initialize an empty array
		defaultOpen = new Array();
		//if there is a list, lets split it into an array
		if (opts.defaultOpen != '') {
			defaultOpen = opts.defaultOpen.split(',');
		}
		//return the default open array
		return defaultOpen;
	}
	
	// settings
	$.fn.collapsible.defaults = {
		cssClose: 'collapse-close', //class you want to assign to a closed collapsible header
		cssOpen: 'collapse-open', //class you want to assign an opened collapsible header
		cookieName: 'collapsible', //name of the cookie you want to set for this collapsible
		cookieOptions: { //cookie options, see cookie plugin for details
			path: '/',
			expires: 7,
			domain: '',
			secure: ''
		},
		defaultOpen: '', //comma seperated list of header ids that you want opened by default
		speed: 300, //speed of the slide effect
		bind: 'click' //event to bind to, supports click, dblclick, mouseover and mouseenter
	};
})(jQuery);