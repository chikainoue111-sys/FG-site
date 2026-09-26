const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const homeSnapPage = document.body.classList.contains('home-snap-page');
const header = document.querySelector('.site-header');

if (homeSnapPage && header) {
  const updateSnapOffset = () => {
    document.body.style.setProperty('--snap-header-offset', `${header.offsetHeight}px`);
  };

  updateSnapOffset();
  window.addEventListener('resize', updateSnapOffset);
}

const revealItems = document.querySelectorAll('.reveal-item');
const prefersReducedMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealItems.length) {
  document.documentElement.classList.add('js-enhanced');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('is-visible');
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

if (homeSnapPage && !prefersReducedMotion) {
  const snapFrames = Array.from(document.querySelectorAll('.home-main .snap-frame'));
  const reducedMotionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

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

  document.addEventListener('keydown', (event) => {
    if (!snapFrames.length || isReducedMotion()) return;
    if (event.defaultPrevented) return;
    const isTypingTarget =
      event.target instanceof HTMLElement &&
      (event.target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT|BUTTON)$/i.test(event.target.tagName));

    if (isTypingTarget) return;

    let direction = 0;
    if (event.key === 'PageDown') direction = 1;
    if (event.key === 'PageUp') direction = -1;
    if (event.code === 'Space') direction = event.shiftKey ? -1 : 1;
    if (!direction) return;

    const activeFrame =
      (event.target instanceof Element && event.target.closest('.snap-frame')) || snapFrames[0];
    const scrollArea = findSnapParent(event.target) || activeFrame.querySelector('.snap-frame-scroll');
    if (!canMoveFrame(scrollArea, direction)) return;

    event.preventDefault();
    moveToFrame(activeFrame, direction);
  });
}
