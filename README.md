# Harshavardhan Robba — Personal Portfolio

A personal portfolio website for Harshavardhan Robba, AI/ML & LLM Engineer. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies.

**Live site:** [harshavardhan-robba-portfolio.vercel.app](https://harshavardhan-robba-portfolio.vercel.app)

---

## Features

- **Interactive SVG Skills Radar Chart**: Axis-hover tooltips displaying detailed skills of 6 technology categories.
- **Dynamic Neural Network Canvas**: Animated connection network backdrop in the hero section.
- **Infinite Scrolling Skill Carousel**: Dual-track overlapping carousel displaying the technical arsenal.
- **Animated Metric Counters**: Numeric indicators with cubic-bezier easing for key project achievements.
- **Fade-in Scroll Animations**: Smooth element reveal triggers via `IntersectionObserver`.
- **Interactive Card Click Redirects**: Cards automatically redirect to relevant GitHub repositories.
- **Dismissible Status Badge**: "Open to Work" indicator with dismissible button.
- **Direct Resume Download**: Fast access to the resume PDF (`Harshavardhan_Resume_claude.pdf`).
- **Working Contact Form (mailto)**: Client-side validation, error messaging, and input sanitization.
- **Custom Mouse Cursor**: Sleek cursor follower that disappears when leaving the page.
- **Fully Responsive**: Tailored grid/flex layout for mobile, tablet, and desktop screens.
- **Custom SVG Favicon**: Sleek monogram (`HR_` in accent colour).
- **Content Security Policy Headers**: Hardened security policies defined in the meta headers.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox, animations) |
| Scripting | Vanilla JavaScript (ES5-compatible) |
| Fonts | Playfair Display + DM Sans + IBM Plex Mono via Google Fonts |
| Hosting | Vercel |

---

## Project Structure

```
my-portfolio/
├── index.html                       # Shell — navbar, footer, section placeholders
├── styles.css                       # All styles
├── script.js                        # Fetches sections, then initialises all features
├── favicon.svg                      # SVG favicon (HR_ in accent colour)
├── Profile pic (2).jpeg             # Profile photo
├── Harshavardhan_Resume_claude.pdf  # Resume PDF
└── sections/                        # Section HTML fragments (loaded via fetch)
    ├── hero.html                    # Hero section, bio, external links, location, resume download
    ├── skills.html                  # Skills section, carousel & SVG radar chart
    ├── philosophy.html              # Research & Engineering philosophy
    ├── experience.html              # Professional experience timeline
    ├── projects.html                # Selected project cards with metrics and inline charts
    ├── learning-projects.html       # 25 specialized AI, RAG & LLM prototypes
    ├── education.html               # Education history
    ├── publications.html            # Certifications, DeepLearning.AI courses, and skill tags
    └── contact.html                 # Contact form and channels
```

Sections are kept in separate files and injected at runtime by `script.js` using `Promise.all` + `fetch`. This keeps `index.html` clean and each section independently editable.

---

## Running Locally

You need an HTTP server — `fetch()` does not work over `file://`.

**Python:**
```bash
python -m http.server 8080
```

**Node.js:**
```bash
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## Deployment

The site is deployed on **Vercel** and auto-deploys on every push to `main`.

```bash
git add .
git commit -m "your message"
git push
```

---

## Sections

| Section | File | Description |
|---|---|---|
| Hero / About | `sections/hero.html` | Intro, bio, external links, location, resume download |
| Skills | `sections/skills.html` | Infinite skill carousel & SVG skills radar chart |
| Philosophy | `sections/philosophy.html` | Research & Engineering principles |
| Experience | `sections/experience.html` | Professional history and achievements |
| Projects | `sections/projects.html` | Key production-grade project cards with metrics and dynamic charts |
| Learning Projects | `sections/learning-projects.html` | Deep dive into 25 specialized AI, RAG & LLM prototypes |
| Education | `sections/education.html` | Academic degrees and relevant coursework |
| Certifications & Training | `sections/publications.html` | Professional credentials, DeepLearning.AI courses, and skill tags |
| Contact | `sections/contact.html` | Validation contact form and direct contact links |

---

## Contact

- **Email:** robbaharsha834@gmail.com
- **LinkedIn:** [harshavarthanrobba](https://www.linkedin.com/in/harshavarthanrobba)
- **GitHub:** [HarshaVardhanRobba](https://github.com/HarshaVardhanRobba)
