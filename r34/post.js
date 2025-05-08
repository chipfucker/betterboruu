const debug = true;
const debugErrMsg = "Debug: Forced error";
const debugPosts = {
	type: {
		image: "debug/image.json",
		wide: "debug/wide.json",
		video: "debug/video.json",
		gif: "debug/gif.json"
	},
	error: true ? debugErrMsg : false
};
const debugPost = debugPosts.type.image; // change depending on needs
const debugErr = debugPosts.error;

submitPost();

async function submitPost() {
	console.group(">> attempt");
	hideStuff();
	if (debug) {
		console.info("%crunning in debug mode",
			`padding: 10px; \
			background: light-dark(pink, maroon); \
			color: light-dark(maroon, pink); \
			font-size: large`
		);
		if (debugErr) {
			console.log("forced error");
			let msg =
				"This website is in debug mode, and an error was forced on load. "+
				"If you're seeing this, you probably shouldn't be, and you should contact me if you are!";
			displayError(debugErr, msg);
			return;
		}
		fetchData(debugPost);
		console.info("skipped link creation");
		return;
	}
	console.group("submitPost()");
	// get input
	const input = document.getElementById("url").value;
	const defaultUrl = "https://rule34.xxx/index.php?page=post&s=view&id=";
	// convert input to post id
	const outputId = input.startsWith(defaultUrl) ? input.slice(defaultUrl.length) : input;
	// append id to end of api link
	const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&fields=tag_info&id=";
	let hashId = location.hash.substring(1);
	hashId = /^\d+$/.test(hashId) ? hashId : null;
	const id = input || hashId || "5823623";
	location.hash = "#" + id;
	url = apiUrl + id;
	console.groupEnd();
	fetchData(url);
}

function hideStuff() {
	document.getElementById("display").style.display = "none";
	document.getElementById("errDisplay").style.display = "none";
	console.log("hid displays");
}

async function fetchData(url) {
	// fetch and handle api content
	console.group("fetching");
	console.time("fetch time");
	try {
		response = await fetch(url);
		console.timeEnd("fetch time");
		console.log("got api info from:\n"+url);
	} catch (e) {
		console.timeEnd("fetch time");
		let msg = "Couldn't fetch from: "+url;
		displayError(e, msg);
		return;
	}
	const jsonInfo = await response.json();
	console.groupCollapsed("json info");
	console.log(JSON.stringify(jsonInfo, null, 1));
	console.groupEnd();
	console.groupEnd();
	post = jsonInfo[0];



	artists = getTags(post.tag_info, "artist"); // display extra tag info and get artist tags as one string
	// artists = getTagOfType(post.tag_info, "artist");

	displayMedia(post.file_url, post.sample_url); // display media
	/// videos don't work on firefox; fix this somehow!!!

	setButtons(); // set all buttons
	
	displayRaw(document.getElementById("raw"), jsonInfo); // display raw json info
	
	// reveal everything
	showStuff();
}

function getTags(tags, typeRequest) {
	console.group("tags display");
	const ulElement = {
		copyright: document.getElementById("tagCopyright"),
		character: document.getElementById("tagCharacter"),
		artist: document.getElementById("tagArtist"),
		tag: document.getElementById("tagGeneral"),
		metadata: document.getElementById("tagMetadata")
	};
	console.log("got list elements");
	console.groupCollapsed("resetting list items");
	for (const list in ulElement) {
		ulElement[list].innerHTML = "";
		console.log("reset list items: "+list);
	}
	console.groupEnd();

	let feat = [];
	let featCount = [];
	console.groupCollapsed("displaying tags");
	for (const x in tags) {
		const element = ulElement[tags[x].type];
		element.innerHTML +=
			`<a
				href="https://rule34.xxx/index.php?page=post&s=list&tags=${tags[x].tag}"
				title="${tags[x].count} uses"
			><li>${tags[x].tag}</li></a>`
		;
		console.log(`added tag to ${tags[x].type}: ${tags[x].tag}`);
		if (tags[x].type === typeRequest) {
			feat.push(tags[x].tag);
			featCount.push(`${tags[x].tag} (${tags[x].count})`);
		}
	}
	console.groupEnd();
	if (feat.length) {
		console.log(`caught ${feat.length} tag${feat.length === 1 ? "" : "s"} for typeRequest (${typeRequest}):\n- ${featCount.join("\n- ")}`);
	} else {
		console.log("didn't catch any tags for typeRequest");
		return false;
	}
	featJson = {
		list: feat.join(" "),
		comma: feat.join(", "),
		and: feat.length <= 2 ?
			feat.join(" and ")
			: feat.slice(0, (feat.length - 1)).join(", ") + ", and " + feat[feat.length - 1],
		count: {
			list: featCount.join(" "),
			comma: featCount.join(", "),
			and: featCount.length <= 2 ?
				featCount.join(" and ")
				: featCount.slice(0, (featCount.length - 1)).join(", ") + ", and " + featCount[featCount.length - 1]
		}
	};
	console.groupCollapsed("featJSON");
	console.log(JSON.stringify(featJson, null, 4));
	console.groupEnd();
	console.groupEnd();
	return featJson;
}

function getTagOfType(tags, typeRequest) {

}

function displayMedia(mediaUrl, sampleUrl) {
	console.group("displaying media");
	const container = document.getElementById('imageDisplay');
	container.innerHTML = '';

	extension = mediaUrl.split('.').pop().toLowerCase();
	console.log("media extension is ."+extension);
	const imageExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
	const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'avi'];


	if (imageExt.includes(extension)) {
		console.log("media is assumed an image");
		const img = document.createElement('img');
		img.src = mediaUrl;
		img.alt = post.file;
		container.appendChild(img);
	} else if (videoExt.includes(extension)) {
		console.log("media is assumed a video");
		const video = document.createElement('video');
		video.controls = true;
		video.autoplay = false;
		video.loop = true;
		video.muted = false;
		video.preload = "auto";
		const videoSource = document.createElement('source');
		videoSource.src = mediaUrl;
		videoSource.type = `video/mp4`;
		video.appendChild(videoSource);
		container.appendChild(video);
	} else {
		console.error("media is assumed neither an image or a video\nfalling back to error button");
		const link = document.createElement('a');
		link.style.borderStyle = "none";
		link.href = 'https://discord.com/users/1184619891215573042';
		link.innerHTML = '<div class="button">Invalid format. Contact @chipfucker on Discord if this is erroneous--it likely is.</div>';
		link.firstChild.style.whiteSpace = "wrap";
		container.appendChild(link);
	}
	console.groupEnd();
}

function setButtons() {
	setOpenMedia(post.file_url); // set open media link
	setCopyMedia(post.file_url); // set copy media link
	// setDownloadLink(post.file_url); // set download media link
	// setSpecialDownloadLink(post.file_url, post.id, artists); // set special download media link and name
	setOpenPost(post.id); // set open original post link

	function setOpenMedia(url) {
		element = document.getElementById("openMedia");
		element.href = url;
		element.target = "_blank";
	}

	function setCopyMedia(url) {
	}
	
	function setDownloadLink(url) {
		element = document.getElementById("downloadLink");
		element.href = url;
		element.download = "";
	}
	
	function setSpecialDownloadLink(url, id, artists) {
		element = document.getElementById("specialDownloadLink");
		element.href = url;
		element.download = `${artists.list} r${id}.${extension}`;
	}
	
	function setOpenPost(id) {
	}
}

function copyLink() {
	const element = document.getElementById("copyLink").firstElementChild;
	let share =
		`<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
			<path d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z">
			</path>
		</svg>
		<span>Copy BetterBoruu link</span>`;
	let success =
		`<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
			<path d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z">
			</path>
		</svg>
		<span>Copied!</span>`;
	let failure =
		`<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
			<path d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z">
			</path>
		</svg>
		<span>Failed!</span>`;

	console.group("copyLink()");
	console.log("copying link");
	try {
		navigator.clipboard.writeText(location);
		console.debug("copied location to clipboard");
		element.innerHTML = success;
		console.debug("set text to 'copied'");
	} catch (e) {
		console.warn("couldn't write location to clipboard:\n"+e);
		element.innerHTML = failure;
		console.debug("set text to 'failed'");
	}
	
	setTimeout(() => {
		element.innerHTML = share;
		console.debug("reset text to 'copy'");
		console.groupEnd();
	}, 1000);
}

function displayRaw(element, json) {
	element.innerHTML = JSON.stringify(json, null, 2);
}

function showStuff() {
	document.getElementById("display").style.display = "grid";
	console.log("revealed display");
	console.groupEnd();
}

async function getFileFromUrl(url, name, defaultType = 'text/xml') {
	const response = await fetch(url);
	const data = await response.blob();
	return new File([data], name, {
		type: data.type || defaultType,
	});
}

function displayError(e, msg) {
	const errorDisplay = document.getElementById("errDisplay");
	const errorInfo = document.getElementById("errInfo");
	errorInfo.innerHTML = `MESSAGE IN 'TRY' CATCH:<br>${msg}<br><br>ERROR MESSAGE:<br>${e}`;
	errorDisplay.style.display = "block";
}
