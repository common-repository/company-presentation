// Running careerpages from plugins

// This function is just to resolve that the tooltip function is missing
(function ($) {
	$.fn.tooltip = function(arg) {
		this.each(function( ) {
			return null;
		});
	};
}( jQuery ));

function cpErrToggle() {
	if (jQuery("#errTarget").css('display') == 'none') {
		jQuery("#errTarget").css("display", "table-cell");
	} else {
		jQuery("#errTarget").css("display", "none");
	}
}

// getCompanyHtml
function getCompanyHtml(company) {
	var group = jQuery("#careerpagescontent").parent();
	group.find('#loading').show();
	jQuery.ajax({
		cache: false,
		url: group.find('#handler').val(),
		data: {action: 'getCompanyHtml', key: group.find("#key").val(), subdir: group.find("#subdir").val(), company: company, template: group.find("#template").val(), locale: group.find("#locale").val(), local: group.find("#local").val(), subdir: group.find("#subdir").val(), breadcrumbs: [company, 0, 0]},
		dataType: 'json',
		type: 'post',
		success: function(data) {
			jQuery("#careerpagescontent").html(data);
			group.find("#companyids").val(company);
			group.find("#teamid").val(0);
			group.find("#profileid").val(0);
			window.scrollTo(0, 0);
			group.find('#loading').hide();
		},
		error: function(data) {console.log(data);}
	});
}

// getNetworkHtml
function getNetworkHtml(network) {
	var group = jQuery("#careerpagescontent").parent();
	group.find('#loading').show();
	jQuery.ajax({
		cache: false,
		url: group.find('#handler').val(),
		data: {action: 'getNetworkHtml', key: group.find("#key").val(), subdir: group.find("#subdir").val(), network: network, template: group.find("#template").val(), locale: group.find("#locale").val(), local: group.find("#local").val(), subdir: group.find("#subdir").val(), breadcrumbs: [network, 0, 0]},
		dataType: 'json',
		type: 'post',
		success: function(data) {
			jQuery("#careerpagescontent").html(data);
			group.find("#networkids").val(network);
			group.find("#teamid").val(0);
			group.find("#profileid").val(0);
			window.scrollTo(0, 0);
			group.find('#loading').hide();
		},
		error: function(data) {console.log(data);}
	});
}

// getTeamHtml
function getTeamHtml(team) {
	var group = jQuery("#careerpagescontent").parent();
	group.find('#loading').show();
	jQuery.ajax({
		cache: false,
		url: group.find('#handler').val(),
		data: {action: 'getTeamHtml', key: group.find("#key").val(), subdir: group.find("#subdir").val(), team: team, template: group.find("#template").val(), locale: group.find("#locale").val(), local: group.find("#local").val(), subdir: group.find("#subdir").val(), breadcrumbs: [group.find("#companyids").val(), team, 0]},
		dataType: 'json',
		type: 'post',
		success: function(data) {
			jQuery("#careerpagescontent").html(data);
			group.find("#teamid").val(team);
			group.find("#profileid").val(0);
			window.scrollTo(0, 0);
			group.find('#loading').hide();
		},
		error: function(data) {console.log(data);}
	});
}

// getProfileHtml
function getProfileHtml(profile) {
	var group = jQuery("#careerpagescontent").parent();
	group.find('#loading').show();
	jQuery.ajax({
		cache: false,
		url: group.find('#handler').val(),
		data: {action: 'getProfileHtml', key: group.find("#key").val(), subdir: group.find("#subdir").val(), profile: profile, template: group.find("#template").val(), locale: group.find("#locale").val(), local: group.find("#local").val(), subdir: group.find("#subdir").val(), breadcrumbs: [group.find("#companyids").val(), group.find("#teamid").val(), profile]},
		dataType: 'json',
		type: 'post',
		success: function(data) {
			jQuery("#careerpagescontent").html(data);
			group.find("#profileid").val(profile)
			window.scrollTo(0, 0);
			group.find('#loading').hide();
		},
		error: function(data) {console.log(data);}
	});
}
