// General, inserted by Ralph
//=============================================================

document.onreadystatechange = function() {
    if (document.readyState === 'complete') 
        jQuery(document).trigger('fontfaceapplied');
};

function delayedRedirect(uri, delay) {
	setTimeout('location.replace("'+urlBase+'/'+uri+'")', delay);
}

function cssClass2Camelstyle(property){
	for (var exp=/-([a-z])/; exp.test(property); property = property.replace(exp,RegExp.$1.toUpperCase()));
	return property;
}

function maximizeWindow() {
	window.moveTo(0,0);
	if (document.all) {
		top.window.resizeTo(screen.width,screen.height);
	} else if (document.layers||document.getElementById) {
		window.resizeTo(screen.width, screen.height);
	}
}

function resizeProdiiIframe(id, domain) {
	var iframe = document.getElementById(id);
	window.addEventListener("message", function(event) {
		if (event.origin !== domain) return; // only accept messages from the specified domain
		if (isNaN(event.data)) return; // only accept something which can be parsed as a number
		var height = parseInt(event.data) + 10; // add some extra height to avoid scrollbar
		iframe.height = height + "px";
	}, false);
}






// Profiles, inserted by Ralph
//=============================================================

// checkEmailexistens
function checkEmailexistens(request, response, term) {
	$.ajax({
		cache: false,
		url: urlBase+'/common/profiles/profileshandler.php',
		dataType: "json",
		data: {action: "checkEmailexistens", term: term},
		type: "post",
		success: function(data) {checkEmailexistensResponse(data, response);},
		error: function(data) {console.log(data);}
	});
}

function checkEmailexistensResponse(data, response) {
	$("#editModal .form-control-feedback").remove();

	if (data == 1) {
		setFeedback($("#editModal .email"), 'This email already is in use by another profile, please use another');
	}
}

function setFeedback(obj, title) {
	obj.after('<i class="fa fa-ban form-control-feedback text-danger" title="'+title+'"></i>');
}






// Geo, inserted by Ralph
//=============================================================

function getMapSimple(identity, lat, lng, zoom) {
	var myLatlng = new google.maps.LatLng(lat, lng);

	var simpleOptions = {
		zoom: zoom,
		zoomControl: false,
		panControl: false,
		scaleControl: false,
		scrollwheel: false,
		streetViewControl: false,
		mapTypeControl: false,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	
	var map = new google.maps.Map(document.getElementById(identity), simpleOptions);
	//var bounds = map.getBounds();

	var infowindow = new google.maps.InfoWindow({
		content: ""
	});
	 
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		title: ""
	});

	map.panBy(-200, -40);
	//google.maps.event.addListener(marker, 'click', function() {
	//	infowindow.open(map,marker);
	//});
}




// Positions, inserted by Ralph
//=============================================================

// Positions Canvas Graph 1 - Donut text under
function drawPositionsGraph1(parentid, cssprefix, industriesdata, outerdiameter, innerdiameter) {
	try { 
		if (industriesdata) {
			var canvas = document.getElementById('canvas_'+parentid);
			if (canvas) canvas.parentNode.removeChild(canvas);
		
			var originalcanvasparent = jQuery("#"+parentid).clone(true);
			jQuery("#"+parentid).show();
			var width = jQuery("#"+parentid).width();
			jQuery("#"+parentid).replaceWith(originalcanvasparent);
			var canvasparent = jQuery("#"+parentid);

			var colors = Array();
			var noofindustries = parseInt(getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvasnoofindustries', 'orphans'));
			colors[0] = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvascolor1', 'color');
			colors[1] = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvascolor2', 'color');
			colors[2] = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvascolor3', 'color');
			colors[3] = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvascolor4', 'color');
			colors[4] = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvascolor5', 'color');
			var infonamecolor = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvasinfofont', 'color');
			var infotimecolor = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvastimefont', 'color');
			var infofontname = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvasinfofont', 'font');
			var infofonttime = getCanvasCss(canvasparent, cssprefix+'positionsgraph1canvastimefont', 'font');

			var space = 30;
			var outerradius = outerdiameter / 2;
			var innerradius = innerdiameter / 2;
			var infoheight = 24;
			var infolineheight = 16;
			var infotimewidth = 160;
			var infobulletradius = 8;
			
			var infototalheight = 0;
			canvasparent.append('<canvas id="canvas_'+parentid+'" height="20" width="'+width+'"></canvas>');
			var testcanvas = document.getElementById('canvas_'+parentid);
			var testc2 = testcanvas.getContext('2d');
			testc2.font = infofontname;
			var timetotal = 0;
			var industriescounter = 0;
			for (var name in industriesdata) {
				industriescounter++;
				timetotal += industriesdata[name]["time"];
				var fragname = wrapCanvasText(testc2, name, width - infotimewidth)
				industriesdata[name]["fragname"] = fragname;
				infototalheight += infoheight + (fragname.length - 1) * infolineheight;
				if (industriescounter >= noofindustries) break;
			}
			jQuery("#canvas_"+parentid).remove();
			var height = outerdiameter + infototalheight + 10;
			
			canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');

			var centerX = width/2;
			var centerY = outerdiameter/2;

			var anglefactor = 2 * Math.PI / timetotal;
			
			var canvas = document.getElementById('canvas_'+parentid);
			var c2 = canvas.getContext('2d');
			
			var currentangle = 0;
			var currentheight = outerdiameter + space;
			for (var name in industriesdata) {
				colorindex = Math.floor(Math.random() * colors.length);
				currentcolor = colors[colorindex];
				colors.splice(colorindex, 1);
				diffangle = anglefactor * industriesdata[name]["time"];
				// Industry arc
				c2.beginPath();
				c2.moveTo(centerX + innerradius * Math.cos(currentangle), centerY + innerradius * Math.sin(currentangle));
				c2.lineTo(centerX + outerradius * Math.cos(currentangle), centerY + outerradius * Math.sin(currentangle));
				c2.arc(centerX, centerY, outerradius, currentangle, currentangle + diffangle, false);
				c2.lineTo(centerX + innerradius * Math.cos(currentangle + diffangle), centerY + innerradius * Math.sin(currentangle + diffangle));
				c2.arc(centerX, centerY, innerradius, currentangle + diffangle, currentangle, true);
				c2.fillStyle = currentcolor;
				c2.fill();
				c2.closePath();
				currentangle += diffangle;
				
				// Infoline
				c2.beginPath();
				c2.arc(infobulletradius, currentheight - infobulletradius + 1, infobulletradius, 0, 2 * Math.PI, false);
				c2.fillStyle = currentcolor;
				c2.fill();
				c2.closePath();
				for (var i=0; i < industriesdata[name]["fragname"].length; i++) {
					c2.beginPath();
					c2.textBaseline="alphabetic";
					c2.fillStyle = infonamecolor;
					c2.textAlign = "left";
					c2.font = infofontname;
					c2.fillText(industriesdata[name]["fragname"][i], 2 * infobulletradius + 10, currentheight);
					c2.fill();
					c2.closePath();
					if (i + 1 >= industriesdata[name]["fragname"].length) {
						c2.beginPath();
						c2.textBaseline="alphabetic";
						c2.fillStyle = infotimecolor;
						c2.textAlign = "right";
						c2.font = infofonttime;
						c2.fillText(industriesdata[name]["timetext"], width, currentheight);
						c2.fill();
						c2.closePath();
						currentheight += infoheight;
					} else {
						currentheight += infolineheight;
					}
				}
				
				if (colors.length == 0) break;
			}
		}
	} catch(err) {
		console.log(err);
	}
}

// Positions Canvas Graph 2 - Donut text right
function drawPositionsGraph2(parentid, cssprefix, industriesdata) {
	try { 
		if (industriesdata) {
			var canvas = document.getElementById('canvas_'+parentid);
			if (canvas) canvas.parentNode.removeChild(canvas);

			var originalcanvasparent = jQuery("#"+parentid).clone(true);
			jQuery("#"+parentid).show();
			var width = jQuery("#"+parentid).width();
			jQuery("#"+parentid).replaceWith(originalcanvasparent);
			var canvasparent = jQuery("#"+parentid);

			var noofindustries = parseInt(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasnoofindustries', 'orphans'));
			var outerradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasouterradius', 'height'));
			var innerradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasinnerradius', 'height'));
			var horizontalspace = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvashorizontalspace', 'width'));
			var inforowspace = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasinforowsspace', 'height'));
			var infobulletradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasinfobullet', 'height'));
			var infobulletspace = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasinfobullet', 'width'));
			var infoverticaloffset = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasinfoverticaloffset', 'height'));
			var infotimecolor = getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvastime', 'color');
			var infofonttime = getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvastime', 'font');
			var infotimewidth = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvastime', 'width'));
			var infofontindustry = getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasindustry', 'font');
			var infoindustrycolor = getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasindustry', 'color');
			var infoindustrylineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'positionsgraph2canvasindustry', 'line-height'));

			var colors = Array();
			for (i = 0; i < noofindustries; i++){
				color = getCanvasCss(canvasparent, 'positionsgraph2canvascolor'+(i + 1), 'color');
				if (color) {
					colors[i] = color;
				} else {
					break;
				}
			}
			
			var infototalheight = infoverticaloffset;
			canvasparent.append('<canvas id="canvas_'+parentid+'" height="20" width="'+width+'"></canvas>');
			var testcanvas = document.getElementById('canvas_'+parentid);
			var testc2 = testcanvas.getContext('2d');
			testc2.font = infofontindustry;
			var timetotal = 0;
			var industrycounter = 0;
			
			var restspace = width - (2 * infobulletradius + infobulletspace + outerradius * 2 + horizontalspace + infotimewidth);
			if (restspace <= 0) {
			} else {
				for (var name in industriesdata) {
					industrycounter++;
					timetotal += industriesdata[name]["time"];
				 var fragname = wrapCanvasText(testc2, name, width - (2 * infobulletradius + infobulletspace + outerradius * 2 + horizontalspace + infotimewidth))
					industriesdata[name]["fragname"] = fragname;
					infototalheight += inforowspace + (fragname.length) * infoindustrylineheight;
					if (industrycounter > noofindustries - 1) break;
				}
				jQuery("#canvas_"+parentid).remove();
				var heightcalc = infototalheight;
				var height = heightcalc > outerradius * 2 ? heightcalc : outerradius * 2;

				canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');

				var centerX = outerradius;
				var centerY = outerradius;
				var anglefactor = 2 * Math.PI / timetotal;
				
				var canvas = document.getElementById('canvas_'+parentid);
				var c2 = canvas.getContext('2d');
				
				var currentangle = -Math.PI / 2;
				var currentheight = infoverticaloffset + 2 * infobulletradius;
				var industrycolor = 0;
				for (var name in industriesdata) {
					if (industrycolor > noofindustries - 1) break;
					currentcolor = colors[industrycolor];
					diffangle = anglefactor * industriesdata[name]["time"];
					
					// Industry arc
					c2.beginPath();
					c2.moveTo(centerX + innerradius * Math.cos(currentangle), centerY + innerradius * Math.sin(currentangle));
					c2.lineTo(centerX + outerradius * Math.cos(currentangle), centerY + outerradius * Math.sin(currentangle));
					c2.arc(centerX, centerY, outerradius, currentangle, currentangle + diffangle, false);
					c2.lineTo(centerX + innerradius * Math.cos(currentangle + diffangle), centerY + innerradius * Math.sin(currentangle + diffangle));
					c2.arc(centerX, centerY, innerradius, currentangle + diffangle, currentangle, true);
					c2.fillStyle = currentcolor;
					c2.fill();
					c2.closePath();
					currentangle += diffangle;
					
					// Infoline
					c2.beginPath();
					c2.arc(outerradius * 2 + horizontalspace + infobulletradius, currentheight - infobulletradius, infobulletradius, 0, 2 * Math.PI, false);
					c2.fillStyle = currentcolor;
					c2.fill();
					c2.closePath();
					for (var i=0; i < industriesdata[name]["fragname"].length; i++) {
						c2.beginPath();
						c2.textBaseline="alphabetic";
						c2.fillStyle = infoindustrycolor;
						c2.textAlign = "left";
						c2.font = infofontindustry;
						c2.fillText(industriesdata[name]["fragname"][i], outerradius * 2 + horizontalspace + 2 * infobulletradius + 10, currentheight - 3);
						c2.fill();
						c2.closePath();
						if (i + 1 >= industriesdata[name]["fragname"].length) {
							c2.beginPath();
							c2.textBaseline="alphabetic";
							c2.fillStyle = infotimecolor;
							c2.textAlign = "right";
							c2.font = infofonttime;
							c2.fillText(industriesdata[name]["timetext"], width, currentheight - 3);
							c2.fill();
							c2.closePath();
							currentheight += inforowspace + infoindustrylineheight;
						} else {
							currentheight += infoindustrylineheight;
						}
					}
					
					industrycolor++;
				}
			}
		}
	} catch(err) {
	}
}


///// professionalbio function ////////////////////////////////////////////////////////////////////////////////////
///// Toggles between medias on professional bio edit layer

function toggleViewPositionsElement(obj) {
	obj.closest(".viewpositionslist").find(".viewpositionslistboby").hide();
	obj.closest(".viewpositionslistelement").find(".viewpositionslistboby").show();

	obj.closest(".viewpositionslist").find(".viewpositionselementtoggle").html("[");
	obj.html("]");
}






// Portfolio, inserted by Ralph
//=============================================================

// Portfolio Canvas Graph 1 - Three circles
function drawPortfolioGraph1(parentid, cssprefix, portfoliodata) {
	if (portfoliodata) {
		var canvas = document.getElementById('canvas_'+parentid);
		if (canvas) canvas.parentNode.removeChild(canvas);
		
		var originalcanvasparent = jQuery("#"+parentid).clone(true);
		jQuery("#"+parentid).show();
		var width = jQuery("#"+parentid).width();
		jQuery("#"+parentid).replaceWith(originalcanvasparent);
		var canvasparent = jQuery("#"+parentid);
		
		var circlelargeradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio1canvascirclelargeradius', 'height'));
		var circlesmallradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio1canvascirclesmallradius', 'height'));
		var color1 = getCanvasCss(canvasparent, cssprefix+'portfolio1canvascolor1', 'color');
		var color2 = getCanvasCss(canvasparent, cssprefix+'portfolio1canvascolor2', 'color');
		var color3 = getCanvasCss(canvasparent, cssprefix+'portfolio1canvascolor3', 'color');
		var headerfont = getCanvasCss(canvasparent, cssprefix+'portfolio1canvasheaderfont', 'font');
		var numberfont = getCanvasCss(canvasparent, cssprefix+'portfolio1canvasnumberfont', 'font');
		var infofont = getCanvasCss(canvasparent, cssprefix+'portfolio1canvasinfofont', 'font');
		var headercolor = getCanvasCss(canvasparent, cssprefix+'portfolio1canvasheaderfont', 'color');
		var numbercolor = getCanvasCss(canvasparent, cssprefix+'portfolio1canvasnumberfont', 'color');
		var infocolor = getCanvasCss(canvasparent, cssprefix+'portfolio1canvasinfofont', 'color');
		
		var uppercirclespacer = 10;
		var uppertext = 17;
		var lowercirclespacer = 30;
		var circleverticalposition = uppertext + uppercirclespacer + circlelargeradius; // 68;
		var infoverticalposition = uppertext + uppercirclespacer + 2 * circlelargeradius + lowercirclespacer // 130;

		var height = uppertext + uppercirclespacer + 2 * circlelargeradius + lowercirclespacer + 2 * circlesmallradius; //canvasparent.height();
		canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');
		
		canvas = document.getElementById("canvas_"+parentid);
		var c2 = canvas.getContext('2d');
		
		// Connections header
		c2.beginPath();
		c2.textBaseline="top";
		c2.fillStyle = headercolor;
		c2.textAlign = "center";
		c2.font = headerfont;
		c2.fillText('Connections', circlelargeradius, 0);
		c2.fill();
		c2.closePath();
		// Followers header
		c2.beginPath();
		c2.textBaseline="top";
		c2.fillStyle = headercolor;
		c2.textAlign = "center";
		c2.font = headerfont;
		c2.fillText('Followers', width/2, 0);
		c2.fill();
		c2.closePath();
		// Followings header
		c2.beginPath();
		c2.textBaseline="top";
		c2.fillStyle = headercolor;
		c2.textAlign = "center";
		c2.font = headerfont;
		c2.fillText('Following', width-circlelargeradius, 0);
		c2.fill();
		c2.closePath();

		// Connections circle
		c2.beginPath();
		c2.fillStyle = color2;
		c2.arc(circlelargeradius, circleverticalposition, circlelargeradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		connections = portfoliodata["networkconnections"];
		if (connections > 0) {
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = numbercolor;
			c2.textAlign = "center";
			c2.font = numberfont;
			c2.fillText(connections, circlelargeradius, circleverticalposition);
			c2.fill();
			c2.closePath();
		}
		// Followers circle
		c2.beginPath();
		c2.fillStyle = color3;
		c2.arc(width/2, circleverticalposition, circlelargeradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		followers = portfoliodata["networkfollowers"];
		if (followers > 0) {
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = numbercolor;
			c2.textAlign = "center";
			c2.font = numberfont;
			c2.fillText(followers, width/2, circleverticalposition);
			c2.fill();
			c2.closePath();
		}
		// Following circle
		c2.beginPath();
		c2.fillStyle = color1;
		c2.arc(width-circlelargeradius, circleverticalposition, circlelargeradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		followings = portfoliodata["networkfollowings"];
		if (followings > 0) {
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = numbercolor;
			c2.textAlign = "center";
			c2.font = numberfont;
			c2.fillText(followings, width-circlelargeradius, circleverticalposition);
			c2.fill();
			c2.closePath();
		}
		
		// Audience circles
		c2.beginPath();
		c2.fillStyle = color3;
		c2.arc(circlesmallradius, infoverticalposition, circlesmallradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		c2.beginPath();
		c2.fillStyle = color2;
		c2.arc(3*circlesmallradius-3, infoverticalposition, circlesmallradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		c2.beginPath();
		c2.textBaseline="alphabetic";
		c2.fillStyle = infocolor;
		c2.textAlign = "left";
		c2.font = infofont;
		c2.fillText(String(Number(connections) + Number(followers))+' audience', 4*circlesmallradius+2, infoverticalposition+circlesmallradius);
		c2.fill();
		c2.closePath();
		
		// Resources circles
		c2.beginPath();
		c2.fillStyle = color2;
		c2.arc(width/2+circlesmallradius, infoverticalposition, circlesmallradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		c2.beginPath();
		c2.fillStyle = color1;
		c2.arc(width/2+3*circlesmallradius-3, infoverticalposition, circlesmallradius, 2*Math.PI, 0, false);
		c2.fill();
		c2.closePath();
		c2.beginPath();
		c2.textBaseline="alphabetic";
		c2.fillStyle = infocolor;
		c2.textAlign = "left";
		c2.font = infofont;
		c2.fillText(String(Number(followings) + Number(connections))+' resources', width/2+4*circlesmallradius+2, infoverticalposition+circlesmallradius);
		c2.fill();
		c2.closePath();
	}
}

// Profile portfolio graph 1 hover tools
function showCareerpagesPortfolioGraph1(obj, mediaid, classname, amount) {
	obj.parent().parent().find("#careerpagesteamportfolioviewall").addClass("careerpagesteamportfolioviewallgroupdisabled");
	obj.parent().find(".careerpagesteamportfolioviewer").removeClass("careerpagesteamportfoliovieweractive");
	obj.find(".careerpagesteamportfolioviewer").addClass("careerpagesteamportfoliovieweractive");
	
	obj.parent().parent().parent().find(".careerpagesteamportfolioswitch").hide();
	obj.parent().parent().parent().find(".careerpagesteamportfolioswitch_"+mediaid).show();
}

function hideCareerpagesPortfolioGraph1(obj) {
	obj.parent().find(".careerpagesteamportfolioviewer").removeClass("careerpagesteamportfoliovieweractive");

	obj.parent().parent().parent().find(".careerpagesteamportfolioswitch").hide();
	obj.parent().parent().parent().find(".careerpagesteamportfolioswitch_0").show();

	obj.parent().parent().find("#careerpagesteamportfolioviewall").removeClass("careerpagesteamportfolioviewallgroupdisabled");
}

// Embedding portfolio graph 1 hover tools
function showEmbedPortfolioGraph1(obj, mediaid, classname, amount) {
	obj.parent().parent().find("#viewembedportfolio1viewall").addClass("viewembedportfolio1viewallgroupdisabled");
	obj.parent().find(".viewembedportfolio1viewer").removeClass("viewembedportfolio1vieweractive");
	obj.find(".viewembedportfolio1viewer").addClass("viewembedportfolio1vieweractive");
	
	obj.parent().parent().parent().find(".viewembedportfolio1switch").hide();
	obj.parent().parent().parent().find(".viewembedportfolio1switch_"+mediaid).show();
}

function hideEmbedPortfolioGraph1(obj) {
	obj.parent().find(".viewembedportfolio1viewer").removeClass("careerpagesteamportfoliovieweractive");

	obj.parent().parent().parent().find(".viewembedportfolio1switch").hide();
	obj.parent().parent().parent().find(".viewembedportfolio1switch_0").show();

	obj.parent().parent().find("#viewembedportfolio1viewall").removeClass("viewembedportfolio1viewallgroupdisabled");
}

// Portfolio Canvas Graph 2 - Timeline
function drawPortfolioGraph2(parentid, cssprefix, portfoliodata) {
	if (portfoliodata) {
		var canvas = document.getElementById('canvas_'+parentid);
		if (canvas) canvas.parentNode.removeChild(canvas);

		var webicons = {1:"0xf0e1", 2:"0xf099", 3:"0xf09a", 4:"0xf1a5", 5:"0xf1e7", 6:"0xf0d5", 7:"0xf167", 8:"0xf0d2", 9:"0xf0d2", 10:"0xf0d2"};
		
		var originalcanvasparent = jQuery("#"+parentid).clone(true);
		jQuery("#"+parentid).show();
		var width = jQuery("#"+parentid).width();
		if (width > 0) {
			jQuery("#"+parentid).replaceWith(originalcanvasparent);
			var canvasparent = jQuery("#"+parentid);

			var maxyear = new Date();
			maxyear = maxyear.getFullYear();
			var minyear = null;
			var noofmedias = 0;
			for (var mediaid in portfoliodata) {
				if (mediaid > 0 && portfoliodata[mediaid]["mediacreated"]) {
					minyear = minyear === null || portfoliodata[mediaid]["mediacreated"] < minyear ? portfoliodata[mediaid]["mediacreated"] : minyear;
					noofmedias++;
				}
			}
			minyear = new Date(parseInt(minyear) * 1000);
			minyear = minyear.getFullYear();
			
			var iconWidth = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediaicon', 'height'));
			var iconHeight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediaicon', 'width'));
			var mediabarfont = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediabarfont', 'font');
			var sincefont = getCanvasCss(canvasparent, cssprefix+'portfolio2canvassincefont', 'font');
			var yearfont = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasyearfont', 'font');
			var mediabarfontcolor = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediabarfont', 'color');
			var sincefontcolor = getCanvasCss(canvasparent, cssprefix+'portfolio2canvassincefont', 'color');
			var yearfontcolor = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasyearfont', 'color');
			var axiscolor = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasaxiscolor', 'color');
			var mediacolor = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediabarcolor', 'color');
			var spacebetween = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasspacebetween', 'height'));
			var mediabarheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediabarheight', 'height'));
			var spacetoxaxis = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasspacetoxaxis', 'height'));
			var xaxisthickness = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasxaxisthickness', 'height'));
			var bullitradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasbullitradius', 'height'));
			var lineover = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvaslineover', 'height'));
			var lineunder = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvaslineunder', 'height'));
			var yearlineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio2canvasyearlineheight', 'line-height'));
			var mediasymbolfont = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediasymbol', 'font');
			var mediasymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio2canvasmediasymbol', 'color');

			var height = lineover + mediabarheight * noofmedias + spacebetween * (noofmedias - 1) + spacetoxaxis + xaxisthickness + (lineunder > yearlineheight ? lineunder : yearlineheight);

			canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');

			canvas = document.getElementById('canvas_'+parentid);
			var c2 = canvas.getContext('2d');
			
			var canvasyear;
			if (maxyear - minyear > 0) {
				canvasyear = width / (maxyear - minyear + 1);
			} else {
				// Handle max = min
			}
			
			var step = 1;
			var yeartextwidth = 50;
			var noofsteps = Math.ceil((maxyear-minyear)/step);
			while (width/noofsteps < yeartextwidth && step <= noofsteps) {
				step++;
				noofsteps = Math.ceil((maxyear-minyear)/step);
			}
			
			for (var y = maxyear; y >= minyear; y -= step) {
				// Year line
				if (y < maxyear) {
					c2.beginPath();
					c2.moveTo(canvasyear * (y - minyear + (step + 1)/2), 0);
					c2.lineTo(canvasyear * (y - minyear + (step + 1)/2), height);
					c2.lineWidth = 1;
					c2.strokeStyle = yearfontcolor;
					c2.stroke();
					c2.closePath();
				}
				// Year text
				c2.beginPath();
				c2.textBaseline="bottom";
				c2.fillStyle = y == maxyear ? axiscolor : yearfontcolor;
				c2.textAlign = "center";
				c2.font = yearfont;
				c2.fillText(y, canvasyear / 2 + canvasyear * (y - minyear), lineover + mediabarheight * noofmedias + spacebetween * (noofmedias - 1) + spacetoxaxis + xaxisthickness + yearlineheight);
				c2.fill();
				c2.closePath();
			}		

			// X-axis
			c2.beginPath();
			c2.fillStyle = axiscolor;
			c2.fillRect(0, lineover + mediabarheight * noofmedias + spacebetween * (noofmedias - 1) + spacetoxaxis, width, xaxisthickness);
			c2.closePath();
			// Bullit
			c2.beginPath();
			c2.arc(width - bullitradius, lineover + mediabarheight * noofmedias + spacebetween * (noofmedias - 1) + spacetoxaxis + xaxisthickness / 2, bullitradius, 0, 2 * Math.PI, false);
			c2.fillStyle = axiscolor;
			c2.fill();
			c2.closePath();

			// Medias
			var currentheight = lineover;
			for (var mediaid in portfoliodata) {
				if (mediaid > 0 && portfoliodata[mediaid]["mediacreated"]) {
					mediayear = new Date(parseInt(portfoliodata[mediaid]["mediacreated"]) * 1000);
					mediayear = mediayear.getFullYear();
					// Rectangle
					c2.beginPath();
					c2.fillStyle = mediacolor;
					c2.fillRect(canvasyear * (mediayear - minyear), currentheight, width-canvasyear * (mediayear - minyear), mediabarheight);
					c2.closePath();
					// Icon
					c2.beginPath();
					c2.textBaseline="middle";
					c2.fillStyle = mediasymbolcolor;
					c2.textAlign = "center";
					c2.font = mediasymbolfont;
					c2.fillText(String.fromCharCode(webicons[mediaid]), canvasyear * (mediayear - minyear) + 15, currentheight + mediabarheight / 2);
					c2.fill();
					c2.closePath();
					// Name
					c2.beginPath();
					c2.textBaseline="alphabetic";
					c2.fillStyle = mediabarfontcolor;
					c2.textAlign = "left";
					c2.font = mediabarfont;
					c2.fillText(portfoliodata[mediaid]["alias"], canvasyear * (mediayear - minyear) + 30, currentheight + mediabarheight / 2 + 5);
					c2.fill();
					c2.closePath();
					// Since
					c2.beginPath();
					c2.textBaseline="alphabetic";
					c2.fillStyle = sincefontcolor;
					c2.textAlign = "right";
					c2.font = sincefont;
					c2.fillText(mediayear, width - 10, currentheight + mediabarheight / 2 + 5);
					c2.fill();
					c2.closePath();
					
					currentheight += spacebetween + mediabarheight;
				}
			}
		}
	}
}

// Portfolio Canvas Graph 3 - Two circles
function drawPortfolioGraph3(parentid, cssprefix, portfoliodata, audiencesymbol, audiencetext1, audiencetext2, resourcessymbol, resourcestext1, resourcestext2) {
	if (portfoliodata) {
		var canvas = document.getElementById('canvas_'+parentid);
		if (canvas) canvas.parentNode.removeChild(canvas);
		
		var originalcanvasparent = jQuery("#"+parentid).clone(true);
		jQuery("#"+parentid).show();
		var width = jQuery("#"+parentid).width();
		if (width > 0) {
			jQuery("#"+parentid).replaceWith(originalcanvasparent);
			var canvasparent = jQuery("#"+parentid);

			var color1 = getCanvasCss(canvasparent, cssprefix+'portfolio3canvascolor1', 'color');
			var color2 = getCanvasCss(canvasparent, cssprefix+'portfolio3canvascolor2', 'color');
			var color3 = getCanvasCss(canvasparent, cssprefix+'portfolio3canvascolor3', 'color');
			var audiencesymbolfont = getCanvasCss(canvasparent, cssprefix+'portfolio3canvasaudiencesymbol', 'font');
			var audiencesymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio3canvasaudiencesymbol', 'color');
			var audiencesymbollineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvasaudiencesymbol', 'margin'));
			var resourcesymbolfont = getCanvasCss(canvasparent, cssprefix+'portfolio3canvasresourcessymbol', 'font');
			var resourcesymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio3canvasresourcessymbol', 'color');
			var resourcesymbollineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvasresourcessymbol', 'margin'));
			var numberfont = getCanvasCss(canvasparent, cssprefix+'portfolio3canvasnumber', 'font');
			var numbercolor = getCanvasCss(canvasparent, cssprefix+'portfolio3canvasnumber', 'color');
			var numberlineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvasnumber', 'line-height'));
			var text1font = getCanvasCss(canvasparent, cssprefix+'portfolio3canvastext1', 'font');
			var text1color = getCanvasCss(canvasparent, cssprefix+'portfolio3canvastext1', 'color');
			var text1lineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvastext1', 'line-height'));
			var text2font = getCanvasCss(canvasparent, cssprefix+'portfolio3canvastext2', 'font');
			var text2color = getCanvasCss(canvasparent, cssprefix+'portfolio3canvastext2', 'color');
			var text2lineheight = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvastext2', 'line-height'));
			var spacebetweencircles = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvasspacebetweencircles', 'width'));
			var roundelthickness = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio3canvasroundelthickness', 'width'));
			var outerradius = (width - spacebetweencircles) / 4;
			var innerradius = outerradius - roundelthickness;
			
			var vertical = new Array(2 * outerradius, numberlineheight, text1lineheight, text2lineheight);
			var height = Math.max.apply(Math, vertical) + 1;

			canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');
			
			canvas = document.getElementById("canvas_"+parentid);
			var c2 = canvas.getContext('2d');

			var followers = portfoliodata["networkfollowers"];
			var connections = portfoliodata["networkconnections"];
			var followings = portfoliodata["networkfollowings"];
			
			// Audience circle
			var currentangle = -Math.PI / 2;
			anglefactor = 2 * Math.PI / (followers + connections);
			centerXaudience = outerradius;
			centerYaudience = outerradius;
			// Connections arc
			diffangle = anglefactor * connections;
			c2.beginPath();
			c2.moveTo(centerXaudience + innerradius * Math.cos(currentangle), centerYaudience + innerradius * Math.sin(currentangle));
			c2.lineTo(centerXaudience + outerradius * Math.cos(currentangle), centerYaudience + outerradius * Math.sin(currentangle));
			c2.arc(centerXaudience, centerYaudience, outerradius, currentangle, currentangle + diffangle, false);
			c2.lineTo(centerXaudience + innerradius * Math.cos(currentangle + diffangle), centerYaudience + innerradius * Math.sin(currentangle + diffangle));
			c2.arc(centerXaudience, centerYaudience, innerradius, currentangle + diffangle, currentangle, true);
			c2.fillStyle = color2;
			c2.fill();
			c2.closePath();
			currentangle += diffangle;
			// Followers arc
			diffangle = anglefactor * followers;
			c2.beginPath();
			c2.moveTo(centerXaudience + innerradius * Math.cos(currentangle), centerYaudience + innerradius * Math.sin(currentangle));
			c2.lineTo(centerXaudience + outerradius * Math.cos(currentangle), centerYaudience + outerradius * Math.sin(currentangle));
			c2.arc(centerXaudience, centerYaudience, outerradius, currentangle, currentangle + diffangle, false);
			c2.lineTo(centerXaudience + innerradius * Math.cos(currentangle + diffangle), centerYaudience + innerradius * Math.sin(currentangle + diffangle));
			c2.arc(centerXaudience, centerYaudience, innerradius, currentangle + diffangle, currentangle, true);
			c2.fillStyle = color1;
			c2.fill();
			c2.closePath();
			currentangle += diffangle;
			// Symbol
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = audiencesymbolcolor;
			c2.textAlign = "center";
			c2.font = audiencesymbolfont;
			c2.fillText(String.fromCharCode(audiencesymbol), centerXaudience, outerradius + audiencesymbollineheight);
			c2.fill();
			c2.closePath();
			// Text 1
			c2.beginPath();
			c2.textBaseline="bottom";
			c2.fillStyle = text1color;
			c2.textAlign = "center";
			c2.font = text1font;
			c2.fillText(audiencetext1, centerXaudience, text1lineheight);
			c2.fill();
			c2.closePath();
			// Number
			c2.beginPath();
			c2.textBaseline="bottom";
			c2.fillStyle = numbercolor;
			c2.textAlign = "center";
			c2.font = numberfont;
			c2.fillText(followers + connections, centerXaudience, numberlineheight);
			c2.fill();
			c2.closePath();
			// Text 2
			c2.beginPath();
			c2.textBaseline="bottom";
			c2.fillStyle = text2color;
			c2.textAlign = "center";
			c2.font = text2font;
			c2.fillText(audiencetext2, centerXaudience, text2lineheight);
			c2.fill();
			c2.closePath();

			// Resources circle
			currentangle = -Math.PI / 2;
			anglefactor = 2 * Math.PI / (followings + connections);
			centerXresources = width - outerradius;
			centerYresources = outerradius;
			// Connections arc
			diffangle = anglefactor * connections;
			c2.beginPath();
			c2.moveTo(centerXresources + innerradius * Math.cos(currentangle), centerYresources + innerradius * Math.sin(currentangle));
			c2.lineTo(centerXresources + outerradius * Math.cos(currentangle), centerYresources + outerradius * Math.sin(currentangle));
			c2.arc(centerXresources, centerYresources, outerradius, currentangle, currentangle + diffangle, false);
			c2.lineTo(centerXresources + innerradius * Math.cos(currentangle + diffangle), centerYresources + innerradius * Math.sin(currentangle + diffangle));
			c2.arc(centerXresources, centerYresources, innerradius, currentangle + diffangle, currentangle, true);
			c2.fillStyle = color2;
			c2.fill();
			c2.closePath();
			currentangle += diffangle;
			// Followers arc
			diffangle = anglefactor * followings;
			c2.beginPath();
			c2.moveTo(centerXresources + innerradius * Math.cos(currentangle), centerYresources + innerradius * Math.sin(currentangle));
			c2.lineTo(centerXresources + outerradius * Math.cos(currentangle), centerYresources + outerradius * Math.sin(currentangle));
			c2.arc(centerXresources, centerYresources, outerradius, currentangle, currentangle + diffangle, false);
			c2.lineTo(centerXresources + innerradius * Math.cos(currentangle + diffangle), centerYresources + innerradius * Math.sin(currentangle + diffangle));
			c2.arc(centerXresources, centerYresources, innerradius, currentangle + diffangle, currentangle, true);
			c2.fillStyle = color3;
			c2.fill();
			c2.closePath();
			currentangle += diffangle;
			// Symbol
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = resourcesymbolcolor;
			c2.textAlign = "center";
			c2.font = resourcesymbolfont;
			c2.fillText(String.fromCharCode(resourcessymbol), centerXresources, outerradius + resourcesymbollineheight);
			c2.fill();
			c2.closePath();
			// Text 1
			c2.beginPath();
			c2.textBaseline="bottom";
			c2.fillStyle = text1color;
			c2.textAlign = "center";
			c2.font = text1font;
			c2.fillText(resourcestext1, centerXresources, text1lineheight);
			c2.fill();
			c2.closePath();
			// Number
			c2.beginPath();
			c2.textBaseline="bottom";
			c2.fillStyle = numbercolor;
			c2.textAlign = "center";
			c2.font = numberfont;
			c2.fillText(followings + connections, centerXresources, numberlineheight);
			c2.fill();
			c2.closePath();
			// Text 2
			c2.beginPath();
			c2.textBaseline="bottom";
			c2.fillStyle = text2color;
			c2.textAlign = "center";
			c2.font = text2font;
			c2.fillText(resourcestext2, centerXresources, text2lineheight);
			c2.fill();
			c2.closePath();
		}
	}
}

// Portfolio Canvas Graph 4 - Two plus three circles
function drawPortfolioGraph4(parentid, cssprefix, portfoliodata, headersymbol, headertext) {
	if (portfoliodata) {
		var canvas = document.getElementById('canvas_'+parentid);
		if (canvas) canvas.parentNode.removeChild(canvas);
		
		var originalcanvasparent = jQuery("#"+parentid).clone(true);
		jQuery("#"+parentid).show();
		var width = jQuery("#"+parentid).width();
		jQuery("#"+parentid).replaceWith(originalcanvasparent);
		var canvasparent = jQuery("#"+parentid);

		var color1 = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascolor1', 'color');
		var color2 = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascolor2', 'color');
		var color3 = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascolor3', 'color');
		var headersymbolfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheadersymbol', 'font');
		var headersymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheadersymbol', 'color');
		var headertextfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheadertext', 'font');
		var headertextcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheadertext', 'color');
		var headerfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheaderfromtop', 'height'));
		var audiencebgsize = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasaudienceicon', 'background-size');
		var headersymbolsize = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheadersymbol', 'font-size'));
		var headersymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasheadersymbol', 'color');
		var audiencesymbolsize = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasaudiencesymbol', 'font-size'));
		var audiencesymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasaudiencesymbol', 'color');
		var resourcessymbolsize = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasresourcessymbol', 'font-size'));
		var resourcessymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasresourcessymbol', 'color');
		var roundelsymbolfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelsymbol', 'font');
		var roundelsymbolcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelsymbol', 'color');
		var roundelsymbolfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelsymbolfromtop', 'height'));
		var roundeltoptextfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundeltoptext', 'font');
		var roundeltoptextcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundeltoptext', 'color');
		var roundeltoptextfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundeltoptextfromtop', 'height'));
		var roundelmiddletextfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelmiddletext', 'font');
		var roundelmiddletextcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelmiddletext', 'color');
		var roundelmiddletextfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelmiddletextfromtop', 'height'));
		var roundelbottomtextfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelbottomtext', 'font');
		var roundelbottomtextcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelbottomtext', 'color');
		var roundelbottomtextfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelbottomtextfromtop', 'height'));
		var circletoptextfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascircletoptext', 'font');
		var circletoptextcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascircletoptext', 'color');
		var circletoptextfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvascircletoptextfromtop', 'height'));
		var circlebottomtextfont = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascirclebottomtext', 'font');
		var circlebottomtextcolor = getCanvasCss(canvasparent, cssprefix+'portfolio4canvascirclebottomtext', 'color');
		var circlebottomtextfromtop = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvascirclebottomtextfromtop', 'height'));
		
		var spacebetweencircles = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasspacebetweencircles', 'width'));
		var roundelouterdiameter = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelouterdiameter', 'width'));
		var roundelthickness = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvasroundelthickness', 'width'));
		var circleradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'portfolio4canvascircleouterdiameter', 'width')) / 2;
		var outerradius = roundelouterdiameter / 2;
		var innerradius = outerradius - roundelthickness;
		var circlespace = (width - 2 *roundelouterdiameter - 6 * circleradius) / 4;
		var height = roundelouterdiameter;
		var toppos = 0;

		canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');
		
		canvas = document.getElementById("canvas_"+parentid);
		var c2 = canvas.getContext('2d');

		var followers = portfoliodata["networkfollowers"];
		var connections = portfoliodata["networkconnections"];
		var followings = portfoliodata["networkfollowings"];
		
		// Header text and symbol
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = headersymbolcolor;
		c2.textAlign = "center";
		c2.font = headersymbolfont;
		c2.fillText(String.fromCharCode(headersymbol), width / 2 - 155, headerfromtop);
		c2.fill();
		c2.closePath();
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = headertextcolor;
		c2.textAlign = "center";
		c2.font = headertextfont;
		c2.fillText(headertext, (width / 2) + 35, headerfromtop);
		c2.fill();
		c2.closePath();
		
		// Audience roundel
		var currentangle = -Math.PI / 2;
		anglefactor = 2 * Math.PI / (followers + connections);
		centerXaudience = outerradius;
		centerYaudience = outerradius;
		// Connections arc
		diffangle = anglefactor * connections;
		c2.beginPath();
		c2.moveTo(centerXaudience + innerradius * Math.cos(currentangle), centerYaudience + innerradius * Math.sin(currentangle));
		c2.lineTo(centerXaudience + outerradius * Math.cos(currentangle), centerYaudience + outerradius * Math.sin(currentangle));
		c2.arc(centerXaudience, centerYaudience, outerradius, currentangle, currentangle + diffangle, false);
		c2.lineTo(centerXaudience + innerradius * Math.cos(currentangle + diffangle), centerYaudience + innerradius * Math.sin(currentangle + diffangle));
		c2.arc(centerXaudience, centerYaudience, innerradius, currentangle + diffangle, currentangle, true);
		c2.fillStyle = color2;
		c2.fill();
		c2.closePath();
		currentangle += diffangle;
		// Followers arc
		diffangle = anglefactor * followers;
		c2.beginPath();
		c2.moveTo(centerXaudience + innerradius * Math.cos(currentangle), centerYaudience + innerradius * Math.sin(currentangle));
		c2.lineTo(centerXaudience + outerradius * Math.cos(currentangle), centerYaudience + outerradius * Math.sin(currentangle));
		c2.arc(centerXaudience, centerYaudience, outerradius, currentangle, currentangle + diffangle, false);
		c2.lineTo(centerXaudience + innerradius * Math.cos(currentangle + diffangle), centerYaudience + innerradius * Math.sin(currentangle + diffangle));
		c2.arc(centerXaudience, centerYaudience, innerradius, currentangle + diffangle, currentangle, true);
		c2.fillStyle = color1;
		c2.fill();
		c2.closePath();
		currentangle += diffangle;

		toppos = 0;
		// Roundel symbol
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundelsymbolcolor;
		c2.textAlign = "center";
		c2.font = roundelsymbolfont;
		c2.fillText(String.fromCharCode("0xf130"), centerXaudience, toppos + roundelsymbolfromtop);
		c2.fill();
		c2.closePath();

		// Roundel top text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundeltoptextcolor;
		c2.textAlign = "center";
		c2.font = roundeltoptextfont;
		c2.fillText("Our audience is", centerXaudience, toppos + roundeltoptextfromtop);
		c2.fill();
		c2.closePath();

		// Roundel middle text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundelmiddletextcolor;
		c2.textAlign = "center";
		c2.font = roundelmiddletextfont;
		c2.fillText((followers + connections).toLocaleString(), centerXaudience, toppos + roundelmiddletextfromtop);
		c2.fill();
		c2.closePath();

		// Roundel bottom text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundelbottomtextcolor;
		c2.textAlign = "center";
		c2.font = roundelbottomtextfont;
		c2.fillText("people", centerXaudience, toppos + roundelbottomtextfromtop);
		c2.fill();
		c2.closePath();

		// Resources roundel
		currentangle = -Math.PI / 2;
		anglefactor = 2 * Math.PI / (followings + connections);
		centerXresources = width - outerradius;
		centerYresources = outerradius;
		// Connections arc
		diffangle = anglefactor * connections;
		c2.beginPath();
		c2.moveTo(centerXresources + innerradius * Math.cos(currentangle), centerYresources + innerradius * Math.sin(currentangle));
		c2.lineTo(centerXresources + outerradius * Math.cos(currentangle), centerYresources + outerradius * Math.sin(currentangle));
		c2.arc(centerXresources, centerYresources, outerradius, currentangle, currentangle + diffangle, false);
		c2.lineTo(centerXresources + innerradius * Math.cos(currentangle + diffangle), centerYresources + innerradius * Math.sin(currentangle + diffangle));
		c2.arc(centerXresources, centerYresources, innerradius, currentangle + diffangle, currentangle, true);
		c2.fillStyle = color2;
		c2.fill();
		c2.closePath();
		currentangle += diffangle;
		// Followers arc
		diffangle = anglefactor * followings;
		c2.beginPath();
		c2.moveTo(centerXresources + innerradius * Math.cos(currentangle), centerYresources + innerradius * Math.sin(currentangle));
		c2.lineTo(centerXresources + outerradius * Math.cos(currentangle), centerYresources + outerradius * Math.sin(currentangle));
		c2.arc(centerXresources, centerYresources, outerradius, currentangle, currentangle + diffangle, false);
		c2.lineTo(centerXresources + innerradius * Math.cos(currentangle + diffangle), centerYresources + innerradius * Math.sin(currentangle + diffangle));
		c2.arc(centerXresources, centerYresources, innerradius, currentangle + diffangle, currentangle, true);
		c2.fillStyle = color3;
		c2.fill();
		c2.closePath();
		currentangle += diffangle;

		// Roundel symbol
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundelsymbolcolor;
		c2.textAlign = "center";
		c2.font = roundelsymbolfont;
		c2.fillText(String.fromCharCode("0xf02d"), centerXresources, toppos + roundelsymbolfromtop);
		c2.fill();
		c2.closePath();

		// Roundel top text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundeltoptextcolor;
		c2.textAlign = "center";
		c2.font = roundeltoptextfont;
		c2.fillText("We learn from", centerXresources, toppos + roundeltoptextfromtop);
		c2.fill();
		c2.closePath();

		// Roundel middle text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundelmiddletextcolor;
		c2.textAlign = "center";
		c2.font = roundelmiddletextfont;
		c2.fillText((followings + connections).toLocaleString(), centerXresources, toppos + roundelmiddletextfromtop);
		c2.fill();
		c2.closePath();

		// Roundel bottom text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = roundelbottomtextcolor;
		c2.textAlign = "center";
		c2.font = roundelbottomtextfont;
		c2.fillText("resources", centerXresources, toppos + roundelbottomtextfromtop);
		c2.fill();
		c2.closePath();

		var circlecenterX = 2 * outerradius + circlespace + circleradius;
		var circlecenterY = height - circleradius;

		toppos = height - 2 * circleradius;
 
		// Followers circle
		circlecenterX += 0;
		c2.beginPath();
		c2.arc(circlecenterX, circlecenterY, circleradius, 0, 2 * Math.PI, false);
		c2.fillStyle = color1;
		c2.fill();
		c2.closePath();
		
		// Followers top text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = circletoptextcolor;
		c2.textAlign = "center";
		c2.font = circletoptextfont;
		c2.fillText(followers.toLocaleString(), circlecenterX, toppos + circletoptextfromtop);
		c2.fill();
		c2.closePath();
		
		// Followers bottom text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = circlebottomtextcolor;
		c2.textAlign = "center";
		c2.font = circlebottomtextfont;
		c2.fillText("Followers", circlecenterX, toppos + circlebottomtextfromtop);
		c2.fill();
		c2.closePath();
		
		// Connections circle
		circlecenterX += circlespace + 2 * circleradius;
		c2.beginPath();
		c2.arc(circlecenterX, circlecenterY, circleradius, 0, 2 * Math.PI, false);
		c2.fillStyle = color2;
		c2.fill();
		c2.closePath();
		
		// Connections top text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = circletoptextcolor;
		c2.textAlign = "center";
		c2.font = circletoptextfont;
		c2.fillText(connections.toLocaleString(), circlecenterX, toppos + circletoptextfromtop);
		c2.fill();
		c2.closePath();
		
		// Connections bottom text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = circlebottomtextcolor;
		c2.textAlign = "center";
		c2.font = circlebottomtextfont;
		c2.fillText("Connections", circlecenterX, toppos + circlebottomtextfromtop);
		c2.fill();
		c2.closePath();
		
		// Followings circle
		circlecenterX += circlespace + 2 * circleradius;
		c2.beginPath();
		c2.arc(circlecenterX, circlecenterY, circleradius, 0, 2 * Math.PI, false);
		c2.fillStyle = color3;
		c2.fill();
		c2.closePath();
		
		// Followings top text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = circletoptextcolor;
		c2.textAlign = "center";
		c2.font = circletoptextfont;
		c2.fillText(followings.toLocaleString(), circlecenterX, toppos + circletoptextfromtop);
		c2.fill();
		c2.closePath();
		
		// Followings bottom text
		c2.beginPath();
		c2.textBaseline="hanging";
		c2.fillStyle = circlebottomtextcolor;
		c2.textAlign = "center";
		c2.font = circlebottomtextfont;
		c2.fillText("Followings", circlecenterX, toppos + circlebottomtextfromtop);
		c2.fill();
		c2.closePath();
	}
}






// Smti, inserted by Ralph
//=============================================================

// Smti Canvas Graph 1 - Circle with 4 quadrants
function drawSmtiGraph1(parentid, cssprefix, smtiData, centeroffset) {
	if (smtiData) {
		var canvas = document.getElementById('canvas_'+parentid);
		if (canvas) canvas.parentNode.removeChild(canvas);
		
		var activities = smtiData["activities"] === undefined ? false : smtiData["activities"];
		var activities = smtiData["activities"] === undefined ? false : smtiData["activities"];
		
		var originalcanvasparent = jQuery("#"+parentid).clone(true);
		jQuery("#"+parentid).show();
		var width = jQuery("#"+parentid).width();
		jQuery("#"+parentid).replaceWith(originalcanvasparent);
		var canvasparent = jQuery("#"+parentid);

		var color1 = getCanvasCss(canvasparent, cssprefix+'smti1canvascolor1', 'color');
		var color2 = getCanvasCss(canvasparent, cssprefix+'smti1canvascolor2', 'color');
		var color3 = getCanvasCss(canvasparent, cssprefix+'smti1canvascolor3', 'color');
		var color4 = getCanvasCss(canvasparent, cssprefix+'smti1canvascolor4', 'color');
		var numberfont = getCanvasCss(canvasparent, cssprefix+'smti1canvasnumberfont', 'font');
		var activitiesfont = getCanvasCss(canvasparent, cssprefix+'smti1canvasactivitiesfont', 'font');
		var typefont = getCanvasCss(canvasparent, cssprefix+'smti1canvastypefont', 'font');
		var numbercolor = getCanvasCss(canvasparent, cssprefix+'smti1canvasnumberfont', 'color');
		var activitiescolor = getCanvasCss(canvasparent, cssprefix+'smti1canvasactivitiesfont', 'color');
		var numberrectwidth = parseFloat(getCanvasCss(canvasparent, cssprefix+'smti1canvasnumberrect', 'width'));
		var numberrectheigth = parseFloat(getCanvasCss(canvasparent, cssprefix+'smti1canvasnumberrect', 'height'));
		var circleradius = parseFloat(getCanvasCss(canvasparent, cssprefix+'smti1canvascircleradius', 'height'));

		var graphfactor = circleradius/70;
		var recttextspace = 3;
		var rectactivityspace = 5;

		var height = numberrectheigth + 2*circleradius + 2*centeroffset + numberrectheigth;
		canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');
		
		var centerX = width/2;
		var centerY = height/2;
		
		canvas = document.getElementById('canvas_'+parentid);
		var c2 = canvas.getContext('2d');
		
		//Draw research
		c2.beginPath();
		c2.moveTo(centerX + centeroffset, centerY - centeroffset);
		c2.lineTo(centerX + centeroffset, centerY - centeroffset - smtiData["research"]*graphfactor);
		c2.arc(centerX + centeroffset, centerY - centeroffset, smtiData["research"]*graphfactor, -0.5 * Math.PI, 0, false);
		c2.lineTo(centerX + centeroffset, centerY - centeroffset);
		c2.fillStyle = color1;
		c2.fill();
		c2.closePath();
				
		if (!activities == false) {
			if (activities.types.research > 0) {
				c2.beginPath();
				c2.rect(width-numberrectwidth, 0, numberrectwidth, numberrectheigth);
				c2.fillStyle = color1;
				c2.fill();
				c2.closePath();

				c2.beginPath();
				c2.textBaseline="top";
				c2.fillStyle = numbercolor;
				c2.textAlign = "center";
				c2.font = numberfont;
				c2.fillText(activities.types.research, width-numberrectwidth/2, recttextspace);
				c2.textBaseline="bottom";
				c2.font = activitiesfont;
				c2.fillStyle = activitiescolor;
				c2.fillText('Activities', width-numberrectwidth/2, numberrectheigth - recttextspace);
				c2.textBaseline="top";
				c2.textAlign = "right";
				c2.font = typefont;
				c2.fillStyle = color1;
				c2.fillText('Observer', width, numberrectheigth + rectactivityspace);
				c2.fill();
				c2.closePath();
				}
		}
		
		//Draw share
		c2.beginPath();
		c2.moveTo(centerX + centeroffset, centerY + centeroffset);
		c2.lineTo(centerX + centeroffset + smtiData["share"]*graphfactor, centerY + centeroffset);
		c2.arc(centerX + centeroffset, centerY + centeroffset, smtiData["share"]*graphfactor, 0, 0.5 * Math.PI, false);
		c2.lineTo(centerX + centeroffset, centerY + centeroffset);
		c2.fillStyle = color2;
		c2.fill();
		c2.closePath();
				
		if (!activities == false) {
			if (activities.types.share > 0) {
				c2.beginPath();
				c2.rect(width-numberrectwidth, height-numberrectheigth, numberrectwidth, numberrectheigth);
				c2.fillStyle = color2;
				c2.fill();
				c2.closePath();

				c2.beginPath();
				c2.textBaseline="top";
				c2.fillStyle = numbercolor;
				c2.textAlign = "center";
				c2.font = numberfont;
				c2.fillText(activities.types.share, width-numberrectwidth/2, height-numberrectheigth+recttextspace);
				c2.textBaseline="bottom";
				c2.font = activitiesfont;
				c2.fillStyle = activitiescolor;
				c2.fillText('Activities', width-numberrectwidth/2, height-recttextspace);
				c2.textBaseline="bottom";
				c2.textAlign = "right";
				c2.font = typefont;
				c2.fillStyle = color2;
				c2.fillText('Sharer', width, height-numberrectheigth-rectactivityspace);
				c2.fill();
				c2.closePath();
			}
		}
		
		//Draw addvalue
		c2.beginPath();
		c2.moveTo(centerX - centeroffset, centerY + centeroffset);
		c2.lineTo(centerX - centeroffset, centerY + centeroffset + smtiData["addvalue"]*graphfactor);
		c2.arc(centerX - centeroffset, centerY + centeroffset, smtiData["addvalue"]*graphfactor, 0.5 * Math.PI, Math.PI, false);
		c2.lineTo(centerX - centeroffset, centerY + centeroffset);
		c2.fillStyle = color3;
		c2.fill();
		c2.closePath();
				
		if (!activities == false) {
			if (activities.types.addvalue > 0) {
				c2.beginPath();
				c2.rect(0, height-numberrectheigth, numberrectwidth, numberrectheigth);
				c2.fillStyle = color3;
				c2.fill();
				c2.closePath();

				c2.beginPath();
				c2.textBaseline="top";
				c2.fillStyle = numbercolor;
				c2.textAlign = "center";
				c2.font = numberfont;
				c2.fillText(activities.types.share, width-numberrectwidth/2, height-numberrectheigth+recttextspace);
				c2.textBaseline="bottom";
				c2.font = activitiesfont;
				c2.fillStyle = activitiescolor;
				c2.fillText('Activities', width-numberrectwidth/2, height-recttextspace);
				c2.textBaseline="bottom";
				c2.textAlign = "right";
				c2.font = typefont;
				c2.fillStyle = color2;
				c2.fillText('Sharer', width, height-numberrectheigth-rectactivityspace);
				c2.fill();
				c2.closePath();




				c2.beginPath();
				c2.textBaseline="top";
				c2.fillStyle = numbercolor;
				c2.textAlign = "center";
				c2.font = numberfont;
				c2.fillText(activities.types.addvalue, numberrectwidth/2, height-numberrectheigth+recttextspace);
				c2.textBaseline="bottom";
				c2.font = activitiesfont;
				c2.fillStyle = activitiescolor;
				c2.fillText('Activities', numberrectwidth/2, height-recttextspace);
				c2.textBaseline="bottom";
				c2.textAlign = "left";
				c2.font = typefont;
				c2.fillStyle = color3;
				c2.fillText('Participator', 0, height-numberrectheigth-rectactivityspace);
				c2.fill();
				c2.closePath();
			}
		}
		
		//Draw produce
		c2.beginPath();
		c2.moveTo(centerX - centeroffset, centerY - centeroffset);
		c2.lineTo(centerX - centeroffset - smtiData["produce"]*graphfactor, centerY - centeroffset);
		c2.arc(centerX - centeroffset, centerY - centeroffset, smtiData["produce"]*graphfactor, Math.PI, 1.5 * Math.PI, false);
		c2.lineTo(centerX - centeroffset, centerY - centeroffset);
		c2.fillStyle = color4;
		c2.fill();
		c2.closePath();
				
		if (!activities == false) {
			if (activities.types.produce > 0) {
				c2.beginPath();
				c2.rect(0, 0, numberrectwidth, numberrectheigth);
				c2.fillStyle = color4;
				c2.fill();
				c2.closePath();

				c2.beginPath();
				c2.textBaseline="top";
				c2.fillStyle = numbercolor;
				c2.textAlign = "center";
				c2.font = numberfont;
				c2.fillText(activities.types.produce, numberrectwidth/2, recttextspace);
				c2.textBaseline="bottom";
				c2.font = activitiesfont;
				c2.fillStyle = activitiescolor;
				c2.fillText('Activities', numberrectwidth/2, numberrectheigth - recttextspace);
				c2.textBaseline="top";
				c2.textAlign = "left";
				c2.font = typefont;
				c2.fillStyle = color4;
				c2.fillText('Creator', 0, numberrectheigth + rectactivityspace);
				c2.fill();
				c2.closePath();
			}
		}
	}
}

/*function showCareerpagesSmti(obj, mediaid, classname, amount) {
	obj.parent().parent().find("#smtiviewall").addClass("careerpagesprofilesmtiviewallgroupdisabled");
	obj.parent().find(".careerpagesprofilesmtiviewer").removeClass("careerpagesprofilesmtivieweractive");
	obj.find(".careerpagesprofilesmtiviewer").addClass("careerpagesprofilesmtivieweractive");

	obj.parent().parent().parent().find(".smtiswitch").hide();
	obj.parent().parent().parent().find(".smtiswitch_"+mediaid).show();
	
	var group = obj.parent().find("#smtioverlay");
	//group.find(".careerpagesprofilesmtioverlayheader").addClass(classname);
	group.find(".careerpagesprofilesmtioverlayamount").html(amount);
	
	var position = obj.position();
	group.css({top: position.top + 30, left: position.left + 4});
	group.show();
}

function hideCareerpagesSmti(obj) {
	obj.parent().find(".careerpagesprofilesmtiviewer").removeClass("careerpagesprofilesmtivieweractive");

	obj.parent().parent().parent().find(".smtiswitch").hide();
	obj.parent().parent().parent().find(".smtiswitch_0").show();
	
	var group = obj.parent().find("#smtioverlay");
	//obj.find(".careerpagesprofilesmtioverlayheader").removeClass().addClass("careerpagesprofilesmtioverlayheader");
	group.find(".careerpagesprofilesmtioverlayamount").html("");
	group.hide();

	obj.parent().parent().find("#smtiviewall").removeClass("careerpagesprofilesmtiviewallgroupdisabled");
}

function showEmbedSmti(obj, mediaid, classname, amount) {
	obj.parent().parent().find("#smtiviewall").addClass("viewembedsmti1viewallgroupdisabled");
	obj.parent().find(".careerpagesprofilesmtiviewer").removeClass("viewembedsmti1vieweractive");
	obj.find(".viewembedsmti1viewer").addClass("viewembedsmti1vieweractive");

	obj.parent().parent().parent().find(".smtiswitch").hide();
	obj.parent().parent().parent().find(".smtiswitch_"+mediaid).show();
	
	var group = obj.parent().find("#smtioverlay");
	group.find(".viewembedsmti1overlayamount").html(amount);
	
	var position = obj.position();
	group.css({top: position.top + 30, left: position.left + 4});
	group.show();
}

function hideEmbedSmti(obj) {
	obj.parent().find(".viewembedsmti1viewer").removeClass("viewembedsmti1vieweractive");

	obj.parent().parent().parent().find(".smtiswitch").hide();
	obj.parent().parent().parent().find(".smtiswitch_0").show();
	
	var group = obj.parent().find("#smtioverlay");
	group.find(".viewembedsmti1overlayamount").html("");
	group.hide();

	obj.parent().parent().find("#smtiviewall").removeClass("viewembedsmti1viewallgroupdisabled");
}


function trigDatepicker(obj) {
    datepickerObj = obj.parent().find(".hasDatepicker");
	if (datepickerObj.datepicker('widget').is(':hidden')) {
        datepickerObj.datepicker("show").datepicker("widget").show();
    }
}*/

// Profile Canvas Graph 1 - Profile completed One circle
function drawProfilesGraph1(parentid, cssprefix, percent, text) {
	if (percent >= 0) {
		var canvas = document.getElementById('canvas_'+parentid);
		if (canvas) canvas.parentNode.removeChild(canvas);
		
		var originalcanvasparent = jQuery("#"+parentid).clone(true);
		jQuery("#"+parentid).show();
		var width = jQuery("#"+parentid).width();
		var height = jQuery("#"+parentid).height();
		if (width > 0 && height > 0) {
			jQuery("#"+parentid).replaceWith(originalcanvasparent);
			var canvasparent = jQuery("#"+parentid);

			var signalcolor = getCanvasCss(canvasparent, cssprefix+'profiles1canvassignalcolor', 'color');
			var neutralcolor = getCanvasCss(canvasparent, cssprefix+'profiles1canvasneutralcolor', 'color');
			var numberfont = getCanvasCss(canvasparent, cssprefix+'profiles1canvasnumber', 'font');
			var numbercolor = getCanvasCss(canvasparent, cssprefix+'profiles1canvasnumber', 'color');
			var numberverticaloffset = parseFloat(getCanvasCss(canvasparent, cssprefix+'profiles1canvasnumber', 'margin'));
			var textfont = getCanvasCss(canvasparent, cssprefix+'profiles1canvastext', 'font');
			var textcolor = getCanvasCss(canvasparent, cssprefix+'profiles1canvastext', 'color');
			var textverticaloffset = parseFloat(getCanvasCss(canvasparent, cssprefix+'profiles1canvastext', 'margin'));
			var roundelthicknesspercent = parseFloat(getCanvasCss(canvasparent, cssprefix+'profiles1canvasroundelthicknesspercent', 'line-height'));
			var outerradius = height > width ? width / 2 : height / 2;
			var innerradius = outerradius - outerradius * roundelthicknesspercent;

			canvasparent.append('<canvas id="canvas_'+parentid+'" height="'+height+'" width="'+width+'"></canvas>');
			
			canvas = document.getElementById("canvas_"+parentid);
			var c2 = canvas.getContext('2d');
			
			var currentangle = -Math.PI / 2;
			var centerX = width / 2;
			var centerY = height / 2;

			// Signal arc
			diffangle = 2 * Math.PI * percent / 100;
			c2.beginPath();
			c2.moveTo(centerX + innerradius * Math.cos(currentangle), centerY + innerradius * Math.sin(currentangle));
			c2.lineTo(centerX + outerradius * Math.cos(currentangle), centerY + outerradius * Math.sin(currentangle));
			c2.arc(centerX, centerY, outerradius, currentangle, currentangle + diffangle, false);
			c2.lineTo(centerX + innerradius * Math.cos(currentangle + diffangle), centerY + innerradius * Math.sin(currentangle + diffangle));
			c2.arc(centerX, centerY, innerradius, currentangle + diffangle, currentangle, true);
			c2.fillStyle = signalcolor;
			c2.fill();
			c2.closePath();
			currentangle += diffangle;
			// Neutral arc
			diffangle = 2 * Math.PI - diffangle;
			c2.beginPath();
			c2.moveTo(centerX + innerradius * Math.cos(currentangle), centerY + innerradius * Math.sin(currentangle));
			c2.lineTo(centerX + outerradius * Math.cos(currentangle), centerY + outerradius * Math.sin(currentangle));
			c2.arc(centerX, centerY, outerradius, currentangle, currentangle + diffangle, false);
			c2.lineTo(centerX + innerradius * Math.cos(currentangle + diffangle), centerY + innerradius * Math.sin(currentangle + diffangle));
			c2.arc(centerX, centerY, innerradius, currentangle + diffangle, currentangle, true);
			c2.fillStyle = neutralcolor;
			c2.fill();
			c2.closePath();
			// Number
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = numbercolor;
			c2.textAlign = "center";
			c2.font = numberfont;
			console.log("number Y: "+(centerY + numberverticaloffset));
			c2.fillText((percent)+'%', centerX, centerY + numberverticaloffset);
			c2.fill();
			c2.closePath();
			// Text
			c2.beginPath();
			c2.textBaseline="middle";
			c2.fillStyle = textcolor;
			c2.textAlign = "center";
			c2.font = textfont;
			console.log("text Y: "+(centerY + textverticaloffset));
			c2.fillText(text, centerX, centerY + textverticaloffset);
			c2.fill();
			c2.closePath();
		}
	}
}

function tabCanvasRefresh(tab, identifier, refresh) {
	if (tab === null) {
		if (jQuery("#canvas_"+identifier).length === 0) {
			jQuery("#"+identifier).each(function(){
				eval(refresh);
			});
		}
	} else {
		if (tab.find("#"+identifier).length) {
			tab.find("#"+identifier).each(function(){
				eval(refresh);
			});
		}
	}
}

function getCanvasCss(canvasparent, classname, property) {
	var value = null;

	var identifier = randomStringOfLetters(14);
	canvasparent.append('<input id="'+identifier+'" class="'+classname+'" type="hidden"></input>'); 
	var element = document.getElementById(identifier);
	
	if (document.defaultView && document.defaultView.getComputedStyle) {
		var style = document.defaultView.getComputedStyle(element,null);
		value = style.getPropertyValue(property);
	} else if (element.currentStyle) {
		for (var exp=/-([a-z])/; exp.test(property); property = property.replace(exp,RegExp.$1.toUpperCase()));
		value = property;
	}
	var tempelement = document.getElementById(identifier);
	element.parentNode.removeChild(tempelement);

	return value;
}

function randomStringOfLetters(length) {
	var chars = 'abcdefghijklmnopqrstuvwxyz';
	
	var str = '';
	for (var i = length; i > 0; --i) str += chars[Math.round(Math.random() * (chars.length - 1))];
		
	return str;
}

function loadCanvasimages(sources, callback) {
	var images = {};
	var loadedImages = 0;
	var numImages = 0;
	
	// get num of sources
	for(var src in sources) {
		numImages++;
	}
	
	for(var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {callback(images);}
		};
	
		images[src].src = sources[src];
	}
}

function wrapCanvasText(canvasObj, text, maxWidth) {
	var words = text.split(' '),
		lines = [],
		line = "";
	if (canvasObj.measureText(text).width < maxWidth) {
		return [text];
	}
	while (words.length > 0) {
		while (canvasObj.measureText(words[0]).width >= maxWidth) {
			var tmp = words[0];
			words[0] = tmp.slice(0, -1);
			if (words.length > 1) {
				words[1] = tmp.slice(-1) + words[1];
			} else {
				words.push(tmp.slice(-1));
			}
		}
		if (canvasObj.measureText(line + words[0]).width < maxWidth) {
			line += words.shift() + " ";
		} else {
			lines.push(line);
			line = "";
		}
		if (words.length === 0) {
			lines.push(line);
		}
	}
	return lines;
}

function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object", 
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }

    return false;
};


///// Opens the progress layer
function showContentProgressLayer() {
	$("div#contentprogresslayer .contentprogresslayerbody .contentprogresslayerprogress").html();
 	$("div#contentprogresslayer").show();
	$("#contentprogresslayerprogressbar").width($("div#contentwidgetprogressouter").width() - $("div#contentprogresslayer .contentprogresslayerbody").width() - 34);
	$("#contentprogresslayerprogressbar")
}

///// Closes the edit layer
function closeContentProgressLayer() {
	$("div#contentprogresslayer .contentprogresslayerbody .contentprogresslayerprogress").html("");
	$("div#contentprogresslayer").hide();
}
