/**
*	sportsoptimizer.js
*	It contains all basic scripts for index.html/optimizer.html
*/

var isCreation = true;
var savedSelectionVal = "None";
var updateIdx = -1;
const { remote, app } = require('electron');
var win = remote.getCurrentWindow();
const path = require('path');

var knex = require("knex")({
	client: "sqlite3",
	connection: {
		filename: remote.app.isPackaged ? path.join(path.dirname(process.execPath), "data.sqlite") : path.join(__dirname, "..", 'data.sqlite')
	}
});

(function ($) {

	"use strict";
	/* Menu Handler
	 * -------------------------------------------------- */


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
			knex('sports').select("*")
				.then((rows) => {

					if (rows.length > 0) {
						$("div.dash-nodata-overlay.clearfix").removeClass("active");
					}
					$("ul.dash-optimizerlist").empty();
					rows.map(item => {
						$("ul.dash-optimizerlist").append("<li>						<div class= \"list-container\">						<div class=\"list-logo-container\">							<span class=\"logo-main-icon\"></span> 						</div>						<div class=\"list-optimizer-name\">" + item.name + "</div>						<div class=\"list-button-container\">							<a  onClick=\"showEditDlg("
							+ "'" + item["optimizerId"] + "'" + "," + "'" + item["name"] + "'" + "," + "'" + item["positions"] + "'" + "," + "'" + String(item["rules-minsalary-creation"]) + "'" + "," + "'" + String(item["rules-maxsalary-creation"]) + "'" + "," +
							"'" + String(item["rules-maxplayers-creation"]) + "'" + "," + "'" + String(item["rules-minteams-creation"]) + "'" + "," + "'" + String(item["selected-rules-noopponent-creation"]) + "'" +
							")\" class=\"ui button secondary\">								<i class=\"im im-external-link\" aria-hidden=\"true\"></i> Open</a>							<a class=\"ui button danger\" type=\"button\" onClick=\"deleteOptimizer('" + item["optimizerId"] + "')\">								<i class=\"im im-trash-can\" aria-hidden=\"true\"></i></a>						</div>					</div >				</li > ");
					});

				})
				.catch((err) => {
					console.log("sqlite db error", err);
				})

		});
	});

	/* Optimizer Builder Steps
	 * -------------------------------------------------- */

	if ($("#optimizer-builder").length) {
		$("#optimizer-builder").steps({
			headerTag: "h3",
			bodyTag: "section",
			stepsOrientation: "vertical",
			transitionEffect: "slideLeft",
			onFinished: function (event, currentIdx) {
				var Optmizer_Name = String($('#CreateName').val()).trim();
				var positions = $('#positionsCreated').find("input").map(function () {
					return String($(this).val()).trim();
				}).get().join("-");
				var rules = {};
				rules['rules-minsalary-creation'] = $('#rules-minsalary-creation').val();
				rules['rules-maxsalary-creation'] = $('#rules-maxsalary-creation').val();
				rules['rules-maxplayers-creation'] = $('#rules-maxplayers-creation').val();
				rules['rules-minteams-creation'] = $('#rules-minteams-creation').val();
				rules['selected-rules-noopponent-creation'] = String($('#rules_noopponent_creation :selected').text()).trim();
				//save to sqlite3 localdb
				if (isCreation) {
					knex('sports').insert([
						{
							"Name": Optmizer_Name, "Positions": positions, "rules-minsalary-creation": rules['rules-minsalary-creation'],
							"rules-maxsalary-creation": rules['rules-maxsalary-creation'],
							"rules-maxplayers-creation": rules['rules-maxplayers-creation'],
							"rules-minteams-creation": rules['rules-minteams-creation'],
							"selected-rules-noopponent-creation": rules['selected-rules-noopponent-creation']
						}
					]).then((res) => {
						$("#modalBuildOptimizer").modal("hide");
						dispatchEvent(new Event('load'));
					}
					).catch((err) => {
						alert("error occured while inserting data to database");
					});
				}
				else {
					knex('sports').where("optimizerId", String(updateIdx)).update(
						{
							"Name": Optmizer_Name, "Positions": positions, "rules-minsalary-creation": rules['rules-minsalary-creation'],
							"rules-maxsalary-creation": rules['rules-maxsalary-creation'],
							"rules-maxplayers-creation": rules['rules-maxplayers-creation'],
							"rules-minteams-creation": rules['rules-minteams-creation'],
							"selected-rules-noopponent-creation": rules['selected-rules-noopponent-creation']
						}
					).then((res) => {
						$("#modalBuildOptimizer").modal("hide");
						dispatchEvent(new Event('load'));
					}
					).catch((err) => {
						alert(err);
					});
				}
			},
			onStepChanged: function (event, curIdx, priorIdx) {
				if (curIdx == 2) {
					updateSelection();
					if (isCreation == false) {
						$("#rules_noopponent_creation option").each(function () {
							if ($(this).text().toLowerCase() == savedSelectionVal.toLowerCase()) {
								this.selected = true;
								return;
							}
						})
					}
				}
			}
		});
	}

	/* Popover Info
	 * -------------------------------------------------- */
	$('[data-toggle="popover"]').popover();


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

	function updateSelection() {

		$('#rules_noopponent_creation').empty().append('<option value="">None</option>');
		var dataList = $('#positionsCreated').find("input").map(function () {
			return $(this).val();
		}).get().join(',');

		var dataList = dataList.split(',');
		var map = {};
		dataList.map(function (item) {
			item = item.trim();
			if (item == "") {
				return;
			}
			if (map[item]) {
				return;
			}
			map[item] = true;
			$('#rules_noopponent_creation').append(new Option(item, "value"));
		})
	}
	$("#modalBuildOptimizer").on('shown.bs.modal', function () {
		if (isCreation) {
			$("#CreateName").val("");
			$("#positionsCreated").empty();
			$("#rules-minsalary-creation").val(0);
			$("#rules-maxsalary-creation").val(0);
			$("#rules-maxplayers-creation").val(0);
			$("#rules-minteams-creation").val(0);
			$("#rules_noopponent_creation option").empty().append(new Option("None", "value"));
		}
	});
	$("#modalBuildOptimizer").on('hidden.bs.modal', function () {
		isCreation = true;
		savedSelectionVal = "None";
		updateIdx = -1;
	});

})(jQuery);

function showEditDlg(id, name, positon, rules0, rules1, rules2, rules3, selectionName) {

	isCreation = false;
	$("#modalBuildOptimizer").find(".modal-title").text("Edit Optimizer");
	$("#CreateName").val(name);
	positons = positon.split("-");
	var map = {};
	positons.map((item, idx) => {
		$("#positionsCreated").empty();
		$("#positionsCreated").append("<tr id=\"" + "row" + String(idx) + "\">	<td><input id=\"CreatePositionValue\" type=\"tel\" value=\"" + item + "\" placeholder=\"Enter position/s... Ex. C or C,1B,2B for flex/util\"></td>		<td class=\"right\"><i id=\"" + "delete_" + String(idx) + "\" class=\"" + "ic-delete-1" + "\" aria-hidden=\"true\"></i></td></tr>");
		$('#rules_noopponent_creation').empty().append('<option value="">None</option>');
		itemlist = item.split(',')
		itemlist.map((item, idx) => {
			//insert items
			item = item.trim();
			if (item == "") {
				return;
			}
			if (map[item]) {
				return;
			}
			map[item] = true;
			$('#rules_noopponent_creation').append(new Option(item, "value"));
		})

	});
	$("#rules-minsalary-creation").val(rules0);
	$("#rules-maxsalary-creation").val(rules1);
	$("#rules-maxplayers-creation").val(rules2);
	$("#rules-minteams-creation").val(rules3);
	savedSelectionVal = selectionName;
	updateIdx = id;
	$("#rules_noopponent_creation option").each(function () {
		if ($(this).text().toLowerCase() == savedSelectionVal.toLowerCase()) {
			this.selected = true;
			return;
		}
	})
	$("#modalBuildOptimizer").modal("show");
}

function deleteOptimizer(id) {
	knex('sports').where('optimizerId', (id)).del().then(res => {
		//delete process here
		$("#modalBuildOptimizer").modal("hide");
		dispatchEvent(new Event('load'));
	}).catch(err => {
		console.log(err);
	})
}
function deleteAll(){
	knex('sports').delete().then(res => {
		//delete process here
		$("#modalBuildOptimizer").modal("hide");
		dispatchEvent(new Event('load'));
	}).catch(err => {
		console.log(err);
	})
}
