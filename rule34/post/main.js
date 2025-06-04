window.onerror = function handleError(e, url, line) {
    window.alert(`${e}\n\n${line}`);
    document.getElementById("postDisplay").style.display = "none";
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

const debug = false;
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

var postJson = [];
var postXml = [];
var artists = {};

window.onload = async function () {
    console.group("ONLOAD ATTEMPT");
    const jsonUrl = getLink(true);
    const xmlUrl = getLink(false);
    await submitPost(jsonUrl, xmlUrl);
    console.groupEnd();
};

document.getElementById("searchBar").addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        document.getElementById("submit").click();
    }
});

window.addEventListener("hashchange", () => {
    window.location.reload();
});

function searchBarUpdate() {
    document.getElementById("submit").parentElement.href =
        `../search/index.html?q=${document.getElementById("searchBar").firstElementChild.value}&p=0`;
}

async function submitPost(json, xml) {
    document.getElementById("hideError").style.display = "none";
    postJson = await fetchJsonData(json);
    postXml = await fetchXmlData(xml);

    getTags(postJson.tag_info); // display extra tag info and get artist tags as one string
    artists = getTagOfType(postJson.tag_info, "artist"); // assign artist tags to strings
    await setEmbed(artists);
    displayMedia(postJson.file_url); // display media
    displayFamily();
    displayInfo(postJson, postXml);
    setButtons(); // set all buttons
    displayComments(postJson.id); // show all comments under post
    showStuff(); // reveal everything
    console.groupEnd();
}

async function submitSearch(input) {
    location.href = "../search/index.html?q=" + encodeURIComponent(input) + "&p=0";
}

function displayInfo(postJson, postXml) {
    document.getElementById("rawPostInfo").getElementsByTagName("pre")[1].innerHTML =
        `\n${JSON.stringify(postJson, null, 2)}`;
    document.getElementById("id").innerHTML = postJson.id;
    var date = new Date(postXml.querySelector("post").getAttribute("created_at"));
    date = date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    date = date.replace(',', '');
    document.getElementById("posted").innerHTML = date;
    document.getElementById("ownerLink").href = "../search/index.html?q=user:" + encodeURIComponent(postJson.owner) + "&p=0";
    document.getElementById("owner").innerHTML = postJson.owner;
    document.getElementById("size").innerHTML = `${postJson.width}&times;${postJson.height}`;
    document.getElementById("rating").innerHTML = postJson.rating.charAt(0).toUpperCase() + postJson.rating.slice(1);
    document.getElementById("score").innerHTML = postJson.score;
}

function getLink(jsonBool) {
    const apiUrl = `https://api.rule34.xxx//index.php?page=dapi&s=post&q=index${jsonBool?"&json=1&fields=tag_info":""}&id=`;
    let hashId = location.hash.substring(1);
    console.log("got hash value: "+(hashId?hashId:null));
    const id = hashId || "5823623";
    console.log("final id: "+id);
    location.hash = "#" + id;
    url = apiUrl + id;
    console.log("final url: "+url);
    return url;
}

async function fetchJsonData(url) {
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
    return jsonInfo[0];
}

async function fetchXmlData(url) {
    // fetch and handle api content
    console.time("fetch time");
    try {
        response = await fetch(url);
        console.timeEnd("fetch time");
        console.log("got api info from:\n"+url);
        text = await response.text();
    } catch (e) {
        console.timeEnd("fetch time");
        displayError(e, `Couldn't fetch from: ${url}`);
        return;
    }
    const parser = new DOMParser();
    const xmlInfo = parser.parseFromString(text, "text/xml");
    console.groupCollapsed("xml info");
    console.log(new XMLSerializer().serializeToString(xmlInfo));
    console.groupEnd();
    return xmlInfo;
}

function getTags(tags) {
    const ulElement = {
        copyright: document.getElementById("tagCopyright"),
        character: document.getElementById("tagCharacter"),
        artist: document.getElementById("tagArtist"),
        tag: document.getElementById("tagGeneral"),
        metadata: document.getElementById("tagMetadata"),
        null: document.getElementById("tagNull")
    };
    console.log("got list elements");
    for (const x in ulElement) {
        ulElement[x].innerHTML = "";
        console.log("reset list items: "+x);
    }
    console.groupCollapsed("displaying tags");
    for (const x in tags) {
        const element = ulElement[tags[x].type];
        element.innerHTML +=
            `<a
                href="../search/index.html?q=${encodeURIComponent(tags[x].tag)}&p=0"
                title="${tags[x].count} uses"
            ><li>${tags[x].tag.replaceAll("_", " ")}</li></a>`;
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

async function setEmbed(artists) {
    const titleElement = document.getElementsByTagName("title")[0];
    titleElement.innerText = `#${postJson.id} - ${artists.comma}`;

    //const authorName = document.createElement("meta");
    //authorName.setAttribute("property", "og:author:name");
    //authorName.content = `#${postJson.id}`;
    //document.head.appendChild(authorName);
    //
    //const authorUrl = document.createElement("meta");
    //authorUrl.setAttribute("property", "og:author:url");
    //authorUrl.content = `https://chipfucker.github.io/betterboruu/rule34/post#${postJson.id}`;
    //document.head.appendChild(authorUrl);
    //
    //const description = document.createElement("meta");
    //description.setAttribute("property", "og:description");
    //description.content = `### Artist${artists.plural}:\n${artists.list}`;
    //document.head.appendChild(description);
    //
    //const imageUrl = document.createElement("meta");
    //imageUrl.setAttribute("property", "og:image:url");
    //imageUrl.content = postJson.file_url;
    //document.head.appendChild(imageUrl);
    //
    //const title = document.createElement("meta");
    //title.setAttribute("property", "title");
    //title.content = `#${artists.and}`;
    //document.head.appendChild(title);
}

function displayMedia(mediaUrl) {
    console.log(`media url: ${mediaUrl}`);
    const container = document.getElementById("imageDisplay");
    container.innerHTML = "";

    extension = mediaUrl.split(".").pop().toLowerCase();
    console.log("media extension: ."+extension);
    const imageExt = ["jpg", "jpeg", "png", "gif"];
    const videoExt = ["mp4"];


    if (imageExt.includes(extension)) {
        console.log("media is assumed an image");
        const img = document.createElement("img");
        img.src = mediaUrl;
        img.alt = postJson.image;
        container.appendChild(img);
    } else if (videoExt.includes(extension)) {
        console.log("media is assumed a video");
        const video = document.createElement("video");
        video.controls = true;
        video.autoplay = false;
        video.loop = true;
        video.muted = false;
        video.preload = "auto";
        video.alt = postJson.image;
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
    setOpenMedia(postJson.file_url); // set open media link
    // setDownloadLink(postJson.file_url); // set download media link
    // setSpecialDownloadLink(postJson.file_url, postJson.id, artists); // set special download media link and name
    setOpenPost(postJson.id); // set open original post link

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
        const element = document.getElementById("openPost");
        element.href = `https://rule34.xxx/index.php?page=post&s=view&id=${id}`;
    }
}

function displayFamily() {

}

async function displayComments(id) {
    const url = "https://api.rule34.xxx//index.php?page=dapi&s=comment&q=index&post_id=" + id;
    console.time("fetch time");
    try {
        response = await fetch(url);
        console.timeEnd("fetch time");
        console.log("got api info from:\n"+url);
        text = await response.text();
    } catch (e) {
        console.timeEnd("fetch time");
        displayError(e, `Couldn't fetch from: ${url}`);
        return;
    }
    const parser = new DOMParser();
    const xmlInfo = parser.parseFromString(text, "text/xml");
    console.groupCollapsed("xml info");
    console.log(new XMLSerializer().serializeToString(xmlInfo));
    console.groupEnd();

    const array = xmlInfo.querySelector("comments").children;
    const commentCon = document.getElementById("comments").firstElementChild;

    for (let x = 0; x < array.length; x++) {
        console.log(array[x]);
        const id = array[x].getAttribute("id");
        const creator = array[x].getAttribute("creator");
        const body = array[x].getAttribute("body");
        const creatorApplicable = false;
        commentCon.innerHTML +=
            `<li><div class="card">
                ${creatorApplicable?'<a href="../search/index.html?q=user:${encodeURIComponent(creator)}">':""}
                    <span class="creator">${creator}</span>
                ${creatorApplicable?"</a>":""}
                <span class="id">&raquo; #${id}</span>
                <br>
                <blockquote>
                    <span>${body}</span>
                </blockquote>
            </div></li>`;
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
        navigator.clipboard.writeText(postJson.file_url);
        console.debug("copied media link to clipboard: "+postJson.file_url);
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
        navigator.clipboard.writeText(`${artists.generic} r${postJson.id}.${extension}`);
        console.debug("copied preset name to clipboard: "+`${artists.generic} r${postJson.id}.${extension}`);
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
        rawDrop.innerHTML = "[ \\/ SHOW RAW POST INFO \\/ ]";
        rawInfo.style.display = "none";
        rawDiv.display = "false";
    } else {
        rawDrop.innerHTML = "[ /\\ HIDE RAW POST INFO /\\ ]";
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
