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
	getTagInfo(jsonInfo.tags);
	
	// Display image along with other cards
	if (jsonInfo.sample) {
		//document.getElementById("imageDisplay").setAttribute("src", jsonInfo[1].data);
		//document.getElementById("imageDisplay").style.maxwidth = `${jsonInfo[15].data}px`;
		displayMedia(jsonInfo.sample_url, jsonInfo.sample_width);
	} else {
		//document.getElementById("imageDisplay").setAttribute("src", jsonInfo[2].data);
		displayMedia(jsonInfo.file_url);
	}

	displayMedia()

	function displayMedia(mediaUrl, sampleWidth) {
		const container = document.getElementById('imageDisplay');
		container.innerHTML = '';
		
		const extension = mediaUrl.split('.').pop().toLowerCase();
		const imageExt = ['jpg', 'jpeg', 'png', 'webp'];
		const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
		
		if (imageExt.includes(extension)) {
			const img = document.createElement('img');
			img.src = mediaUrl;
			img.alt = 'Image';
			img.style.maxWidth = sampleWidth + 'px';
			container.appendChild(img);
		} else if (extension === 'gif') {
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.autoplay = true;
			video.loop = true;
			video.muted = false;
			video.style.maxWidth = sampleWidth + 'px';
			container.appendChild(video);
		} else if (videoExt.includes(extension)) {
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.controls = true;
			video.style.maxWidth = sampleWidth + 'px';
			container.appendChild(video);
		} else {
			const button = document.createElement('div');
			link.innerHTML = 'Invalid format. <a href="link">Contact chipfucker if this is erroneous</a>.';
			link.class = 'button'
			container.appendChild(button);
		}
	}

	function displayMedia(mediaUrl) {
		const container = document.getElementById('imageDisplay');
		container.innerHTML = '';
		
		const extension = mediaUrl.split('.').pop().toLowerCase();
		const imageExt = ['jpg', 'jpeg', 'png', 'webp'];
		const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
		
		if (imageExt.includes(extension)) {
			const img = document.createElement('img');
			img.src = mediaUrl;
			img.alt = 'Image';
			img.style.maxWidth = '100%';
			container.appendChild(img);
		} else if (extension === 'gif') {
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.autoplay = true;
			video.loop = true;
			video.muted = false;
			video.style.maxWidth = sampleWidth;
			container.appendChild(video);
		} else if (videoExt.includes(extension)) {
			const video = document.createElement('video');
			video.src = mediaUrl;
			video.controls = true;
			video.style.maxWidth = '100%';
			container.appendChild(video);
		} else {
			const button = document.createElement('div');
			link.textContent = 'Invalid format. Contact chipfucker if this is erroneous.';
			link.class = 'button'
			container.appendChild(button);
		}
	}

	document.getElementById("downloadLink").setAttribute("href", jsonInfo.file_url);
	copyShareLink(jsonInfo.image_url);
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
		preview_url: post[0].preview_url,
		sample_url: post[0].sample_url,
		file_url: post[0].file_url,
		directory: post[0].directory,
		hash: post[0].hash,
		width: post[0].width,
		height: post[0].height,
		id: post[0].id,
		image: post[0].image,
		change: post[0].change,
		owner: post[0].owner,
		parent_id: post[0].parent_id,
		rating: post[0].rating,
		sample: post[0].sample,
		sample_height: post[0].sample_height,
		sample_width: post[0].sample_width,
		score: post[0].score,
		tags: post[0].tags,
		source: post[0].source,
		status: post[0].status,
		has_notes: post[0].has_notes,
		comment_count: post[0].comment_count
	};
	
	console.log(jsonInfo.tags);
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
