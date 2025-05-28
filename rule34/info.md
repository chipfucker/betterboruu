# API Info
> <details>
>     <summary>
>         Original text from ?page=help&amp;topic=dapi
>     </summary>
>
> # API Basics
> You should never receive an error unless the server is overloaded or the search dies. In cases of the searcher breaking, you will receive a response success of "false" and a message stating "search down" or similar.
>
> # Posts
> ## List
> Url for API access: **index.php?page=dapi&amp;s=post&amp;q=index**
> * **limit** How many posts you want to retrieve. There is a hard limit of 1000 posts per request.
> * **pid** The page number.
> * **tags** The tags to search for. Any tag combination that works on the web site will work here. This includes all the meta-tags. See cheatsheet for more information.
> * **cid** Change ID of the post. This is in Unix time so there are likely others with the same value if updated at the same time.
> * **id** The post id.
> * **json** Set to 1 for JSON formatted response.
>
> ## Deleted Images
> Url for API access: **index.php?page=dapi&amp;s=post&amp;q=index&amp;deleted=show**
> * **last_id** A numerical value. Will return everything above this number.
>
> # Comments
> ## List
> Url for API access: **ndex.php?page=dapi&amp;s=comment&amp;q=index**
> * **post_id** The id number of the comment to retrieve.
>
> # Tags
> ## List
> Url for API access: **index.php?page=dapi&amp;s=tag&amp;q=index**
> * **id** The tag's id in the database. This is useful to grab a specific tag if you already know this value.
> * **limit** How many tags you want to retrieve. There is a default limit of 100 per request.
> </details>

You should never receive an error unless the server is overloaded or the search dies.<br>
*In cases of the searcher breaking, you will receive a response success of "false" and a message stating "search down" or similar.*

## Beginning URL
https://api.rule34.xxx/index.php?page=dapi&q=index ...
* &s=post
    * &limit=*int*
        > Posts to show on a single page<br>
        > Hard maximum of 1000
    * &pid=*int*
        > Page number of results<br>
        > Offsets results by `pid` &times; `limit`
    * &tags=*string*
        > Tag query to search for posts<br>
        > [Cheatsheet applies](#cheatsheet)
    * &cid=*int*
        > Change ID of post<br>
        > In Unix time; other posts may share an ID
    * &id=*int*
        > Post ID
    * &json=
        * 0 *(default)*
            > Fetch as XML document
        * 1
            > Fetch as JSON object<br>
            > Slightly slower than XML
            * &fields=
                * tag_info
                    > Show info for each tag within tag string of post

# Example info
## JSON

```json
[
    {
        "preview_url": "https:\/\/api-cdn.rule34.xxx\/thumbnails\/5109\/thumbnail_0966b7bb5f64f30010d14d5e98bb81e4.jpg",
        "sample_url": "https:\/\/api-cdn.rule34.xxx\/images\/5109\/0966b7bb5f64f30010d14d5e98bb81e4.jpeg",
        "file_url": "https:\/\/api-cdn.rule34.xxx\/images\/5109\/0966b7bb5f64f30010d14d5e98bb81e4.jpeg",
        "directory": 5109,
        "hash": "0966b7bb5f64f30010d14d5e98bb81e4",
        "width": 1136,
        "height": 1250,
        "id": 5823623,
        "image": "0966b7bb5f64f30010d14d5e98bb81e4.jpeg",
        "change": 1680758419,
        "owner": "grovyleslut",
        "parent_id": 0,
        "rating": "safe",
        "sample": false,
        "sample_height": 0,
        "sample_width": 0,
        "score": 361,
        "tags": "anthro belt cleavage female female_only heart inkplasm jeans redhead shirt smile smiling solo terraria welwraith zoologist_(terraria)",
        "source": "",
        "status": "active",
        "has_notes": false,
        "comment_count": 17
    }
]
```

## XML

```xml
<posts
    count="1"
    offset="0">
    <post
        height="1250"
        score="361"
        file_url="https://api-cdn.rule34.xxx/images/5109/0966b7bb5f64f30010d14d5e98bb81e4.jpeg"
        parent_id=""
        sample_url="https://api-cdn.rule34.xxx/images/5109/0966b7bb5f64f30010d14d5e98bb81e4.jpeg"
        sample_width="1136"
        sample_height="1250"
        preview_url="https://api-cdn.rule34.xxx/thumbnails/5109/thumbnail_0966b7bb5f64f30010d14d5e98bb81e4.jpg"
        rating="s"
        tags=" anthro belt cleavage female female_only heart inkplasm jeans redhead shirt smile smiling solo terraria welwraith zoologist_(terraria) "
        id="5823623"
        width="1136"
        change="1680758419"
        md5="0966b7bb5f64f30010d14d5e98bb81e4"
        creator_id="1550138"
        has_children="false"
        created_at="Fri Mar 18 03:02:02 +0100 2022"
        status="active"
        source=""
        has_notes="false"
        has_comments="true"
        preview_width="136"
        preview_height="150"
    />
</posts>
```

## Keys and Values
### Main XML/JSON differences

| XML | JSON |
| - | - |
| All values are strings | Values are strings, integers, and booleans per appropriate key |
| Provides info on amount of posts and page offset | --- |
| --- | All slashes are escaped with backslashes |

### Default parameters

| Attribute | Description | Misc. Info | JSON Parody |
| - | - | - | - |
| `height` | Height of media in pixels | | Yes |
| `score` | Amount of upvotes given to post | | Yes |
| `file_url` | URL to original media file | | Yes |
| `parent_id` | Numerical ID of parent post | `0` if N/A | Yes |
| `sample_url` | URL to smaller version of image | Same as `file_url` if `sample` is `false` | Yes |
| `sample_width` | Width of sample image in pixels | | Yes |
| `sample_height` | Height of sample image in pixels | | Yes |
| `preview_url` | URL to thumbnail image | | Yes |
| `rating` | How suggestive or explicit the media is | | `s` for safe, `q` for questionable, `e` for explicit |
| `tags` | Tags that are associated with post | Single object, separated by spaces | Surrounded by a space on each side of string |
| `id` | Numerical ID of post | | Yes |
| `width` | Width of media in pixels | | Yes |
| `change` | Date of the last modification to the post | In Unix time | Yes |
| `md5` | MD5 hash associated with media | | Key is `hash` |
| `creator_id` | ID of uploading user | | No (see `owner`) |
| `has_children` | Whether the post has children | | No |
| `created_at` | Date of post creation | | No |
| `status` | *Yet to be determined* | | Yes |
| `source` | Source string associated with post | | Yes |
| `has_notes` | *Yet to be determined* | | Yes |
| `has_comments` | Whether the post has comments | | No (see `comment_count`) |
| `preview_width` | Width of preview image in pixels | | No |
| `preview_height` | Height of preview image in pixels | | No |

### `&json=1`

| Object | Description | Misc. Info | XML Parody |
| - | - | - | - |
| `preview_url` | URL to thumbnail image | | Yes |
| `sample_url` | URL to smaller version of image | Same as `file_url` if `sample` is `false` | Yes |
| `file_url` | URL to original media file | | Yes |
| `directory` | *Yet to be determined* | | No |
| `hash` | MD5 hash associated with media | | Attribute is `md5` |
| `width` | Width of media in pixels | | Yes |
| `height` | Height of media in pixels | | Yes |
| `id` | Numerical ID of post | | Yes |
| `image` | Filename of image | `hash` + file extension | No |
| `change` | Date of the last modification to the post | In Unix time | Yes |
| `owner` | User who created post | `"bot"` if uploaded by bot | No (see `creator_id`) |
| `parent_id` | Numerical ID of parent post | `0` if N/A | Yes |
| `rating` | How suggestive or explicit the media is | | `"safe"`, `"questionable"`, and `"explicit"` per se |
| `sample` | Whether there is a smaller version of the image | | No |
| `sample_height` | Height of sample image in pixels | | Yes |
| `sample_width` | Width of sample image in pixels | | Yes |
| `score` | Amount of upvotes given to post | | Yes |
| `tags` | Tags that are associated with post | Single object, separated by spaces | No surrounding characters |
| `source` | Source string associated with post | | Yes |
| `status` | *Yet to be determined* | | Yes |
| `has_notes` | *Yet to be determined* | | Yes |
| `comment_count` | Amount of comments under post | | No (see `has_comments`) |

### `&json=1&fields=tag_info`

| Object | Description | Misc. Info |
| - | - | - |
| `tag_info` | Array of objects that contain info for each tag | |
| `count` | Amount of posts that use tag | |
| `type` | Category of tag | `"tag"` if general, `"metadata"` if meta; others share a value with their name |
| `tag` | Name of tag | |
