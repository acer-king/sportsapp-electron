/**
*	sportsoptimizer.js
*	It contains all basic scripts for index.html/optimizer.html
*/

(function ($) {

	"use strict";

	/* Menu Handler
	 * -------------------------------------------------- */
	const { remote } = require('electron');

	var win = remote.getCurrentWindow();

	$.each(['show', 'hide'], function (i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function () {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});

	$('#minimize').click(function () {
		win.minimize();
	});

	$('#close').click(function () {
		win.close();
	});

	/* Preloader
	 * -------------------------------------------------- */
	$("html").addClass('ss-preload');

	$(window).on('load', function () {
		// will first fade out the loading animation 
		$(".preloader-content").fadeOut("slow", function () {
			// will fade out the whole DIV that covers the website.
			$(".preloader").delay(300).fadeOut("slow");
		});
	});

	/* Optimizer Builder Steps
	 * -------------------------------------------------- */
	if ($("#optimizer-builder").length) {
		$("#optimizer-builder").steps({
			headerTag: "h3",
			bodyTag: "section",
			stepsOrientation: "vertical",
			transitionEffect: "slideLeft"
		});
	}

	/* Popover Info
	 * -------------------------------------------------- */
	$('[data-toggle="popover"]').popover();

	$("#CreateName").on("input", function () {
		console.log($(this).val());
	})

	var g_index = 0;
	$("#Bt_Add_Position").click(function () {
		var rowID = "row" + g_index.toString();
		var deleteId = "delete_" + g_index.toString();
		g_index += 1;
		$("#positionsCreated").append("<tr id=\"" + rowID + "\">	<td><input id=\"CreatePositionValue\" type=\"tel\" value=\"\" placeholder=\"Enter position/s... Ex. C or C,1B,2B for flex/util\"></td>		<td class=\"right\"><i id=\"" + deleteId + "\" class=\"" + "ic-delete-1" + "\" aria-hidden=\"true\"></i></td></tr>");
	})

	$("#positionsCreated").on('click', '.ic-delete-1', function () {
		var id = this.id;
		var split_id = id.split("_");
		var deleteIdx = split_id[1];
		//remove tr with this idx
		$("#row" + deleteIdx).remove();
	})

	$("#RulesIdInCreating").mouseenter(function () {
		
		$('#rules_noopponent_creation').empty().append('<option value="">None</option>');
		var dataList = $('#CreatePositionValue').map(function(){
			console.log($(this).val())
			return $(this).val();
		}).get().join(',');
		
		var dataList = dataList.split(',');
		dataList.map(function(item){
			item = item.trim();
			console.log(item);
			$('#rules_noopponent_creation').append(new Option(item,"value"));
		})
	})

})(jQuery);




