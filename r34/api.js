hideStuff();
submitPost();

function hideStuff() {
	document.getElementById("errDisplay").style.display = "none";
	document.getElementById("display").style.display = "none";
}

async function submitPost() {
	const input = document.getElementById("url").value;
	const defaultUrl = "https://rule34.xxx/index.php?page=post&s=view&id=";
	const outputId = input.startsWith(defaultUrl) ? input.slice(defaultUrl.length) : input;
	
	getData(outputId);
}

async function getData(inputId) {
	// create api link
	const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&fields=tag_info&id=";
	let hashId = location.hash.substring(1);
	hashId = /^\d+$/.test(hashId) ? hashId : null;
	const id = inputId || hashId || "5823623";
	location.hash = "#" + id;
	url = apiUrl + id;
	
	// fetch and handle api content
	try {
		response = await fetch(url);
		console.log("got api info");
	} catch (e) {
		let msg = "Couldn't fetch from: "+url;
		let hide = true;
		displayError(e, msg, hide);
		return;
	}
	const jsonInfo = await response.json();
	post = jsonInfo[0];

	artists = getTags(post[tag_info]); // display extra tag info and get artist tags as string

	displayMedia(post[file_url]); // display media
	/* display sample file if it exists:
	 * displayMedia(post[sample] ? post[sample_url] : post[file_url]);
	 * (not useful because image is resized to fit screen regardless) */
	/// videos don't work on firefox; fix this somehow!!!

	setButtons(); // set all buttons
	
	displayRaw(document.getElementById("raw"), jsonInfo); // display raw json info
	
	// reveal everything
	showStuff();
}

function getTags(tags) {
	const ulElement = {
		copyright: document.getElementById("tagCopyright"),
		character: document.getElementById("tagCharacter"),
		artist: document.getElementById("tagArtist"),
		tag: document.getElementById("tagGeneral"),
		meta: document.getElementById("tagMeta")
	};

	for (const list in ulElement) {
		ulElement[list].innerHTML = "";
	}

	let artists;
	let artistCount = false;
	for (let tagNumber of tags) {
		const element = ulElement[tags[tagNumber].type];
		if (element) {
			element.innerHTML +=
				`<a
					href="https://rule34.xxx/index.php?page=post&s=list&tags=${tags[tagNumber].tag}"
					title="${tags[tagNumber].count} uses"
				><li>${tags[tagNumber].tag}</li></a>`;
		}
		if (element === "artist") {
			if (artists === false) {
				artists += `${tags[tagNumber].tag} (${tags[tagNumber].count})`;
				artistCount = true;
			} else {
				artists += `, ${tags[tagNumber].tag} (${tags[tagNumber].count})`;
			}
		}
	}
}

function displayMedia(mediaUrl) {
	const container = document.getElementById('imageDisplay');
	container.innerHTML = '';

	const extension = mediaUrl.split('.').pop().toLowerCase();
	console.debug("media extension is ."+extension);
	const imageExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
	const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'avi'];


	if (imageExt.includes(extension)) {
		console.debug("media is assumed an image");
		const img = document.createElement('img');
		img.src = mediaUrl;
		img.alt = post.file;
		container.appendChild(img);
	} else if (videoExt.includes(extension)) {
		console.debug("media is assumed a video");
		const video = document.createElement('video');
		video.src = mediaUrl;
		video.controls = true;
		video.autoplay = false;
		video.loop = true;
		video.muted = false;
		container.appendChild(video);
	} else {
		console.warning("media is assumed neither an image or a video\nfalling back to error button");
		const link = document.createElement('a');
		link.style.borderStyle = "none";
		link.href = 'https://discord.com/users/1184619891215573042';
		link.innerHTML = '<div class="button">Invalid format. Contact @chipfucker on Discord if this is erroneous--which it likely is.</div>';
		link.firstChild.style.whiteSpace = "wrap";
		container.appendChild(link);
	}
}

function setButtons() {
	setOpenMedia(post[file_url]); // set open media link
	setCopyMedia(post[file_url]); // set copy media link
	setDownloadLink(post[file_url]); // set download media link
	setSpecialDownloadLink(post[file_url], post[id], artists); // set special download media link and name
	setOpenPost(post[id]); // set open original post link

	function setOpenMedia(url) {
	}

	function setCopyMedia(url) {
	}
	
	function setDownloadLink(url) {
		link = document.getElementById("downloadLink");
		link.href = url;
		link.download = "";
	}
	
	function setSpecialDownloadLink(url, id, artists) {
		link = document.getElementById("downloadLink");
		link.href = url;
		link.download = `${artists} r${id}`;
	}
	
	function setOpenPost(id) {
	}
}

function copyLink() {
	let element = document.getElementById("copyLink").firstChild;
	let share = element.innerHTML;
	let success =
		`<svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z">
            </path>
        </svg>
		<span>Copied</span>`;
	let failure =
		`<svg width="24" height="24" viewBox="0 0 24 24">
		</svg>
		<span>Failed!</span>`;

	console.debug("Copying location");
	try {
		navigator.clipboard.writeText(location);
		console.debug("copied location to clipboard");
		element.innerHTML = success;
		console.debug("set text to 'copied'");
	} catch (e) {
		console.warning("couldn't write location to clipboard:\n"+e);
		element.innerHTML = failure;
		console.debug("set text to 'failed'");
		hide = false;
	}
	
	setTimeout(() => {
		element.innerHTML = share;
		console.debug("reset text to 'copy'");
	}, 3000);
}

function displayRaw(element, jsonInfo) {
	element.innerHTML = JSON.stringify(jsonInfo, null, 2);
}

function showStuff() {
	document.getElementById("display").style.display = "grid";
	console.log("revealed display")
}

function displayError(e, msg, hide) {
	const errorDisplay = document.getElementById("errDisplay");
	const errorInfo = document.getElementById("errInfo");
	errorInfo.innerHTML = `MESSAGE IN 'TRY' CATCH:<br>${msg}<br><br>ERROR MESSAGE:<br>${e}`;
	errorDisplay.style.display = "block";
}
