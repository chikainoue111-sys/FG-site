const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuToggle && nav) {
  const mobileQuery = window.matchMedia('(max-width: 960px)');
  const setMenuOpen = (isOpen) => {
    nav.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    if (mobileQuery.matches && event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (
      mobileQuery.matches &&
      menuToggle.getAttribute('aria-expanded') === 'true' &&
      !nav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  mobileQuery.addEventListener('change', () => setMenuOpen(false));
}

const homeSnapPage = document.body.classList.contains('home-snap-page');
const header = document.querySelector('.site-header');
if (header) {
  let scrollPending = false;
  const updateHeader = () => {
    // Keep the thresholds farther apart than the 20px header height change.
    const isScrolled = header.classList.contains('is-scrolled');
    header.classList.toggle('is-scrolled', isScrolled ? window.scrollY > 4 : window.scrollY > 48);
    scrollPending = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (scrollPending) return;
      window.requestAnimationFrame(updateHeader);
      scrollPending = true;
    },
    { passive: true }
  );
  updateHeader();
}

const reducedMotionQuery =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

if (homeSnapPage && header) {
  const updateSnapOffset = () => {
    document.body.style.setProperty('--snap-header-offset', `${header.offsetHeight}px`);
  };

  updateSnapOffset();
  window.addEventListener('resize', updateSnapOffset);
}

const revealItems = document.querySelectorAll('.reveal-item, .fade-up');
const prefersReducedMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;

if (revealItems.length) {
  document.documentElement.classList.add('js-enhanced');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => {
      item.classList.add('is-visible', 'is-inview');
    });
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('is-visible', 'is-inview');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealItems.forEach((item) => {
      item.classList.add('reveal-pending');
      observer.observe(item);
    });

    document.documentElement.classList.add('reveal-active');
    window.requestAnimationFrame(() => {
      document.documentElement.classList.add('reveal-ready');
    });
  }
}

const mobileWhyPanel = document.querySelector('.home-page .panel-why');
if (mobileWhyPanel) {
  const mobileWhyQuery = window.matchMedia('(max-width: 760px)');
  const shell = mobileWhyPanel.querySelector('.why-shell');
  const stepsContainer = mobileWhyPanel.querySelector('.why-steps');
  const steps = Array.from(mobileWhyPanel.querySelectorAll('.why-step'));
  const stage = mobileWhyPanel.closest('.home-stage');
  let enabled = false;
  let frame = 0;
  let pinTop = 0;
  let scrollDistance = 1;
  let activeIndex = -1;

  const updateSlide = () => {
    frame = 0;
    if (!enabled) return;
    const start = mobileWhyPanel.getBoundingClientRect().top + 24;
    const progress = Math.max(0, Math.min(1, (pinTop - start) / scrollDistance));
    mobileWhyPanel.style.setProperty('--why-translate', `${-progress * (steps.length - 1) * 100}%`);
    const nextIndex = Math.round(progress * (steps.length - 1));
    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex;
      steps.forEach((step, index) => {
        step.setAttribute('aria-hidden', String(index !== activeIndex));
      });
    }
  };

  const requestSlide = () => {
    if (enabled && !frame) frame = window.requestAnimationFrame(updateSlide);
  };

  const measure = () => {
    if (!enabled) return;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    // On short screens, let the introduction scroll up before pinning the slides.
    pinTop = Math.min(headerHeight + 12, window.innerHeight - shell.offsetHeight - 16);
    scrollDistance = Math.max(window.innerHeight, shell.offsetWidth) * (steps.length - 1);
    mobileWhyPanel.style.setProperty('--why-shell-height', `${shell.offsetHeight}px`);
    mobileWhyPanel.style.setProperty('--why-pin-top', `${pinTop}px`);
    mobileWhyPanel.style.setProperty('--why-scroll-distance', `${scrollDistance}px`);
    requestSlide();
  };

  const configure = () => {
    enabled = mobileWhyQuery.matches && !(reducedMotionQuery && reducedMotionQuery.matches);
    stage.classList.toggle('has-mobile-why-scroll', enabled);
    mobileWhyPanel.classList.toggle('has-horizontal-scroll', enabled);
    if (enabled) {
      stepsContainer.setAttribute('aria-live', 'off');
      window.addEventListener('scroll', requestSlide, { passive: true });
      measure();
    } else {
      window.removeEventListener('scroll', requestSlide);
      window.cancelAnimationFrame(frame);
      frame = 0;
      activeIndex = -1;
      steps.forEach((step) => step.removeAttribute('aria-hidden'));
      stepsContainer.setAttribute('aria-live', 'polite');
      ['--why-shell-height', '--why-pin-top', '--why-scroll-distance', '--why-translate'].forEach((property) => {
        mobileWhyPanel.style.removeProperty(property);
      });
    }
  };

  mobileWhyQuery.addEventListener('change', configure);
  if (reducedMotionQuery) reducedMotionQuery.addEventListener('change', configure);
  window.addEventListener('resize', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(shell);
  configure();
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const formStatus = contactForm.querySelector('[data-form-status]');
  const spamTrap = contactForm.querySelector('[name="_gotcha"]');
  const submitButton = contactForm.querySelector('[type="submit"]');
  let isSending = false;
  let isSubmitted = false;

  contactForm.addEventListener(
    'invalid',
    () => {
      if (formStatus) {
        formStatus.textContent = '入力内容をご確認ください。必須項目とメールアドレスの形式をご確認ください。';
        formStatus.dataset.state = 'error';
      }
    },
    true
  );

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isSending || isSubmitted) return;
    if (spamTrap && spamTrap.value) return;
    if (!contactForm.reportValidity()) return;

    isSending = true;
    if (submitButton) submitButton.disabled = true;
    contactForm.setAttribute('aria-busy', 'true');
    if (formStatus) {
      formStatus.textContent = '送信中です。しばらくお待ちください。';
      formStatus.dataset.state = 'sending';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Form submission failed');

      isSubmitted = true;
      contactForm.querySelectorAll('input, select, textarea, button').forEach((control) => {
        control.disabled = true;
      });
      if (formStatus) {
        formStatus.innerHTML = 'お問い合わせありがとうございます。<br>内容を確認のうえ、原則2営業日以内に担当者より改めてご連絡いたします。';
        formStatus.dataset.state = 'success';
      }
    } catch {
      if (formStatus) {
        formStatus.textContent = '送信できませんでした。時間をおいて再度お試しいただくか、上記メールアドレスへ直接ご連絡ください。';
        formStatus.dataset.state = 'error';
      }
    } finally {
      isSending = false;
      if (submitButton) submitButton.disabled = isSubmitted;
      contactForm.setAttribute('aria-busy', 'false');
    }
  });
}

if (homeSnapPage && !prefersReducedMotion) {
  const snapFrames = Array.from(document.querySelectorAll('.home-main .snap-frame'));
  const isReducedMotion = () => reducedMotionQuery && reducedMotionQuery.matches;

  const findSnapParent = (target) =>
    target instanceof Element ? target.closest('.snap-frame-scroll') : null;

  const canMoveFrame = (scrollArea, direction) => {
    if (!scrollArea) return true;
    const maxTop = scrollArea.scrollHeight - scrollArea.clientHeight;
    if (maxTop <= 0) return true;
    if (direction > 0) {
      return scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 2;
    }
    return scrollArea.scrollTop <= 1;
  };

  const moveToFrame = (currentFrame, direction) => {
    const frameIndex = snapFrames.indexOf(currentFrame);
    if (frameIndex < 0) return;
    const nextIndex = frameIndex + direction;
    const nextFrame = snapFrames[nextIndex];
    if (!nextFrame) return;
    nextFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getCurrentFrame = () => {
    const headerOffset = header ? header.offsetHeight : 0;
    const pivot = headerOffset + 24;
    const inView =
      snapFrames.find((frame) => {
        const rect = frame.getBoundingClientRect();
        return rect.top <= pivot && rect.bottom > pivot;
      }) || null;

    if (inView) return inView;

    return snapFrames.reduce((nearest, frame) => {
      if (!nearest) return frame;
      const nearestDistance = Math.abs(nearest.getBoundingClientRect().top - pivot);
      const frameDistance = Math.abs(frame.getBoundingClientRect().top - pivot);
      return frameDistance < nearestDistance ? frame : nearest;
    }, null);
  };

  document.addEventListener('keydown', (event) => {
    if (!snapFrames.length || isReducedMotion()) return;
    if (event.defaultPrevented) return;
    const isTypingTarget =
      event.target instanceof HTMLElement &&
      (event.target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT|BUTTON)$/i.test(event.target.tagName));

    if (isTypingTarget) return;

    const isAllowedKeyboardTarget =
      event.target === document.body ||
      event.target === document.documentElement ||
      (event.target instanceof HTMLElement && event.target.classList.contains('snap-frame-scroll'));

    if (!isAllowedKeyboardTarget) return;

    let direction = 0;
    if (event.key === 'PageDown') direction = 1;
    if (event.key === 'PageUp') direction = -1;
    if (!direction) return;

    const activeFrame =
      (event.target instanceof Element && event.target.closest('.snap-frame')) || getCurrentFrame();
    if (!activeFrame) return;
    const scrollArea = findSnapParent(event.target) || activeFrame.querySelector('.snap-frame-scroll');
    if (!canMoveFrame(scrollArea, direction)) return;

    event.preventDefault();
    moveToFrame(activeFrame, direction);
  });
}
