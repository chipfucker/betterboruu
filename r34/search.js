window.onerror = function handleError(e, url, line) { 
    window.alert(`${e}\n\n${line}`);
    document.getElementById("display").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").innerHTML =
        `ERROR MESSAGE:<br>${e}<br><br>ERROR URL:<br>${url}<br><br>ERROR LINE:<br>${line}`;
    document.getElementById("errDisplay").style.display = "block";
    console.error(e);
    return false;
};

const debug = false;
const debugErrMsg = "Debug: Forced error";
const debugPosts = {
    link: "https://rule34.xxx/index.php?page=post&s=list&tags=zoologist_(terraria)",
    file: "debug\/search.json",
    error: false ? debugErrMsg : false
};
const debugPost = debugPosts.file; // change depending on needs
const debugErr = debugPosts.error;

async function submitInput() {
    console.group(">> attempt");
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
        getData(debugPost);
        console.info(`skipped to fetchData(${debugPost})`);
    } else {
        var input = document.getElementById("searchBar").value; // get input
        console.log("got input: "+(input?input:null));
        if (/^id:\d+$/.test(input) || !input) {
            input = input.substring(3);
            submitPost(input);
        } else {
            submitSearch(input);
        }
    }
}

async function submitSearch(input) {
    const params = new URL(document.location.toString()).searchParams;
    const ogQuery = params.get("q");
    const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&fields=tag_info&tags=-ai_generated%20";
    const url = apiUrl + input;
    getData(url);
}

async function submitPost(id) {
    window.location.href = "post.html#"+id;
}

async function getData(url) {
    
}

function hideStuff() {
    document.getElementById("searchDisplay").style.display = "none";
    document.getElementById("errDisplay").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    console.log("hid displays");
}
