# PRINTXTORE — PREMIUM MULTIPURPOSE PRINT SHOP HTML TEMPLATE

PRINTXTORE is a commercial-quality, multipurpose static HTML template built for printing companies, copy centers, digital design hubs, and 3D printing studios. 

Built with **Tailwind CSS**, **GSAP**, **Three.js**, **Chart.js**, and **Swiper.js**, it operates with a virtual, synchronized database running inside `localStorage`.

---

## Key Template Features

- **Brand Design Accents**: Gradient treatment matching `#134E5E → #71B280` highlighting the signature **X** in `PRINTXTORE`.
- **RTL Support & Dark Mode**: Persistent theme settings (saved to `localStorage`) with full Arabic/Hebrew mirror processing.
- **Three.js 3D Hero Scene**: Floating, mouse-responsive 3D compositions simulating paper stocks, business cards, and packaging mockups.
- **Dynamic Pricing Calculator**: Formulas calculation updating based on paper GSM, single/double sided selections, and binding choices.
- **Drag-and-Drop Uploader**: Simulated progress bar animation and file format validation.
- **Synchronized local DB**: Shared virtual storage syncs additions/removals between customer dashboards and administrator grids in real-time.
- **Complete Admin CRUD**: CRUD management for orders, services, products, messages, blogs, and testimonials.

---

## Directory Organization

```text
PrintXtore/
├── index.html                  (Home 1 - General Services)
├── home-2.html                 (Home 2 - Creative Print Studio)
│
├── pages/
│   ├── about.html              (About timeline and profiles)
│   ├── services.html           (Service tag filters)
│   ├── service-details.html    (Sizing matrices and sticky panels)
│   ├── gallery.html            (Bento masonry gallery + lightboxes)
│   ├── pricing.html            (Pricing tables)
│   ├── blog.html               (Blog categories & search bar)
│   ├── blog-details.html       (Sidebars and article views)
│   ├── contact.html            (Operational directory + map previews)
│   ├── faq.html                (Accordion question panels)
│   ├── file-preparation.html   (CSS bleed guidelines)
│   ├── delivery-options.html   (Shipping rates comparison)
│   ├── 404.html                (Torn paper error design)
│   ├── coming-soon.html        (Countdown timers)
│   └── maintenance.html        (Calibration progress bars)
│
├── auth/
│   ├── login.html              (Authentication and demo bypass)
│   └── register.html           (Customer database insertions)
│
├── dashboard/
│   ├── index.html              (Stats dashboard and Chart.js graphs)
│   ├── orders.html             (Admin order statuses and client reorders)
│   ├── customers.html          (Admin customer registers)
│   ├── services.html           (Service catalog configurations)
│   ├── products.html           (Print templates checklists)
│   ├── pricing.html            (Multiplier adjustments)
│   ├── messages.html           (Feedback reader inboxes)
│   └── settings.html           (User profile configurations)
│
└── assets/
    ├── css/
    │   └── style.css           (Animations and scrollbar presets)
    ├── js/
    │   ├── database.js         (Simulated localStorage engine)
    │   ├── theme-rtl.js        (Dynamic mirror and layout toggles)
    │   ├── main.js             (Common inputs and calculators)
    │   ├── three-scene.js      (3D WebGL renderer)
    │   └── dashboard.js        (CRUD actions and analytical charts)
```

---

## Getting Started

### 1. Running the Site
Simply double-click `index.html` or open the root directory inside a static web server (e.g. Live Server in VS Code, Python `http.server`, or Nginx). All routes use relative paths, ensuring complete functionality in any local environment.

### 2. Standard Demo Accounts
Visit `auth/login.html` and use either:
- **Verified Customer**: `demo@printxtore.com` / `demo123`
- **Store Administrator**: `admin@printxtore.com` / `admin123`
- Alternatively, select the **"CONTINUE AS DEMO USER"** bypass.

### 3. Reviewing Client vs Admin Portals
Inside any page under `dashboard/`, utilize the **"Demo Role Switcher"** located inside the sidebar. Selecting a different mode will refresh the interface and instantly load the other role's features.
