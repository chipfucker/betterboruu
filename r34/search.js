const debug = true;
const debugErrMsg = "Debug: Forced error";
const debugPosts = {
    link: "https://rule34.xxx/index.php?page=post&s=list&tags=zoologist_(terraria)",
    file: "debug\/search.json",
    error: false ? debugErrMsg : false
};
const debugPost = debugPosts.file; // change depending on needs
const debugErr = debugPosts.error;

async function submitSearch(input) {
    let params = new URL(document.location.toString()).searchParams;
    let name = params.get("name");
    // change as necessary
    const apiUrl = "https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&fields=tag_info&tags=-ai_generated+";
    const url = apiUrl + input;
}