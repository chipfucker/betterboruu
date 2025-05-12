window.onerror = function handleError(e, url, line) { 
    window.alert(`${e}\n\n${line}`);
    document.getElementById("searchDisplay").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").innerHTML =
        `ERROR MESSAGE:<br>${e}<br><br>ERROR URL:<br>${url}<br><br>ERROR LINE:<br>${line}`;
    document.getElementById("errDisplay").style.display = "block";
    console.error(e);
    return false;
};

const debug = true;
const debugErrMsg = "Debug: Forced error";
const debugPosts = {
    link: "https://rule34.xxx/index.php?page=post&s=list&tags=zoologist_(terraria)",
    file: "debug\/search.json",
    error: false ? debugErrMsg : false
};
const debugPost = debugPosts.file; // change depending on needs
const debugErr = debugPosts.error;

function submitInput() {
    console.group("SUBMIT ATTEMPT");
    if (debug) {
        console.info("!! running in debug mode");
        console.info(`skipping to submitSearch(${debugPost})`);
        submitSearch(debugPost);
    } else {
        var input = document.getElementById("searchBar").value; // get input
        console.log("got input: "+(input?input:null));
        if (/^id:\d+$/.test(input)) { // if input is either 'id:' followed by digits or null
            input = input.substring(3); // get digits after 'id:'
            submitPost(input);
        } else {
            const url = getLink(input);
            console.log("got api link: "+url)
            submitSearch(url);
        }
    }
}

async function submitSearch(input) {
    results = await fetchData(url);
    displayResults(results);
}

async function submitPost(id) {
    window.location.href = "post.html#"+id;
}

function getLink(input) {
    const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&tags=-ai_generated%20";
    let link = new URLSearchParams(location.params.search);
    let linkQuery = link.get("q");
    console.log("got link query: "+(linkQuery?linkQuery:null));
    const query = input || linkQuery || "";
    console.log("final query: "+query);
    location.search = "?q=" + encodeURIComponent(query);
    url = apiUrl + encodeURIComponent(query);
    console.log("final url: "+url);
    return url;
}

async function fetchData(url) {
    // fetch and handle api content
    console.time("fetch time");
    try {
        response = await fetch(url);
        console.timeEnd("fetch time");
        console.log("got api info from:\n"+url);
        jsonInfo = await response.json();
    } catch (e) {
        console.timeEnd("fetch time");
        displayError(e, `Couldn't fetch from: ${url}`);
        return;
    }
    console.groupCollapsed("json info");
    console.log(JSON.stringify(jsonInfo, null, 1));
    console.groupEnd();
    return jsonInfo;
}

function displayResults(results) {
    const display = document.getElementById("searchDisplay");
    for (const x in results) {
        display.innerHTML +=
            `<div class="post">
				<a href="post.html#${results[x].id}">
					<img src="${results[x].preview_url}"/>
				</a>
			</div>`;
    }
}
