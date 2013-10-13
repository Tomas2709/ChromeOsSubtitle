var myURL = window.URL || window.webkitURL;

var packaged_app = (window.location.origin.indexOf("chrome-extension") == 0);

MediaElementPlayer.prototype.buildsubsize = function(player, controls, layers, media) {
    var captionSelector = player.captionsButton.find('.mejs-captions-selector');
    var
    t = this;

    function updateCaptionSize(value) {
	$('.mejs-captions-layer').css({
	    "line-height":function( index, oldValue ) {
		return value + "px";
	    },
	    "font-size":function( index, oldValue ) {
		return value + "px";
	    }
	});
    };

    var value =
	$('<input style="background-color: transparent; width: 41px; color: white; font-size: 10px;clear: none; margin:0px 0px 0px 0px;"></input>').
	on('input',function(e){
	    updateCaptionSize(Number(t.capSizeInput.value));
	});


    t.capSizeInput = value[0];

    // create the buttons
    var dec =
        $('<div class="mejs-button mejs-reduce-button mejs-reduce" >' +
	  '<button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('Decrease caption size') + '" aria-label="' + mejs.i18n.t('Decrease caption size') + '"></button>' +  '</div>')
	.click(function() {
	    t.capSizeInput.value = (Number(t.capSizeInput.value) / 1.2).toFixed(0);
	    updateCaptionSize(Number(t.capSizeInput.value));
	}); 
    var inc = 
	$('<div class="mejs-button mejs-increase-button mejs-increase" >' +
	  '<button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('Increase caption size') + '" aria-label="' + mejs.i18n.t('Increase caption size') + '"></button>' +  '</div>')
	.click(function() {
	    t.capSizeInput.value = (Number(t.capSizeInput.value) * 1.2).toFixed(0);
	    updateCaptionSize(Number(t.capSizeInput.value));
	});  

    var line =
	$('<li class="mejs-captionsize"></li>')
	.append($('<label style="width:74px;float: left;padding: 0px 0px 0px 5px;">Caption size</label>'))
	.append(dec)
	.append(value)
	.append(inc);
    captionSelector.find('ul').append(line);

    var settingsList = $('#settings_list')[0];
    $('<li/>')
    	.appendTo(settingsList)
    	.append($('<label style="width:250px; float:left;">Default subtitle font size</label>'))
    	.append($('<input id="defaultSubSize" style="width:100px;background-color: transparent; color: white;"/>'));

    t.capSizeInput.value = 22;
    updateCaptionSize(Number(t.capSizeInput.value));
    chrome.storage.sync.get({'default_sub_size': 22}, function(obj) {
	t.capSizeInput.value = obj['default_sub_size'];
	$("#defaultSubSize")[0].value = obj['default_sub_size'];
	updateCaptionSize(Number(t.capSizeInput.value));
    });

    $(document).bind("settingsClosed", function() { 
	var defaultValue = $("#defaultSubSize")[0].value;
	chrome.storage.sync.set({
	    'default_sub_size': defaultValue
	}, function(obj) {
	});
    });
};


MediaElementPlayer.prototype.buildsubdelay = function(player, controls, layers, media) {
    var captionSelector = player.captionsButton.find('.mejs-captions-selector');
    var
    t = this;
    var value =
	$('<input style="background-color: transparent; width: 41px; color: white; font-size: 10px;clear: none; margin:0px 0px 0px 0px;"></input>').
	on('input',function(e){
	    t.capDelayValue = Number(t.capDelayInput.value);
	}
	);

    t.capDelayInput = value[0];
    t.capDelayInput.value = 0;

    // create the buttons
    var dec =
        $('<div class="mejs-button mejs-reduce-button mejs-reduce" >' +
	  '<button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('Decrease caption delay') + '" aria-label="' + mejs.i18n.t('Decrease caption delay') + '"></button>' +  '</div>')
	.click(function() {
	    t.capDelayInput.value = (Number(t.capDelayInput.value) - 0.1).toFixed(1);
	    t.capDelayValue = Number(t.capDelayInput.value);
	}); 
    var inc = 
	$('<div class="mejs-button mejs-increase-button mejs-increase" >' +
	  '<button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('Increase caption delay') + '" aria-label="' + mejs.i18n.t('Increase caption delay') + '"></button>' +  '</div>')
	.click(function() {
	    t.capDelayInput.value = (Number(t.capDelayInput.value) + 0.1).toFixed(1);
	    t.capDelayValue = Number(t.capDelayInput.value);
	});

    var line =
	$('<li class="mejs-captionsize"></li>')
	.append($('<label style="width:74px;float: left;padding: 0px 0px 0px 5px;">Caption delay</label>'))
	.append(dec)
	.append(value)
	.append(inc);
    captionSelector.find('ul').append(line);

    media.addEventListener('loadeddata',function() {
	t.capDelayInput.value = 0;
	t.capDelayValue = 0;
    });

};


(function($) {
    $.extend(MediaElementPlayer.prototype, {
	buildsource: function(player, controls, layers, media) {
	    var 
	    t = this,
	    openFileInput = $('<input style="display:none" type="file" id="openfile_input"/>')
		.appendTo(controls);
	    t.openedFile = null;
	    var open  = 
		$('<div class="mejs-button mejs-source-button mejs-source" >' +
		  '<button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('Open video...') + '" aria-label="' + mejs.i18n.t('Open video...') + '"></button>' +
		  '</div>')
		.appendTo(controls);
	    open.click(function(e) {
		e.preventDefault();
		openFileInput[0].click();
		return false;
	    });
	    openFileInput.change(function (e) {
		mainMediaElement.stop();
		player.tracks = [];
		var path = window.URL.createObjectURL(openFileInput[0].files[0]);
		t.openedFile = openFileInput[0].files[0];
		mainMediaElement.setSrc(path);
		return false;
	    });
	}
    });
})(mejs.$);


(function($) {
    $.extend(MediaElementPlayer.prototype, {
	builddrop: function(player, controls, layers, media) {
	    var 
	    t = this;
	    document.body.addEventListener('dragover', function(e) {
		e.preventDefault();
		e.stopPropagation();
	    }, false);
	    document.body.addEventListener('dragleave', function(e) {
		e.preventDefault();
	    }, false);
	    document.body.addEventListener('drop', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var draggedVideo = null;
		var draggedSrt = null;
		if (e.dataTransfer.types.indexOf('Files') >= 0) {
		    var files = e.dataTransfer.files;
		    for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if (file.type.indexOf("video") >= 0)
			    draggedVideo = file;
			else if (file.type.indexOf("subrip") >= 0)
			    draggedSrt = file;
			else if (file.type.indexOf("application/zip") >= 0)
			    draggedSrt = file;
		    }
		}
		if (draggedVideo != null) {
		    mainMediaElement.stop();
		    t.openedFile = draggedVideo;

		    var path = window.URL.createObjectURL(draggedVideo);
		    mainMediaElement.setSrc(path);
		}
		player.tracks = [];
		if (draggedSrt != null) {
		    player.openSrtEntry(draggedSrt);
		}
	    }, false);
	}
    });
})(mejs.$);


(function($) {
    $.extend(MediaElementPlayer.prototype, {
	buildinfo: function(player, controls, layers, media) {
	    var 
	    t = this;
	    var infoText = 
		'<div class="me-window" style="color:#fff;margin: auto;position: absolute;top: 0; left: 0; bottom: 0; right: 0;width:650px;display: table; height: auto;background: url(background.png);background: rgba(50,50,50,0.7);border: solid 1px transparent;padding: 10px;overflow: hidden;-webkit-border-radius: 0;-moz-border-radius: 0;border-radius: 0;font-size: 16px;visibility: hidden;"><img src="icon.png" style="width:80px;height: auto;"/>'+
		    '<h2>Subtitle Videoplayer v1.5.0</h2>' +
		'A small Chrome video player that supports external subtitles. Plase visit our project <a href="https://github.com/guancio/ChromeOsSubtitle">home page</a>.<br><br>';
	    if (!packaged_app) {
		infoText = infoText +
		    'Plase install the <a href="https://chrome.google.com/webstore/detail/subtitle-videoplayer/naikohapihpbhficdpbddmgbhiccijca?hl=en-GB" target="_blank">packaged app</a> version of this application, that also integrate with opensubtitles.org<br><br>'; 
	    }

	    infoText = infoText +
		'This software is possible thanks to several open source projects:<ul>'+
		'<li>The main madia player component is a fork of <a id="link_mediaelement" href="http://mediaelementjs.com/">MediaelEment.js</a>, developed by John Dyer</li>'+
		'<li>Zip files are opened using <a href="http://gildas-lormeau.github.io/zip.js/" target="_blank">zip.js</a></li>';
	    if (packaged_app) { 
		infoText = infoText + '<li>Subtitles service powered by <a href="http://www.OpenSubtitles.org" target="_blank">www.OpenSubtitles.org</a>. More uploaded subs means more subs available. Please opload <a href="http://www.opensubtitles.org/upload" target="_blank">here</a> jour subs.<br/><a href="http://www.OpenSubtitles.org" target="_blank"><img src="opensubtitle.gif"/></a></li>';
	    }
	    infoText = infoText + '</ul>[Click the box to close the info window]</div>'

	    var info = $(infoText
	    ).appendTo(controls[0].parentElement);

	    info.find("a").click(function (e) {
		window.open(this.href,'_blank');
		event.stopPropagation();
		return false;
	    });

	    function hideInfo(e) {
		info.css('visibility','hidden');
		if (player.media.paused)
		    $(".mejs-overlay-play").show();
		
		e.preventDefault();
		e.stopPropagation();
		player.container.off("click", hideInfo);
		return false;
	    }

	    t.openInfoWindow = function() {
		$('.me-window').css('visibility','hidden');
		info.css('visibility','visible');
		$(".mejs-overlay-play").hide();
		player.container.click(hideInfo);
	    };

	    var open  = 
		$('<div class="mejs-button mejs-info-button mejs-info" >' +
		  '<button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('About...') + '" aria-label="' + mejs.i18n.t('About...') + '"></button>' +
		  '</div>')
		.appendTo(controls)
		.click(function(e) {
		    e.preventDefault();
		    t.openInfoWindow();
		    return false;
		});
	}
    });
})(mejs.$);


var myURL = window.URL || window.webkitURL;

var mainMediaElement = null;

// $('#main').append('<video width="1024" height="590" id="player" controls="controls"></video>');
$('#main').append('<video id="player" controls="controls"></video>');

var features = ['source', 'settings','playpause','progress','current','duration', 'tracks','subdelay', 'subsize', 'volume', 'info', 'settingsbutton', 'fullscreen', 'drop'];
    if (packaged_app)
	features.push('opensubtitle');

$('#player').mediaelementplayer({
    startLanguage:'en',
    isVideo:true,
    hideCaptionsButtonWhenEmpty:false,
    mode:"native",
    features: features,
    success: function (mediaElement, domObject) { 
	mainMediaElement = mediaElement;

	mainMediaElement.player.container
	    .addClass('mejs-container-fullscreen');
	mainMediaElement.player.container
	    .width('100%')
	    .height('100%');

	var t = mainMediaElement.player;
	if (mainMediaElement.player.pluginType === 'native') {
	    t.$media
		.width('100%')
		.height('100%');
	} else {
	    t.container.find('.mejs-shim')
		.width('100%')
		.height('100%');
	    
	    //if (!mejs.MediaFeatures.hasTrueNativeFullScreen) {
	    t.media.setVideoSize($(window).width(),$(window).height());
	    //}
	}

	t.layers.children('div')
	    .width('100%')
	    .height('100%');

	t.setControlsSize();


	function openCmdLineVideo() {
	    if (!window.launchData)
		return false;
	    if (!window.launchData.items)
		return false;
	    if (window.launchData.items.length != 1)
		return false;
	    entry = window.launchData.items[0].entry;
	    if (entry == null)
		return false;

	    mainMediaElement.stop();
	    entry.file(function fff(file) {
		mainMediaElement.openedFile = file;

		var path = window.URL.createObjectURL(file);
		mainMediaElement.setSrc(path);
		mainMediaElement.play();
	    });
	    return true;
	}

	if (!openCmdLineVideo())
	    mediaElement.player.openInfoWindow();

    }
});
