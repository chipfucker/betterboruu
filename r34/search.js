window.onerror = function handleError(e, url, line) { 
    window.alert(`${e}\n\n${line}`);
    document.getElementById("searchDisplay").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").innerHTML =
        `<b><pre>ERROR MESSAGE:</pre></b>
        <pre>${e}</pre>
        <br/>
        <b><pre>ERROR URL:</pre></b>
        <pre>${url}</pre>
        <br/>
        <b><pre>ERROR LINE:</pre></b>
        <pre>${line}</pre>`;
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

window.onload = function () {
    console.group("ONLOAD ATTEMPT");
    if (debug) {
        console.info("!! running in debug mode");
        if (debugErr) {
            console.log("forced error");
            let msg =
                "This website is in debug mode, and an error was forced on load.\n"+
                "If you're seeing this, you probably shouldn't be, and you should contact me if you are!";
            displayError(debugErr, msg);
            return;
        }
        submitSearch(debugPost);
        console.info(`skipped to fetchData(${debugPost})`);
    } else {
        const url = getLink();
        submitSearch(url);
    }
};

document.getElementById("searchBar").addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        submitInput();
    }
});

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
            window.location.href = "index.html?q="+encodeURIComponent(input);
        }
    }
}

async function submitSearch(url) {
    document.getElementById("hideError").style.display = "none";
    results = await fetchData(url);

    displayResults(results);
}

async function submitPost(id) {
    window.location.href = "post.html#"+id;
}

function getLink() {
    const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&limit=50&tags=-ai_generated%20";
    link = new URLSearchParams(window.location.search);
    query = link.get("q");
    console.log("got link query: "+(query?query:null));
    document.getElementById("searchBar").value = query;
    console.log(link.get("p"));
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

function prevPage() {
    window.alert("this doesn't work yet. sorry!");
}
function nextPage() {
    window.alert("this doesn't work yet. sorry!");
    //const newPage = link.set("p", link.get("p") + 1);
    //window.location.search = newPage.toString();
}

function displayError(e, msg) {
    document.getElementById("searchDisplay").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").innerHTML =
        `<b><pre>MESSAGE IN TRY-CATCH:</pre></b>
        <i><pre>${msg}</pre></i>
        <br/>
        <b><pre>ERROR MESSAGE:</pre></b>
        <pre>${e}</pre>`;
    document.getElementById("errDisplay").style.display = "block";
}
