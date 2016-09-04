(function() {
    MediaElementPlayer.prototype.autosrt = function() {
        if(!packaged_app)
            return;
        
        var t = this,
            entries = [],
            dirs = [];
        
        t.media.addEventListener('loadeddata', function() {
            if(t.openedFileEntry == null) {
                return;
            }
            // TODO avoid to search the srt if ona has been alreade specified by the user
            
            chrome.fileSystem.getDisplayPath(t.openedFileEntry, function(path) {
                var dirEntry = null,
                    subPath = "";
                
                for(var i = 0; i < dirs.length; i++) {
                    var dir = dirs[i];
                    if(path.indexOf(dir.path) != 0)
                        continue;
                        
                    dirEntry = dir.entry;
                    subPath = path.substr(dir.path.length);
                }
                if(dirEntry == null)
                    return;
                    
                subPath = subPath.substr(1, subPath.lastIndexOf(".") - 1);
                dirEntry.getFile(subPath + ".srt", {}, function(fileEntry) {
                    fileEntry.file(function(file) {
                        t.openSrtEntry(file);
                    });
                });
            });
        });
        
        var settingsList = $('#settings_list');
        $('<li/>')
            .appendTo(settingsList)
            .append($('<label style="width:250px; float:left;">Enable auto-srt</label>'))
            .append($('<button id="allowedAutoSrtButton" style="width:100px">Select Folder</button>'));
            
        $('#allowedAutoSrtButton').on('click', function() {
            chrome.fileSystem.chooseEntry({
                type: "openDirectory"
            }, function(entry) {
                chrome.fileSystem.getDisplayPath(entry, function(path) {
                    $('#allowedAutoSrtButton').text(path);
                    var retainId = chrome.fileSystem.retainEntry(entry);
                    
                    dirs = [];
                    entries = [];
                    
                    dirs.push({
                        path: path,
                        entry: entry,
                    });
                    entries.push(retainId);
                    
                    mejs.Utility.setIntoSettings('autoSrtEntries', entries);
                });
            });
        });
        
        mejs.Utility.getFromSettings('autoSrtEntries', [], function(entries) {
            for(var i = 0; i < entries.length; i++) {
                chrome.fileSystem.restoreEntry(entries[i], function(entry) {
                    chrome.fileSystem.getDisplayPath(entry, function(path) {
                        $('#allowedAutoSrtButton').text(path);
                        
                        dirs = [];
                        
                        dirs.push({
                            path: path,
                            entry: entry,
                        });
                    });
                });
            }
        });
    }
})();