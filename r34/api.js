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
	if (!inputId) {
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
	getTagInfo(jsonInfo[17].data);
	
	// Display image along with other cards
	if (jsonInfo[13].data) {
		document.getElementById("imageDisplay").setAttribute("src", jsonInfo[1].data);
		document.getElementById("imageDisplay").style.maxwidth = `${jsonInfo[15].data}px`;
	} else {
		document.getElementById("imageDisplay").setAttribute("src", jsonInfo[2].data);
	}

	document.getElementById("downloadLink").setAttribute("href", jsonInfo[2].data);
	/// UPDATE TO SUPPORT VIDEOS
	
	// Display JSON info raw
	document.getElementById("raw").innerHTML = JSON.stringify(post, null, 2);
	
	// Reveal display
	display.style.display = "grid";
}

function assignJson(post) {
	jsonInfo = [
		{
			obj: "preview_url",
			name: "Preview URL",
			desc: "'URL to thumbnail image?'",
			data: post[0].preview_url
		},
		{
			obj: "sample_url",
			name: "Sample URL",
			desc: "'URL to smaller version of image if File URL is too large?'",
			data: post[0].sample_url
		},
		{
			obj: "file_url",
			name: "File URL",
			desc: "URL to main media file",
			data: post[0].file_url
		},
		{
			obj: "directory",
			name: "Directory",
			desc: "Yet to be determined",
			data: post[0].directory
		},
		{
			obj: "hash",
			name: "Hash",
			desc: "Hash string associated with media",
			data: post[0].hash
		},
		{
			obj: "width",
			name: "Width",
			desc: "Width of media in pixels",
			data: post[0].width
		},
		{
			obj: "height",
			name: "Height",
			desc: "Height of media in pixels",
			data: post[0].height
		},
		{
			obj: "id",
			name: "ID",
			desc: "ID of post",
			data: post[0].id
		},
		{
			obj: "image",
			name: "Image",
			desc: "Name of image file",
			data: post[0].image
		},
		{
			obj: "change",
			name: "Change",
			desc: "Date of the last modification to the post, in Unix time",
			data: post[0].change
		},
		{
			obj: "owner",
			name: "Owner",
			desc: "User who created post, 'bot' if uploaded by a robot",
			data: post[0].owner
		},
		{
			obj: "parent_id",
			name: "Parent ID",
			desc: "ID of parent post, 0 if none exists",
			data: post[0].parent_id
		},
		{
			obj: "rating",
			name: "Rating",
			desc: "How suggestive or explicit the media is",
			data: post[0].rating
		},
		{
			obj: "sample",
			name: "Sample",
			desc: "Whether there is a sample attributed",
			data: post[0].sample
		},
		{
			obj: "sample_height",
			name: "Sample Height",
			desc: "'Height of sample?'",
			data: post[0].sample_height
		},
		{
			obj: "sample_width",
			name: "Sample Width",
			desc: "'Width of sample?'",
			data: post[0].sample_width
		},
		{
			obj: "score",
			name: "Score",
			desc: "Amount of upvotes this post has",
			data: post[0].score
		},
		{
			obj: "tags",
			name: "Tags",
			desc: "Tags that are associated with this post, separated by spaces",
			data: post[0].tags
		},
		{
			obj: "source",
			name: "Source",
			desc: "Source string associated with post, empty string if none",
			data: post[0].source
		},
		{
			obj: "status",
			name: "Status",
			desc: "'Whether the post is up?'",
			data: post[0].status
		},
		{
			obj: "has_notes",
			name: "Has notes",
			desc: "'Whether the post has notes?'",
			data: post[0].has_notes
		},
		{
			obj: "comment_count",
			name: "Comment count",
			desc: "Amount of comments under post",
			data: post[0].comment_count
		}
	];
	
	for (let x = 0; x < jsonInfo.length; x++) {
		console.log(`"${jsonInfo[x].obj}": "${jsonInfo[x].data}"`);
	}
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

	for (let x = 0; x < tagInfo.length; x++) {
		const element = tagType[tagInfo[x].type];
		if (element) {
			element.innerHTML +=
				`<a href="https://rule34.xxx/index.php?page=post&s=list&tags=${tagInfo[x].name}" title="${tagInfo[x].count} uses"><li>${tagInfo[x].name}</li></a>`;
		}
	}
}
