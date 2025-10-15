(function () {
  const selects = document.querySelectorAll('.custom-select');
  selects.forEach(cs => {
    const trigger = cs.querySelector('.cs-trigger');
    const menu = cs.querySelector('.cs-menu');
    const options = Array.from(menu.querySelectorAll('.cs-option'));
    const hidden = cs.querySelector('select'); // скрытый select для синхронизации

    let current = options.find(o => o.getAttribute('aria-selected') === 'true') || options[0];
    if (current) trigger.textContent = current.textContent;

    function setOpen(open) {
      cs.classList.toggle('cs-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        setTimeout(() => current?.focus(), 0);
      } else {
        trigger.focus();
      }
    }

    function selectOption(opt, closeAfter = true) {
      options.forEach(o => o.setAttribute('aria-selected', 'false'));
      opt.setAttribute('aria-selected', 'true');
      current = opt;
      trigger.textContent = opt.textContent;

      if (hidden) {
        hidden.value = opt.dataset.value ?? opt.textContent;
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (closeAfter) setOpen(false);
    }

    trigger.addEventListener('click', () => setOpen(!cs.classList.contains('cs-open')));

    options.forEach(opt => {
      opt.tabIndex = -1;
      opt.addEventListener('click', () => selectOption(opt));
      opt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOption(opt); }
      });
    });

    // Клавиатура по меню
    menu.addEventListener('keydown', (e) => {
      const idx = options.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = options[Math.min((idx >= 0 ? idx + 1 : 0), options.length - 1)];
        next?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = options[Math.max((idx >= 0 ? idx - 1 : options.length - 1), 0)];
        prev?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault(); options[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault(); options[options.length - 1]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault(); setOpen(false);
      }
    });

    // Клик вне — закрыть
    document.addEventListener('click', (e) => {
      if (!cs.contains(e.target)) setOpen(false);
    });
  });
})();