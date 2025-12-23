(() => {
  const baseClass =
    'px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const activeClass =
    'px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 font-semibold';

  /**
   * Gắn điều hướng bằng JS cho các link trong header/nav.
   * - Chặn reload mặc định
   * - Điều hướng bằng window.location (để vẫn thay đổi URL)
   * - Bỏ qua link ngoài, mailto, tel, hoặc click mở tab mới
   * @param {ParentNode} scope - nơi tìm nav (mặc định document)
   */
  function setupNavRouting(scope = document) {
    const links = scope.querySelectorAll('nav a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const isExternal =
        href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
      if (isExternal) return;

      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        window.location.href = href;
      });
    });
  }

  /**
   * Tô sáng menu đang active dựa trên pathname hiện tại.
   * @param {ParentNode} scope - nơi tìm nav (mặc định document)
   */
  function highlightActiveNav(scope = document) {
    const links = scope.querySelectorAll('nav a');
    const current = normalizePath(window.location.pathname);

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const target = normalizePath(new URL(href, window.location.origin).pathname);

      // reset class về base
      link.className = baseClass;

      // match chính xác trang
      if (current === target) {
        link.className = activeClass;
      } else {
        // cho phép match index.html với root
        if ((current === '/' && target === '/index.html') ||
            (current === '/index.html' && target === '/')) {
          link.className = activeClass;
        }
      }
    });
  }

  function normalizePath(pathname) {
    if (!pathname) return '/';
    // bỏ slash cuối
    return pathname.replace(/\/+$/, '') || '/';
  }

  window.setupNavRouting = setupNavRouting;
  window.highlightActiveNav = highlightActiveNav;
})();

