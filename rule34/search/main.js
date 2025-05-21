const dom = {
    searchBar: document.getElementById("searchBar"),
    searchDisplay: document.getElementById("searchDisplay"),
    errDisplay: document.getElementById("errDisplay"),
    errInfo: document.getElementById("errInfo"),
    hideError: document.getElementById("hideError"),
    noResults: document.getElementById("noResults"),
    prevPage: document.getElementById("prevPage"),
    nextPage: document.getElementById("nextPage"),
    pageCount: document.getElementById("pageCount").firstElementChild
};

window.onerror = function handleError(e, url, line) {
    window.alert(`${e}\n\n${line}`);
    dom.searchDisplay.style.display = "none";
    dom.hideError.style.display = "none";
    dom.errInfo.innerHTML =
        `<b><pre>ERROR MESSAGE:</pre></b>
        <pre>${e}</pre>
        <br/>
        <b><pre>ERROR URL:</pre></b>
        <pre>${url}</pre>
        <br/>
        <b><pre>ERROR LINE:</pre></b>
        <pre>${line}</pre>`;
    dom.errDisplay.style.display = "block";
    console.error(e);
    return false;
};

var link = "";
var page = 0;
var resultsJson = [];
var resultsXml = [];

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

window.onload = function () {
    console.group("ONLOAD ATTEMPT");
    const jsonUrl = getLink(true);
    const xmlUrl = getLink(false);
    submitSearch(jsonUrl, xmlUrl);
};

document.getElementById("searchBar").addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        document.getElementById("submit").click();
    }
});

function searchBarUpdate() {
    document.getElementById("submit").parentElement.href =
        `index.html?q=${document.getElementById("searchBar").value}&p=0`;
}

async function submitSearch(json, xml) {
    document.getElementById("hideError").style.display = "none";
    resultsJson = await fetchJsonData(json);
    resultsXml = await fetchXmlData(xml);

    displayResults(resultsJson, resultsXml);
}

async function submitPost(id) {
    window.location.href = "../post/index.html#"+id;
}

function getLink(jsonBool) {
    const link = new URLSearchParams(window.location.search);
    console.log("got link params");
    console.groupCollapsed("link params object");
    console.log(link);
    console.groupEnd();
    var query = link.get("q");
    query = query?query:"";
    console.log("got link query: "+(query?query:"null"));
    document.getElementById("searchBar").value = query;
    const page = link.get("p");
    const url = `https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&limit=50&json=${jsonBool?1:0}&tags=-ai_generated%20${encodeURIComponent(query)}&pid=${page?page:0}`;
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
    return jsonInfo;
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
    console.log(JSON.stringify(xmlInfo, null, 1));
    console.groupEnd();
    return xmlInfo;
}

function displayResults(resultsJson, resultsXml) {
    // display page buttons
    const link = new URLSearchParams(window.location.search);
    console.group("pages");
    const page = link.get("p");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");
    console.log("page is "+page);
    if (Number(page) != 0) {
        prevPage.removeAttribute("disabled");
        prevPage.setAttribute("onclick", "prevPage()");
    }

    const resultCount = Number(resultsXml.querySelector("posts").getAttribute("count"));
    const resultOffset = Number(resultsXml.querySelector("posts").getAttribute("offset"));
    const furtherResults = resultCount - resultOffset;
    const totalPages = Math.ceil(resultCount / 50);
    console.log("resultCount is "+resultCount);
    console.log("resultOffset is "+resultOffset);
    console.log(`${resultCount} - ${resultOffset} = ${furtherResults}`);
    console.log("totalPages is "+totalPages);
    if (furtherResults > 50) {
        nextPage.removeAttribute("disabled");
        nextPage.setAttribute("onclick", "nextPage()");
    } else if (resultCount === 0) {
        document.getElementById("noResults").style.display = "block";
        document.getElementById("errDisplay").style.display = "none";
    }
    if (resultCount)
        document.getElementById("pageCount").firstElementChild.innerText = `${Number(page)+1} / ${totalPages}`;
    else
        document.getElementById("pageCount").firstElementChild.innerText = '( ^_^ )/"';
    console.groupEnd();
    // display images
    const display = document.getElementById("searchDisplay");
    display.innerHTML = "";
    for (const x in resultsJson) {
        const extension = resultsJson[x].image.split(".").pop();
        if (extension === "mp4") {
            display.innerHTML +=
                `<div class="post postVideo" id="result-${x}"
                    onmouseover="overVideo(this, true)" onmouseout="overVideo(this, false)">
                    <a href="../post/index.html#${resultsJson[x].id}">
                        <img src="${resultsJson[x].preview_url}"/>
                        <video style="display: none" src="${resultsJson[x].file_url}"
                            type="video/mp4" preload="none" muted loop disablepictureinpicture>
                    </a>
                </div>`;
        } else if (extension === "gif") {
            display.innerHTML +=
                `<div class="post postGif" id="result-${x}"
                    onmouseover="mouseImg(this, '${resultsJson[x].file_url}')"
                    onmouseout="mouseImg(this, '${resultsJson[x].preview_url}')">
                    <a href="../post/index.html#${resultsJson[x].id}">
                        <img src="${resultsJson[x].preview_url}"/>
                    </a>
                </div>`;
        } else {
            display.innerHTML +=
                `<div class="post" id="result-${x}"
                    onmouseover="mouseImg(this, '${resultsJson[x].file_url}')"
                    onmouseout="mouseImg(this, '${resultsJson[x].preview_url}')">
                    <a href="../post/index.html#${resultsJson[x].id}">
                        <img src="${resultsJson[x].preview_url}"/>
                    </a>
                </div>`;
        }
    }
}

function mouseImg(el, img) {
    if (!isMobile()) {
        el.firstElementChild.firstElementChild.src = img;
    }
}

function overVideo(el, bool) {
    if (!isMobile()) {
        if (bool) {
            el.firstElementChild.firstElementChild.style.display = "none";
            el.firstElementChild.lastElementChild.style.display = "unset";
            el.firstElementChild.lastElementChild.play();
        } else {
            el.firstElementChild.firstElementChild.style.display = "unset";
            el.firstElementChild.lastElementChild.style.display = "none";
            el.firstElementChild.lastElementChild.pause();
        }
    }
}

function prevPage() {
    const link = new URLSearchParams(window.location.search);
    console.log("navigating to previous page");
    const page = link.get("p");
    if (page != 0) {
        link.set("p", Number(page) - 1);
        window.location.search = link.toString();
    } else {
        window.alert("You're on the first page already!");
    }
}
function nextPage() {
    const link = new URLSearchParams(window.location.search);
    console.log("navigating to next page");
    const page = link.get("p");
    if (resultsJson.length === 50) {
        link.set("p", Number(page) + 1);
        window.location.search = link.toString();
    } else {
        window.alert("You're on the last page already!");
    }
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

function noResults(e, msg) {
    document.getElementById("searchDisplay").style.display = "none";
    document.getElementById("hideError").style.display = "none";
    document.getElementById("errInfo").style.display = "none";
    document.getElementById("noResults").style.display = "block";
}
