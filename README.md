# DualCanvas

A static site generator for a design portfolio in English and Arabic (LTR and RTL). It builds a project gallery with category filters, case-study pages with an image gallery and viewer, optimised WebP images, canonical and `hreflang` links, JSON-LD, a sitemap, `robots.txt`, a 404 page and a `noindex` preview build.

It was extracted from the build scripts of the author's personal portfolio. All personal text, CVs, screenshots and brand material were removed and replaced with neutral placeholders. It is newly published as a standalone project and has no adoption metrics yet.

## Use

Requires Node.js 22 or later.

```sh
npm install
npm run build            # writes dist/
npm run build:preview    # writes dist-preview/ with noindex
npm test
```

Edit your content:

- `content/site.json`: name, Arabic name, wordmark, location, email, links, CV files, intro, about, experience, hero project.
- `content/projects.json`: projects with `format` (`mobile`, `web` or `brand`), English text, an `ar` block with Arabic text, images, screens, links, colours and an optional `note` shown on the project page.
- `assets/`: your images (PNG or JPEG) and CV PDFs. Names are referenced from the content files.

Some section copy (for example "How I work" and the hero headline) lives in `src/templates.mjs` and should be edited to match your voice. Content is HTML-escaped on output.

Upload the contents of the output folder to a static host.

## Layout

- `src/build.mjs`: builds pages, images, sitemap and headers.
- `src/templates.mjs`: home and project templates.
- `src/enhancements.js`: filters, gallery and image viewer (progressive enhancement).
- `src/style.css`: styles.
- `src/test.mjs`: build, structure, preview and escaping checks.

## License

Proposed: MIT for the code (see `LICENSE` and `NOTICE.md`), pending the owner's decision. Fonts keep their own licenses.
