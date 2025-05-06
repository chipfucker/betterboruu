# Testing
## Default post
### ID: 5823623
* [View post](<https://rule34.xxx/index.php?page=post&s=view&id=5823623>)
* [View API info](<https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&json=1&id=5823623>)

# Possible API Info
## JSON
### Object reference

| Object | Description | Misc. Info |
| --- | --- | --- |
| `preview_url` | URL to thumbnail image | |
| `sample_url` | URL to smaller version of image | Same as `preview_url` if `sample` is `false` |
| `file_url` | URL to original media file | |
| `directory` | *Yet to be determined* | |
| `hash` | Hash string associated with media | |
| `width` | Width of media in pixels | |
| `height` | Height of media in pixels | |
| `id` | Numerical ID of post | |
| `image` | Filename of image | |
| `change` | Date of the last modification to the post, in Unix time | |
| `owner` | User who created post | `"bot"` if uploaded by automation |
| `parent_id` | Numerical ID of parent post | `0` if N/A |
| `rating` | How suggestive or explicit the media is | `"s"` for safe, `"q"` for questionable, `"e"` for explicit |
| `sample` | Whether there is a smaller version of the image | |
| `sample_height` | Height of sample image in pixels | |
| `sample_width` | Width of sample image in pixels | |
| `score` | Amount of upvotes given to post | |
| `tags` | Tags that are associated with post | Single object, separated by spaces |
| `source` | Source string associated with post | `""` if N/A |
| `status` | *Yet to be determined* | |
| `has_notes` | *Yet to be determined* | |
| `comment_count` | Amount of comments under post | |