(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (navToggle && nav) navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  const searchDialog = document.getElementById('site-search-dialog');
  const searchInput = document.getElementById('site-search-input');
  const searchResults = document.getElementById('site-search-results');
  const index = window.TIZI_SEARCH_INDEX || [];
  const normalize = (value) => String(value || '').toLowerCase().replace(/\s+/g, '');
  const resolveUrl = (url) => {
    if (location.protocol !== 'file:') return url;
    const clean = url.replace(/^\//, '');
    const local = clean.endsWith('/') ? clean + 'index.html' : clean;
    return (window.TIZI_BASE_PREFIX || '') + local;
  };
  const renderResults = (query = '') => {
    if (!searchResults) return;
    const keyword = normalize(query);
    const matches = (keyword ? index.filter((item) => normalize(item.title + item.description + item.type).includes(keyword)) : index.slice(0, 8)).slice(0, 12);
    searchResults.innerHTML = matches.length ? matches.map((item) => '<a class="search-result" href="' + resolveUrl(item.url) + '"><span>' + item.type + '</span><strong>' + item.title + '</strong><small>' + item.description.slice(0, 88) + '</small></a>').join('') : '<p class="search-empty">没有找到匹配内容，试试“机场推荐”“晚高峰”或具体机场名称。</p>';
  };
  document.querySelectorAll('[data-open-search]').forEach((button) => button.addEventListener('click', () => {
    if (!searchDialog) return;
    searchDialog.showModal();
    renderResults(searchInput ? searchInput.value : '');
    setTimeout(() => searchInput && searchInput.focus(), 50);
  }));
  if (searchInput) searchInput.addEventListener('input', (event) => renderResults(event.target.value));
  document.querySelectorAll('[data-search-form]').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input');
    if (searchInput && input) searchInput.value = input.value;
    if (searchDialog) searchDialog.showModal();
    renderResults(input ? input.value : '');
  }));

  document.querySelectorAll('[data-open-dialog]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.openDialog);
    if (dialog) dialog.showModal();
  }));
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog')?.close()));
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
})();
