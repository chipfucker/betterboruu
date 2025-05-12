window.onerror = function handleError(e, url, line) { 
    window.alert(`${e}\n\n${line}`);
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").innerHTML =
        `<b><pre>ERROR MESSAGE:</pre></b>
        <pre>${e}</pre>
        <b><pre>ERROR URL:</pre></b>
        <pre>${url}</pre>
        <b><pre>ERROR LINE:</pre></b>
        <pre>${line}</pre>`;
    document.getElementById("errDisplay").style.display = "block";
    console.error(e);
    return false;
};

const debug = true;
const debugErrMsg = "Debug: Forced error";
const debugPosts = {
    link: {
        image: "https:\/\/rule34.xxx\/index.php?page=post&s=view&id=5823623"
    },
    file: {
        image: "debug\/image\/image.json",
        animated: "debug\/animated\/animated.json",
        video: "debug\/video\/video.json"
    },
    error: false ? debugErrMsg : false
};
const debugPost = debugPosts.file.animated; // change depending on needs
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
        submitPost(debugPost);
        console.info(`skipped to fetchData(${debugPost})`);
    } else {
        const url = getLink(location.hash.substring(1));
        submitPost(url);
    }
};

async function submitInput() {
    console.group("SUBMIT ATTEMPT");
    if (debug) {
        console.info("!! running in debug mode");
        submitPost(debugPost);
        console.info(`skipped to fetchData(${debugPost})`);
    } else {
        var input = document.getElementById("searchBar").value; // get input
        console.log("got input: "+(input?input:null));
        if (/^id:\d+$/.test(input) || !input) { // if input is either 'id:' followed by digits or null
            input = input.substring(3); // get digits after 'id:'
            const url = getLink(input); // append id to end of api link
            console.log("got api link: "+url);
            submitPost(url);
        } else {
            submitSearch(input);
        }
    }
}

async function submitPost(url) {
    hideStuff();
    post = await fetchData(url); // set post info to variable
    await setEmbed();

    getTags(post.tag_info); // display extra tag info and get artist tags as one string
    artists = getTagOfType(post.tag_info, "artist"); // assign artist tags to strings
    displayMedia(post.file_url); // display media
    /// videos don't work on firefox; fix this somehow!!!
    displayInfo(post);
    setButtons(); // set all buttons
    showStuff(); // reveal everything
    console.groupEnd();
}

async function submitSearch(input) {
    location.href = "index.html?q=" + encodeURIComponent(input);
}

function hideStuff() {
    document.getElementById("hideError").style.display = "none";
    console.log("hid displays");
}

function displayInfo(post) {
    document.getElementById("rawPostInfo").getElementsByTagName("pre")[1].innerHTML =
        `\n${JSON.stringify(post, null, 2)}`;
    document.getElementById("id").innerHTML = post.id;
    document.getElementById("ownerLink").href = "index.html?q=" + encodeURIComponent(post.owner);
    document.getElementById("owner").innerHTML = post.owner;
}

function getLink(input) {
    const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&fields=tag_info&id=";
    let hashId = location.hash.substring(1);
    console.log("got hash value: "+(hashId?hashId:null));
    hashId = /^\d+$/.test(hashId) ? hashId : null;
    console.log("got new hash id: "+hashId);
    const id = input || hashId || "5823623";
    console.log("final id: "+id);
    location.hash = "#" + id;
    url = apiUrl + id;
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
    } catch (e) {
        console.timeEnd("fetch time");
        displayError(e, `Couldn't fetch from: ${url}`);
        return;
    }
    const jsonInfo = await response.json();
    console.groupCollapsed("json info");
    console.log(JSON.stringify(jsonInfo, null, 1));
    console.groupEnd();
    return jsonInfo[0];
}

function getTags(tags) {
    const ulElement = {
        copyright: document.getElementById("tagCopyright"),
        character: document.getElementById("tagCharacter"),
        artist: document.getElementById("tagArtist"),
        tag: document.getElementById("tagGeneral"),
        metadata: document.getElementById("tagMetadata")
    };
    console.log("got list elements");
    for (const list in ulElement) {
        ulElement[list].innerHTML = "";
        console.log("reset list items: "+list);
    }
    console.groupCollapsed("displaying tags");
    for (const x in tags) {
        const element = ulElement[tags[x].type];
        element.innerHTML +=
            `<a
                href="?q=${encodeURIComponent(tags[x].tag)}"
                title="${tags[x].count} uses"
            ><li>${tags[x].tag}</li></a>`;
        console.log(`added tag to ${tags[x].type}: ${tags[x].tag}`);
    }
    console.groupEnd();
}

function getTagOfType(tags, typeRequest) {
    let feat = [];
    let featCount = [];
    for (const x in tags) {
        if (tags[x].type === typeRequest) {
            feat.push(tags[x].tag);
            featCount.push(`${tags[x].tag} (${tags[x].count})`);
            console.log(`caught ${typeRequest}: ${tags[x].tag}`);
        }
    }
    if (feat.length) {
        console.log(`caught ${feat.length} tag${feat.length === 1 ? "" : "s"} for typeRequest (${typeRequest}):\n- ${featCount.join("\n- ")}`);
    } else {
        console.log(`didn't catch any tags for typeRequest ${typeRequest}`);
        return false;
    }
    const featJson = {
        plural: feat.length === 1 ? "" : "s",
        generic: feat.join(" "),
        list: "- "+feat.join("\n- "),
        comma: feat.join(", "),
        and: feat.length <= 2 ?
            feat.join(" and ")
            : feat.slice(0, (feat.length - 1)).join(", ") + ", and " + feat[feat.length - 1],
        count: {
            generic: featCount.join(" "),
            list: "- "+featCount.join("\n- "),
            comma: featCount.join(", "),
            and: featCount.length <= 2 ?
                featCount.join(" and ")
                : featCount.slice(0, (featCount.length - 1)).join(", ") + ", and " + featCount[featCount.length - 1]
        }
    };
    console.groupCollapsed("featJSON");
    console.log(JSON.stringify(featJson, null, 4));
    console.groupEnd();
    return featJson;
}

async function setEmbed() {
    const artists = getTagOfType(post.tag_info, "artist");
    
    const titleElement = document.getElementsByTagName("title")[0];
    titleElement.innerText = `#${post.id} - ${artists.comma}`;
    
    const authorName = document.createElement("meta");
    authorName.setAttribute("property", "og:author:name");
    authorName.content = `#${post.id}`;
    document.head.appendChild(authorName);

    const authorUrl = document.createElement("meta");
    authorUrl.setAttribute("property", "og:author:url");
    authorUrl.content = `https://chipfucker.github.io/betterboruu/r34/post#${post.id}`;
    document.head.appendChild(authorUrl);

    const description = document.createElement("meta");
    description.setAttribute("property", "og:description");
    description.content = `### Artist${artists.plural}:\n${artists.list}`;
    document.head.appendChild(description);

    const imageUrl = document.createElement("meta");
    imageUrl.setAttribute("property", "og:image:url");
    imageUrl.content = post.file_url;
    document.head.appendChild(imageUrl);

    const title = document.createElement("meta");
    title.setAttribute("property", "title");
    title.content = `#${artists.and}`;
    document.head.appendChild(title);
}

function displayMedia(mediaUrl) {
    console.log(`media url: ${mediaUrl}`);
    const container = document.getElementById("imageDisplay");
    container.innerHTML = "";

    extension = mediaUrl.split(".").pop().toLowerCase();
    console.log("media extension: ."+extension);
    const imageExt = ["jpg", "jpeg", "png", "webp", "gif"];
    const videoExt = ["mp4", "webm", "ogg", "mov", "avi"];


    if (imageExt.includes(extension)) {
        console.log("media is assumed an image");
        const img = document.createElement("img");
        img.src = mediaUrl;
        img.alt = post.file;
        container.appendChild(img);
    } else if (videoExt.includes(extension)) {
        console.log("media is assumed a video");
        const video = document.createElement("video");
        video.controls = true;
        video.autoplay = false;
        video.loop = true;
        video.muted = false;
        video.preload = "auto";
        const videoSource = document.createElement("source");
        videoSource.src = mediaUrl;
        videoSource.type = `video/mp4`;
        video.appendChild(videoSource);
        container.appendChild(video);
    } else {
        console.error("media is assumed neither an image or a video\nfalling back to error button");
        const link = document.createElement("a");
        link.style.borderStyle = "none";
        link.href = "https://discord.com/users/1184619891215573042";
        link.innerHTML = "<div class='button'>Invalid format. Contact @chipfucker on Discord if this is erroneous--it likely is.</div>";
        link.firstChild.style.whiteSpace = "wrap";
        container.appendChild(link);
    }
}

function setButtons() {
    setOpenMedia(post.file_url); // set open media link
    // setDownloadLink(post.file_url); // set download media link
    // setSpecialDownloadLink(post.file_url, post.id, artists); // set special download media link and name
    setOpenPost(post.id); // set open original post link

    function setOpenMedia(url) {
        const element = document.getElementById("openMedia");
        element.href = url;
        element.target = "_blank";
    }

    function setDownloadLink(url) {
        const element = document.getElementById("downloadLink");
        element.href = url;
        element.download = "";
    }

    function setSpecialDownloadLink(url, id, artists) {
        const element = document.getElementById("specialDownloadLink");
        element.href = url;
        element.download = `${artists.generic} r${id}.${extension}`;
    }

    function setOpenPost(id) {
    }
}

function copyMedia() {
    const element = document.getElementById("copyMedia").firstElementChild;
    const copy = element.innerHTML;
    let success =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z"/>
        </svg>
        <span>Copied!</span>`;
    let failure =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"/>
        </svg>
        <span>Failed!</span>`;

    try {
        navigator.clipboard.writeText(post.file_url);
        console.debug("copied media link to clipboard: "+post.file_url);
        element.innerHTML = success;
        console.debug("set text to 'copied'");
    } catch (e) {
        console.warn("couldn't write location to clipboard:\n"+e);
        element.innerHTML = failure;
        console.debug("set text to 'failed'");
    }

    setTimeout(() => {
        element.innerHTML = copy;
        console.debug("reset text to 'copy'");
    }, 1000);
}

function copyPresetName() {
    const element = document.getElementById("copyPresetName").firstElementChild;
    const copy = element.innerHTML;
    let success =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z">
            </path>
        </svg>
        <span>Copied!</span>`;
    let failure =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z">
            </path>
        </svg>
        <span>Failed!</span>`;

    try {
        navigator.clipboard.writeText(`${artists.generic} r${post.id}.${extension}`);
        console.debug("copied preset name to clipboard: "+`${artists.generic} r${post.id}.${extension}`);
        element.innerHTML = success;
        console.debug("set text to 'copied'");
    } catch (e) {
        console.warn("couldn't write location to clipboard:\n"+e);
        element.innerHTML = failure;
        console.debug("set text to 'failed'");
    }

    setTimeout(() => {
        element.innerHTML = copy;
        console.debug("reset text to 'copy'");
    }, 1000);
}

function copyLawlietCommand() {
    const element = document.getElementById("copyLawlietCommand").firstElementChild;
    const copy = element.innerHTML;
    let success =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z">
            </path>
        </svg>
        <span>Copied!</span>`;
    let failure =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z">
            </path>
        </svg>
        <span>Failed!</span>`;

    try {
        navigator.clipboard.writeText(`l.r34 ${artists.generic}`);
        console.debug("copied preset name to clipboard: "+`l.r34 ${artists.generic}`);
        element.innerHTML = success;
        console.debug("set text to 'copied'");
    } catch (e) {
        console.warn("couldn't write location to clipboard:\n"+e);
        element.innerHTML = failure;
        console.debug("set text to 'failed'");
    }

    setTimeout(() => {
        element.innerHTML = copy;
        console.debug("reset text to 'copy'");
    }, 1000);
}
function displayRawInfo() {
    const rawDiv = document.getElementById("rawPostInfo");
    const rawDrop = rawDiv.children[0];
    const rawInfo = rawDiv.children[1];
    if (rawDiv.display === "true") {
        rawDrop.innerHTML = "[ DISPLAY RAW POST INFO > ]";
        rawInfo.style.display = "none";
        rawDiv.display = "false";
    } else {
        rawDrop.innerHTML = "[ HIDE RAW POST INFO v ]";
        rawInfo.style.display = "block";
        rawDiv.display = "true";
    }
}

function showStuff() {
    document.getElementById("postDisplay").style.display = "grid";
    console.log("revealed display");
}

async function getFileFromUrl(url, name, defaultType = "text/xml") {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
        type: data.type || defaultType
    });
}

function displayError(e, msg) {
    document.getElementById("postDisplay").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").innerHTML =
        `<b><pre>MESSAGE IN TRY-CATCH:</pre></b>
        <i><pre>${msg}</pre></i>
        <br/>
        <b><pre>ERROR MESSAGE:</pre></b>
        <pre>${e}</pre>`;
    document.getElementById("errDisplay").style.display = "block";
}