// ORIGIN Coffee – landing page behaviour: sticky nav, mobile menu, reveal-on-scroll, quote form, footer year.

// SỬA: thông tin liên hệ thật của ORIGIN.
//  - email: điền email nhận yêu cầu báo giá (để trống thì form sẽ sao chép nội dung để khách gửi qua Zalo)
//  - zalo:  link Zalo của ORIGIN, ví dụ https://zalo.me/09xxxxxxxx
//  - hotline: số điện thoại hiển thị ở mục Liên hệ, ví dụ "0912 345 678"
const CONTACT = {
  email: '',
  zalo: 'https://zalo.me/',
  hotline: '',
};

(function () {
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');

  // nav gets a solid backdrop once the page scrolls
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  // reveal sections as they enter the viewport (shown at once when motion is reduced or unsupported)
  const items = document.querySelectorAll('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // stagger siblings slightly
        const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 90}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  // hotline from CONTACT
  if (CONTACT.hotline) {
    document.querySelectorAll('[data-tel]').forEach(a => {
      a.textContent = CONTACT.hotline;
      a.href = 'tel:' + CONTACT.hotline.replace(/[^\d+]/g, '');
    });
  }

  // quote request: e-mail it when an address is configured, otherwise copy it for sending on Zalo
  const form = document.getElementById('quote');
  const status = form.querySelector('.quote__status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const required = Array.from(form.querySelectorAll('[required]'));
    required.forEach(f => f.classList.toggle('is-invalid', !f.value.trim()));
    const missing = required.find(f => !f.value.trim());
    if (missing) {
      status.textContent = 'Vui lòng điền tên quán, người liên hệ và số điện thoại.';
      missing.focus();
      return;
    }
    const data = new FormData(form);
    const products = data.getAll('product');
    const text = [
      'YÊU CẦU BÁO GIÁ – ORIGIN COFFEE',
      `Quán / doanh nghiệp: ${data.get('shop')}`,
      `Người liên hệ: ${data.get('name')}`,
      `Điện thoại / Zalo: ${data.get('phone')}`,
      data.get('area') && `Khu vực: ${data.get('area')}`,
      products.length && `Sản phẩm quan tâm: ${products.join(', ')}`,
      data.get('volume') && `Sản lượng dự kiến / tháng: ${data.get('volume')}`,
      data.get('note') && `Ghi chú: ${data.get('note')}`,
    ].filter(Boolean).join('\n');

    if (CONTACT.email) {
      const subject = `Yêu cầu báo giá – ${data.get('shop')}`;
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      status.textContent = 'Đang mở ứng dụng email để gửi yêu cầu. Cảm ơn bạn!';
      return;
    }
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch (_) { /* clipboard blocked */ }
    status.innerHTML = copied
      ? `Đã sao chép yêu cầu. <a href="${CONTACT.zalo}" target="_blank" rel="noopener">Mở Zalo</a> và dán tin nhắn gửi ORIGIN để nhận báo giá.`
      : `Hãy gửi nội dung sau qua <a href="${CONTACT.zalo}" target="_blank" rel="noopener">Zalo</a> cho ORIGIN:<br>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}`;
  });
  form.querySelectorAll('[required]').forEach(f => f.addEventListener('input', () => f.classList.remove('is-invalid')));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
