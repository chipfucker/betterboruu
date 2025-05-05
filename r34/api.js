async function submitPost() {
	// Assign input to variable
	var input = document.getElementById("url").value;
	if (input === "") {
		input = "5823623";
	}
	
	const defaultUrl = "https://rule34.xxx/index.php?page=post&s=view&id="
	const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&id="
	const outputUrl = input.startsWith(defaultUrl)
		? apiUrl + input.slice(defaultUrl.length)
		: apiUrl + input;
	
	getData(outputUrl);
}

async function getData(url) {
	// hide display
	display = document.getElementById("display");
	display.style.display = "none";
	
	// fetch JSON info from url
	const response = await fetch(url);
	// assign info to variable
	const post = await response.json();

	assignJson(post);

	// Functions to set Display
	getTagInfo(tags);
	
	// Display image along with other cards
	document.getElementById("imageDisplay").setAttribute("src", file_url);
	/// UPDATE TO SUPPORT VIDEOS
	
	// Set default JSON info to display on element ID's
	// document.getElementById("preview_url").innerHTML = preview_url;
	// document.getElementById("sample_url").innerHTML = sample_url;
	// document.getElementById("file_url").innerHTML = file_url;
	// document.getElementById("directory").innerHTML = directory;
	// document.getElementById("hash").innerHTML = hash;
	// document.getElementById("width").innerHTML = width;
	// document.getElementById("height").innerHTML = height;
	// document.getElementById("id").innerHTML = id;
	// document.getElementById("image").innerHTML = image;
	// document.getElementById("change").innerHTML = change;
	// document.getElementById("owner").innerHTML = owner;
	// document.getElementById("parent_id").innerHTML = parent_id;
	// document.getElementById("rating").innerHTML = rating;
	// document.getElementById("sample").innerHTML = sample;
	// document.getElementById("sample_height").innerHTML = sample_height;
	// document.getElementById("sample_width").innerHTML = sample_width;
	// document.getElementById("tags").innerHTML = tags;
	// document.getElementById("source").innerHTML = source;
	// document.getElementById("status").innerHTML = status;
	// document.getElementById("has_notes").innerHTML = has_notes;
	// document.getElementById("comment_count").innerHTML = comment_count;
	
	// Display JSON info raw
	json = JSON.stringify(post, undefined, 2);
	document.getElementById("raw").innerHTML = JSON.stringify(post, null, 2);
	
	// Reveal display
	display.style.display = "grid";
}

function assignJson(post) {
	postInfo = [
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
		}, // Score
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
	]
	
	for (let x = 0; )
	console.log("Preview URL: "+preview_url);
	console.log("Sample URL: "+sample_url);
	console.log("File URL: "+file_url);
	console.log("Directory: "+directory);
	console.log("Hash: "+hash);
	console.log("Width: "+width);
	console.log("Height: "+height);
	console.log("ID: "+id); // Post ID
	console.log("Image: "+image);
	console.log("Change: "+change);
	console.log("Owner: "+owner); // User who uploaded
	console.log("Parent ID: "+parent_id); // ID of parent post
	console.log("Rating: "+rating);
	console.log("Sample: "+sample);
	console.log("Sample height: "+sample_height);
	console.log("Sample width: "+sample_width);
	console.log("Score: "+score); // Score
	console.log("Tags: "+tags); // Tags
	console.log("Source: "+source); // Source
	console.log("Status: "+status);
	console.log("Has notes: "+has_notes);
	console.log("Comment count: "+comment_count);
}

async function getTagInfo(tags) {
	// Separate tags and list them in unordered list
	
	// ORIGINAL CODE
	const tag = tags.split(" ");
	const tagList = document.getElementById("tagList");
	tagList.innerHTML = ""; // Delete existing displayed tags
	for (let x = 0; x < tag.length; x++) {
		tagList.innerHTML += `<li>${tag[x]}</li>`;
	}

	// Warn for errors in display
	tagList.parentNode.innerHTML += "<h3>Tag color testing</h3><p>Ignore this if it seems broken.</p>"

	// Base API URL
	const apiUrl = "https://api.rule34.xxx/index.php?page=dapi&s=tag&q=index&name=";

	// Function to fetch tag info
	async function fetchTagTypes(tags) {
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
					name: tag,
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

			const tagType = {
				0: getElementById("tagCopyright"),
				1: getElementById("tagCharacter"),
				2: getElementById("tagArtist"),
				3: getElementById("tagGeneral"),
				4: getElementById("tagMeta")
			};
			
			for (let x = 0; x < tagInfo.length; x++) {
				const element = tagType[tagInfo[x].type];
				if (element) {
					element.innerHTML += `<li title="(${tagInfo[x].count})">${tagInfo[x].name}</li>`;
					// append <a> for searching for tag when applicable
					// element.innerHTML +=  `<li title="(${tagInfo[x].count})"><a href"/search">${tagInfo[x].name}</a></li>`;
				}
			}
		}
	}
}

window.onload = submitPost();