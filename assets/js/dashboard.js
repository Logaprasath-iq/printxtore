// PRINTXTORE Dashboard Controller (Supports all separate HTML pages and full CRUD)

document.addEventListener("DOMContentLoaded", () => {
  // Fallback showToast if main.js is not loaded
  if (typeof window.showToast === "undefined") {
    window.showToast = function(message, type = "success") {
      let oldToast = document.querySelector(".toast-notification");
      if (oldToast) oldToast.remove();

      const toast = document.createElement("div");
      toast.className = `toast-notification glass ${
        type === "success" 
          ? "border-emerald/30 text-[#10B981] bg-[#18242D]/95" 
          : "border-red-500/30 text-red-400 bg-[#251212]/95"
      }`;
      
      let iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
      if (type !== "success") {
        iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
      }

      toast.innerHTML = `${iconHTML} <span>${message}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add("show");
      }, 50);

      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    };
  }

  // Check auth session
  let currentUser = JSON.parse(localStorage.getItem("printxtore_session"));
  
  // Enforce authentication
  if (!currentUser && !window.location.pathname.includes("login.html") && !window.location.pathname.includes("register.html")) {
    window.location.href = "../auth/login.html";
    return;
  }

  // --- INITIALIZE SYNCED LOCALSTORAGE DATABASES ---
  const getDB = (key, fallback) => {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  };

  const DEFAULT_CUSTOMERS = [
    { id: "cust-1", name: "Emma Watson", email: "demo@printxtore.com", phone: "+91 9999988888", company: "Watson Designs", address: "12, Ring Road", city: "Delhi", state: "Delhi", pincode: "110001", status: "Active" },
    { id: "cust-2", name: "Bruce Wayne", email: "bruce@wayne.com", phone: "+1 555-0199", company: "Wayne Enterprises", address: "Wayne Manor", city: "Gotham", state: "New Jersey", pincode: "07001", status: "Active" }
  ];

  const DEFAULT_SERVICES = [
    { id: "srv-1", name: "Business Cards", category: "Stationery", description: "Premium cardstocks, custom finishes, matte/gloss.", basePrice: 450, status: "Active" },
    { id: "srv-2", name: "Flyers & Leaflets", category: "Marketing", description: "High volume standard marketing handouts, high-speed offset.", basePrice: 850, status: "Active" },
    { id: "srv-3", name: "Posters & Banners", category: "Large Format", description: "Large format high-fidelity indoor and outdoor displays.", basePrice: 1200, status: "Active" },
    { id: "srv-4", name: "Packaging", category: "Packaging", description: "Custom boxes, mailer boxes, kraft cardboard.", basePrice: 2500, status: "Active" }
  ];

  const DEFAULT_PRICING = [
    { product: "Business Cards", basePrice: 450, qtyFactor: 0.85, paperFactor: 1.0, gsmFactor: 1.0, finishPrice: 2, bindingPrice: 0, deliveryPrice: 100 },
    { product: "Flyers & Leaflets", basePrice: 850, qtyFactor: 0.8, paperFactor: 1.1, gsmFactor: 1.1, finishPrice: 1.5, bindingPrice: 0, deliveryPrice: 100 },
    { product: "Posters & Banners", basePrice: 1200, qtyFactor: 0.75, paperFactor: 1.2, gsmFactor: 1.2, finishPrice: 3, bindingPrice: 0, deliveryPrice: 150 },
    { product: "Packaging", basePrice: 2500, qtyFactor: 0.6, paperFactor: 1.4, gsmFactor: 1.4, finishPrice: 3, bindingPrice: 0, deliveryPrice: 200 }
  ];

  const DEFAULT_PRODUCTS = [
    { id: "prod-1", name: "Premium Silk Paper", category: "Paper", price: 15, size: "A4", paperType: "Premium Silk", gsm: "350 GSM", finishing: "Matte", stock: 1200, status: "Active" },
    { id: "prod-2", name: "Corrugated Kraft Board", category: "Paper", price: 25, size: "Custom", paperType: "Kraft Board", gsm: "450 GSM", finishing: "None", stock: 650, status: "Active" }
  ];

  const DEFAULT_ORDERS = [
    { id: "PX-1001", customerId: "cust-1", customerName: "Emma Watson", product: "Business Cards", quantity: 500, specs: { size: "3.5\" x 2.0\"", paper: "Premium Silk 350 GSM", color: "Full Color", side: "Double Sided", finish: "Matte Lamination", binding: "None" }, file: { name: "design_draft.pdf", size: "2.1 MB" }, price: 850, status: "Printing", createdAt: "2026-08-20", notes: "Please keep colors bright." }
  ];

  const DEFAULT_BLOG = [
  {
    id: "blog-1",
    title: "3D Printing: SLA vs FDM Explanations",
    category: "3D PRINTING",
    author: "Markus Vance",
    date: "Aug 15, 2026",
    excerpt: "Explore the fundamental differences between Stereolithography (SLA) and Fused Deposition Modeling (FDM) in modern 3D printing.",
    image: "https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?auto=format&fit=crop&w=800&q=80",
    readTime: "4 min",
    contentHtml: "<p>Fused Deposition Modeling (FDM) and Stereolithography (SLA) are the two most popular types of 3D printers on the market. FDM works by extruding thermoplastic filaments, whereas SLA works by curing liquid resin using ultraviolet laser beams. In this guide, we dive deep into their resolution, strength, and post-processing requirements to help you choose the right method for your prototypes.</p>",
    status: "Published"
  },
  {
    id: "blog-2",
    title: "Choosing Paper Weight: GSM Guide",
    category: "MATERIAL GUIDE",
    author: "Elena Rostova",
    date: "Aug 18, 2026",
    excerpt: "Understanding Grams per Square Meter (GSM) is crucial for choosing the right paper thickness for print collateral.",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    readTime: "3 min",
    contentHtml: "<p>Grams per Square Meter (GSM) is the standard unit of measurement for paper weight and density. Standard office paper is usually around 80 GSM, while premium business cards require 350 GSM to 450 GSM. Choosing the correct GSM ensures your leaflets, brochures, or cards feel premium and match your brand identity.</p>",
    status: "Published"
  },
  {
    id: "blog-3",
    title: "RGB vs CMYK Gamut Conversions",
    category: "COLOR SETUP",
    author: "David Kael",
    date: "Aug 20, 2026",
    excerpt: "Learn how to avoid dull colors by converting your RGB digital designs to print-ready CMYK profiles.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min",
    contentHtml: "<p>RGB color space is additive and used for light-emitting digital screens, while CMYK is subtractive and used for printing inks. Converting an RGB file directly to CMYK can result in unexpected color shifts, rendering vibrant greens and blues dull. In this guide, we explain how to configure Adobe Photoshop or Illustrator for CMYK color gamuts before export.</p>",
    status: "Published"
  },
  {
    id: "blog-4",
    title: "Matte vs Gloss: Choosing the Right Finish",
    category: "PRINT FINISHING",
    author: "Sarah Jenkins",
    date: "Aug 21, 2026",
    excerpt: "Compare matte and gloss finishes to determine which coating works best for your marketing print materials.",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    readTime: "3 min",
    contentHtml: "<p>Matte finishes offer a non-reflective, elegant texture that prevents glare and fingerprint smudges, making them ideal for high-text brochures and premium cards. Gloss coatings, on the other hand, provide a shiny reflective finish that makes high-contrast images and saturated graphics pop. Here is how to choose the right coating for your layout.</p>",
    status: "Published"
  },
  {
    id: "blog-5",
    title: "How Print Design Builds Stronger Brands",
    category: "BRANDING",
    author: "Alex Rivera",
    date: "Aug 22, 2026",
    excerpt: "Discover why tactile print marketing and physical collateral are still essential for modern brand engagement.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    readTime: "4 min",
    contentHtml: "<p>In a saturated digital landscape, tangible brand representations create a lasting impression. From heavy business cards to customized brochures and packaging, print design establishes a tactile connection with clients. We explore the cognitive science behind brand memory retention through high-quality physical print media.</p>",
    status: "Published"
  },
  {
    id: "blog-6",
    title: "Custom Packaging: From Design to Print",
    category: "PACKAGING",
    author: "Elena Rostova",
    date: "Aug 22, 2026",
    excerpt: "A comprehensive walkthrough of the die-line preparation, material sourcing, and printing phases of packaging.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    readTime: "6 min",
    contentHtml: "<p>Designing custom packaging requires precision. You must prepare a flat die-line template indicating cut lines and crease folds, account for bleed margins, choose durable kraft or cardboard paper stocks, and apply custom finish coatings. This guide walks you through preparing print-ready packaging templates.</p>",
    status: "Published"
  }
];

const DEFAULT_MESSAGES = [
    { id: "msg-1", name: "John Doe", email: "john@example.com", phone: "+91 9999911111", subject: "Wholesale Inquiry", message: "Looking for printing 10,000 brochures monthly. Please share rates.", status: "Unread", createdAt: "2026-08-22" }
  ];

  const DEFAULT_NOTIFICATIONS = [
    { id: "notif-1", userId: "cust-1", message: "Your order PX-1001 status changed to: Printing.", read: false, date: "2026-08-22" }
  ];

  // Initialize databases
  const customers = getDB("printxtore_customers", DEFAULT_CUSTOMERS);
  const services = getDB("printxtore_services", DEFAULT_SERVICES);
  const pricing = getDB("printxtore_pricing", DEFAULT_PRICING);
  const products = getDB("printxtore_products", DEFAULT_PRODUCTS);
  const orders = getDB("printxtore_orders", DEFAULT_ORDERS);
  const blogs = getDB("printxtore_blog", DEFAULT_BLOG);
  const messages = getDB("printxtore_messages", DEFAULT_MESSAGES);
  const notifications = getDB("printxtore_notifications", DEFAULT_NOTIFICATIONS);

  // Sync printxtore_users with customers for login/signup integrity
  getDB("printxtore_users", DEFAULT_CUSTOMERS);

  // Set up view toggling (client vs admin navigation display)
  const clientNav = document.getElementById("nav-client");
  const adminNav = document.getElementById("nav-admin");
  
  if (currentUser) {
    if (currentUser.role === "client") {
      if (clientNav) clientNav.classList.remove("hidden");
      if (adminNav) adminNav.classList.add("hidden");
      document.querySelectorAll(".client-only").forEach(el => el.classList.remove("hidden"));
      document.querySelectorAll(".admin-only").forEach(el => el.classList.add("hidden"));
    } else {
      if (adminNav) adminNav.classList.remove("hidden");
      if (clientNav) clientNav.classList.add("hidden");
      document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
      document.querySelectorAll(".client-only").forEach(el => el.classList.add("hidden"));
    }
    // Populate header name
    document.querySelectorAll(".user-name-display").forEach(el => el.textContent = currentUser.name);
  }

  // --- HIGHLIGHT ACTIVE SIDEBAR NAV LINK ---
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll("#dashboard-sidebar nav a");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (path.includes(href)) {
      link.classList.remove("text-[#1A2730]/65", "dark:text-white/60", "hover:bg-black/5", "dark:hover:bg-white/5");
      link.classList.add("bg-gradient-to-r", "from-[#F15A24]", "to-[#ff6b3b]", "text-white", "font-bold", "shadow-lg");
    }
  });

  // Demo switcher control
  const switcher = document.getElementById("demo-role-switcher");
  if (switcher && currentUser) {
    switcher.value = currentUser.role;
    switcher.addEventListener("change", () => {
      const selected = switcher.value;
      if (selected === "admin") {
        currentUser = { id: "admin-1", name: "PrintXtore Admin", email: "admin@printxtore.com", role: "admin", phone: "+91 9876543210" };
      } else {
        currentUser = { id: "cust-1", name: "Emma Watson", email: "demo@printxtore.com", role: "client", phone: "+91 9999988888", company: "Watson Designs" };
      }
      localStorage.setItem("printxtore_session", JSON.stringify(currentUser));
      window.location.href = "index.html";
    });
  }

  // Logout Control
  document.querySelectorAll(".logout-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("printxtore_session");
      showToast("Logged out successfully.");
      setTimeout(() => {
        window.location.href = "../auth/login.html";
      }, 800);
    });
  });

  // =========================================================================
  // --- 1. OVERVIEW PAGE CONTROLLERS (index.html) ---
  // =========================================================================
  const isOverview = path.includes("index.html") || path.endsWith("/dashboard") || path.endsWith("/dashboard/") || path.endsWith("/");
  if (isOverview) {
    if (currentUser.role === "client") {
      const clientOrders = orders.filter(o => o.customerId === currentUser.id);

      const activeCount = clientOrders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
      const completedCount = clientOrders.filter(o => o.status === "Delivered").length;
      const pendingCount = clientOrders.filter(o => o.status === "File Received" || o.status === "Artwork Review").length;
      const totalSpent = clientOrders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + Number(o.price || 0), 0);

      document.getElementById("stat-client-active").textContent = activeCount;
      document.getElementById("stat-client-completed").textContent = completedCount;
      document.getElementById("stat-client-pending").textContent = pendingCount;
      document.getElementById("stat-client-spent").textContent = `₹${totalSpent.toLocaleString()}`;

      // Spending Summary Calculations
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthSpent = clientOrders
        .filter(o => {
          const d = new Date(o.createdAt);
          return o.status !== "Cancelled" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, o) => sum + Number(o.price || 0), 0);

      const prevMonthSpent = clientOrders
        .filter(o => {
          const d = new Date(o.createdAt);
          const pm = currentMonth === 0 ? 11 : currentMonth - 1;
          const py = currentMonth === 0 ? currentYear - 1 : currentYear;
          return o.status !== "Cancelled" && d.getMonth() === pm && d.getFullYear() === py;
        })
        .reduce((sum, o) => sum + Number(o.price || 0), 0);

      const avgSpent = clientOrders.length > 0 ? Math.round(totalSpent / clientOrders.length) : 0;

      document.getElementById("spend-this-month").textContent = `₹${thisMonthSpent.toLocaleString()}`;
      document.getElementById("spend-prev-month").textContent = `₹${prevMonthSpent.toLocaleString()}`;
      document.getElementById("spend-avg-order").textContent = `₹${avgSpent.toLocaleString()}`;

      // Render notifications
      const nlist = document.getElementById("recent-notifications-list");
      const clientNotifs = notifications.filter(n => n.userId === currentUser.id).slice(0, 3);
      
      nlist.innerHTML = "";
      if (clientNotifs.length === 0) {
        nlist.innerHTML = `<p class="text-xs text-[#1A2730]/50 dark:text-white/50">No notifications.</p>`;
      } else {
        clientNotifs.forEach(n => {
          nlist.innerHTML += `
            <div class="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex justify-between items-center text-xs">
              <span class="${n.read ? 'text-[#1A2730]/50 dark:text-white/50' : 'text-[#1A2730] dark:text-white font-bold'}">${n.message}</span>
              <span class="text-[10px] text-[#1A2730]/40 dark:text-white/40">${n.date}</span>
            </div>
          `;
        });
      }

      // Render Active Job timeline
      const activeJob = clientOrders
        .filter(o => o.status !== "Delivered" && o.status !== "Cancelled")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      const tracker = document.getElementById("client-job-tracker");
      if (activeJob) {
        const stages = ["File Received", "Artwork Review", "Printing", "Quality Check", "Ready", "Delivered"];
        const curIdx = stages.indexOf(activeJob.status);

        tracker.innerHTML = `
          <div class="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-xs text-[#1A2730]/50 dark:text-white/50 uppercase tracking-widest font-bold">Order ID: ${activeJob.id}</span>
              <span class="text-xs text-[#F15A24] font-bold">${activeJob.product}</span>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
              ${stages.map((stg, idx) => {
                const completed = idx <= curIdx;
                const active = idx === curIdx;
                return `
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-[#F15A24] text-white animate-pulse' : (completed ? 'bg-green text-white' : 'bg-black/10 dark:bg-white/5 text-[#1A2730]/40 dark:text-white/40')}">
                      ${completed ? '✓' : idx + 1}
                    </div>
                    <span class="text-xs ${active ? 'text-[#F15A24] font-bold' : (completed ? 'text-[#1A2730] dark:text-white font-medium' : 'text-[#1A2730]/40 dark:text-white/40')}">${stg}</span>
                  </div>
                `;
              }).join('<div class="hidden md:block flex-grow h-0.5 bg-black/10 dark:bg-white/5"></div>')}
            </div>
          </div>
        `;
      } else {
        tracker.innerHTML = `
          <div class="glass p-6 rounded-2xl border-white/5 text-center text-xs text-[#1A2730]/50 dark:text-white/50 py-8">
            No active print jobs.
          </div>
        `;
      }

      // Render Recent Orders table
      const tbody = document.getElementById("recent-orders-tbody");
      tbody.innerHTML = "";
      
      const recents = clientOrders.slice(0, 5);
      if (recents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No orders found.</td></tr>`;
      } else {
        recents.forEach(o => {
          tbody.innerHTML += `
            <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
              <td class="px-6 py-4 font-semibold">${o.id}</td>
              <td class="px-6 py-4">${o.product}</td>
              <td class="px-6 py-4 text-[#1A2730]/60 dark:text-white/60">${new Date(o.createdAt).toLocaleDateString()}</td>
              <td class="px-6 py-4 text-[#1A2730]/50 dark:text-white/50">${o.quantity}</td>
              <td class="px-6 py-4 font-bold text-[#F15A24]">₹${o.price.toLocaleString()}</td>
              <td class="px-6 py-4">${getStatusBadgeHtml(o.status)}</td>
              <td class="px-6 py-4 text-right">
                <button onclick="viewOrderDetails('${o.id}')" class="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition">View</button>
              </td>
            </tr>
          `;
        });
      }
    } else {
      // Admin Overview Stats calculations
      const activeJobs = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
      const customersCount = customers.filter(c => c.role !== "admin").length;
      const completedCount = orders.filter(o => o.status === "Delivered").length;
      const totalRev = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + Number(o.price || 0), 0);

      document.getElementById("stat-admin-rev").textContent = `₹${totalRev.toLocaleString()}`;
      document.getElementById("stat-admin-orders").textContent = activeJobs;
      document.getElementById("stat-admin-customers").textContent = customersCount;
      document.getElementById("stat-admin-completed").textContent = completedCount;

      initAdminCharts(orders);
    }
  }

  // =========================================================================
  // --- 2. DYNAMIC NEW PRINT ORDER FORM CONTROLLERS (new-order.html) ---
  // =========================================================================
  if (path.includes("new-order")) {
    const container = document.getElementById("new-order-container");
    const activeServices = services.filter(s => s.status !== "Inactive");

    container.innerHTML = `
      <div class="glass p-6 md:p-8 rounded-3xl border-white/5 max-w-4xl mx-auto space-y-6">
        <form id="new-print-order-form" class="space-y-6" novalidate>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Print Product</label>
              <select id="order-product" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
                ${activeServices.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Quantity</label>
              <input type="number" id="order-qty" min="1" value="100" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
              <p id="err-qty" class="text-[10px] text-red-500 font-semibold mt-1 hidden"></p>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Paper Size</label>
              <select id="order-paper-size" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Paper Type</label>
              <select id="order-paper-type" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">GSM / Thickness</label>
              <select id="order-gsm" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Finishing Spec</label>
              <select id="order-finish" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Binding Type</label>
              <select id="order-binding" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none font-semibold">
                <option value="None">None</option>
                <option value="Saddle Stitch">Saddle Stitch</option>
                <option value="Perfect Bound">Perfect Bound</option>
                <option value="Spiral Bound">Spiral Bound</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Delivery Method</label>
              <select id="order-delivery" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none font-semibold">
                <option value="Standard">Standard Delivery (3-5 days)</option>
                <option value="Express">Express Speed (24H Turnaround)</option>
                <option value="Pickup">Self Pick-Up</option>
              </select>
            </div>

            <div class="flex items-center mt-4">
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" id="order-double-side" checked class="sr-only peer">
                <div class="w-11 h-6 bg-black/15 dark:bg-dark/45 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F15A24] relative"></div>
                <span class="ml-3 text-xs font-bold uppercase tracking-wider text-[#1A2730]/80 dark:text-white/80">Double-Sided Print</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Artwork File Name (Optional)</label>
            <input type="text" id="order-artwork-name" placeholder="e.g. business_card_draft.pdf" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-[#1A2730]/65 dark:text-white/60 mb-2 uppercase tracking-wider">Additional Design Notes</label>
            <textarea id="order-notes" rows="3" placeholder="Specify colors, spacing offsets, cutting specifications..." class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none"></textarea>
          </div>

          <div class="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <div>
              <p class="text-[10px] text-[#1A2730]/40 dark:text-white/40 uppercase tracking-widest font-bold">Estimated Cost</p>
              <p id="order-est-price" class="text-3xl font-black text-[#F15A24] font-display mt-1">₹0</p>
            </div>
            <button type="submit" class="px-8 py-4 bg-gradient-to-r from-[#F15A24] to-[#ff6b3b] text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition text-xs uppercase tracking-wider">PLACE PRINT ORDER</button>
          </div>
        </form>
      </div>
    `;

    const productSel = document.getElementById("order-product");
    const paperSizeSel = document.getElementById("order-paper-size");
    const paperTypeSel = document.getElementById("order-paper-type");
    const gsmSel = document.getElementById("order-gsm");
    const finishSel = document.getElementById("order-finish");
    const qtyInp = document.getElementById("order-qty");
    const dSide = document.getElementById("order-double-side");
    const notesInp = document.getElementById("order-notes");
    const artInp = document.getElementById("order-artwork-name");
    const bindSel = document.getElementById("order-binding");
    const deliverySel = document.getElementById("order-delivery");

    function updateOptions() {
      const product = productSel.value;
      let sizes = ["3.5\" x 2.0\" Standard", "A5 Size", "A4 Size"];
      let papers = ["Premium Silk", "Smooth Matte", "Recycled Kraft"];
      let gsms = ["350 GSM", "300 GSM", "250 GSM"];
      let finishes = ["None", "Matte Lamination", "Gloss Laminate", "Foil Stamping"];

      if (product === "Flyers & Leaflets") {
        sizes = ["A5 Size", "A4 Size", "A3 Poster Size"];
        papers = ["Premium Silk", "Uncoated Bond", "Recycled Kraft"];
        gsms = ["250 GSM", "150 GSM", "130 GSM"];
        finishes = ["None", "Matte Coating", "Gloss Lamination"];
      } else if (product === "Posters & Banners") {
        sizes = ["A2 Large", "A1 Poster", "A0 Banner"];
        papers = ["High-Gloss Photo", "Vinyl Matte", "Outdoor Fabric Canvas"];
        gsms = ["300 GSM", "200 GSM", "180 GSM"];
        finishes = ["None", "UV Resistant Matte", "Clear Gloss Film"];
      } else if (product === "Packaging") {
        sizes = ["Custom Box", "Mailer Box (M)", "Mailer Box (L)"];
        papers = ["Corrugated Kraft Board", "White SBS Cardboard"];
        gsms = ["450 GSM", "400 GSM", "350 GSM"];
        finishes = ["None", "Waterproof Matte", "Spot UV Coating"];
      }

      paperSizeSel.innerHTML = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
      paperTypeSel.innerHTML = papers.map(p => `<option value="${p}">${p}</option>`).join('');
      gsmSel.innerHTML = gsms.map(g => `<option value="${g}">${g}</option>`).join('');
      finishSel.innerHTML = finishes.map(f => `<option value="${f}">${f}</option>`).join('');
      
      calculatePrice();
    }

    productSel.addEventListener("change", updateOptions);
    
    // Check search queries to pre-select items (e.g. from recommended cards)
    const params = new URLSearchParams(window.location.search);
    const preselected = params.get("product");
    if (preselected && activeServices.find(s => s.name === preselected)) {
      productSel.value = preselected;
    }
    
    updateOptions();

    // Bind price calculations
    [productSel, paperSizeSel, paperTypeSel, gsmSel, finishSel, qtyInp, dSide, bindSel, deliverySel].forEach(el => {
      el.addEventListener("change", calculatePrice);
      if (el.tagName === "INPUT") el.addEventListener("input", calculatePrice);
    });

    function calculatePrice() {
      const product = productSel.value;
      const qty = Math.max(1, parseInt(qtyInp.value) || 0);
      const isDouble = dSide.checked;
      const finish = finishSel.value;
      const binding = bindSel.value;
      const delivery = deliverySel.value;

      const spec = pricing.find(p => p.product === product) || pricing[0];

      let base = spec.basePrice;
      let total = (base * spec.qtyFactor * qty);

      if (paperTypeSel.value.includes("Gloss") || paperTypeSel.value.includes("SBS")) total *= spec.paperFactor;
      if (gsmSel.value.includes("350") || gsmSel.value.includes("450")) total *= spec.gsmFactor;

      if (finish !== "None") total += (spec.finishPrice * qty);
      if (binding !== "None") total += (spec.bindingPrice * qty);
      
      if (delivery === "Express") total += 250;
      if (delivery === "Pickup") total -= 50;

      if (isDouble) total *= 1.35;

      const rounded = Math.round(Math.max(0, total));
      document.getElementById("order-est-price").textContent = `₹${rounded.toLocaleString()}`;
      return rounded;
    }

    // Submit print order
    const form = document.getElementById("new-print-order-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const errQty = document.getElementById("err-qty");
      errQty.classList.add("hidden");

      const qty = parseInt(qtyInp.value);
      if (isNaN(qty) || qty < 1) {
        errQty.textContent = "Quantity must be at least 1.";
        errQty.classList.remove("hidden");
        return;
      }

      const finalPrice = calculatePrice();
      const newOrder = {
        id: "PX-" + Math.floor(1000 + Math.random() * 9000),
        customerId: currentUser.id,
        customerName: currentUser.name,
        product: productSel.value,
        quantity: qty,
        specs: {
          size: paperSizeSel.value,
          paper: `${paperTypeSel.value} ${gsmSel.value}`,
          color: "Full Color",
          side: dSide.checked ? "Double Sided" : "Single Sided",
          finish: finishSel.value,
          binding: bindSel.value
        },
        file: {
          name: artInp.value.trim() || "design_draft.pdf",
          size: "2.5 MB"
        },
        price: finalPrice,
        status: "File Received",
        createdAt: new Date().toISOString().split('T')[0],
        notes: notesInp.value.trim()
      };

      orders.unshift(newOrder);
      localStorage.setItem("printxtore_orders", JSON.stringify(orders));

      // Push notification
      addNotification(currentUser.id, `New print job ${newOrder.id} successfully queued.`);

      showToast("Order placed successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "orders.html";
      }, 1200);
    });
  }

  // =========================================================================
  // --- 3. ORDERS LIST PAGE CRUD CONTROLLERS (orders.html) ---
  // =========================================================================
  if (path.includes("orders")) {
    const search = document.getElementById("order-search");
    const filter = document.getElementById("order-filter-status");
    const sort = document.getElementById("order-sort");
    
    // Bind order list render
    function renderOrdersTable() {
      let list = [...orders];
      if (currentUser.role === "client") {
        list = list.filter(o => o.customerId === currentUser.id);
      }

      // Filter Search
      const searchVal = search.value.trim().toLowerCase();
      if (searchVal) {
        list = list.filter(o => o.id.toLowerCase().includes(searchVal) || o.product.toLowerCase().includes(searchVal) || o.customerName.toLowerCase().includes(searchVal));
      }

      // Filter Status
      const statusVal = filter.value;
      if (statusVal !== "All") {
        list = list.filter(o => o.status === statusVal);
      }

      // Sort
      const sortVal = sort.value;
      if (sortVal === "Newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else if (sortVal === "Oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else if (sortVal === "AmountDesc") list.sort((a, b) => b.price - a.price);
      else if (sortVal === "AmountAsc") list.sort((a, b) => a.price - b.price);

      const tbody = document.getElementById("orders-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No orders found.</td></tr>`;
        return;
      }

      list.forEach(o => {
        const canEdit = o.status === "File Received" || o.status === "Artwork Review";
        const tr = document.createElement("tr");
        tr.className = "hover:bg-black/5 dark:hover:bg-white/5 transition";
        tr.innerHTML = `
          <td class="px-6 py-4 font-semibold">${o.id}</td>
          ${currentUser.role === 'admin' ? `<td class="px-6 py-4 text-[#1A2730]/85 dark:text-white/85">${o.customerName}</td>` : ''}
          <td class="px-6 py-4">${o.product}</td>
          <td class="px-6 py-4 text-[#1A2730]/50 dark:text-white/50">${o.quantity}</td>
          <td class="px-6 py-4 font-bold text-[#F15A24]">₹${o.price.toLocaleString()}</td>
          <td class="px-6 py-4">${getStatusBadgeHtml(o.status)}</td>
          <td class="px-6 py-4 text-right space-x-2">
            <button onclick="viewOrderDetails('${o.id}')" class="px-2.5 py-1.5 bg-black/5 dark:bg-white/5 border rounded-lg hover:bg-black/10 transition text-xs font-semibold">View</button>
            ${currentUser.role === 'admin' ? `
              <button onclick="openAdminOrderEdit('${o.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Edit</button>
              <button onclick="deleteAdminOrder('${o.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition">Delete</button>
            ` : `
              ${canEdit ? `<button onclick="editClientOrder('${o.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Edit</button>` : ''}
              ${canEdit ? `<button onclick="cancelClientOrder('${o.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition">Cancel</button>` : ''}
              ${o.status === 'Delivered' ? `<button onclick="reorderClientOrder('${o.id}')" class="px-2.5 py-1.5 bg-green/10 hover:bg-green/20 text-green border border-green/20 rounded-lg text-xs font-semibold transition">Reorder</button>` : ''}
            `}
          </td>
        `;
        tbody.appendChild(tr);
      });
      lucide.createIcons();
    }

    [search, filter, sort].forEach(el => el.addEventListener("change", renderOrdersTable));
    search.addEventListener("input", renderOrdersTable);
    renderOrdersTable();
    window.refreshOrdersTable = renderOrdersTable;
  }

  // --- CRUD ACTION HANDLERS ---
  window.cancelClientOrder = function(id) {
    openModal(`
      <div class="space-y-4">
        <h3 class="text-base font-bold text-red-500 flex items-center gap-2">
          <i data-lucide="alert-triangle" class="w-5 h-5"></i> Cancel Order ${id}
        </h3>
        <p class="text-xs text-[#1A2730]/70 dark:text-white/70">Are you sure you want to cancel this order? This action cannot be undone.</p>
        <div class="flex justify-end gap-3 pt-3 border-t">
          <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Keep Order</button>
          <button onclick="confirmCancel('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition">Confirm Cancel</button>
        </div>
      </div>
    `);
    lucide.createIcons();
  };

  window.confirmCancel = function(id) {
    const list = getOrdersList();
    const o = list.find(ord => ord.id === id);
    if (o) {
      o.status = "Cancelled";
      saveOrdersList(list);
      addNotification(currentUser.id, `Order ${id} has been cancelled.`);
      showToast(`Order ${id} successfully cancelled.`);
      closeModal();
      if (window.refreshOrdersTable) window.refreshOrdersTable();
    }
  };

  window.reorderClientOrder = function(id) {
    const list = getOrdersList();
    const o = list.find(ord => ord.id === id);
    if (o) {
      window.location.href = `new-order.html?product=${encodeURIComponent(o.product)}`;
    }
  };

  window.editClientOrder = function(id) {
    const list = getOrdersList();
    const o = list.find(ord => ord.id === id);
    if (!o) return;

    openModal(`
      <div class="space-y-4">
        <h3 class="text-base font-bold">Edit Order Specs: ${o.id}</h3>
        <form id="edit-client-order-form" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Quantity</label>
            <input type="number" id="eco-qty" value="${o.quantity}" min="1" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Notes</label>
            <textarea id="eco-notes" rows="3" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">${o.notes || ''}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
            <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Save Changes</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("edit-client-order-form").addEventListener("submit", (e) => {
      e.preventDefault();
      o.quantity = parseInt(document.getElementById("eco-qty").value) || 1;
      o.notes = document.getElementById("eco-notes").value.trim();
      
      // Auto-recalculate base pricing
      const spec = pricing.find(p => p.product === o.product) || pricing[0];
      o.price = Math.round(spec.basePrice * spec.qtyFactor * o.quantity);

      saveOrdersList(list);
      showToast("Order specifications updated.");
      closeModal();
      if (window.refreshOrdersTable) window.refreshOrdersTable();
    });
  };

  // Admin Order Actions
  window.openCreateOrderModal = function() {
    const clients = customers.filter(c => c.role !== 'admin');
    
    openModal(`
      <div class="space-y-4">
        <h3 class="text-base font-bold">Create New Customer Order</h3>
        <form id="admin-create-order-form" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Customer</label>
            <select id="aco-customer" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              ${clients.map(c => `<option value="${c.id}|${c.name}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Service</label>
            <select id="aco-service" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              ${services.map(s => `<option value="${s.name}|${s.basePrice}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Quantity</label>
            <input type="number" id="aco-qty" min="1" value="100" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Override Price (₹)</label>
            <input type="number" id="aco-price" placeholder="Auto calculate if empty" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
            <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Create</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("admin-create-order-form").addEventListener("submit", (e) => {
      e.preventDefault();
      
      const custData = document.getElementById("aco-customer").value.split('|');
      const srvData = document.getElementById("aco-service").value.split('|');
      const qty = parseInt(document.getElementById("aco-qty").value) || 1;
      
      let finalPrice = parseFloat(document.getElementById("aco-price").value);
      if (isNaN(finalPrice)) {
        finalPrice = Math.round(parseFloat(srvData[1]) * qty * 0.8);
      }

      const list = getOrdersList();
      const newOrder = {
        id: "PX-" + Math.floor(1000 + Math.random() * 9000),
        customerId: custData[0],
        customerName: custData[1],
        product: srvData[0],
        quantity: qty,
        specs: { size: "Standard", paper: "Standard", color: "Full Color", side: "Double Sided", finish: "None", binding: "None" },
        file: { name: "admin_manual.pdf", size: "1.0 MB" },
        price: finalPrice,
        status: "File Received",
        createdAt: new Date().toISOString().split('T')[0],
        notes: "Created manually by administrator"
      };

      list.unshift(newOrder);
      saveOrdersList(list);
      addNotification(custData[0], `Order ${newOrder.id} has been added for you by support.`);
      showToast("Order successfully created.");
      closeModal();
      if (window.refreshOrdersTable) window.refreshOrdersTable();
    });
  };

  window.openAdminOrderEdit = function(id) {
    const list = getOrdersList();
    const o = list.find(ord => ord.id === id);
    if (!o) return;

    openModal(`
      <div class="space-y-4">
        <h3 class="text-base font-bold">Edit Order Settings: ${o.id}</h3>
        <form id="admin-edit-order-form" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Status</label>
            <select id="ao-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-semibold">
              <option value="File Received" ${o.status === 'File Received' ? 'selected':''}>File Received</option>
              <option value="Artwork Review" ${o.status === 'Artwork Review' ? 'selected':''}>Artwork Review</option>
              <option value="Printing" ${o.status === 'Printing' ? 'selected':''}>Printing</option>
              <option value="Quality Check" ${o.status === 'Quality Check' ? 'selected':''}>Quality Check</option>
              <option value="Ready" ${o.status === 'Ready' ? 'selected':''}>Ready</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected':''}>Delivered</option>
              <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected':''}>Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Price (₹)</label>
            <input type="number" id="ao-price" value="${o.price}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Admin Notes</label>
            <textarea id="ao-notes" rows="3" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">${o.adminNotes || ''}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
            <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Save Changes</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("admin-edit-order-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const oldStatus = o.status;
      
      o.status = document.getElementById("ao-status").value;
      o.price = parseFloat(document.getElementById("ao-price").value) || o.price;
      o.adminNotes = document.getElementById("ao-notes").value.trim();

      saveOrdersList(list);

      if (oldStatus !== o.status) {
        addNotification(o.customerId, `Your order ${o.id} progress is updated to: ${o.status}`);
      }

      showToast("Order data successfully updated.");
      closeModal();
      if (window.refreshOrdersTable) window.refreshOrdersTable();
    });
  };

  window.deleteAdminOrder = function(id) {
    openModal(`
      <div class="space-y-4">
        <h3 class="text-base font-bold text-red-500">Delete Order Permanently</h3>
        <p class="text-xs">Are you sure you want to delete order ${id} from database? This updates all metrics.</p>
        <div class="flex justify-end gap-3 pt-3 border-t">
          <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Cancel</button>
          <button onclick="confirmAdminOrderDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition">Confirm Delete</button>
        </div>
      </div>
    `);
  };

  window.confirmAdminOrderDelete = function(id) {
    let list = getOrdersList();
    list = list.filter(ord => ord.id !== id);
    saveOrdersList(list);
    showToast(`Order ${id} deleted successfully.`);
    closeModal();
    if (window.refreshOrdersTable) window.refreshOrdersTable();
  };

  // Helpers to prevent duplication
  function getOrdersList() {
    return JSON.parse(localStorage.getItem("printxtore_orders")) || [];
  }
  function saveOrdersList(list) {
    localStorage.setItem("printxtore_orders", JSON.stringify(list));
  }

  // =========================================================================
  // --- 4. ORDER TRACKING CONTROLLER (track.html) ---
  // =========================================================================
  if (path.includes("track")) {
    const container = document.getElementById("track-container");
    container.innerHTML = `
      <div class="glass p-6 md:p-8 rounded-3xl border-white/5 max-w-2xl mx-auto space-y-6">
        <h3 class="text-lg font-bold">Trace Print Job Status</h3>
        <div class="flex gap-4">
          <input type="text" id="track-order-id" placeholder="Enter Order ID (e.g. PX-1001)" class="w-full p-3.5 rounded-xl bg-white dark:bg-[#14212A] border border-black/15 dark:border-white/12 text-[#1A2730] dark:text-white text-sm focus:border-[#F15A24] focus:outline-none">
          <button id="track-btn" class="px-6 bg-[#F15A24] hover:bg-[#ff6b3b] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition">Track</button>
        </div>
        
        <div id="tracking-display" class="hidden pt-6 border-t border-black/5 dark:border-white/5 space-y-8"></div>
        <div id="tracking-err" class="hidden p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center"></div>
      </div>
    `;

    const inp = document.getElementById("track-order-id");
    const btn = document.getElementById("track-btn");
    const display = document.getElementById("tracking-display");
    const err = document.getElementById("tracking-err");

    btn.addEventListener("click", () => {
      display.classList.add("hidden");
      err.classList.add("hidden");
      
      const oid = inp.value.trim().toUpperCase();
      if (!oid) return;

      const o = orders.find(ord => ord.id === oid && ord.customerId === currentUser.id);
      if (!o) {
        err.textContent = `Order not found. Check ID and try again.`;
        err.classList.remove("hidden");
        return;
      }

      const stages = ["File Received", "Artwork Review", "Printing", "Quality Check", "Ready", "Delivered"];
      const activeIdx = stages.indexOf(o.status);

      display.innerHTML = `
        <div class="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
          <div>
            <h4 class="text-sm font-bold">${o.product}</h4>
            <p class="text-[10px] text-gray-400 mt-0.5">Placed on ${new Date(o.createdAt).toLocaleDateString()}</p>
          </div>
          <span class="text-sm font-bold text-[#F15A24]">₹${o.price.toLocaleString()}</span>
        </div>
        
        <div class="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-black/15 before:dark:bg-white/5">
          ${stages.map((stg, i) => {
            const completed = i <= activeIdx;
            return `
              <div class="relative flex items-start gap-4">
                <div class="absolute -left-[27px] w-4 h-4 rounded-full border-2 ${completed ? 'border-[#F15A24] bg-[#F15A24]' : 'border-[#1A2730]/20 bg-white dark:bg-[#202B35] dark:border-white/10'}"></div>
                <div>
                  <h5 class="text-xs font-bold ${completed ? 'text-[#1A2730] dark:text-white' : 'text-[#1A2730]/40 dark:text-white/40'}">${stg}</h5>
                  <p class="text-[10px] text-gray-400 mt-0.5">${completed ? (i === activeIdx ? 'Current Phase' : 'Completed') : 'Pending'}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      display.classList.remove("hidden");
    });
  }

  // =========================================================================
  // --- 5. ARTWORK UPLOAD CONTROLLER (upload.html) ---
  // =========================================================================
  if (path.includes("upload")) {
    const container = document.getElementById("upload-container");
    container.innerHTML = `
      <div class="space-y-6">
        <div class="glass p-6 md:p-8 rounded-3xl border-white/5 max-w-xl mx-auto space-y-6 text-center">
          <div id="drag-drop-zone" class="border-2 border-dashed border-black/15 dark:border-white/10 hover:border-[#F15A24] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-black/5 dark:bg-dark/20 hover:bg-black/10 transition cursor-pointer">
            <i data-lucide="upload-cloud" class="w-10 h-10 text-gray-400"></i>
            <div>
              <p class="text-sm font-semibold">Click or drag artwork files here</p>
              <p class="text-[10px] text-gray-400 mt-1">Accepts PDF, PNG, JPG, JPEG, SVG (Max 25MB)</p>
            </div>
            <input type="file" id="artwork-file-input" class="hidden" accept=".pdf,.png,.jpg,.jpeg,.svg">
          </div>
        </div>

        <div class="glass p-6 rounded-3xl border-white/5 space-y-4">
          <h4 class="text-sm font-bold uppercase tracking-wider">Uploaded Artworks</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-black/5 dark:bg-white/5 text-[#1A2730]/80 dark:text-white/80 border-b border-black/5 dark:border-white/5">
                <tr>
                  <th class="px-6 py-3 font-semibold">File Name</th>
                  <th class="px-6 py-3 font-semibold">Related Order</th>
                  <th class="px-6 py-3 font-semibold">Uploaded Date</th>
                  <th class="px-6 py-3 font-semibold">Size</th>
                  <th class="px-6 py-3 font-semibold">Status</th>
                  <th class="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody id="artwork-tbody" class="divide-y divide-black/5 dark:divide-white/5">
                <!-- JS populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const zone = document.getElementById("drag-drop-zone");
    const fileInp = document.getElementById("artwork-file-input");

    zone.addEventListener("click", () => fileInp.click());
    fileInp.addEventListener("change", () => handleUpload(fileInp.files[0]));

    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("border-[#F15A24]");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("border-[#F15A24]");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("border-[#F15A24]");
      handleUpload(e.dataTransfer.files[0]);
    });

    function handleUpload(file) {
      if (!file) return;
      const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
      if (!allowed.includes(file.type)) {
        showToast("Unsupported file type.", "error");
        return;
      }

      showToast("Uploading file...");
      setTimeout(() => {
        const list = getArtworkList();
        const newArt = {
          id: "art-" + Math.floor(1000 + Math.random() * 9000),
          fileName: file.name,
          orderId: "Unassigned",
          uploadDate: new Date().toISOString().split('T')[0],
          size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
          status: "Pending Review"
        };
        list.unshift(newArt);
        saveArtworkList(list);
        showToast("Artwork uploaded successfully!");
        renderArtworkTable();
      }, 800);
    }

    window.deleteArtwork = function(id) {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500">Delete Artwork File</h3>
          <p class="text-xs">Remove file metadata records permanently from profile?</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Cancel</button>
            <button onclick="confirmArtworkDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition">Confirm Delete</button>
          </div>
        </div>
      `);
    };

    window.confirmArtworkDelete = function(id) {
      let list = getArtworkList();
      list = list.filter(art => art.id !== id);
      saveArtworkList(list);
      showToast("Artwork records deleted.");
      closeModal();
      renderArtworkTable();
    };

    function renderArtworkTable() {
      const list = getArtworkList();
      const tbody = document.getElementById("artwork-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No uploaded files found.</td></tr>`;
        return;
      }

      list.forEach(a => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${a.fileName}</td>
            <td class="px-6 py-4 text-gray-500">${a.orderId}</td>
            <td class="px-6 py-4 text-gray-400">${a.uploadDate}</td>
            <td class="px-6 py-4 text-gray-400">${a.size}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-0.5 rounded border text-[10px] font-semibold ${a.status === 'Approved' ? 'bg-green/10 text-green border-green/20':'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}">${a.status}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button onclick="deleteArtwork('${a.id}')" class="text-red-500 hover:underline text-xs font-bold">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    function getArtworkList() {
      return JSON.parse(localStorage.getItem("px_artwork")) || DEFAULT_ARTWORK;
    }
    function saveArtworkList(list) {
      localStorage.setItem("px_artwork", JSON.stringify(list));
    }

    renderArtworkTable();
  }

  // =========================================================================
  // --- 6. BILLING INVOICES CONTROLLER (invoices.html) ---
  // =========================================================================
  if (path.includes("invoices")) {
    const container = document.getElementById("invoices-container");
    container.innerHTML = `
      <div class="glass p-6 rounded-3xl border-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-black/5 dark:bg-white/5 text-[#1A2730]/80 dark:text-white/80 border-b border-black/5 dark:border-white/5">
              <tr>
                <th class="px-6 py-4 font-semibold">Invoice No</th>
                <th class="px-6 py-4 font-semibold">Order ID</th>
                <th class="px-6 py-4 font-semibold">Date</th>
                <th class="px-6 py-4 font-semibold">Customer</th>
                <th class="px-6 py-4 font-semibold">Product</th>
                <th class="px-6 py-4 font-semibold">Amount</th>
                <th class="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="invoices-tbody" class="divide-y divide-black/5 dark:divide-white/5">
              <!-- JS Populated -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const clientOrders = orders.filter(o => o.customerId === currentUser.id && o.status !== "Cancelled");
    const tbody = document.getElementById("invoices-tbody");
    tbody.innerHTML = "";

    if (clientOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No invoices available.</td></tr>`;
    } else {
      clientOrders.forEach((o, idx) => {
        const invNo = `INV-2026-${1001 + idx}`;
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${invNo}</td>
            <td class="px-6 py-4 text-gray-500">${o.id}</td>
            <td class="px-6 py-4 text-gray-400">${new Date(o.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">${currentUser.name}</td>
            <td class="px-6 py-4 text-gray-500">${o.product}</td>
            <td class="px-6 py-4 font-bold text-[#F15A24]">₹${o.price.toLocaleString()}</td>
            <td class="px-6 py-4 text-right">
              <button onclick="viewInvoiceModal('${o.id}', '${invNo}')" class="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs font-semibold hover:bg-black/10 transition">View</button>
            </td>
          </tr>
        `;
      });
    }
  }

  // Invoice display & printing modal
  window.viewInvoiceModal = function(oid, invNo) {
    const o = orders.find(ord => ord.id === oid);
    if (!o) return;

    openModal(`
      <div id="invoice-print-area" class="space-y-6 text-[#1A2730] p-4 bg-white rounded-lg font-sans">
        <div class="flex justify-between items-start border-b pb-6">
          <div>
            <h2 class="text-2xl font-black text-gray-800 font-display">PRINTXTORE</h2>
            <p class="text-xs text-gray-500 mt-1">Order Fulfilment & Commercial Printing</p>
            <p class="text-xs text-gray-400 mt-4">102, Apex Business Park,<br>Industrial Area, New Delhi</p>
          </div>
          <div class="text-right">
            <h3 class="text-lg font-black text-[#F15A24]">INVOICE</h3>
            <p class="text-sm font-bold text-gray-800 mt-1">${invNo}</p>
            <p class="text-xs text-gray-400 mt-4">Date: ${o.createdAt}<br>Due: Upon Delivery</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 class="font-bold text-gray-500 uppercase">Bill To:</h4>
            <p class="font-bold text-gray-800 mt-1">${currentUser.name}</p>
            <p class="text-gray-500 mt-1">${currentUser.company || "Watson Designs"}</p>
            <p class="text-gray-400 mt-1">${currentUser.phone || "N/A"}</p>
          </div>
          <div class="text-right">
            <h4 class="font-bold text-gray-500 uppercase">Ship To:</h4>
            <p class="text-gray-800 mt-1">${currentUser.name}</p>
            <p class="text-gray-500 mt-1">Delhi NCR Standard Route</p>
          </div>
        </div>

        <table class="w-full text-xs text-left border-collapse mt-6">
          <thead>
            <tr class="border-b-2 border-gray-200 text-gray-600 font-bold">
              <th class="py-2">Description</th>
              <th class="py-2 text-center">Quantity</th>
              <th class="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-3">
                <p class="font-bold text-gray-800">${o.product}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">${o.specs.size} / ${o.specs.paper} / ${o.specs.side}</p>
              </td>
              <td class="py-3 text-center text-gray-700">${o.quantity}</td>
              <td class="py-3 text-right font-bold text-gray-800">₹${o.price}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-end pt-4">
          <div class="w-48 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-500">Subtotal:</span>
              <span class="font-bold text-gray-800">₹${o.price}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Tax (0% GST):</span>
              <span class="font-bold text-gray-800">₹0</span>
            </div>
            <div class="flex justify-between border-t pt-2 text-sm">
              <span class="font-bold text-gray-800">Total:</span>
              <span class="font-bold text-[#F15A24]">₹${o.price}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
        <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold rounded-lg bg-black/5 dark:bg-white/5 border rounded-lg hover:bg-black/10 transition">Close</button>
        <button onclick="printInvoiceArea()" class="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F15A24] text-white hover:opacity-90 transition">Print Invoice</button>
      </div>
    `);
  };

  window.printInvoiceArea = function() {
    const printContent = document.getElementById("invoice-print-area").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `<div style="background: white; color: black; min-height: 100vh; padding: 40px;">${printContent}</div>`;
    window.print();
    window.location.reload();
  };

  // =========================================================================
  // --- 7. CLIENT PROFILE UPDATE CONTROLLER (profile.html) ---
  // =========================================================================
  if (path.includes("profile")) {
    const container = document.getElementById("profile-container");
    container.innerHTML = `
      <div class="glass p-6 md:p-8 rounded-3xl border-white/5 max-w-xl mx-auto space-y-6">
        <form id="profile-form" class="space-y-4" novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" id="prof-name" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" id="prof-email" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-not-allowed">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Phone Number</label>
              <input type="text" id="prof-phone" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Company Name</label>
              <input type="text" id="prof-company" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider mb-1">Address</label>
            <input type="text" id="prof-address" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">City</label>
              <input type="text" id="prof-city" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">State</label>
              <input type="text" id="prof-state" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Pincode</label>
              <input type="text" id="prof-pincode" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none">
            </div>
          </div>
          <div class="pt-4 flex justify-end gap-3 border-t border-black/5 dark:border-white/5">
            <button type="button" id="prof-edit-btn" class="px-5 py-2 text-xs font-bold rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 transition">EDIT PROFILE</button>
            <button type="button" id="prof-cancel-btn" class="px-4 py-2 text-xs font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 hidden">CANCEL</button>
            <button type="submit" id="prof-save-btn" class="px-5 py-2 text-xs font-bold rounded-lg bg-[#F15A24] text-white hover:opacity-90 transition hidden">SAVE CHANGES</button>
          </div>
        </form>
      </div>
    `;

    const name = document.getElementById("prof-name");
    const email = document.getElementById("prof-email");
    const phone = document.getElementById("prof-phone");
    const company = document.getElementById("prof-company");
    const address = document.getElementById("prof-address");
    const city = document.getElementById("prof-city");
    const state = document.getElementById("prof-state");
    const pincode = document.getElementById("prof-pincode");

    const editBtn = document.getElementById("prof-edit-btn");
    const cancelBtn = document.getElementById("prof-cancel-btn");
    const saveBtn = document.getElementById("prof-save-btn");

    function loadFields() {
      name.value = currentUser.name || "";
      email.value = currentUser.email || "";
      phone.value = currentUser.phone || "";
      company.value = currentUser.company || "";
      address.value = currentUser.address || "";
      city.value = currentUser.city || "";
      state.value = currentUser.state || "";
      pincode.value = currentUser.pincode || "";
    }

    loadFields();

    editBtn.addEventListener("click", () => {
      [name, phone, company, address, city, state, pincode].forEach(inp => {
        inp.disabled = false;
        inp.classList.remove("bg-black/5", "dark:bg-white/5", "border-black/10", "dark:border-white/10");
        inp.classList.add("bg-white", "dark:bg-[#14212A]", "border-black/15", "dark:border-white/12");
      });
      editBtn.classList.add("hidden");
      cancelBtn.classList.remove("hidden");
      saveBtn.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
      loadFields();
      [name, phone, company, address, city, state, pincode].forEach(inp => {
        inp.disabled = true;
        inp.classList.remove("bg-white", "dark:bg-[#14212A]", "border-black/15", "dark:border-white/12");
        inp.classList.add("bg-black/5", "dark:bg-white/5", "border-black/10", "dark:border-white/10");
      });
      editBtn.classList.remove("hidden");
      cancelBtn.classList.add("hidden");
      saveBtn.classList.add("hidden");
    });

    document.getElementById("profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nName = name.value.trim();
      if (!nName) {
        showToast("Full Name is required.", "error");
        return;
      }

      currentUser.name = nName;
      currentUser.phone = phone.value.trim();
      currentUser.company = company.value.trim();
      currentUser.address = address.value.trim();
      currentUser.city = city.value.trim();
      currentUser.state = state.value.trim();
      currentUser.pincode = pincode.value.trim();

      localStorage.setItem("printxtore_session", JSON.stringify(currentUser));
      
      // Update in customers table
      const match = customers.find(c => c.id === currentUser.id);
      if (match) {
        Object.assign(match, currentUser);
        localStorage.setItem("printxtore_customers", JSON.stringify(customers));
      }

      showToast("Profile settings successfully saved.");
      setTimeout(() => window.location.reload(), 1000);
    });
  }

  // =========================================================================
  // --- 8. CLIENT NOTIFICATIONS GRID (notifications.html) ---
  // =========================================================================
  if (path.includes("notifications")) {
    const container = document.getElementById("notifications-container");
    container.innerHTML = `
      <div class="glass p-6 rounded-3xl border-white/5 max-w-2xl mx-auto space-y-6">
        <div class="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
          <h3 class="text-base font-bold">Inbox Alerts</h3>
          <button onclick="markAllNotificationsRead()" class="text-xs text-[#F15A24] font-semibold hover:underline">Mark all read</button>
        </div>
        
        <div id="notifications-list" class="space-y-4"></div>
      </div>
    `;

    window.renderNotificationsList = function() {
      const userNotifs = notifications.filter(n => n.userId === currentUser.id);
      const listDiv = document.getElementById("notifications-list");
      listDiv.innerHTML = "";

      if (userNotifs.length === 0) {
        listDiv.innerHTML = `<p class="text-xs text-gray-500 text-center py-6">Your inbox is empty.</p>`;
        return;
      }

      userNotifs.forEach(n => {
        const div = document.createElement("div");
        div.className = `p-4 rounded-xl border flex justify-between items-center gap-4 transition ${n.read ? 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-[#1A2730]/65 dark:text-white/60':'bg-[#F15A24]/5 border-[#F15A24]/10 font-bold'}`;
        div.innerHTML = `
          <div class="space-y-1 text-left">
            <p class="text-xs">${n.message}</p>
            <p class="text-[10px] text-gray-400 font-normal">${n.date}</p>
          </div>
          <div class="flex items-center gap-3 text-[10px] font-bold uppercase">
            ${!n.read ? `<button onclick="markNotificationRead('${n.id}')" class="text-[#F15A24] hover:underline">Read</button>`:''}
            <button onclick="deleteNotification('${n.id}')" class="text-red-500 hover:underline">Delete</button>
          </div>
        `;
        listDiv.appendChild(div);
      });
    };

    window.markNotificationRead = function(id) {
      const n = notifications.find(notif => notif.id === id);
      if (n) {
        n.read = true;
        localStorage.setItem("printxtore_notifications", JSON.stringify(notifications));
        renderNotificationsList();
      }
    };

    window.markAllNotificationsRead = function() {
      notifications.forEach(n => {
        if (n.userId === currentUser.id) n.read = true;
      });
      localStorage.setItem("printxtore_notifications", JSON.stringify(notifications));
      renderNotificationsList();
      showToast("All notifications marked as read.");
    };

    window.deleteNotification = function(id) {
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications.splice(idx, 1);
        localStorage.setItem("printxtore_notifications", JSON.stringify(notifications));
        renderNotificationsList();
        showToast("Notification deleted.");
      }
    };

    renderNotificationsList();
  }

  // =========================================================================
  // --- 9. PREFERENCE CONFIGURATIONS (settings.html) ---
  // =========================================================================
  if (path.includes("settings")) {
    const container = document.getElementById("settings-container");
    
    if (currentUser.role === "client") {
      container.innerHTML = `
        <div class="glass p-6 md:p-8 rounded-3xl border-white/5 max-w-xl mx-auto space-y-6">
          <form id="client-settings-form" class="space-y-6">
            <div class="space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500">General preferences</h4>
              <div class="grid grid-cols-2 gap-4">
                <button type="button" class="theme-toggle p-3 border rounded-xl font-bold text-xs bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 flex items-center justify-center gap-2">
                  <i data-lucide="moon" class="w-4 h-4"></i> Theme Mode
                </button>
                <button type="button" class="rtl-toggle p-3 border rounded-xl font-bold text-xs bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 flex items-center justify-center gap-2">
                  <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Direction (RTL)
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500">Notifications Toggle</h4>
              <label class="flex items-center gap-3">
                <input type="checkbox" id="sett-email" class="rounded border-black/15 dark:border-white/12 text-[#F15A24] focus:ring-0">
                <span class="text-xs font-medium">Send notifications to my email address</span>
              </label>
              <label class="flex items-center gap-3">
                <input type="checkbox" id="sett-order" class="rounded border-black/15 dark:border-white/12 text-[#F15A24] focus:ring-0">
                <span class="text-xs font-medium">Notify me immediately upon order updates</span>
              </label>
            </div>

            <div class="pt-4 flex justify-end border-t border-black/5 dark:border-white/5">
              <button type="submit" class="px-5 py-2.5 bg-[#F15A24] text-white text-xs font-bold rounded-lg hover:opacity-90 transition">Save Preference</button>
            </div>
          </form>
        </div>
      `;
      
      const email = document.getElementById("sett-email");
      const order = document.getElementById("sett-order");
      
      let config = JSON.parse(localStorage.getItem("printxtore_settings")) || {};
      email.checked = config.emailNotifications !== false;
      order.checked = config.orderUpdates !== false;

      document.getElementById("client-settings-form").addEventListener("submit", (e) => {
        e.preventDefault();
        config.emailNotifications = email.checked;
        config.orderUpdates = order.checked;
        localStorage.setItem("printxtore_settings", JSON.stringify(config));
        showToast("Preferences saved successfully!");
      });
    } else {
      let config = JSON.parse(localStorage.getItem("printxtore_settings")) || {};
      container.innerHTML = `
        <div class="glass p-6 md:p-8 rounded-3xl border-white/5 max-w-xl mx-auto space-y-6">
          <form id="admin-settings-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Company Name</label>
              <input type="text" id="asg-company" value="${config.companyName || 'PRINTXTORE'}" required class="w-full p-3 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Support Email</label>
              <input type="email" id="asg-email" value="${config.email || 'support@printxtore.com'}" required class="w-full p-3 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Phone Number</label>
              <input type="text" id="asg-phone" value="${config.phone || '+91 98765 43210'}" required class="w-full p-3 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Currency Code</label>
              <input type="text" id="asg-currency" value="INR (₹)" disabled class="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border text-sm cursor-not-allowed">
            </div>
            <div class="pt-4 flex justify-end gap-3 border-t">
              <button type="submit" class="px-5 py-2.5 bg-[#F15A24] text-white text-xs font-bold rounded-lg hover:opacity-90 transition">Save Settings</button>
            </div>
          </form>
        </div>
      `;
      document.getElementById("admin-settings-form").addEventListener("submit", (e) => {
        e.preventDefault();
        config.companyName = document.getElementById("asg-company").value.trim();
        config.email = document.getElementById("asg-email").value.trim();
        config.phone = document.getElementById("asg-phone").value.trim();
        localStorage.setItem("printxtore_settings", JSON.stringify(config));
        showToast("Store configurations saved.");
      });
    }
  }

  // =========================================================================
  // --- 10. ADMIN CUSTOMERS PANEL CRUD (customers.html) ---
  // =========================================================================
  if (path.includes("customers")) {
    const search = document.getElementById("customer-search");
    const filter = document.getElementById("customer-filter-status");

    function renderCustomersTable() {
      let list = [...customers].filter(c => c.role !== 'admin');
      
      const searchVal = search.value.trim().toLowerCase();
      if (searchVal) {
        list = list.filter(c => c.name.toLowerCase().includes(searchVal) || c.email.toLowerCase().includes(searchVal) || c.phone.includes(searchVal));
      }

      const statusVal = filter.value;
      if (statusVal !== "All") {
        list = list.filter(c => c.status === statusVal);
      }

      const tbody = document.getElementById("customers-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No customers found.</td></tr>`;
        return;
      }

      list.forEach(c => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${c.name}</td>
            <td class="px-6 py-4 text-[#1A2730]/85 dark:text-white/85">${c.email}</td>
            <td class="px-6 py-4 text-gray-500">${c.phone || 'N/A'}</td>
            <td class="px-6 py-4 text-gray-400">${c.company || 'N/A'}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <button onclick="openCustomerEdit('${c.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Edit</button>
              <button onclick="deleteCustomer('${c.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition font-semibold">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    window.openAddCustomerModal = function() {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Add Customer</h3>
          <form id="add-customer-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Full Name</label>
              <input type="text" id="ac-name" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Email Address</label>
              <input type="email" id="ac-email" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Phone Number</label>
              <input type="text" id="ac-phone" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Company</label>
              <input type="text" id="ac-company" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Create</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("add-customer-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("ac-email").value.trim();
        if (customers.find(c => c.email === email)) {
          showToast("A user with this email already exists.", "error");
          return;
        }

        const newCust = {
          id: "cust-" + Math.floor(1000 + Math.random() * 9000),
          name: document.getElementById("ac-name").value.trim(),
          email,
          phone: document.getElementById("ac-phone").value.trim() || "N/A",
          company: document.getElementById("ac-company").value.trim() || "N/A",
          role: "client",
          status: "Active"
        };
        customers.unshift(newCust);
        localStorage.setItem("printxtore_customers", JSON.stringify(customers));
        showToast("Customer added successfully.");
        closeModal();
        renderCustomersTable();
      });
    };

    window.openCustomerEdit = function(id) {
      const c = customers.find(cust => cust.id === id);
      if (!c) return;

      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Edit Customer: ${c.name}</h3>
          <form id="edit-customer-form" class="space-y-4 text-left font-sans">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Full Name</label>
              <input type="text" id="ec-name" value="${c.name}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Phone Number</label>
              <input type="text" id="ec-phone" value="${c.phone || ''}" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Company</label>
              <input type="text" id="ec-company" value="${c.company || ''}" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Status</label>
              <select id="ec-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
                <option value="Active" ${c.status === 'Active' ? 'selected':''}>Active</option>
                <option value="Inactive" ${c.status === 'Inactive' ? 'selected':''}>Inactive</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Save Changes</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("edit-customer-form").addEventListener("submit", (e) => {
        e.preventDefault();
        c.name = document.getElementById("ec-name").value.trim();
        c.phone = document.getElementById("ec-phone").value.trim() || "N/A";
        c.company = document.getElementById("ec-company").value.trim() || "N/A";
        c.status = document.getElementById("ec-status").value;

        localStorage.setItem("printxtore_customers", JSON.stringify(customers));
        showToast("Customer updated successfully.");
        closeModal();
        renderCustomersTable();
      });
    };

    window.deleteCustomer = function(id) {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500">Delete Customer Profile</h3>
          <p class="text-xs">Are you sure you want to permanently delete this customer?</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Cancel</button>
            <button onclick="confirmCustomerDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition">Confirm Delete</button>
          </div>
        </div>
      `);
    };

    window.confirmCustomerDelete = function(id) {
      const idx = customers.findIndex(c => c.id === id);
      if (idx !== -1) {
        customers.splice(idx, 1);
        localStorage.setItem("printxtore_customers", JSON.stringify(customers));
        showToast("Customer deleted successfully.");
        closeModal();
        renderCustomersTable();
      }
    };

    [search, filter].forEach(el => el.addEventListener("change", renderCustomersTable));
    search.addEventListener("input", renderCustomersTable);
    renderCustomersTable();
  }

  // =========================================================================
  // --- 11. ADMIN SERVICES CATALOG PANEL CRUD (services.html) ---
  // =========================================================================
  if (path.includes("services")) {
    const search = document.getElementById("service-search");
    const filter = document.getElementById("service-filter-status");

    function renderServicesTable() {
      let list = [...services];
      const searchVal = search.value.trim().toLowerCase();
      if (searchVal) {
        list = list.filter(s => s.name.toLowerCase().includes(searchVal) || s.category.toLowerCase().includes(searchVal));
      }
      const statusVal = filter.value;
      if (statusVal !== "All") {
        list = list.filter(s => s.status === statusVal);
      }

      const tbody = document.getElementById("services-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No services found.</td></tr>`;
        return;
      }

      list.forEach(s => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${s.name}</td>
            <td class="px-6 py-4 text-gray-500">${s.category}</td>
            <td class="px-6 py-4 font-bold text-[#F15A24]">₹${s.basePrice}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-0.5 rounded border text-[10px] font-semibold ${s.status === 'Inactive' ? 'bg-red-500/10 text-red-400 border-red-500/20':'bg-green/10 text-green border-green/20'}">${s.status || 'Active'}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button onclick="openServiceEdit('${s.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Edit</button>
              <button onclick="deleteService('${s.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition font-semibold">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    window.openAddServiceModal = function() {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Add Service</h3>
          <form id="add-service-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Service Name</label>
              <input type="text" id="as-name" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Category</label>
              <input type="text" id="as-category" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Starting Price (₹)</label>
              <input type="number" id="as-price" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Status</label>
              <select id="as-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Create</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("add-service-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("as-name").value.trim();
        const newS = {
          id: "srv-" + Math.floor(1000 + Math.random() * 9000),
          name,
          category: document.getElementById("as-category").value.trim(),
          description: `${name} custom print option specs.`,
          basePrice: parseFloat(document.getElementById("as-price").value) || 0,
          status: document.getElementById("as-status").value
        };
        services.push(newS);
        localStorage.setItem("printxtore_services", JSON.stringify(services));
        showToast("Service added successfully.");
        closeModal();
        renderServicesTable();
      });
    };

    window.openServiceEdit = function(id) {
      const s = services.find(srv => srv.id === id);
      if (!s) return;

      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Edit Service Specs: ${s.name}</h3>
          <form id="edit-service-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Service Name</label>
              <input type="text" id="es-name" value="${s.name}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-sans">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Category</label>
              <input type="text" id="es-category" value="${s.category || ''}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-sans">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Starting Price (₹)</label>
              <input type="number" id="es-price" value="${s.basePrice}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-sans">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Status</label>
              <select id="es-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-semibold">
                <option value="Active" ${s.status !== 'Inactive' ? 'selected':''}>Active</option>
                <option value="Inactive" ${s.status === 'Inactive' ? 'selected':''}>Inactive</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Save Changes</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("edit-service-form").addEventListener("submit", (e) => {
        e.preventDefault();
        s.name = document.getElementById("es-name").value.trim();
        s.category = document.getElementById("es-category").value.trim();
        s.basePrice = parseFloat(document.getElementById("es-price").value) || s.basePrice;
        s.status = document.getElementById("es-status").value;

        localStorage.setItem("printxtore_services", JSON.stringify(services));
        showToast("Service updated successfully.");
        closeModal();
        renderServicesTable();
      });
    };

    window.deleteService = function(id) {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500">Remove Service</h3>
          <p class="text-xs">Remove this service catalog entry permanently?</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Cancel</button>
            <button onclick="confirmServiceDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition">Confirm Delete</button>
          </div>
        </div>
      `);
    };

    window.confirmServiceDelete = function(id) {
      const idx = services.findIndex(s => s.id === id);
      if (idx !== -1) {
        services.splice(idx, 1);
        localStorage.setItem("printxtore_services", JSON.stringify(services));
        showToast("Service deleted successfully.");
        closeModal();
        renderServicesTable();
      }
    };

    [search, filter].forEach(el => el.addEventListener("change", renderServicesTable));
    search.addEventListener("input", renderServicesTable);
    renderServicesTable();
  }

  // =========================================================================
  // --- 12. ADMIN PRODUCTS PANEL CRUD (products.html) ---
  // =========================================================================
  if (path.includes("products")) {
    const search = document.getElementById("product-search");
    const filter = document.getElementById("product-filter-category");

    function renderProductsTable() {
      let list = [...products];
      const searchVal = search.value.trim().toLowerCase();
      if (searchVal) {
        list = list.filter(p => p.name.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal));
      }
      const categoryVal = filter.value;
      if (categoryVal !== "All") {
        list = list.filter(p => p.category === categoryVal);
      }

      const tbody = document.getElementById("products-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No materials found.</td></tr>`;
        return;
      }

      list.forEach(p => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${p.name}</td>
            <td class="px-6 py-4 text-gray-500">${p.category}</td>
            <td class="px-6 py-4 font-bold text-emerald">₹${p.price}</td>
            <td class="px-6 py-4 text-gray-400">${p.stock} units</td>
            <td class="px-6 py-4">
              <span class="px-2 py-0.5 rounded border text-[10px] font-semibold ${p.status === 'Inactive' ? 'bg-red-500/10 text-red-400 border-red-500/20':'bg-green/10 text-green border-green/20'}">${p.status || 'Active'}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button onclick="openProductEdit('${p.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Edit</button>
              <button onclick="deleteProduct('${p.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition font-semibold">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    window.openAddProductModal = function() {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Add Material</h3>
          <form id="add-product-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Material Name</label>
              <input type="text" id="ap-name" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Category</label>
              <input type="text" id="ap-category" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Rate (₹)</label>
              <input type="number" id="ap-price" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Stock Level</label>
              <input type="number" id="ap-stock" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Create</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("add-product-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const newP = {
          id: "prod-" + Math.floor(1000 + Math.random() * 9000),
          name: document.getElementById("ap-name").value.trim(),
          category: document.getElementById("ap-category").value.trim(),
          price: parseFloat(document.getElementById("ap-price").value) || 0,
          stock: parseInt(document.getElementById("ap-stock").value) || 0,
          status: "Active"
        };
        products.push(newP);
        localStorage.setItem("printxtore_products", JSON.stringify(products));
        showToast("Product added successfully.");
        closeModal();
        renderProductsTable();
      });
    };

    window.openProductEdit = function(id) {
      const p = products.find(prod => prod.id === id);
      if (!p) return;

      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Edit Material: ${p.name}</h3>
          <form id="edit-product-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Material Name</label>
              <input type="text" id="ep-name" value="${p.name}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-sans">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Rate (₹)</label>
              <input type="number" id="ep-price" value="${p.price}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-sans">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Stock Level</label>
              <input type="number" id="ep-stock" value="${p.stock}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-sans">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Status</label>
              <select id="ep-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-semibold">
                <option value="Active" ${p.status !== 'Inactive' ? 'selected':''}>Active</option>
                <option value="Inactive" ${p.status === 'Inactive' ? 'selected':''}>Inactive</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Save Changes</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("edit-product-form").addEventListener("submit", (e) => {
        e.preventDefault();
        p.name = document.getElementById("ep-name").value.trim();
        p.price = parseFloat(document.getElementById("ep-price").value) || p.price;
        p.stock = parseInt(document.getElementById("ep-stock").value) || p.stock;
        p.status = document.getElementById("ep-status").value;

        localStorage.setItem("printxtore_products", JSON.stringify(products));
        showToast("Product updated successfully.");
        closeModal();
        renderProductsTable();
      });
    };

    window.deleteProduct = function(id) {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500">Remove Product Material</h3>
          <p class="text-xs">Remove this material inventory item permanently?</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Cancel</button>
            <button onclick="confirmProductDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition">Confirm Delete</button>
          </div>
        </div>
      `);
    };

    window.confirmProductDelete = function(id) {
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        products.splice(idx, 1);
        localStorage.setItem("printxtore_products", JSON.stringify(products));
        showToast("Product deleted successfully.");
        closeModal();
        renderProductsTable();
      }
    };

    [search, filter].forEach(el => el.addEventListener("change", renderProductsTable));
    search.addEventListener("input", renderProductsTable);
    renderProductsTable();
  }

  // =========================================================================
  // --- 13. ADMIN PRICING SPECS MATRIX PANEL CRUD (pricing.html) ---
  // =========================================================================
  if (path.includes("pricing")) {
    function renderPricingTable() {
      const tbody = document.getElementById("pricing-tbody");
      tbody.innerHTML = "";

      pricing.forEach((p, idx) => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${p.product}</td>
            <td class="px-6 py-4 font-bold">₹${p.basePrice}</td>
            <td class="px-6 py-4 text-gray-500">${p.qtyFactor}</td>
            <td class="px-6 py-4 text-gray-500">${p.paperFactor}</td>
            <td class="px-6 py-4 text-gray-500">${p.gsmFactor}</td>
            <td class="px-6 py-4 font-bold text-emerald">₹${p.finishPrice}</td>
            <td class="px-6 py-4 font-bold text-emerald">₹${p.bindingPrice}</td>
            <td class="px-6 py-4 font-bold">₹${p.deliveryPrice}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <button onclick="editPricingSpec(${idx})" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Edit</button>
              <button onclick="deletePricingSpec(${idx})" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    window.editPricingSpec = function(idx) {
      const p = pricing[idx];
      if (!p) return;

      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Edit Pricing Matrix: ${p.product}</h3>
          <form id="edit-pricing-form" class="space-y-4 text-left">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">Base Price (₹)</label>
                <input type="number" id="ep-base" value="${p.basePrice}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">Qty Multiplier</label>
                <input type="number" step="0.01" id="ep-qty" value="${p.qtyFactor}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">Paper Multiplier</label>
                <input type="number" step="0.01" id="ep-paper" value="${p.paperFactor}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">GSM Multiplier</label>
                <input type="number" step="0.01" id="ep-gsm" value="${p.gsmFactor}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">Finish Price/Unit</label>
                <input type="number" id="ep-finish" value="${p.finishPrice}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">Binding Price/Unit</label>
                <input type="number" id="ep-binding" value="${p.bindingPrice}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-bold uppercase mb-1 font-sans text-gray-500">Delivery Charge (₹)</label>
                <input type="number" id="ep-delivery" value="${p.deliveryPrice}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Save Pricing</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("edit-pricing-form").addEventListener("submit", (e) => {
        e.preventDefault();
        p.basePrice = parseFloat(document.getElementById("ep-base").value) || p.basePrice;
        p.qtyFactor = parseFloat(document.getElementById("ep-qty").value) || p.qtyFactor;
        p.paperFactor = parseFloat(document.getElementById("ep-paper").value) || p.paperFactor;
        p.gsmFactor = parseFloat(document.getElementById("ep-gsm").value) || p.gsmFactor;
        p.finishPrice = parseFloat(document.getElementById("ep-finish").value) || p.finishPrice;
        p.bindingPrice = parseFloat(document.getElementById("ep-binding").value) || p.bindingPrice;
        p.deliveryPrice = parseFloat(document.getElementById("ep-delivery").value) || p.deliveryPrice;

        localStorage.setItem("printxtore_pricing", JSON.stringify(pricing));
        showToast("Pricing specifications updated successfully.");
        closeModal();
        renderPricingTable();
      });
    };

    window.deletePricingSpec = function(idx) {
      if (!confirm("Permanently delete pricing specifications for this product?")) return;
      pricing.splice(idx, 1);
      localStorage.setItem("printxtore_pricing", JSON.stringify(pricing));
      showToast("Pricing specifications deleted.");
      renderPricingTable();
    };

    renderPricingTable();
  }

  // =========================================================================
  // --- 14. ADMIN MESSAGES CONTROLLER (messages.html) ---
  // =========================================================================
  if (path.includes("messages")) {
    const search = document.getElementById("message-search");
    const filter = document.getElementById("message-filter-status");

    function renderMessagesTable() {
      let list = [...messages];
      const searchVal = search.value.trim().toLowerCase();
      if (searchVal) {
        list = list.filter(m => m.name.toLowerCase().includes(searchVal) || m.subject.toLowerCase().includes(searchVal) || m.message.toLowerCase().includes(searchVal));
      }
      const statusVal = filter.value;
      if (statusVal !== "All") {
        list = list.filter(m => m.status === statusVal);
      }

      const tbody = document.getElementById("messages-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No messages found.</td></tr>`;
        return;
      }

      list.forEach(m => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold">${m.name}</td>
            <td class="px-6 py-4 text-[#1A2730]/80 dark:text-white/80">${m.subject}</td>
            <td class="px-6 py-4 text-gray-500">${new Date(m.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-0.5 rounded border text-[10px] font-semibold ${m.status === 'Read' ? 'bg-black/5 text-gray-400 border-black/10' : (m.status === 'Replied' ? 'bg-green/10 text-green border-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}">${m.status || 'Unread'}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button onclick="readMessage('${m.id}')" class="px-2.5 py-1.5 bg-black/5 dark:bg-white/5 border rounded-lg hover:bg-black/10 transition text-xs font-semibold">View</button>
              <button onclick="replyMessage('${m.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition">Reply</button>
              <button onclick="deleteMessage('${m.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    window.readMessage = function(id) {
      const m = messages.find(msg => msg.id === id);
      if (!m) return;

      if (m.status === "Unread") {
        m.status = "Read";
        localStorage.setItem("printxtore_messages", JSON.stringify(messages));
        renderMessagesTable();
      }

      openModal(`
        <div class="space-y-4">
          <div class="border-b pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold">${m.subject}</h3>
            <span class="text-xs text-gray-400">${m.createdAt}</span>
          </div>
          <div class="text-xs space-y-2 text-gray-500">
            <p><strong>Sender:</strong> ${m.name} (${m.email})</p>
            <p><strong>Phone:</strong> ${m.phone || 'N/A'}</p>
          </div>
          <p class="text-sm pt-4 border-t whitespace-pre-line">${m.message}</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Close</button>
            <button onclick="replyMessage('${m.id}')" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Reply</button>
          </div>
        </div>
      `);
    };

    window.replyMessage = function(id) {
      const m = messages.find(msg => msg.id === id);
      if (!m) return;

      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Send Reply: ${m.name}</h3>
          <form id="reply-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">To</label>
              <input type="text" disabled value="${m.email}" class="w-full p-2.5 rounded-lg bg-black/5 text-gray-500 text-sm cursor-not-allowed">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1 font-sans">Message</label>
              <textarea id="reply-text" rows="5" required class="w-full p-3 rounded-lg bg-white dark:bg-[#14212A] border text-sm"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition">Cancel</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition">Send</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("reply-form").addEventListener("submit", (e) => {
        e.preventDefault();
        m.status = "Replied";
        localStorage.setItem("printxtore_messages", JSON.stringify(messages));
        showToast(`Reply sent successfully to ${m.email}`);
        closeModal();
        renderMessagesTable();
      });
    };

    window.deleteMessage = function(id) {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500 font-sans">Delete Message</h3>
          <p class="text-xs">Delete this message from your inbox permanently?</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition font-semibold">Cancel</button>
            <button onclick="confirmMessageDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition font-semibold">Confirm Delete</button>
          </div>
        </div>
      `);
    };

    window.confirmMessageDelete = function(id) {
      const idx = messages.findIndex(m => m.id === id);
      if (idx !== -1) {
        messages.splice(idx, 1);
        localStorage.setItem("printxtore_messages", JSON.stringify(messages));
        showToast("Message deleted successfully.");
        closeModal();
        renderMessagesTable();
      }
    };

    window.deleteAllMessages = function() {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500">Purge Message Inbox</h3>
          <p class="text-xs">Are you sure you want to delete all messages? This cannot be undone.</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition font-semibold">Cancel</button>
            <button onclick="confirmPurgeMessages()" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition font-semibold">Delete All</button>
          </div>
        </div>
      `);
    };

    window.confirmPurgeMessages = function() {
      messages.length = 0;
      localStorage.setItem("printxtore_messages", JSON.stringify(messages));
      showToast("Inbox cleared successfully.");
      closeModal();
      renderMessagesTable();
    };

    [search, filter].forEach(el => el.addEventListener("change", renderMessagesTable));
    search.addEventListener("input", renderMessagesTable);
    renderMessagesTable();
  }

  // =========================================================================
  // --- 15. ADMIN BLOG CRUD PANEL (blog.html) ---
  // =========================================================================
  if (path.includes("blog")) {
    const search = document.getElementById("blog-search");
    const filter = document.getElementById("blog-filter-status");

    function renderBlogTable() {
      let list = [...blogs];
      const searchVal = search.value.trim().toLowerCase();
      if (searchVal) {
        list = list.filter(p => p.title.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal) || p.author.toLowerCase().includes(searchVal));
      }
      const statusVal = filter.value;
      if (statusVal !== "All") {
        list = list.filter(p => p.status === statusVal);
      }

      const tbody = document.getElementById("blog-tbody");
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-[#1A2730]/50 dark:text-white/50 font-semibold">No blog articles found.</td></tr>`;
        return;
      }

      list.forEach(p => {
        tbody.innerHTML += `
          <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="px-6 py-4 font-semibold max-w-[200px] truncate">${p.title}</td>
            <td class="px-6 py-4 text-gray-500">${p.category}</td>
            <td class="px-6 py-4 text-gray-500 text-xs">${p.author}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${p.date}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-0.5 rounded border text-[10px] font-semibold ${p.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20':'bg-green/10 text-green border-green/20'}">${p.status || 'Published'}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button onclick="openBlogEdit('${p.id}')" class="px-2.5 py-1.5 bg-[#F15A24]/10 hover:bg-[#F15A24]/20 text-[#F15A24] border border-[#F15A24]/20 rounded-lg text-xs font-semibold transition font-semibold">Edit</button>
              <button onclick="deleteBlog('${p.id}')" class="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition font-semibold">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    window.openAddBlogModal = function() {
      openModal(`
        <div class="space-y-4 font-sans">
          <h3 class="text-base font-bold">Publish Blog Post</h3>
          <form id="add-blog-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Title</label>
              <input type="text" id="ab-title" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Category</label>
              <input type="text" id="ab-category" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Excerpt</label>
              <textarea id="ab-excerpt" rows="3" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Status</label>
              <select id="ab-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-semibold">
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition font-semibold">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition font-semibold">Publish</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("add-blog-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const title = document.getElementById("ab-title").value.trim();
        const category = document.getElementById("ab-category").value.trim();
        const excerpt = document.getElementById("ab-excerpt").value.trim();
        const status = document.getElementById("ab-status").value;

        const newP = {
          id: "blog-" + Math.floor(1000 + Math.random() * 9000),
          title,
          category,
          author: currentUser.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          excerpt,
          readTime: "3 min",
          image: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
          views: 1,
          tags: ["Printing"],
          status
        };

        blogs.unshift(newP);
        localStorage.setItem("printxtore_blog", JSON.stringify(blogs));
        showToast("Blog article published.");
        closeModal();
        renderBlogTable();
      });
    };

    window.openBlogEdit = function(id) {
      const b = blogs.find(bl => bl.id === id);
      if (!b) return;

      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold">Edit Blog Post: ${b.title}</h3>
          <form id="edit-blog-form" class="space-y-4 text-left font-sans">
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Title</label>
              <input type="text" id="eb-title" value="${b.title}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Category</label>
              <input type="text" id="eb-category" value="${b.category}" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Excerpt</label>
              <textarea id="eb-excerpt" rows="3" required class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm">${b.excerpt || ''}</textarea>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase mb-1">Status</label>
              <select id="eb-status" class="w-full p-2.5 rounded-lg bg-white dark:bg-[#14212A] border text-sm font-semibold">
                <option value="Published" ${b.status !== 'Draft' ? 'selected':''}>Published</option>
                <option value="Draft" ${b.status === 'Draft' ? 'selected':''}>Draft</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition font-semibold">Close</button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold bg-[#F15A24] text-white rounded-lg transition font-semibold">Save Changes</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById("edit-blog-form").addEventListener("submit", (e) => {
        e.preventDefault();
        b.title = document.getElementById("eb-title").value.trim();
        b.category = document.getElementById("eb-category").value.trim();
        b.excerpt = document.getElementById("eb-excerpt").value.trim();
        b.status = document.getElementById("eb-status").value;

        localStorage.setItem("printxtore_blog", JSON.stringify(blogs));
        showToast("Blog article updated.");
        closeModal();
        renderBlogTable();
      });
    };

    window.deleteBlog = function(id) {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-base font-bold text-red-500 font-sans">Delete Blog Post</h3>
          <p class="text-xs">Remove this article entry permanently?</p>
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition font-semibold">Cancel</button>
            <button onclick="confirmBlogDelete('${id}')" class="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg transition font-semibold">Confirm Delete</button>
          </div>
        </div>
      `);
    };

    window.confirmBlogDelete = function(id) {
      const idx = blogs.findIndex(bl => bl.id === id);
      if (idx !== -1) {
        blogs.splice(idx, 1);
        localStorage.setItem("printxtore_blog", JSON.stringify(blogs));
        showToast("Blog deleted successfully.");
        closeModal();
        renderBlogTable();
      }
    };

    [search, filter].forEach(el => el.addEventListener("change", renderBlogTable));
    search.addEventListener("input", renderBlogTable);
    renderBlogTable();
  }

  // =========================================================================
  // --- GENERAL MULTIPAGE HELPER CONTROLLERS ---
  // =========================================================================
  function getStatusBadgeHtml(status) {
    switch (status) {
      case "File Received": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">${status}</span>`;
      case "Artwork Review": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">${status}</span>`;
      case "Printing": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">${status}</span>`;
      case "Quality Check": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">${status}</span>`;
      case "Ready": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">${status}</span>`;
      case "Delivered": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green/10 text-green border border-green/20">${status}</span>`;
      case "Cancelled": return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">${status}</span>`;
      default: return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/20">${status}</span>`;
    }
  }

  window.viewOrderDetails = function(orderId) {
    const o = orders.find(ord => ord.id === orderId);
    if (!o) return;

    openModal(`
      <div class="space-y-4 font-sans">
        <div class="border-b pb-3 flex justify-between items-center">
          <h3 class="text-base font-bold">Order Details: ${o.id}</h3>
          <span class="text-xs text-gray-400">${o.createdAt}</span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p class="text-gray-400 font-bold uppercase">Product</p>
            <p class="text-sm font-bold text-[#1A2730] dark:text-white mt-0.5">${o.product}</p>
          </div>
          <div>
            <p class="text-gray-400 font-bold uppercase">Quantity</p>
            <p class="text-sm font-bold text-[#1A2730] dark:text-white mt-0.5">${o.quantity} units</p>
          </div>
          <div>
            <p class="text-gray-400 font-bold uppercase">Paper & Size</p>
            <p class="text-[#1A2730]/80 dark:text-white/80 mt-0.5">${o.specs.size} (${o.specs.paper})</p>
          </div>
          <div>
            <p class="text-gray-400 font-bold uppercase">Sides</p>
            <p class="text-[#1A2730]/80 dark:text-white/80 mt-0.5">${o.specs.side}</p>
          </div>
          <div>
            <p class="text-gray-400 font-bold uppercase">Finish / Binding</p>
            <p class="text-[#1A2730]/80 dark:text-white/80 mt-0.5">${o.specs.finish} / Binding: ${o.specs.binding}</p>
          </div>
          <div>
            <p class="text-gray-400 font-bold uppercase">Price</p>
            <p class="text-sm font-bold text-[#F15A24] mt-0.5">₹${o.price.toLocaleString()}</p>
          </div>
          <div class="col-span-2">
            <p class="text-gray-400 font-bold uppercase">Design File</p>
            <p class="text-[#1A2730] dark:text-white font-medium mt-0.5">${o.file?.name || 'design_draft.pdf'}</p>
          </div>
          <div class="col-span-2">
            <p class="text-gray-400 font-bold uppercase">Notes</p>
            <p class="text-[#1A2730]/75 dark:text-white/70 italic mt-0.5">${o.notes || 'None'}</p>
          </div>
          ${o.adminNotes ? `
            <div class="col-span-2 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
              <p class="text-yellow-600 font-bold uppercase text-[10px]">Admin Notes</p>
              <p class="text-[#1A2730]/80 dark:text-white/80 text-xs mt-0.5">${o.adminNotes}</p>
            </div>
          `:''}
        </div>

        <div class="pt-4 border-t flex flex-col items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Status:</span>
            ${getStatusBadgeHtml(o.status)}
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t">
          <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold bg-black/5 dark:bg-white/5 border rounded-lg transition font-semibold">Close</button>
        </div>
      </div>
    `);
  };

  // Reusable modal overlay binders
  window.openModal = function(html) {
    const modal = document.getElementById("dashboard-modal");
    const content = document.getElementById("modal-content");
    if (modal && content) {
      content.innerHTML = html;
      modal.classList.remove("hidden");
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById("dashboard-modal");
    if (modal) modal.classList.add("hidden");
  };

  function addNotification(userId, message) {
    const list = JSON.parse(localStorage.getItem("printxtore_notifications")) || [];
    list.unshift({
      id: "notif-" + Math.floor(1000 + Math.random() * 9000),
      userId,
      message,
      read: false,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem("printxtore_notifications", JSON.stringify(list));
  }

  // --- CHART RENDERING SYSTEM ---
  function initAdminCharts(orders) {
    const revCanvas = document.getElementById("analytics-revenue-chart");
    const srvCanvas = document.getElementById("analytics-services-chart");

    if (revCanvas && typeof Chart !== "undefined") {
      const monthlySum = Array(12).fill(0);
      orders.forEach(o => {
        if (o.status !== "Cancelled") {
          const d = new Date(o.createdAt);
          if (!isNaN(d.getTime())) monthlySum[d.getMonth()] += o.price;
        }
      });

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const textCol = isDark ? "#87919A" : "#1A2730";
      const ctx = revCanvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(241, 90, 36, 0.35)");
      gradient.addColorStop(1, "rgba(241, 90, 36, 0.0)");

      new Chart(revCanvas, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            data: monthlySum.slice(0, 8),
            borderColor: '#F15A24',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#18242D',
            pointBorderColor: '#F15A24',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textCol } },
            y: { ticks: { color: textCol, callback: (v) => '₹' + (v / 1000) + 'k' } }
          }
        }
      });
    }

    if (srvCanvas && typeof Chart !== "undefined") {
      const counts = {};
      orders.forEach(o => { counts[o.product] = (counts[o.product] || 0) + 1; });
      const labels = Object.keys(counts).slice(0, 4);
      const data = labels.map(l => counts[l]);

      new Chart(srvCanvas, {
        type: 'doughnut',
        data: {
          labels: labels.length > 0 ? labels : ['No Data'],
          datasets: [{
            data: data.length > 0 ? data : [1],
            backgroundColor: ['#1F6F6B', '#F15A24', '#71B280', '#A8D5BA'],
            borderColor: 'transparent'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: document.documentElement.getAttribute("data-theme") === "dark" ? "#87919A" : "#1A2730" } } }
        }
      });
    }
  }


  // Sidebar Mobile Toggles bound globally
  const sidebar = document.getElementById("dashboard-sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => sidebar.classList.remove("-translate-x-full"));
  }
  if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", () => sidebar.classList.add("-translate-x-full"));
  }

  // Bind Lucide Icons globally
  lucide.createIcons();
});
