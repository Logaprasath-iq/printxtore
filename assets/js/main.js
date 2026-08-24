// PRINTXTORE Common Application Script

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navbar Sticky & Blur Effect
  const navbar = document.getElementById("main-navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navbar.classList.add("bg-dark-teal/95", "backdrop-blur-md", "shadow-xl", "border-b", "border-white/5");
        navbar.classList.remove("bg-dark/40", "backdrop-blur-sm", "border-white/10");
      } else {
        navbar.classList.add("bg-dark/40", "backdrop-blur-sm", "border-white/10");
        navbar.classList.remove("bg-dark-teal/95", "backdrop-blur-md", "shadow-xl", "border-b", "border-white/5");
      }
    });
  }

  // 2. Active Link Detector
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && currentPath.endsWith(href)) {
      link.classList.add("active");
    }
  });

  // 3. Mobile Hamburger Menu Toggle
  const menuBtn = document.getElementById("mobile-menu-btn");
  const menuCloseBtn = document.getElementById("mobile-menu-close");
  const mobileMenu = document.getElementById("mobile-menu");
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("translate-x-full");
      document.body.classList.add("overflow-hidden");
    });
  }
  
  if (menuCloseBtn && mobileMenu) {
    menuCloseBtn.addEventListener("click", () => {
      mobileMenu.classList.add("translate-x-full");
      document.body.classList.remove("overflow-hidden");
    });
  }

  // Mobile Menu Accordions
  const accordions = document.querySelectorAll(".mobile-accordion-header");
  accordions.forEach(header => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const arrow = header.querySelector(".accordion-arrow");
      if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        if (arrow) arrow.style.transform = "rotate(180deg)";
      } else {
        content.classList.add("hidden");
        if (arrow) arrow.style.transform = "rotate(0deg)";
      }
    });
  });

  // 4. Toast Notification Creator
  window.showToast = function(message, type = "success") {
    let oldToast = document.querySelector(".toast-notification");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notification glass ${
      type === "success" 
        ? "border-emerald/30 text-emerald-400 bg-dark/90" 
        : "border-red-500/30 text-red-400 bg-dark/90"
    }`;
    
    // Icon
    let iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    if (type !== "success") {
      iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    }

    toast.innerHTML = `${iconHTML} <span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger transition
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    // Clear after 3.5s
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  // 5. Dynamic Print Price Calculator
  const calculatorForm = document.getElementById("price-calculator-form");
  if (calculatorForm) {
    const fields = ["calc-product", "calc-quantity", "calc-paper-size", "calc-paper-type", "calc-gsm", "calc-finish", "calc-binding"];
    const elements = {};
    fields.forEach(f => elements[f] = document.getElementById(f));
    
    const doubleSideCheckbox = document.getElementById("calc-double-side");
    const displayElement = document.getElementById("calc-estimated-price");

    // Parse URL parameter to auto-load service details on details page
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam && typeof DB !== 'undefined') {
      const matchedSrv = DB.getServices().find(s => 
        s.name.toLowerCase() === serviceParam.toLowerCase() || 
        serviceParam.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (matchedSrv) {
        const titleEl = document.getElementById('service-title');
        const descEl = document.getElementById('service-description');
        if (titleEl) titleEl.textContent = matchedSrv.name;
        if (descEl) descEl.textContent = matchedSrv.description;
        if (elements["calc-product"]) {
          elements["calc-product"].value = matchedSrv.name;
        }

        // Dynamically adjust selector option values depending on size
        const sizeSelect = document.getElementById('calc-paper-size');
        if (sizeSelect) {
          sizeSelect.innerHTML = "";
          if (matchedSrv.name === "Business Cards") {
            sizeSelect.innerHTML = `<option value="3.5\\" x 2.0\\">3.5" x 2.0" Standard</option>`;
          } else if (matchedSrv.name === "Flyers & Leaflets") {
            sizeSelect.innerHTML = `<option value="A5">A5 Flyer</option><option value="A4">A4 Flyer</option>`;
          } else if (matchedSrv.name === "Posters & Banners" || matchedSrv.name === "Outdoor Signage") {
            sizeSelect.innerHTML = `<option value="A2">A2 Poster</option><option value="A1">A1 Poster</option><option value="Custom">Custom Vinyl Banner</option>`;
          } else if (matchedSrv.name === "Brochures") {
            sizeSelect.innerHTML = `<option value="A4 Tri-fold">A4 Tri-fold Brochure</option><option value="A5 Bi-fold">A5 Bi-fold Brochure</option>`;
          } else {
            sizeSelect.innerHTML = `<option value="Standard">Standard Product Size</option><option value="Custom">Custom Specifications</option>`;
          }
        }
      }
    }

    function updateCalculator() {
      const product = elements["calc-product"] ? elements["calc-product"].value : "Business Cards";
      const qty = elements["calc-quantity"] ? (parseInt(elements["calc-quantity"].value) || 1) : 100;
      const paperSize = elements["calc-paper-size"] ? elements["calc-paper-size"].value : "Standard";
      const paperType = elements["calc-paper-type"] ? elements["calc-paper-type"].value : "";
      const gsm = elements["calc-gsm"] ? elements["calc-gsm"].value : "";
      const finish = elements["calc-finish"] ? elements["calc-finish"].value : "None";
      const binding = elements["calc-binding"] ? elements["calc-binding"].value : "None";
      const isDoubleSided = doubleSideCheckbox ? doubleSideCheckbox.checked : false;

      const specString = `${paperSize} ${paperType} ${gsm}`.trim();
      const estimatedPrice = DB.calculatePrice(product, qty, specString, finish, binding, isDoubleSided);
      
      if (displayElement) {
        // Currency formatted output
        displayElement.textContent = `₹${estimatedPrice.toLocaleString()}`;
      }
    }

    // Add event listeners to all fields
    fields.forEach(f => {
      if (elements[f]) {
        elements[f].addEventListener("change", updateCalculator);
        if (elements[f].tagName === "INPUT") {
          elements[f].addEventListener("input", updateCalculator);
        }
      }
    });
    if (doubleSideCheckbox) doubleSideCheckbox.addEventListener("change", updateCalculator);

    updateCalculator(); // Run once initially
  }

  // 6. Artwork File Upload Drag-and-Drop System
  const dropzone = document.getElementById("artwork-dropzone");
  const fileInput = document.getElementById("artwork-file-input");
  const fileList = document.getElementById("uploaded-files-list");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    // Drag events
    ["dragenter", "dragover"].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add("border-emerald", "bg-emerald/10");
      }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-emerald", "bg-emerald/10");
      }, false);
    });

    dropzone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleUploadedFiles(files);
    });

    fileInput.addEventListener("change", () => {
      handleUploadedFiles(fileInput.files);
    });

    function handleUploadedFiles(files) {
      if (!files.length) return;
      Array.from(files).forEach(file => {
        // Validation
        const validExtensions = ["pdf", "jpg", "png", "svg"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
          showToast(`Invalid file type for ${file.name}. Only PDF, JPG, PNG, and SVG are accepted.`, "error");
          return;
        }

        // File Item Node creation
        const fileId = "file-" + Math.floor(Math.random() * 100000);
        const itemNode = document.createElement("div");
        itemNode.id = fileId;
        itemNode.className = "flex flex-col gap-2 p-4 rounded-lg bg-dark/20 border border-white/5 shadow-inner mt-3";
        itemNode.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <div>
                <p class="text-sm font-semibold truncate max-w-[200px] text-white">${file.name}</p>
                <p class="text-xs text-white/50">${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button type="button" class="delete-file-btn text-white/40 hover:text-red-400 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          <!-- Simulated upload progress tracker -->
          <div class="progress-bar-container w-full h-1.5 bg-dark rounded-full overflow-hidden">
            <div class="progress-bar-fill w-0 h-full bg-gradient-to-r from-teal to-green transition-all duration-300"></div>
          </div>
        `;
        
        if (fileList) fileList.appendChild(itemNode);

        // Simulate progress bar animating
        const barFill = itemNode.querySelector(".progress-bar-fill");
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 20) + 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            barFill.classList.remove("from-teal", "to-green");
            barFill.classList.add("bg-emerald");
            showToast(`File "${file.name}" uploaded successfully!`);
            
            // Save file properties temporarily for order form
            const stored = JSON.parse(sessionStorage.getItem("uploaded_artwork_demo")) || [];
            stored.push({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` });
            sessionStorage.setItem("uploaded_artwork_demo", JSON.stringify(stored));
          }
          barFill.style.width = `${progress}%`;
        }, 150);

        // Delete binder
        itemNode.querySelector(".delete-file-btn").addEventListener("click", () => {
          itemNode.remove();
          const stored = JSON.parse(sessionStorage.getItem("uploaded_artwork_demo")) || [];
          const filtered = stored.filter(f => f.name !== file.name);
          sessionStorage.setItem("uploaded_artwork_demo", JSON.stringify(filtered));
          showToast(`File "${file.name}" removed.`);
        });
      });
    }
  }

  // 7. Contact Form Handler & Validator
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const phone = document.getElementById("contact-phone").value.trim();
      const subject = document.getElementById("contact-subject").value.trim();
      const message = document.getElementById("contact-message").value.trim();
      
      if (!name || !email || !subject || !message) {
        showToast("Please fill in all required fields.", "error");
        return;
      }

      // Add to database
      const messages = DB.get("messages") || [];
      const newMsg = {
        id: "msg-" + Math.floor(Math.random() * 100000),
        name,
        email,
        phone,
        subject,
        message,
        status: "Unread",
        createdAt: new Date().toISOString()
      };
      
      messages.unshift(newMsg);
      DB.set("messages", messages);
      
      showToast("Thank you! Your message has been sent successfully.");
      contactForm.reset();
    });
  }

  // 8. Magnetic Buttons micro-interaction
  const magneticElements = document.querySelectorAll(".magnetic");
  if (magneticElements.length && window.innerWidth >= 1024) {
    magneticElements.forEach(elem => {
      elem.addEventListener("mousemove", (e) => {
        const bound = elem.getBoundingClientRect();
        const x = e.clientX - bound.left - (bound.width / 2);
        const y = e.clientY - bound.top - (bound.height / 2);
        // Translate button by 30% of offset
        elem.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      elem.addEventListener("mouseleave", () => {
        elem.style.transform = "translate(0px, 0px)";
      });
    });
  }
});
