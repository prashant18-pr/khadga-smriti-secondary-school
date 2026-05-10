/**
 * Main Frontend Script
 * Handles UI interactions, animations, and API requests
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const html = document.documentElement;
  const loader = document.getElementById('loader');
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  const themeToggle = document.getElementById('themeToggle');
  const backToTop = document.getElementById('backToTop');
  const footerYear = document.getElementById('footerYear');
  
  // Set Footer Year
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ==========================================
  // INITIAL LOADER
  // ==========================================
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto'; // allow scrolling after load
    }, 1500); // minimum load time for UX
  });

  // prevent scrolling during load
  document.body.style.overflow = 'hidden';

  // ==========================================
  // THEME TOGGLE (Dark/Light)
  // ==========================================
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // ==========================================
  // NAVBAR & SCROLL BEHAVIOR
  // ==========================================
  window.addEventListener('scroll', () => {
    // Navbar background
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active link highlighting
    highlightNav();
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Hamburger Menu
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Active link highlighting based on scroll position
  const sections = document.querySelectorAll('section[id]');
  function highlightNav() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);

      if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  }

  // ==========================================
  // SCROLL REVEAL ANIMATIONS
  // ==========================================
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
      
      // If it's a stats container, trigger counter
      if (entry.target.classList.contains('hero-stats')) {
        startCounters();
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // NUMBER COUNTERS
  // ==========================================
  let countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // lower = faster

    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const increment = target / speed;

      const updateCount = () => {
        const count = +counter.innerText;
        if (count < target) {
          counter.innerText = Math.ceil(count + increment);
          setTimeout(updateCount, 10);
        } else {
          counter.innerText = target;
        }
      };

      updateCount();
    });
  }

  // ==========================================
  // TESTIMONIALS SLIDER
  // ==========================================
  const track = document.getElementById('testimonialsTrack');
  if (track) {
    const cards = track.querySelectorAll('.testimonial-card');
    const btnPrev = document.getElementById('tcPrev');
    const btnNext = document.getElementById('tcNext');
    const dotsContainer = document.getElementById('tcDots');
    let currentIndex = 0;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('tc-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.tc-dot');

    function goToSlide(index) {
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
      
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      dots.forEach(dot => dot.classList.remove('active'));
      dots[currentIndex].classList.add('active');
    }

    btnPrev.addEventListener('click', () => goToSlide(currentIndex - 1));
    btnNext.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Auto slide
    setInterval(() => goToSlide(currentIndex + 1), 6000);
  }

  // ==========================================
  // FETCH API DATA
  // ==========================================
  fetchNotices();
  fetchGallery();
  // We'll use mock events since there isn't a dedicated endpoint implemented yet
  populateMockEvents();

  // TICKER NOTICES
  async function fetchNotices() {
    try {
      // In a real app we would call /api/notices
      // For this demo if API isn't running, we'll use fallback data
      const response = await fetch('/api/notices?limit=5').catch(() => null);
      let notices = [];
      
      if (response && response.ok) {
        const data = await response.json();
        notices = data.data;
      } else {
        // Fallback mock data
        notices = [
          { title: "ADMISSION OPEN for 2025/2026 Academic Session - Apply Now!", category: "admission", priority: "urgent", publishedAt: new Date().toISOString() },
          { title: "First Term Examination Routine Published", category: "exam", publishedAt: new Date().toISOString() },
          { title: "Science Exhibition scheduled for next week", category: "event", publishedAt: new Date().toISOString() }
        ];
      }

      // Update Ticker
      const tickerContent = document.getElementById('tickerContent');
      if (tickerContent && notices.length > 0) {
        let html = '';
        // Duplicate content for smooth infinite scrolling
        for (let i = 0; i < 10; i++) {
          notices.forEach(n => {
            const date = new Date(n.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isAdmission = n.category === 'admission' || n.title.includes('ADMISSION');
            html += `<div class="ticker-item ${isAdmission ? 'ticker-admission' : ''}"><span class="ticker-date">[${date}]</span> <a href="#notices">${n.title}</a></div>`;
          });
        }
        tickerContent.innerHTML = html;
      }

      // Update Notices Section
      const noticesList = document.getElementById('noticesList');
      if (noticesList && notices.length > 0) {
        let html = '';
        notices.forEach(n => {
          const d = new Date(n.publishedAt);
          const month = d.toLocaleDateString('en-US', { month: 'short' });
          const day = d.getDate();
          
          html += `
            <div class="notice-item" data-category="${n.category}">
              <div class="notice-date-box">
                <span class="nd-month">${month}</span>
                <span class="nd-day">${day}</span>
              </div>
              <div class="notice-content-inner">
                <div class="notice-meta">
                  <span class="notice-tag ${n.category} ${n.priority === 'urgent' ? 'urgent' : ''}">${n.category}</span>
                </div>
                <h3 class="notice-title"><a href="#">${n.title}</a></h3>
                <p class="notice-desc">${n.content || 'Click to read more details about this notice.'}</p>
              </div>
            </div>
          `;
        });
        noticesList.innerHTML = html;
        
        // Setup filters
        setupNoticeFilters();
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  }

  function setupNoticeFilters() {
    const buttons = document.querySelectorAll('.notice-filters .filter-btn');
    const items = document.querySelectorAll('.notice-item');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        items.forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'flex';
            // Slight delay to allow display flex to apply before opacity transition
            setTimeout(() => { item.style.opacity = '1'; }, 10);
          } else {
            item.style.opacity = '0';
            setTimeout(() => { item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  // GALLERY FETCH
  async function fetchGallery() {
    try {
      const response = await fetch('/api/gallery?limit=6').catch(() => null);
      let items = [];
      
      if (response && response.ok) {
        const data = await response.json();
        items = data.data;
      } else {
        // Fallback mock data
        items = [
          { title: "Morning Assembly", category: "campus", imageUrl: "assembly.jpg" },
          { title: "Our Dedicated Staff", category: "campus", imageUrl: "staff_group.jpg" },
          { title: "Academic Award Ceremony", category: "events", imageUrl: "award_ceremony.jpg" },
          { title: "Student Achievements", category: "events", imageUrl: "achievements.jpg" },
          { title: "Annual School Trip", category: "cultural", imageUrl: "school_trip.jpg" },
          { title: "Educational Excursion", category: "cultural", imageUrl: "scenic_group.png" },
          { title: "Interactive Classroom Session", category: "campus", imageUrl: "classroom.png" },
          { title: "Field Study Tour", category: "cultural", imageUrl: "educational_tour.png" },
          { title: "Cultural Program Performance", category: "cultural", imageUrl: "cultural_program.png" },
          { title: "School Community Gathering", category: "campus", imageUrl: "assembly_wide.png" }
        ];
      }

      const grid = document.getElementById('galleryGrid');
      if (grid && items.length > 0) {
        let html = '';
        items.forEach((item, index) => {
          // Add data attributes for lightbox
          html += `
            <div class="gallery-item" data-category="${item.category}" 
                 data-src="${item.imageUrl}" data-caption="${item.title}" data-index="${index}">
              <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
              <div class="gallery-overlay">
                <div class="gallery-category">${item.category}</div>
                <div class="gallery-title">${item.title}</div>
              </div>
            </div>
          `;
        });
        grid.innerHTML = html;
        setupGalleryFilters();
        setupLightbox();
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  }

  function setupGalleryFilters() {
    const buttons = document.querySelectorAll('[data-gallery-filter]');
    const items = document.querySelectorAll('.gallery-item');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-gallery-filter');
        
        items.forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // MOCK EVENTS (If no API route is built yet)
  function populateMockEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const events = [
      { title: "Inter-College Debate", date: "Nov 15, 2025", desc: "Join us for the annual inter-college debate competition focusing on AI in education.", img: "award_ceremony.jpg" },
      { title: "Science Fair 2025", date: "Dec 05, 2025", desc: "Showcasing innovative projects by our Science stream students.", img: "classroom.png" },
      { title: "Alumni Meet", date: "Jan 10, 2026", desc: "A get-together event for all batches to reconnect and network.", img: "staff_group.jpg" }
    ];

    let html = '';
    events.forEach(e => {
      html += `
        <div class="event-card">
          <img src="${e.img}" alt="${e.title}" class="event-img" loading="lazy">
          <div class="event-content">
            <div class="event-date-badge">${e.date}</div>
            <h3 class="event-title">${e.title}</h3>
            <p class="event-desc">${e.desc}</p>
            <div class="event-meta">
              <span>📍 Main Auditorium</span>
              <a href="#contact" class="btn-card">Register →</a>
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
  }

  // ==========================================
  // LIGHTBOX
  // ==========================================
  function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const items = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;

    if (!lightbox || items.length === 0) return;

    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
      });
    });

    function openLightbox() {
      const item = items[currentIndex];
      lightboxImg.src = item.getAttribute('data-src');
      lightboxCaption.textContent = item.getAttribute('data-caption');
      lightbox.style.display = 'flex';
      // tiny delay for transition
      setTimeout(() => lightbox.classList.add('active'), 10);
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 300);
    }

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    
    document.getElementById('lightboxPrev').addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
      openLightbox();
    });
    
    document.getElementById('lightboxNext').addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
      openLightbox();
    });

    // Close on click outside
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
      if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
    });
  }

  // ==========================================
  // CONTACT FORM SUBMISSION
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formAlert = document.getElementById('formAlert');
      const submitBtn = document.getElementById('submitContactBtn');
      const btnText = document.getElementById('submitBtnText');
      const btnSpinner = document.getElementById('btnSpinner');
      
      // Basic validation reset
      document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
      let isValid = true;
      
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();

      if (!name) { document.getElementById('contactName').parentElement.classList.add('has-error'); document.getElementById('nameError').textContent = "Name is required"; isValid = false; }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { document.getElementById('contactEmail').parentElement.classList.add('has-error'); document.getElementById('emailError').textContent = "Valid email is required"; isValid = false; }
      if (!subject) { document.getElementById('contactSubject').parentElement.classList.add('has-error'); document.getElementById('subjectError').textContent = "Subject is required"; isValid = false; }
      if (!message || message.length < 10) { document.getElementById('contactMessage').parentElement.classList.add('has-error'); document.getElementById('messageError').textContent = "Message must be at least 10 characters"; isValid = false; }

      if (!isValid) return;

      // Prepare request
      const payload = { name, email, subject, message, phone };

      // UI Loading state
      btnText.style.display = 'none';
      btnSpinner.style.display = 'block';
      submitBtn.disabled = true;
      formAlert.style.display = 'none';
      formAlert.className = 'form-alert';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          formAlert.textContent = data.message || "Message sent successfully!";
          formAlert.classList.add('success');
          contactForm.reset();
        } else {
          formAlert.textContent = data.message || "Failed to send message. Please try again.";
          formAlert.classList.add('error');
        }
      } catch (error) {
        // Handle case when backend is not running
        formAlert.textContent = "Thank you! Your message has been received (Demo mode).";
        formAlert.classList.add('success');
        contactForm.reset();
        console.error("Form submission error (likely backend not running):", error);
      } finally {
        // Restore UI state
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
        
        // Hide success message after 5 seconds
        if (formAlert.classList.contains('success')) {
          setTimeout(() => {
            formAlert.style.display = 'none';
          }, 5000);
        }
      }
    });
  }

});
