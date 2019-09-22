function init() {

    var players = document.querySelectorAll("video");
    players[0].remove();
    var player = players[players.length - 1];
    $(player).css('visibility', 'visible');

    var party = new WatchParty();
    
    party.on('open', (id) => {
        // Set share URL
        var share = new URL(window.location.href)
        share.searchParams.append('watchParty', id)
        share.searchParams.append('autoplay', 1);
        party.shareUrl = share.href;
    })


    function registerEvents() {
        $("video").off();
        $("video")
            .on("play", (e) => {
                party.sendMessage({
                    command: 'play'
                })
            })
            .on("pause", (e) => {
                party.sendMessage({
                    command: 'pause'
                })
            })
            .on("seeked", (e) => {
                party.sendMessage({
                    command: 'seeked',
                    currentTime: player.currentTime
                })
            })
    }

    party.onReceive = (data) => {
        $("video").off();
        switch (data.command) {
            case "update":
                party.notify('Connected', 'Connected to ' + data.sender)
                player.currentTime = data.currentTime;
                if (data.paused) {
                    $(player).trigger('pause');
                } else {
                    $(player).trigger('play');
                }
                break;
            case "play":
                $(player).trigger('play');
                party.notify('Resumed', data.sender + ' resumed the video.')
                break;
            case "pause":
                $(player).trigger('pause');
                party.notify('Paused', data.sender + ' paused the video.')
                break;
            case "seeked":
                player.currentTime = data.currentTime;
                party.notify('Changed time', data.sender + ' moved to ' + data.currentTime)
                break;
        }
        $("video").on('canplaythrough', registerEvents)
        setTimeout(registerEvents, 1000)    
    }

    party.onClientConnect = (id) => {
        party.sendMessage({
            command: 'update',
            paused: player.paused,
            currentTime: player.currentTime
        })
        notify('Connected', id + ' is connected.')
    }

    registerEvents();
}

// Wait for video player to show up
const check = setInterval(() => {
    console.log('Checking player');
    if (document.querySelector('.dv-player-fullscreen') !== null && document.querySelectorAll('video').length > 1){
        console.log('Player found');
        console.log($(".dv-player-fullscreen"))
        clearInterval(check)
        init();
    }
}, 500)