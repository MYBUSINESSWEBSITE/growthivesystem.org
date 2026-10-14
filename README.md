# growthivesystems.com

Static website for Growthive Systems. Plain HTML, CSS and JavaScript for GitHub Pages. No build step.

## Pages
- index.html: home (scroll-driven product showcase and work gallery)
- solutions.html: the four service divisions (#technology, #systems, #data, #growth)
- products.html: Growthive Monitor (#monitor) and Growthive Book (#book)
- work.html: case studies and design gallery (portfolio.html redirects here)
- about.html, contact.html, privacy.html, 404.html

## Deploy
1. Replace the contents of the `growthivesystem.org` repo with this folder (keep the `.git` folder).
2. Repo Settings > Pages: Deploy from a branch, `main`, `/ (root)`.
3. The `CNAME` file sets the custom domain to growthivesystems.com. At your domain registrar add:
   - A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME record for `www`: growthivesystems.github.io
4. Once the domain verifies, tick "Enforce HTTPS" in Settings > Pages.

## Things to know
- Contact form posts to Formspree form `xnjljdpq`. Submissions arrive in the email linked to that Formspree account.
- Scroll effects use GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.1.13 (unpkg). If they fail to load, every page still shows all content. Visitors with "reduce motion" switched on get no scroll effects.
- Product screenshots in assets/img/screens are the real Monitor and Book interfaces rendered with sample data, and are labelled as sample data on the site.
- Shared header and footer are repeated in each HTML file. If you change a nav link, change it on every page.
