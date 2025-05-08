const debug = false;
const debugErrMsg = "Debug: Forced error";
const debugPosts = {
    type: {
        image: "debug\/image.json",
        animated: "debug\/animated.json",
        video: "debug\/video.json"
    },
    error: false ? debugErrMsg : false
};
const debugPost = debugPosts.type.image; // change depending on needs
const debugErr = debugPosts.error;

submitPost();

async function setEmbed() {
    const artists = getTagOfType(post.tag_info, "artist");
    
    const authorName = document.createElement("meta");
    authorName.property = "author:name";
    authorName.content = `#${post.id}`;
    document.head.appendChild(authorName);

    const authorUrl = document.createElement("meta");
    authorUrl.property = "author:url";
    authorUrl.content = `https://chipfucker.github.io/betterboruu/r34/post#${post.id}`;
    document.head.appendChild(authorUrl);

    const description = document.createElement("meta");
    description.property = "description";
    description.content = `### Artist${artists.plural}:\n${artists.list}`;
    document.head.appendChild(description);

    const imageUrl = document.createElement("meta");
    imageUrl.property = "image:url";
    imageUrl.content = post.file_url;
    document.head.appendChild(imageUrl);
}

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
                "This website is in debug mode, and an error was forced on load.\n"+
                "If you're seeing this, you probably shouldn't be, and you should contact me if you are!";
            displayError(debugErr, msg);
            return;
        }
        post = await fetchData(debugPost);
        console.info("skipped link creation");
    } else {
        // get input
        const input = document.getElementById("url").value;
        console.log("got input: "+(input?input:null));
        const defaultUrl = "https://rule34.xxx/index.php?page=post&s=view&id=";
        // convert input to only id
        const outputId = input.startsWith(defaultUrl) ? input.slice(defaultUrl.length) : input;
        console.log("extracted id: "+(outputId?outputId:null));
        // append id to end of api link
        const url = getLink(outputId);
        console.log("got api link: "+url);
        post = await fetchData(url);
        await setEmbed();
    }

    getTags(post.tag_info); // display extra tag info and get artist tags as one string
    artists = getTagOfType(post.tag_info, "artist");
    displayMedia(post.file_url); // display media
    /// videos don't work on firefox; fix this somehow!!!
    setButtons(); // set all buttons
    displayRaw(document.getElementById("raw"), post); // display raw json info
    showStuff(); // reveal everything
    console.groupEnd();
}

function hideStuff() {
    document.getElementById("display").style.display = "none";
    document.getElementById("errDisplay").style.display = "none";
    console.log("hid displays");
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
        let msg = "Couldn't fetch from: "+url;
        displayError(e, msg);
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
        if (debug) {
            element.innerHTML +=
                `<a
                    href=""
                    title="${tags[x].count} uses"
                ><li>${tags[x].tag}</li></a>`;
        } else {
            element.innerHTML +=
                `<a
                    href="https://rule34.xxx/index.php?page=post&s=list&tags=${tags[x].tag}"
                    title="${tags[x].count} uses"
                ><li>${tags[x].tag}</li></a>`;
        }
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

function displayMedia(mediaUrl) {
    const container = document.getElementById("imageDisplay");
    container.innerHTML = "";

    extension = mediaUrl.split(".").pop().toLowerCase();
    console.log("media extension is ."+extension);
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
    let copy =
        `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 16a1 1 0 0 1-1-1v-5a8 8 0 0 1 8-8h5a1 1 0 0 1 1 1v.5a.5.5 0 0 1-.5.5H10a6 6 0 0 0-6 6v5.5a.5.5 0 0 1-.5.5H3Z">
            </path>
            <path d="M6 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4h-3a5 5 0 0 1-5-5V6h-4a4 4 0 0 0-4 4v8Z">
            </path>
            <path d="M21.73 12a3 3 0 0 0-.6-.88l-4.25-4.24a3 3 0 0 0-.88-.61V9a3 3 0 0 0 3 3h2.73Z">
            </path>
        </svg>
        <span>Copy media link</span>`;
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

function copyLink() {
    const element = document.getElementById("copyLink").firstElementChild;
    let copy =
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

    try {
        navigator.clipboard.writeText(location);
        console.debug("copied location to clipboard: "+location);
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

function displayRaw(element, json) {
    element.innerHTML = JSON.stringify(json, null, 2);
}

function showStuff() {
    document.getElementById("display").style.display = "grid";
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
    const errorDisplay = document.getElementById("errDisplay");
    const errorInfo = document.getElementById("errInfo");
    errorInfo.innerHTML = `MESSAGE IN 'TRY' CATCH:<br>${msg}<br><br>ERROR MESSAGE:<br>${e}`;
    errorDisplay.style.display = "block";
}
