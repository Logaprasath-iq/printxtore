// PRINTXTORE Unified Database & Session Engine

const DEFAULT_CUSTOMERS = [
  { id: "cust-1", name: "Sarah Jenkins", email: "sarah.j@example.com", phone: "+1 (555) 234-5678", role: "client", company: "Aero Design Studio", status: "Active" },
  { id: "cust-2", name: "Alex Rivera", email: "alex.r@example.com", phone: "+1 (555) 876-5432", role: "client", company: "PixelTech", status: "Active" },
  { id: "cust-3", name: "David Chen", email: "david.c@example.com", phone: "+1 (555) 456-7890", role: "client", company: "Chen Consulting", status: "Active" },
  { id: "cust-4", name: "Emma Watson", email: "demo@printxtore.com", phone: "+1 (555) 111-2222", role: "client", company: "Creative Hub", status: "Active" },
  { id: "cust-admin", name: "PrintXtore Admin", email: "admin@printxtore.com", phone: "+1 (555) 000-9999", role: "admin", company: "PRINTXTORE HQ", status: "Active" }
];

const DEFAULT_SERVICES = [
  { id: "srv-1", name: "Business Cards", description: "Premium cardstock cards with custom finishes (matte, gloss, foil).", category: "Business Printing", basePrice: 450, status: "Active" },
  { id: "srv-2", name: "Flyers & Leaflets", description: "Vibrant promotional materials to boost brand visibility.", category: "Marketing Materials", basePrice: 850, status: "Active" },
  { id: "srv-3", name: "Posters & Banners", description: "High-resolution large-format prints for indoor/outdoor use.", category: "Marketing Materials", basePrice: 1200, status: "Active" },
  { id: "srv-4", name: "Packaging", description: "Eco-friendly, branded boxes and mailer tubes.", category: "Packaging", basePrice: 2500, status: "Active" }
];

const DEFAULT_ORDERS = [
  {
    id: "PX-1001",
    customerId: "cust-4",
    customerName: "Emma Watson",
    product: "Business Cards",
    quantity: 500,
    specs: { size: "3.5\" x 2.0\"", paper: "Premium Silk 350 GSM", color: "Full Color", side: "Double Sided", finish: "Matte Lamination", binding: "None" },
    file: { name: "design_draft.pdf", size: "2.1 MB" },
    price: 850,
    status: "Printing",
    createdAt: "2026-08-20",
    notes: "Please keep colors bright."
  }
];

const DEFAULT_BLOG = [
  {
    id: "blog-1",
    title: "3D Printing: SLA vs FDM Explanations",
    category: "3D PRINTING",
    author: "Markus Vance",
    date: "Aug 15, 2026",
    excerpt: "Explore the fundamental differences between Stereolithography (SLA) and Fused Deposition Modeling (FDM) in modern 3D printing.",
    image: "../assets/images/blog1.jpg",
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
    image: "../assets/images/blog2.jpg",
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
    image: "../assets/images/blog3.jpg",
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
    image: "../assets/images/blog4.jpg",
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
    image: "../assets/images/blog5.jpg",
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
    image: "../assets/images/blog6.jpg",
    readTime: "6 min",
    contentHtml: "<p>Designing custom packaging requires precision. You must prepare a flat die-line template indicating cut lines and crease folds, account for bleed margins, choose durable kraft or cardboard paper stocks, and apply custom finish coatings. This guide walks you through preparing print-ready packaging templates.</p>",
    status: "Published"
  }
];

const DEFAULT_MESSAGES = [
  { id: "msg-1", name: "John Doe", email: "john@example.com", phone: "+91 9999911111", subject: "Wholesale Inquiry", message: "Looking for printing 10,000 brochures monthly. Please share rates.", status: "Unread", createdAt: "2026-08-22" }
];

const DEFAULT_PRICING = [
  { product: "Business Cards", basePrice: 450, qtyFactor: 0.85, paperFactor: 1.0, gsmFactor: 1.0, finishPrice: 2, bindingPrice: 0, deliveryPrice: 100 },
  { product: "Flyers & Leaflets", basePrice: 850, qtyFactor: 0.8, paperFactor: 1.1, gsmFactor: 1.1, finishPrice: 1.5, bindingPrice: 0, deliveryPrice: 100 },
  { product: "Posters & Banners", basePrice: 1200, qtyFactor: 0.75, paperFactor: 1.2, gsmFactor: 1.2, finishPrice: 3, bindingPrice: 0, deliveryPrice: 150 },
  { product: "Packaging", basePrice: 2500, qtyFactor: 0.6, paperFactor: 1.4, gsmFactor: 1.4, finishPrice: 3, bindingPrice: 0, deliveryPrice: 200 }
];

// Initialize databases using prompt specified keys
function initDatabase() {
  const storedBlog = JSON.parse(localStorage.getItem("printxtore_blog"));
  if (!storedBlog || storedBlog.length < 6) {
    localStorage.setItem("printxtore_blog", JSON.stringify(DEFAULT_BLOG));
  }
  if (!localStorage.getItem("printxtore_users")) {
    localStorage.setItem("printxtore_users", JSON.stringify(DEFAULT_CUSTOMERS));
  }
  if (!localStorage.getItem("printxtore_customers")) {
    localStorage.setItem("printxtore_customers", JSON.stringify(DEFAULT_CUSTOMERS));
  }
  if (!localStorage.getItem("printxtore_services")) {
    localStorage.setItem("printxtore_services", JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem("printxtore_orders")) {
    localStorage.setItem("printxtore_orders", JSON.stringify(DEFAULT_ORDERS));
  }
  if (!localStorage.getItem("printxtore_blog")) {
    localStorage.setItem("printxtore_blog", JSON.stringify(DEFAULT_BLOG));
  }
  if (!localStorage.getItem("printxtore_messages")) {
    localStorage.setItem("printxtore_messages", JSON.stringify(DEFAULT_MESSAGES));
  }
  if (!localStorage.getItem("printxtore_pricing")) {
    localStorage.setItem("printxtore_pricing", JSON.stringify(DEFAULT_PRICING));
  }
}

// Database module
const DB = {
  get: (key) => JSON.parse(localStorage.getItem(`printxtore_${key}`)),
  set: (key, val) => localStorage.setItem(`printxtore_${key}`, JSON.stringify(val)),
  
  // Auth Session mappings using localStorage
  getCurrentUser: () => JSON.parse(localStorage.getItem("printxtore_session")),
  setCurrentUser: (user) => localStorage.setItem("printxtore_session", JSON.stringify(user)),
  logout: () => localStorage.removeItem("printxtore_session")
};

initDatabase();
window.DB = DB;
console.log("PRINTXTORE Synced Database Engine Loaded.");
