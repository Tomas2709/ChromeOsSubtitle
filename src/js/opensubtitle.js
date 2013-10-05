function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 1024;

    function charCodeFromCharacter(c) {
        return c.charCodeAt(0);
    }

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = Array.prototype.map.call(slice, charCodeFromCharacter);
        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

(function($) {
    $.extend(MediaElementPlayer.prototype, {
	buildopensubtitle: function(player, controls, layers, media) {
	    var 
	    t = this;

	    var service = new rpc.ServiceProxy("http://api.opensubtitles.org/xml-rpc", {
		sanitize: false,
		protocol: "XML-RPC",
		asynchronous: true,
		methods: ["ServerInfo", "LogIn", "SearchSubtitles", "DownloadSubtitles"]
	    });
	    t.opensubtitleService = {token:null, service:service};
	    


	    var prec = $('#li_encoding');
	    $('<li class="mejs-captionload"/>')
		.append($('<input type="radio" name="' + player.id + '_captions" id="' + player.id + '_opensubtitle_enabled" value="opensubtitle" disabled="disabled"/>'))
		.append($('<div id="opensubtitle_button" class="mejs-button  mejs-captionload" > <button type="button" aria-controls="' + t.id + '" title="' + mejs.i18n.t('Download from opensubtitle.org...') + '" aria-label="' + mejs.i18n.t('Download from opensubtitle.org...') + '"></button></div>'))
		.append($('<label id="label_opensubtitle" style="padding: 0px 0px 0px 0px;text-overflow: ellipsis;width: 105px;height: 18px;overflow: hidden;white-space: nowrap;left:60px;position:absolute;">No subtitle</label>'))
		.insertBefore(prec);

	    function info(text) {
		$('#label_opensubtitle')[0].textContent=text;
	    };

	    function openSubtitle(content, sub) {
		info("Opening...");
		var blob = b64toBlob(content, "text/plain");
		zip.createReader(new zip.BlobReader(blob),function(reader) {
		    reader.gunzip(new zip.BlobWriter(), function(data){
			info(sub.SubFileName);
			$('#encoding-selector').val("UTF-8");
			t.tracks = [];
			t.tracks.push({
			    srclang: 'enabled',
			    file: data,
			    kind: 'subtitles',
			    label: 'Enabled',
			    entries: [],
			    isLoaded: false
			});
			t.tracks[0].file = data;
			t.tracks[0].isLoaded = false;
			t.loadTrack(0);
		    });
		});
	    }

	    function downloadSubtitle(sub) {
		info("Downloading...");
		service.DownloadSubtitles({
		    params: [t.opensubtitleService.token, [
			sub.IDSubtitleFile
		    ]],
		    onException:function(errorObj){
			info("Download failed...");
		    },
		    onComplete:function(responseObj){
			var content = responseObj.result.data[0].data;
			openSubtitle(content, sub);
		    }
		});
	    }

	    function searchSubtitle() {
		info("Searching...");
		service.SearchSubtitles({
		    params: [t.opensubtitleService.token, [
			{query: t.openedFile.name,
			 sublanguageid: "eng"}
		    ], {limit:100}],
		    onException:function(errorObj){
			info("Search failed");
		    },
		    onComplete:function(responseObj){
			// Check that at leat a subtitle has been found
			downloadSubtitle(responseObj.result.data[0]);
		    }
		});
	    };

	    function logIn() {
		info("Authenticating...");
		service.LogIn({
		    params: ["", "", "", "ChromeSubtitleVideoplayer"],
		    onException:function(errorObj){
			info("Authentiation failed");
		    },
		    onComplete:function(responseObj){
			t.opensubtitleService.token = responseObj.result.token;
			searchSubtitle();
		    }
		});
	    };

	    $('#opensubtitle_button').click(function (e) {
		logIn();
	    });
	}
    });
})(mejs.$);

