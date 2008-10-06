/*
 * tabs unit tests
 */
(function($) {


module('tabs');

test('init', function() {
	expect(4);

	var el = $('#tabs1 > ul').tabs();
	ok(true, '.tabs() called on element');
	
	el.tabs('destroy').tabs({ selected: 1 });
	equals( el.data('selected.tabs'), 1, 'selected.tabs set' );
	equals( $('li', el).index( $('li.ui-tabs-selected', el) ), 1, 'second tab active');
	equals( $('div', '#tabs1').index( $('div.ui-tabs-hide', '#tabs1') ), 0, 'first panel should be hidden' );
	
});

test('destroy', function() {
	expect(0);
	
});

test("defaults", function() {
	
	var expected = {
		unselect: false,
		event: 'click',
		disabled: [],
		cookie: null,
		spinner: 'Loading&#8230;',
		cache: false,
		idPrefix: 'ui-tabs-',
		ajaxOptions: null,
		fx: null,
		tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a></li>',
		panelTemplate: '<div></div>',
		navClass: 'ui-tabs-nav',
		selectedClass: 'ui-tabs-selected',
		unselectClass: 'ui-tabs-unselect',
		disabledClass: 'ui-tabs-disabled',
		panelClass: 'ui-tabs-panel',
		hideClass: 'ui-tabs-hide',
		loadingClass: 'ui-tabs-loading'
	};

	var el = $("#tabs1").tabs();

	for (var optionName in expected) {
		var actual = el.data(optionName + '.tabs'), expects = expected[optionName];

		if (optionName == 'disabled')
			ok(expects.constructor == Array && !expects.length, optionName);
		else
			equals(actual, expects, optionName);
			
	}
	
});

test('add', function() {
	expect(0);
	
});

test('remove', function() {
	expect(0);
	
});

test('enable', function() {
	expect(0);
	
});

test('disable', function() {
	expect(0);
	
});

test('select', function() {
	expect(0);
	
});

test('load', function() {
	expect(0);
	
});

test('url', function() {
	expect(0);
	
});


module('options');

test('select: null', function() {
	expect(3);
	
	var el = $('#tabs1 > ul');
	
	el.tabs({ selected: null });
	equals( el.data('selected.tabs'), null, 'option set' );
	equals( $('li.ui-tabs-selected', el).length, 0, 'all tabs should be unselected' );
	equals( $('div.ui-tabs-hide', '#tabs1').length, 3, 'all panels should be hidden' );
	
	// TODO select == null with cookie
	// TODO select == null with select method
	
});

test('unselect: true', function() {
	expect(7);
	
	var el = $('#tabs1 > ul');
	
	el.tabs({ unselect: true });
	equals( el.data('unselect.tabs'), true, 'option set' );
	equals( $('li.ui-tabs-unselect', el).length, 1, 'class "ui-tabs-unselect" attached once');
	equals( $('li', el).index( $('li.ui-tabs-unselect', el) ), 0, 'class "ui-tabs-unselect" attached to first tab');
	
	el.tabs('select', 1);
	equals( $('li.ui-tabs-unselect', el).length, 1, 'class "ui-tabs-unselect" attached once');
	equals( $('li', el).index( $('li.ui-tabs-unselect', el) ), 1, 'class "ui-tabs-unselect" attached to second tab');
	
	el.tabs('select', 1);
	equals( $('li.ui-tabs-unselect', el).length, 0, 'class "ui-tabs-unselect" not attached');
	// wait a bit for the fake animation...
	stop();
	setTimeout(function() {
		equals( $('div.ui-tabs-hide', '#tabs1').length, 3, 'all panels should be hidden' );
		start();
	}, 100);

});

test('cookie', function() {
	expect(5);
	
	var el = $('#tabs1 > ul');
	var cookieName = 'ui-tabs-' + $.data(el[0]);
	$.cookie(cookieName, null); // blank state
	var cookie = function() {
		return parseInt($.cookie(cookieName), 10);
	};
	
	el.tabs({ cookie: {} });
	equals(cookie(), 0, 'initial cookie value, no cookie given');
	
	el.tabs('destroy');
	el.tabs({ selected: 1, cookie: {} });
	equals(cookie(), 1, 'initial cookie value, given selected');

	el.tabs('select', 2);
	equals(cookie(), 2, 'cookie value after tabs select');
	
	el.tabs('destroy');
	$.cookie(cookieName, 1);
	el.tabs({ cookie: {} });
	equals(cookie(), 1, 'initial cookie value, from existing cookie');
	
	el.tabs('destroy');
	ok($.cookie(cookieName) === null, 'erase cookie after destroy');
	
});


module('tickets');

test('id containing colon #???', function() {
	expect(4);

	var el = $('#tabs2 > ul').tabs();
	ok( $('div.ui-tabs-panel:eq(0)', '#tabs2').is(':visible'), 'first panel should be visible' );
	ok( $('div.ui-tabs-panel:eq(1)', '#tabs2').is(':hidden'), 'second panel should be hidden' );
	
	el.tabs('select', 1).tabs('select', 0);
	ok( $('div.ui-tabs-panel:eq(0)', '#tabs2').is(':visible'), 'first panel should be visible' );
	ok( $('div.ui-tabs-panel:eq(1)', '#tabs2').is(':hidden'), 'second panel should be hidden' );
	
});

// test('', function() {
// 	expect(0);
// 	
// });

})(jQuery);