(async function(){
  // 1) Подключаем header.html в контейнер
  const mount = document.getElementById('hdrx-mount');
  if (!mount) return;

  try{
    const res = await fetch('header.html', { cache: 'no-cache' });
    mount.innerHTML = await res.text();
  } catch(e){
    console.error('Не удалось загрузить header.html', e);
    return;
  }

  // 2) Определяем текущий файл
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const nav = mount.querySelector('.hdrx-nav');
  const links = Array.from(mount.querySelectorAll('.hdrx-nav .hdrx-btn'));
  const indicator = mount.querySelector('.hdrx-indicator');

  if (!nav || links.length === 0 || !indicator) return;

  // helper: позиционирование индикатора под кнопкой
  function moveIndicatorTo(el){
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    // размеры/позиция относительно nav
    const left = r.left - navRect.left;
    const top = r.top - navRect.top;

    indicator.style.width = r.width + 'px';
    indicator.style.height = r.height + 'px';
    indicator.style.transform = `translate(${left}px, ${top}px)`;
  }

  // 3) Выставляем активную кнопку по href
  let active = null;
  links.forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const isActive = href === current;
    a.classList.toggle('hdrx-active', isActive);
    if (isActive) active = a;
  });

  // fallback: если нет совпадения — ничего не выделяем
  if (active){
    // ставим индикатор без "рывка" на первый рендер
    indicator.style.transition = 'none';
    moveIndicatorTo(active);
    // включаем анимацию со следующего кадра
    requestAnimationFrame(() => {
      indicator.style.transition = 'transform .22s ease, width .22s ease, height .22s ease';
    });
  } else {
    indicator.style.width = '0px';
    indicator.style.height = '0px';
  }

  // 4) Hover-анимация: индикатор «едет» за наведением и возвращается на активный
  links.forEach(a => {
    a.addEventListener('mouseenter', () => moveIndicatorTo(a));
    a.addEventListener('focus', () => moveIndicatorTo(a));
  });

  nav.addEventListener('mouseleave', () => { if (active) moveIndicatorTo(active); });
  nav.addEventListener('focusout', (e) => {
    // если фокус ушёл из nav — вернуть на активный
    if (!nav.contains(e.relatedTarget) && active) moveIndicatorTo(active);
  });

  // 5) При ресайзе пересчитать позицию
  window.addEventListener('resize', () => { if (active) moveIndicatorTo(active); });
})();