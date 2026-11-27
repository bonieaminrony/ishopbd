# iShopBD SEO setup

One set of rules decides every page's title, description, canonical link and structured data.
The same rules run in two places, so the first HTML a search engine downloads and the page the
app shows afterwards always say the same thing.

| Where | File | Job |
|---|---|---|
| App (browser) | `src/seo/seo.ts` | Builds the tags for the page on screen and writes them into `<head>` with `applySeo()`. Called from one effect in `App.tsx`. |
| Server (first HTML) | `public/api/_seo_lib.php`, used by `public/index.php` | Same rules in PHP. Adds the tags, the page's structured data and a visible first-paint block with real names, prices and links. |
| Sitemap | `public/api/sitemap.php` (served at `/sitemap.xml`) | Built live from the product cache: home, every category and subcategory with products, every published product with its photos and last-change date. |
| Site-wide | `index.html` | WebSite and Organization structured data (name iShopBD, other names: i SHOP BD, ishopbd, আই শপ বিডি). |
| Crawling | `public/robots.txt` | Lets search engines in everywhere except private API endpoints; points to the sitemap. |

## Rules

- **Shop name in titles:** `iShopBD`, always at the end after `|`.
- **Product title:** `<name> Price in Bangladesh | iShopBD`, at most 70 characters. Names often carry their own
  "Price in BD" or "| iShop BD" tails; these are removed first. Long names fall back to the full name without the
  price phrase, then the part before the first `|` with "Price in BD", then a shortened name.
- **Product description:** the admin's meta description if written (50+ characters), otherwise the short or full
  description, ending with the price and "ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে হোম ডেলিভারি।" At most 158 characters.
- **Category:** `<Category> Price in Bangladesh | iShopBD`; subcategory `<Sub> Price in Bangladesh – <Category> | iShopBD`.
  Description names how many products and the first three.
- **Addresses:** products `/p/<slug>`, categories `/category/<slug>[/<sub>]`, same slugs everywhere.
  Old category addresses (charger-fan, power-bank, smart-watch, headphone, mobile-accessories, lifestyle-watch)
  send a permanent redirect to today's category.
- **Not indexed (noindex):** /dashboard, /order-success, checkout, cart and other app-only screens, unknown categories,
  products that are hidden or deleted.
- **Structured data:** Product with price, stock (same rule as the page badge), shipping (৳70 Dhaka, ৳130 elsewhere,
  or the product's own charge / free delivery), brand only when it is a real brand, rating only when there are reviews.
  No invented dates.
- **No meta keywords.** Search engines ignore them.

## Changing a rule

Change it in `src/seo/seo.ts` and `public/api/_seo_lib.php` together, run `npx vitest run src/seo`, and check a
product, a category and the home page in the browser (view source shows the server version).

## After deploying

In Google Search Console: submit `https://ishopbd.com/sitemap.xml`, then use URL Inspection on the home page and a
couple of products and press "Request indexing".
