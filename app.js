document.addEventListener('DOMContentLoaded', () => {

  /* --- HEADER SCROLL EFFECT --- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* --- MOBILE MENU TOGGLE --- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(5px, 6px)' : 'none';
    spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(5px, -6px)' : 'none';
  });

  const navItems = navLinks.querySelectorAll('a');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });

  /* --- SCROLL ANIMATIONS (INTERSECTION OBSERVER FOR STANDARD REVEALS) --- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  /* ================================================================
     HERO — 260-FRAME CANVAS IMAGE SEQUENCE (Apple-style)
     ================================================================ */

  const TOTAL_FRAMES = 260;

  // Build the ordered array of image paths
  function framePath(n) {
    return `images/herosection/ezgif-frame-${String(n).padStart(3, '0')}.png`;
  }

  // Pre-load every frame into Image objects so drawing is instant
  const frames = new Array(TOTAL_FRAMES).fill(null);
  let framesLoaded = 0;

  function preloadFrames(onReady) {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = framePath(i + 1); // frames are 001..260
      img.onload = img.onerror = () => {
        framesLoaded++;
        if (framesLoaded === TOTAL_FRAMES) onReady();
      };
      frames[i] = img;
    }
  }

  // Canvas + context
  const heroCanvas = document.getElementById('heroCanvas');
  const ctx = heroCanvas ? heroCanvas.getContext('2d') : null;

  // Size the canvas to fill the viewport pixel-perfectly
  function resizeCanvas() {
    if (!heroCanvas) return;
    heroCanvas.width  = window.innerWidth;
    heroCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    drawFrame(currentFrameIndex);
  });

  // Draw a single frame (cover-fit, centred)
  let currentFrameIndex = 0;
  function drawFrame(index) {
    if (!ctx || !heroCanvas) return;
    const img = frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = heroCanvas.width;
    const ch = heroCanvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // --- Text overlay elements ---
  const heroScrollWrapper = document.getElementById('heroScrollWrapper');
  const textOverlays   = [
    document.getElementById('heroText1'),
    document.getElementById('heroText2'),
    document.getElementById('heroText3'),
    document.getElementById('heroText4'),
  ];
  const progressDots   = document.querySelectorAll('.hero-dot');
  const scrollIndicator = document.getElementById('heroScrollIndicator');

  // Show/hide overlays based on which quarter of the scroll we're in
  function updateHeroOverlays(progress) {
    // Each panel occupies 25 % of the total scroll range
    const panel = Math.min(3, Math.floor(progress * 4));

    textOverlays.forEach((el, i) => {
      if (!el) return;
      if (i === panel) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });

    progressDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === panel);
    });

    // Hide the "scroll to begin" indicator once user starts scrolling
    if (scrollIndicator) {
      scrollIndicator.classList.toggle('hidden', progress > 0.01);
    }
  }

  // Helper: scroll progress for the hero wrapper (0 → 1)
  function getHeroScrollProgress() {
    if (!heroScrollWrapper) return 0;
    const scrollTop = window.scrollY;
    const wrapperTop    = heroScrollWrapper.offsetTop;
    const wrapperHeight = heroScrollWrapper.offsetHeight;
    const viewportH     = window.innerHeight;
    const start = wrapperTop;
    const end   = wrapperTop + wrapperHeight - viewportH;
    if (scrollTop <= start) return 0;
    if (scrollTop >= end)   return 1;
    return (scrollTop - start) / (end - start);
  }

  // Main hero tick — called on every scroll event
  function animateHero() {
    const p = getHeroScrollProgress();
    // Map 0-1 progress to frame index 0-259
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.round(p * (TOTAL_FRAMES - 1)));
    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      drawFrame(currentFrameIndex);
    }
    updateHeroOverlays(p);
  }

  // Details & Price block selectors
  const detailBlocks = document.querySelectorAll('.detail-block');

  function highlightDetailBlocks() {
    if (detailBlocks.length === 0) return;
    const threshold = window.innerHeight * 0.5; // Visual focus line at middle of viewport

    detailBlocks.forEach(block => {
      const rect = block.getBoundingClientRect();
      const blockCenter = rect.top + rect.height / 2;

      // If the block is close to the middle of the screen, light it up
      if (Math.abs(blockCenter - threshold) < 220) {
        block.classList.add('active');
      } else {
        block.classList.remove('active');
      }
    });
  }

  // Generic helper: scroll progress (0→1) for any scroll-wrapper section
  function getScrollProgress(wrapper) {
    if (!wrapper) return 0;
    const scrollTop    = window.scrollY;
    const wrapperTop   = wrapper.offsetTop;
    const wrapperH     = wrapper.offsetHeight;
    const viewportH    = window.innerHeight;
    const start = wrapperTop;
    const end   = wrapperTop + wrapperH - viewportH;
    if (scrollTop <= start) return 0;
    if (scrollTop >= end)   return 1;
    return (scrollTop - start) / (end - start);
  }

  // Statement sticky selectors
  const statementScrollWrapper = document.getElementById('statementScrollWrapper');
  const statementContent = document.getElementById('statementContent');
  const statementBg = document.getElementById('statementBg');

  function animateStatement() {
    if (!statementScrollWrapper) return;
    const p = getScrollProgress(statementScrollWrapper);

    if (statementContent) {
      let opacity = 0;
      let translateY = 40;

      // Animation curves: fade in during first half, fade out during second half
      if (p < 0.5) {
        const factor = p * 2; // scales 0 to 1
        opacity = factor;
        translateY = 40 - factor * 40;
      } else {
        const factor = (p - 0.5) * 2; // scales 0 to 1
        opacity = 1 - factor;
        translateY = -factor * 40;
      }

      statementContent.style.opacity = Math.max(0, Math.min(1, opacity));
      statementContent.style.transform = `translateY(${translateY}px)`;
    }

    if (statementBg) {
      statementBg.style.transform = `scale(${1.0 + p * 0.2})`;
      statementBg.style.opacity = Math.max(0, Math.min(1, p < 0.5 ? p * 2 : 2 - p * 2));
    }
  }

  // Run core scroll loop inside requestAnimationFrame for smooth 60 fps
  function onScroll() {
    animateHero();
    highlightDetailBlocks();
    animateStatement();
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(onScroll);
  });

  // ── BOOT SEQUENCE ──────────────────────────────────────────────
  // 1. Draw frame 0 immediately (visible before scrolling)
  // 2. Start pre-loading all 260 frames in the background
  // 3. Show first text overlay right away
  drawFrame(0);
  updateHeroOverlays(0);

  preloadFrames(() => {
    // All frames ready — redraw current frame in case scroll happened during load
    drawFrame(currentFrameIndex);
  });

  // Call scroll handler once so everything is in the right state on first paint
  onScroll();

  /* --- SPECIFICATION TABS & IMAGE SWAPPING --- */
  const tabBtns = document.querySelectorAll('.specs-tab-btn');
  const tabContents = document.querySelectorAll('.specs-tab-content');
  const specsDisplayImage = document.getElementById('specsDisplayImage');

  const tabImageMap = {
    overview: 'images/exterior.png',
    exterior: 'images/exterior.png',
    interior: 'images/interior.png',
    engine: 'images/engine.png',
    drivetrain: 'images/engine.png'
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${targetTab}`) {
          content.classList.add('active');
        }
      });

      if (tabImageMap[targetTab]) {
        specsDisplayImage.style.opacity = 0;
        setTimeout(() => {
          specsDisplayImage.src = tabImageMap[targetTab];
          specsDisplayImage.style.opacity = 1;
        }, 200);
      }
    });
  });

  /* --- GALLERY FILTERING --- */
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          item.offsetHeight; // force reflow
          item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* --- LIGHTBOX OVERLAY --- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const triggerElements = document.querySelectorAll('[data-image]');

  const openLightbox = (imageSrc, captionText) => {
    lightboxImage.src = imageSrc;
    lightboxCaption.textContent = captionText;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      lightboxImage.src = '';
      lightboxCaption.textContent = '';
    }, 400);
  };

  triggerElements.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-image');
      const caption = trigger.getAttribute('data-caption') || '';
      openLightbox(src, caption);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* --- ENQUIRY FORM VALIDATION & HANDLING --- */
  const enquiryForm = document.getElementById('enquiryForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      formSuccess.style.display = 'none';
      formError.style.display = 'none';

      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const collectorProfile = document.getElementById('collectorProfile');
      const fundsCheckbox = document.getElementById('fundsCheckbox');

      let isValid = true;

      const validateField = (input, condition) => {
        if (condition) {
          input.style.borderColor = 'var(--color-border-light)';
        } else {
          input.style.borderColor = '#dc3545';
          isValid = false;
        }
      };

      validateField(firstName, firstName.value.trim() !== '');
      validateField(lastName, lastName.value.trim() !== '');
      validateField(collectorProfile, collectorProfile.value !== '');
      validateField(phone, phone.value.trim() !== '');
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validateField(email, emailRegex.test(email.value.trim()));

      const checkmark = fundsCheckbox.closest('.checkbox-group').querySelector('.checkmark');
      if (fundsCheckbox.checked) {
        checkmark.style.borderColor = 'var(--color-border-light)';
      } else {
        checkmark.style.borderColor = '#dc3545';
        isValid = false;
      }

      if (!isValid) {
        formError.style.display = 'block';
        return;
      }

      const submitBtn = enquiryForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Transmitting...';
      submitBtn.style.backgroundColor = 'var(--color-accent-gold)';
      submitBtn.style.color = 'var(--color-text-dark)';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.backgroundColor = '';
        submitBtn.style.color = '';

        formSuccess.style.display = 'block';
        enquiryForm.reset();

        [firstName, lastName, email, phone, collectorProfile].forEach(field => {
          field.style.borderColor = '';
        });
        checkmark.style.borderColor = '';
      }, 1500);
    });
  }

});
