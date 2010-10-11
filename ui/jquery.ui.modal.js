
(function( $, undefined ) {
	
$.widget("ui.modal", {
	options: {
		autoOpen: false,
		closeOnEscape: true,
		overlay: true,
		overlayColor: '#000000',
		overlayOpacity: 0.5
	},
	
	_create: function() {
		this._makeOverlay();
		this.element.css({
			zIndex: 999999,
			position: 'absolute'	
		}).hide();
		if ( this.options.autoOpen ) this.open();
	},
	open: function() {
		this.element.show();
		this._overlay.show();
		this._lockFocus(this.element);
	},
	close: function() {
		this.element.hide();
		this._overlay.hide();
		this._unlockFocus(this.element);
	},
	widget: function() {
		return this._overlay;
	},
	destroy: function() {
		this._overlay.destroy();
		$.ui.widget.prototype.destroy.call(this);
	}
	
	/**
	 * This method should be called whenever the dom inside the overlay is updated.
	 * Delegation is possibly a better solution, but ultimately we would still need
	 * to refresh the list of "focusables" anyway, since we want to be able to jump
	 * back in to the list - and delegation does not solve that.
	 */
	update: function() {
		this._unlockFocus(this.element);
		this._lockFocus(this.element);
	},
	
	_overlay: null,
	/**
	 * Make the overlay div.  This is extracted out of the _create method so that it
	 * is more straightforward to refactor and override
	 */
	_makeOverlay: function() {
		this._overlay = $('<div class="ui-widget ui-widget-reset ui-modal-overlay"></div>')
			.appendTo(document.body)
			.css({
				zIndex: 999998,
				position: 'absolute',
				width: '100%',
				height: '100%',
				top: '0px',
				left: '0px',
				backgroundColor: this.options.overlayColor,
				opacity: this.options.overlayOpacity
			})
			.hide();
		return this._overlay;
	},
	_destroyOverlay: function() {
		this._overlay.remove();
	},
	
	
	/**
	 * lock focus to a specific dom element
	 */
	_lockFocus: function($el) {
		var focusables = this._sortedFocusables($el);
		focusables[0].focus();
		this._trackFocusedElement( $el, this);
		this._trackShiftKey( focusables, this);
		this._captureTabOutOfEdgeElements( $el );
		$(document).bind('focusin', {el: $el, modal:this, focusables:focusables}, this._lockFocusEvent);
		if ( this.options.closeOnEscape ) {
			$el.bind('keypress', {modal:this}, this._closeOnEscapeEvent);
		}
		return $el;
	},
	/**
	 * event for _lockFocus, separated for safe unbinding
	 */
	_lockFocusEvent: function(event) {
		var focused = event.originalTarget,
			focusables = event.data.focusables,
			modal = event.data.modal,
			previous = modal._focusedElement,
			backwards = modal._shiftKey,
			$el = event.data.el;
		if ( focused !== $(document)[0] && focusables.index(focused) === -1 ) {
			modal._nextItemByTabIndex(focusables, previous, backwards).focus();
		}
	},
	/**
	 * unlock focus from a specific dom element
	 */
	_unlockFocus: function($el) {
		var focusables = this._sortedFocusables($el);
		this._untrackFocusedElement($el);
		this._untrackShiftKey(focusables);
		this._unCaptureTabOutOfEdgeElements( $el );
		$(document).unbind('focusin', this._lockFocusEvent);
		$el.unbind('keypress', this._closeOnEscapeEvent);
		return $el;
	},
	/**
	 * closes modal on escape keypress
	 */
	_closeOnEscapeEvent: function(event) {
		if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
			event.data.modal.close();
			return false;
		}
	},
	
	/**
	 * given a tabindex-sorted list of dom elements,
	 * the previously focused element, and the direction go to the
	 * next element.  Loops forward or backward as required.
	 */
	_nextItemByTabIndex: function($list, previous, backwards) {
		var index = $list.index(previous),
			oldIndex = index;
		if ( !backwards ) {
			index = ( index>-1 && index<$list.size()-1 ) ? index+1 : 0;
		} else {
			index = ( index>0 ) ? index-1 : $list.size()-1;
		}
		return $list[index];
	},
	
	/**
	 * state value for the last focused element
	 */
	_focusedElement: null,
	/**
	 * track focused element
	 */
	_trackFocusedElement: function($list, store) {
		return $list.bind('focusin', {store:store}, this._trackFocusedElementEvent);
	},
	/**
	 * event to track focused element
	 */
	_trackFocusedElementEvent: function(event) {
		event.data.store._focusedElement = event.originalTarget;
	},
	/**
	 * stop tracking focused element
	 */
	_untrackFocusedElement: function($list) {
		return $list.unbind('focusin', this._trackFocusedElementEvent);
	},
	
	/**
	 * state value for shift key on tabbing
	 */
	_shiftKey: false,
	/**
	 * track the use of the shift key when tabbing
	 */
	_trackShiftKey: function($focusables, store) {
		return $focusables.bind('keydown', {store:store}, this._trackShiftKeyEvent);
	},
	/**
	 * event for tracking the use of the shift key, separated for safe unbinding
	 */
	_trackShiftKeyEvent: function(event) {
		if ( event.keyCode !== $.ui.keyCode.TAB ) return;
		event.data.store._shiftKey = event.shiftKey;
	},
	/**
	 * stop tracking the use of the shift key when tabbing
	 */
	_untrackShiftKey: function($focusables) {
		return $focusables.unbind('keydown', this._trackShiftKeyEvent);
	},
	
	
	/**
	 * Capture tabbing from the "edge" elements (in dom order)
	 * so that we can avoid jumping out to the browser's chrome
	 * @fixme - "keydown" does not capture repeats when holding the key down
	 */
	_captureTabOutOfEdgeElements: function($el) {
		var focusables = $(':tabbable', $el),
			last = focusables.last();
			first = focusables.filter('input,select,textarea').first();
		last.bind('keydown', {modal:this, el:$el, focusables:focusables, forwards:true}, this._captureTabOutOfEdgeElementsEvent);
		first.bind('keydown', {modal:this, el:$el, focusables:focusables, forwards:false}, this._captureTabOutOfEdgeElementsEvent);
	},
	/**
	 * Event to capture tabbing from the "edge" elements
	 */
	_captureTabOutOfEdgeElementsEvent: function(event) {
		var forwards = event.data.forwards;
		if ( event.keyCode !== $.ui.keyCode.TAB || (event.shiftKey==forwards) ) return true;
		var focusables = event.data.focusables,
			modal = event.data.modal,
			$el = event.data.el,
			sortedFocusables = modal._sortedFocusables($el);
		modal._nextItemByTabIndex(sortedFocusables, this, !forwards).focus();
		return false;
	},
	/**
	 * Stop capturing tabbing from the "edge" elements
	 */
	_unCaptureTabOutOfEdgeElements: function($el) {
		var focusables = $(':tabbable', $el),
			last = focusables.last(),
			first = focusables.filter('input,select,textarea').first();
		last.unbind('keydown', this._captureTabOutOfLastElementEvent);
		first.unbind('keydown', this._captureTabOutOfLastElementEvent);
	},
	
	/**
	 * utility method to sort an elements focusable children by tabIndex
	 */
	_sortedFocusables: function($el) {
		return $(':focusable', $el).sort(function(a,b){
			return parseInt(a.tabIndex,10)-parseInt(b.tabIndex,10);
		});
	}
});
	
	
	
}(jQuery));
