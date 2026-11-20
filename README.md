# CRAFT at COLING 2027

Curation, Reproducibility, and Accountability for Training Foundation Models.

Website: https://craft-2027.github.io/

Contact: organizers-craft@googlegroups.com

## Website pages

- `index.html`: About, including the title, model animation, and workshop overview.
- `themes.html`: Topics of interest.
- `cfp.html`: Call for papers, submission formats, author guidance, and reviewing.
- `timeline.html`: Important dates, featuring the January 5, 2027 paper submission deadline.
- `speakers.html`: Speakers TBA.
- `organizers.html`: Organizer names, affiliations, and portraits.
- `committee.html`: Program committee and reviewer recruitment signup.
- `sponsors.html`: Sponsorship information.
- `program.html`: Workshop program overview, linked from the footer.

`about.html` redirects to the combined About page. Previously shared section links such as `/#dates` and `/#committee` open the corresponding pages.

## Updating content

Edit page content in `src/pages/`, the shared header/footer and metadata in `src/layout.html`, and navigation/page descriptions in `src/site.json`.

Run `python3 scripts/build_site.py` to regenerate the published HTML and sitemap before committing. The builder uses `public/` in a source bundle and the repository root in this GitHub Pages checkout.

Edit `style.css` for styling and `app.js` for the neural animation. Organizer photos are in `portraits/`. `site.js` handles the legacy links and mobile menu. Shared styles and scripts use a content version in their URLs to refresh correctly after publication.

Commit the source and generated files, then push `main`. GitHub Pages publishes the root automatically. No server runtime is required.

The selected palette uses muted emerald accents, neutral charcoal cards, and warm red highlighted panels. Illustration colors are preserved. The exact workshop date and ARR commitment deadline remain TBA.
