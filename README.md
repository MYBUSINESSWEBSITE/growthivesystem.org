# growthivesystems.com

Static website for Growthive Systems. Plain HTML, CSS and JavaScript for GitHub Pages. No build step.

## Pages
- index.html: home (animated hero, stacking services, pinned product showcase, work gallery, packages, founder)
- solutions.html: the four service divisions (#technology, #systems, #data, #growth)
- products.html: Growthive Monitor (#monitor) and Growthive Book (#book)
- packages.html: Launch, Build and Scale packages (no prices, "Get a quote")
- work.html: case studies and design gallery (portfolio.html redirects here)
- about.html, contact.html, privacy.html, 404.html

## Deploy
1. Upload ALL these files to the repo root (Add file → Upload files). No folders needed.
2. Repo Settings > Pages: Deploy from a branch, `main`, `/ (root)`.
3. Custom domain (only after DNS is set up): add a file named `CNAME` containing `growthivesystems.com`, or enter it in Settings > Pages. At your domain registrar add:
   - A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME record for `www`: growthivesystems.github.io
4. Once the domain verifies, tick "Enforce HTTPS" in Settings > Pages.

## Things to know
- Contact form posts to Formspree form `xdayvwlk`. Submissions arrive in the email linked to that Formspree account.
- Scroll effects use GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.1.13 (unpkg). If they fail to load, every page still shows all content. Visitors with "reduce motion" switched on get no scroll effects.
- Product screenshots in screens are the real Monitor and Book interfaces rendered with sample data, and are labelled as sample data on the site.
- Shared header and footer are repeated in each HTML file. If you change a nav link, change it on every page.
