const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

async function submitPost() {
	// Assign input to variable
	var input = document.getElementById("url").value;
	
	const defaultUrl = "https://rule34.xxx/index.php?page=post&s=view&id=";
	const outputId = input.startsWith(defaultUrl)
		? input.slice(defaultUrl.length)
		: input;
	
	getData(outputId);
}

async function getData(inputId) {
	const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&id=";
	let id;
	if (inputId) {
		id = inputId;
	} else if (params.id) {
		id = params.id;
	} else {
		inputId = "5823623";
	}
	params.id = inputId;
	url = apiUrl + inputId;
	// hide display
	display = document.getElementById("display");
	display.style.display = "none";
	
	// fetch JSON info from url
	const response = await fetch(url);
	// assign info to variable
	const post = await response.json();

	assignJson(post);

	// Functions to set Display
	getTagInfo(jsonInfo.tags.value);
	
	// Display image along with other cards
	if (jsonInfo.sample.value) {
		//document.getElementById("imageDisplay").setAttribute("src", jsonInfo[1].data);
		//document.getElementById("imageDisplay").style.maxwidth = `${jsonInfo[15].data}px`;
		displayMedia(jsonInfo.sample_url.value, jsonInfo.sample_width.value);
	} else {
		//document.getElementById("imageDisplay").setAttribute("src", jsonInfo[2].data);
		displayMedia(jsonInfo.file_url.value);
	}

	displayMedia()

	function displayMedia(mediaUrl, sampleWidth) {
		const container = document.getElementById('imageDisplay');
		container.innerHTML = '';
		
		const extension = mediaUrl.split('.').pop().toLowerCase();
		const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
		const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
		
		if (extension === 'gif') {
			// Treat GIFs as videos for better performance
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.autoplay = true;
			video.loop = true;
			video.muted = true; // Required for autoplay in some browsers
			video.style.maxWidth = '100%';
			container.appendChild(video);
		} else if (imageExtensions.includes(extension)) {
			const img = document.createElement('img');
			img.src = mediaUrl;
			img.alt = 'Image';
			img.style.maxWidth = '100%';
			container.appendChild(img);
		} else if (videoExtensions.includes(extension)) {
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.controls = true;
			video.style.maxWidth = '100%';
			container.appendChild(video);
		} else {
			const link = document.createElement('a');
			link.href = mediaUrl;
			link.textContent = 'Download File';
			link.target = '_blank';
			container.appendChild(link);
		}
	}
	function displayMedia(mediaUrl) {
		const container = document.getElementById('imageDisplay');
		container.innerHTML = '';
		
		const extension = mediaUrl.split('.').pop().toLowerCase();
		const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
		const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
		
		if (extension === 'gif') {
			// Treat GIFs as videos for better performance
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.autoplay = true;
			video.loop = true;
			video.muted = true; // Required for autoplay in some browsers
			video.style.maxWidth = '100%';
			container.appendChild(video);
		} else if (imageExtensions.includes(extension)) {
			const img = document.createElement('img');
			img.src = mediaUrl;
			img.alt = 'Image';
			img.style.maxWidth = '100%';
			container.appendChild(img);
		} else if (videoExtensions.includes(extension)) {
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.controls = true;
			video.style.maxWidth = '100%';
			container.appendChild(video);
		} else {
			const link = document.createElement('a');
			link.href = mediaUrl;
			link.textContent = 'Download File';
			link.target = '_blank';
			container.appendChild(link);
		}
	}

	document.getElementById("downloadLink").setAttribute("href", jsonInfo[2].data);
	copyShareLink(jsonInfo.image_url.value);
	function copyShareLink(id) {
		url = "https://chipfucker.github.io/betterboruu/r34/post.html?id=";
		navigator.clipboard.writeText(url + id);
	}
	
	// Display JSON info raw
	document.getElementById("raw").innerHTML = JSON.stringify(post, null, 2);
	
	// Reveal display
	display.style.display = "grid";
}

function assignJson(post) {
	jsonInfo = {
		preview_url: post[0].preview_url, // URL to thumbnail image
		sample_url: post[0].sample_url, // URL to smaller version of image
		file_url: post[0].file_url, // URL to original media file
		directory: post[0].directory, // Yet to be determined
		hash: post[0].hash, // Hash string associated with media
		width: post[0].width, // Width of media in pixels
		height: post[0].height, // Height of media in pixels
		id: post[0].id, // ID of post
		image: post[0].image, // Name of image file
		change: post[0].change, // Date of the last modification to the post, in Unix time
		owner: post[0].owner, // User who created post, 'bot' if uploaded by a robot
		parent_id: post[0].parent_id, // ID of parent post, 0 if not applicable
		rating: post[0].rating, // How suggestive or explicit the media is
		sample: post[0].sample, // Whether there is a smaller version of the image
		sample_height: post[0].sample_height, // Height of sample image
		sample_width: post[0].sample_width, // Width of sample image
		score: post[0].score, // Amount of upvotes this post has
		tags: post[0].tags, // Tags that are associated with this post, separated by spaces
		source: post[0].source, // Source string associated with post, "" if none
		status: post[0].status, // 'Whether the post is up?'
		has_notes: post[0].has_notes, // 'Whether the post has notes?'
		comment_count: post[0].comment_count // Amount of comments under post
	};
	
	console.log(jsonInfo.tags.value);
}

async function getTagInfo(tags) {
	// Base API URL
	const apiUrl = "https://api.rule34.xxx/index.php?page=dapi&s=tag&q=index&name=";

	const tagName = tags.split(" ");
	const tagInfo = [];

	for (let x = 0; x < tagName.length; x++) {
		const response = await fetch(apiUrl + tagName[x]);
		const text = await response.text();

		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(text, "text/xml");

		const tagElement = xmlDoc.querySelector('tag');

		if (tagElement) {
			tagInfo.push({
				name: tagElement.getAttribute('name'),
				type: tagElement.getAttribute('type'),
				count: tagElement.getAttribute('count'),
				id: tagElement.getAttribute('id'),
				ambiguous: tagElement.getAttribute('ambiguous')
			});
		} else {
			tagInfo.push({
				name: tag,
				error: "Couldn't find tag info"
			});
		}
	}

	const tagType = {
		3: document.getElementById("tagCopyright"),
		4: document.getElementById("tagCharacter"),
		1: document.getElementById("tagArtist"),
		0: document.getElementById("tagGeneral"),
		5: document.getElementById("tagMeta")
	};
	tagType[0].innerHTML = "";
	tagType[1].innerHTML = "";
	tagType[3].innerHTML = "";
	tagType[4].innerHTML = "";
	tagType[5].innerHTML = "";

	for (let x = 0; x < tagInfo.length; x++) {
		const element = tagType[tagInfo[x].type];
		if (element) {
			element.innerHTML +=
				`<a href="https://rule34.xxx/index.php?page=post&s=list&tags=${tagInfo[x].name}" title="${tagInfo[x].count} uses"><li>${tagInfo[x].name}</li></a>`;
		}
	}
}
