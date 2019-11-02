// Get the hash of the url
const hash = window.location.hash
	.substring(1)
	.split('&')
	.reduce(function (initial, item) {
		if (item) {
			var parts = item.split('=');
			initial[parts[0]] = decodeURIComponent(parts[1]);
		}
		return initial;
	}, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = 'a849780120da40858eb69f1d05db25e8';
const redirectUri = 'https://www.08oz.com';
const scopes = [
	'streaming',
	/*'user-read-birthdate',*/
	'user-read-private',
	/*'user-modify-playback-state'*/
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
	window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

// Set up the Web Playback SDK

window.onSpotifyPlayerAPIReady = () => {
	const player = new Spotify.Player({
		name: 'Random Song Generator',
		getOAuthToken: cb => {
			cb(_token);
		}
	});


	// Error handling
	player.on('initialization_error', e => console.error(e));
	player.on('authentication_error', e => console.error(e));
	player.on('account_error', e => console.error(e));
	player.on('playback_error', e => console.error(e));

	// Playback status updates
	player.on('player_state_changed', state => {
		console.log(state)
		$('#current-track').attr('src', state.track_window.current_track.album.images[0].url);

		// call data to get duration time and convert it from milliseconds to minutes/seconds
		const ms = state.track_window.current_track.duration_ms
		const min = Math.floor((ms / 1000 / 60) << 0)
		const sec = Math.floor((ms / 1000) % 60)

		// I am calling the variables above to show the total length of the song, in minutes and seconds
		$('#current-track-duration').text("Song Duration: " + min + " minutes, " + sec + " seconds");

		//Set variables for the artist name and song name, then call them up into the html div labeled #current-track-name
		const artistName = state.track_window.current_track.album.name
		const songName = state.track_window.current_track.artists[0].name

		// I am calling the variables above to display the artist details
		$('#current-track-name').text('Song: ' + songName +  ' - ' + ' Artist: ' + artistName);

		//Change page title to be the current songs details (Artist/Song name)
		$(document).prop('title', songName + ' - ' + artistName)
		

	});

	// Ready
	player.on('ready', data => {
		console.log('Ready with Device ID', data.device_id);

		// Play a track using our new device ID
		play(data.device_id);

		// Even though I set up page title above that only works on click, so re-using the function on player ready
		$(document).prop('title', songName + '-' + artistName);
		
	});


	// Connect to the player!
	player.connect();



	//Here is where I start some of the basic player button functionality
	// This function enables the play/pause buttons to work, and also re-calls the function to change svg images on hover 
	$('#playPause').on('click', function () {
		if ($(this).attr('data-click-state') == 1) {
			$(this).attr('data-click-state', 0)
			player.resume()
			$('#playPause').html('<img class="playBtn" src="img/playBtn.svg" data-alt-src="img/playBtnPink.svg" />');
			$(function () {
				$('img.playBtn').hover(sourceSwapBackward, sourceSwapBackward)
			})
		} else {
			$(this).attr('data-click-state', 1)
			player.pause()
			$('#playPause').html('<img class="pauseBtn" src="img/pauseBtn.svg" data-alt-src="img/pauseBtnPink.svg" />');
			$(function () {
				$('img.pauseBtn').hover(sourceSwapBackward, sourceSwapBackward)
			})
		}

	});


	// This is the same setup as the play/pause button, but to lower or raise the volume, and swap volume buttons
	$('#volSettings').on('click', function () {
		if ($(this).attr('data-click-state') == 1) {
			player.setVolume(1.0).then(() => {
				$(this).attr('data-click-state', 0)
					//console.log('Volume raised!');
				$('#volSettings').html('<img class="volHighBtn" src="img/volHighBtn.svg" data-alt-src="img/volHighBtnPink.svg"/>');
			});
			$(function () {
				$('img.volHighBtn').hover(sourceSwapBackward, sourceSwapBackward)
			});
		} else {
			player.setVolume(0.25).then(() => {
				$(this).attr('data-click-state', 1)
					//console.log('Volume lowered!');
				$('#volSettings').html('<img class="volLowBtn" src="img/volLowBtn.svg" data-alt-src="img/volLowBtnPink.svg"/>');
			});
			$(function () {
				$('img.volLowBtn').hover(sourceSwapBackward, sourceSwapBackward)
			});
		}

	});


	// Previous Track Link

	$('#previous').on('click', function () {
		//play previous track on click
		player.previousTrack()
			// Have to reset plat button if paused
		$(this).attr('data-click-state', 1)
		$('#playPause').html('<img class="playBtn" src="img/playBtn.svg" data-alt-src="img/playBtnPink.svg" />');
			$(function () {
				$('img.playBtn').hover(sourceSwapBackward, sourceSwapBackward)
			})
	});


	//Next Track Link

	$('#next').on('click', function () {
		//play next track on click
		player.nextTrack()
			// Have to reset plat button if paused
		$(this).attr('data-click-state', 1)
		$('#playPause').html('<img class="playBtn" src="img/playBtn.svg" data-alt-src="img/playBtnPink.svg" />');
			$(function () {
				$('img.playBtn').hover(sourceSwapBackward, sourceSwapBackward)
			})

	});


	//Mute functionality (not actively using this right now)
	$('#mute').on('click', function () {
		//play next track on click
		player.mute()
			//console.log('mute pressed')

	});


}

// Play a specified track on the Web Playback SDK's device ID using this array of spotify song urls
function play(device_id) {
	$.ajax({
		url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
		type: "PUT",
		data: '{"uris": ["spotify:track:0OlltePKpgAgOB1SLmfLIE", "spotify:track:1xDRRWdTWa9Kfw30TSnS0k", "spotify:track:3ZEyIY5i9m86hJjF14UqvV", "spotify:track:2pywFDuStEktzyQtgrz824", "spotify:track:43ANX85GD3oGEeEiZoRuad", "spotify:track:6h0lPemYPFD5r7iIlDMJHV", "spotify:track:1wd6OiAJ7KTjvEIYSmuRbx", "spotify:track:48Ix9jFvEkgsRmsy08p1Za", "spotify:track:0kVBYGIxVy9I7AhF6uIjke", "spotify:track:4k7s9xDLvgksWo2p5IPhL0"]}',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
		},
		success: function (data) {
			console.log(data)
		}
	});
}

//Control Button Swaps
//Back button Swap
let sourceSwapBackward = function () {
	var $this = $(this);
	var newSource = $this.data('alt-src');
	$this.data('alt-src', $this.attr('src'));
	$this.attr('src', newSource);
}

//Pause button swap on hover
$(function () {
	$('img.playBtn').hover(sourceSwapBackward, sourceSwapBackward);
})

//Play button swap on hover
$(function () {
	$('img.pauseBtn').hover(sourceSwapBackward, sourceSwapBackward);
})

//Back button swap on hover
$(function () {
	$('img.backwardBtn').hover(sourceSwapBackward, sourceSwapBackward);
})

//Forward button swap on hover
$(function () {
	$('img.forwardBtn').hover(sourceSwapBackward, sourceSwapBackward);
})

//Back button swap on hover
$(function () {
	$('img.volHighBtn').hover(sourceSwapBackward, sourceSwapBackward);
})

//Back button swap on hover
$(function () {
	$('img.volLowBtn').hover(sourceSwapBackward, sourceSwapBackward);
})
