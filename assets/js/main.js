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
    header.classList.toggle('is-scrolled', window.scrollY > 8);
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

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const formStatus = contactForm.querySelector('[data-form-status]');
  const spamTrap = contactForm.querySelector('[name="company_website"]');
  const contactEmail = 'fortgate.info@gmail.com';

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

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (spamTrap && spamTrap.value) return;
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const subject = 'FortGateへのお問い合わせ';
    const message = [
      `お名前：${formData.get('name')}`,
      `メールアドレス：${formData.get('email')}`,
      `代理店名：${formData.get('agency') || '未入力'}`,
      `代理店ホームページURL：${formData.get('agency_url') || '未入力'}`,
      `ご相談内容：${formData.get('category') || '未選択'}`,
      '',
      'お問い合わせ内容：',
      formData.get('message'),
    ].join('\n');
    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    if (formStatus) {
      formStatus.innerHTML = '';
      formStatus.dataset.state = 'success';
      formStatus.append(
        document.createTextNode(
          'メール作成画面を開きます。内容をご確認のうえ、メールアプリから送信してください。開かない場合は '
        )
      );
      const emailLink = document.createElement('a');
      emailLink.href = `mailto:${contactEmail}`;
      emailLink.textContent = contactEmail;
      formStatus.append(emailLink, document.createTextNode(' へ直接ご連絡ください。'));
    }

    window.location.href = mailtoUrl;
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
