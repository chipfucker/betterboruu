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
		console.debug("got api info");
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
	/// videos don't work on firefox

	setDownloadLink(post[file_url], post[id]); // set download button link
	
	displayRaw(jsonInfo); // display raw json info
	document.getElementById("raw").innerHTML = JSON.stringify(jsonInfo, null, 2);
	
	// reveal everything
	showStuff();
	display.style.display = "grid";
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

	for (let tagNumber of tags) {
		const element = ulElement[tags[tagNumber].type];
		if (element) {
			element.innerHTML +=
				`<a
					href="https://rule34.xxx/index.php?page=post&s=list&tags=${tags[tagNumber].tag}"
					title="${tags[tagNumber].count} uses"
				><li>${tags[tagNumber].tag}</li></a>`;
		}
	}
}

function displayMedia(mediaUrl) {
	const container = document.getElementById('imageDisplay');
	container.innerHTML = '';

	const extension = mediaUrl.split('.').pop().toLowerCase();
	console.debug("Media extension is ."+extension);
	const imageExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
	const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'avi'];


	if (imageExt.includes(extension)) {
		const img = document.createElement('img');
		img.src = mediaUrl;
		img.alt = post.file;
		container.appendChild(img);
	} else if (videoExt.includes(extension)) {
		const video = document.createElement('video');
		video.src = mediaUrl;
		video.controls = true;
		video.autoplay = false;
		video.loop = true;
		video.muted = false;
		container.appendChild(video);
	} else {
		const link = document.createElement('a');
		link.style.borderStyle = "none";
		link.href = 'https://discord.com/users/1184619891215573042';
		link.innerHTML = '<div class="button">Invalid format. Contact @chipfucker on Discord if this is erroneous.</div>';
		link.firstChild.style.whiteSpace = "wrap";
		container.appendChild(link);
	}
}

function setDownloadLink(url, id, artists) {
	link = document.getElementById("downloadLink");
	link.setAttribute("href", url);
	link.href = url;
	link.download = artists;
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

	console.debug("Copying location");
	try {
		navigator.clipboard.writeText(location);
		console.debug("copied location to clipboard");
	} catch (e) {
		console.warning("couldn't write location to clipboard");
		
		return;
	}
	
	element.innerHTML = success;
	console.debug("set text to 'copied'")
	setTimeout(() => {
		element.innerHTML = share;
		console.debug("reset text to 'copy'");
	}, 3000);
}

function displayError(e, msg, hide) {
	const errorDisplay = document.getElementById("errDisplay");
	const errorInfo = document.getElementById("errInfo");
	errorInfo.innerHTML = `MESSAGE IN 'TRY' CATCH:<br>${msg}<br><br>ERROR MESSAGE:<br>${e}`;
	errorDisplay.style.display = "block";
}
