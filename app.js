document.addEventListener('DOMContentLoaded', () => {

  // ── Utilities ────────────────────────────────────────────────

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function today() {
    const d = new Date();
    return toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  function toDateString(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function parseDate(str) {
    const [year, month, day] = str.split('-').map(Number);
    return { year, month, day };
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function getFirstDayOfWeek(year, month) {
    return new Date(year, month - 1, 1).getDay();
  }

  function compareTime(t1, t2) {
    if (t1 < t2) return -1;
    if (t1 > t2) return 1;
    return 0;
  }

  // ── localStorage ─────────────────────────────────────────────

  const STORAGE_KEY = 'calEvents';

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  }

  function getEventsForDate(dateStr) {
    return state.events.filter(ev => ev.date === dateStr);
  }

  // ── State ────────────────────────────────────────────────────

  const todayStr = today();
  const todayParsed = parseDate(todayStr);

  const state = {
    today:   todayStr,
    year:    todayParsed.year,
    month:   todayParsed.month - 1,  // 0-based
    events:  loadEvents(),
    editing: null,
  };

  // ── DOM Refs ─────────────────────────────────────────────────

  const refs = {
    monthLabel:  document.getElementById('month-label'),
    grid:        document.getElementById('cal-grid'),
    btnPrev:     document.getElementById('btn-prev'),
    btnNext:     document.getElementById('btn-next'),
    btnToday:    document.getElementById('btn-today'),
    btnMenu:     document.getElementById('btn-menu'),
    btnAddEvent: document.getElementById('btn-add-event'),
    btnCreate:   document.getElementById('btn-create'),
    sidebar:     document.getElementById('sidebar'),
    miniGrid:    document.getElementById('mini-grid'),
    miniLabel:   document.getElementById('mini-label'),
    miniPrev:    document.getElementById('mini-prev'),
    miniNext:    document.getElementById('mini-next'),
    overlay:     document.getElementById('modal-overlay'),
    modalBox:    document.getElementById('modal-box'),
    modalTitle:  document.getElementById('modal-title'),
    form:        document.getElementById('event-form'),
    fTitle:      document.getElementById('f-title'),
    fDate:       document.getElementById('f-date'),
    fStart:      document.getElementById('f-start'),
    fEnd:        document.getElementById('f-end'),
    fDesc:       document.getElementById('f-desc'),
    fColor:      document.getElementById('f-color'),
    btnDelete:   document.getElementById('btn-delete'),
    btnCancel:   document.getElementById('btn-cancel'),
    errTitle:    document.getElementById('err-title'),
    errDate:     document.getElementById('err-date'),
    errTime:     document.getElementById('err-time'),
  };

  // ── Month / Day Names ────────────────────────────────────────

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const MONTH_SHORT = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec',
  ];

  // ── Render Mini Calendar ─────────────────────────────────────

  function renderMiniCal() {
    const { year, month } = state;
    refs.miniLabel.textContent = `${MONTH_SHORT[month]} ${year}`;

    const firstDay    = getFirstDayOfWeek(year, month + 1);
    const daysInMonth = getDaysInMonth(year, month + 1);
    const totalCells  = (firstDay + daysInMonth) <= 35 ? 35 : 42;

    const prevMonth  = month === 0 ? 11 : month - 1;
    const prevYear   = month === 0 ? year - 1 : year;
    const daysInPrev = getDaysInMonth(prevYear, prevMonth + 1);
    const nextMonth  = month === 11 ? 0  : month + 1;
    const nextYear   = month === 11 ? year + 1 : year;

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ dateStr: toDateString(prevYear, prevMonth + 1, daysInPrev - i), outside: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ dateStr: toDateString(year, month + 1, d), outside: false });
    }
    let nd = 1;
    while (cells.length < totalCells) {
      cells.push({ dateStr: toDateString(nextYear, nextMonth + 1, nd++), outside: true });
    }

    refs.miniGrid.innerHTML = '';
    cells.forEach(({ dateStr, outside }) => {
      const { day } = parseDate(dateStr);
      const cell = document.createElement('div');
      cell.className = 'mini-cell' + (outside ? ' outside' : '');
      if (dateStr === state.today) cell.classList.add('today');
      cell.dataset.date = dateStr;

      const num = document.createElement('span');
      num.className = 'mini-num';
      num.textContent = day;
      cell.appendChild(num);
      refs.miniGrid.appendChild(cell);
    });
  }

  // ── Render Main Calendar ─────────────────────────────────────

  function renderCalendar() {
    const { year, month } = state;
    refs.monthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

    const firstDay    = getFirstDayOfWeek(year, month + 1);
    const daysInMonth = getDaysInMonth(year, month + 1);
    const totalCells  = (firstDay + daysInMonth) <= 35 ? 35 : 42;

    const prevMonth  = month === 0 ? 11 : month - 1;
    const prevYear   = month === 0 ? year - 1 : year;
    const daysInPrev = getDaysInMonth(prevYear, prevMonth + 1);
    const nextMonth  = month === 11 ? 0  : month + 1;
    const nextYear   = month === 11 ? year + 1 : year;

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      cells.push({ dateStr: toDateString(prevYear, prevMonth + 1, d), dayNum: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ dateStr: toDateString(year, month + 1, d), dayNum: d, isCurrentMonth: true });
    }
    let nd = 1;
    while (cells.length < totalCells) {
      cells.push({ dateStr: toDateString(nextYear, nextMonth + 1, nd), dayNum: nd, isCurrentMonth: false });
      nd++;
    }

    refs.grid.innerHTML = '';

    cells.forEach(({ dateStr, dayNum, isCurrentMonth }) => {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.date = dateStr;
      if (!isCurrentMonth) cell.classList.add('outside-month');
      if (dateStr === state.today) cell.classList.add('today');

      // Day number — "Apr 1" for first of month, else just the number
      const wrap = document.createElement('div');
      wrap.className = 'day-number-wrap';
      const numEl = document.createElement('span');
      numEl.className = 'day-number';
      if (dayNum === 1) {
        const p = parseDate(dateStr);
        numEl.textContent = `${MONTH_SHORT[p.month - 1]} 1`;
      } else {
        numEl.textContent = dayNum;
      }
      wrap.appendChild(numEl);
      cell.appendChild(wrap);

      // Event chips
      const eventsForDay = getEventsForDate(dateStr)
        .slice()
        .sort((a, b) => compareTime(a.startTime || '', b.startTime || ''));

      eventsForDay.forEach(ev => {
        const chip = document.createElement('div');
        chip.className = 'event-chip';
        chip.style.background = ev.color || '#1a73e8';
        chip.textContent = (ev.startTime ? ev.startTime + ' ' : '') + ev.title;
        chip.dataset.id = ev.id;
        chip.addEventListener('click', onChipClick);
        cell.appendChild(chip);
      });

      // Count badge (mobile)
      if (eventsForDay.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'event-count';
        const n = eventsForDay.length;
        badge.textContent = n + (n === 1 ? ' event' : ' events');
        cell.appendChild(badge);
      }

      refs.grid.appendChild(cell);
    });

    // Empty-state hint
    const monthHasEvents = state.events.some(ev => {
      const p = parseDate(ev.date);
      return p.year === year && p.month - 1 === month;
    });
    if (!monthHasEvents) {
      const hint = document.createElement('div');
      hint.id = 'empty-hint';
      hint.textContent = 'No events this month — click any day or Create to add one';
      refs.grid.appendChild(hint);
    }

    renderMiniCal();
  }

  // ── Navigation ───────────────────────────────────────────────

  function prevMonth() {
    state.month--;
    if (state.month < 0) { state.month = 11; state.year--; }
    renderCalendar();
  }

  function nextMonth() {
    state.month++;
    if (state.month > 11) { state.month = 0; state.year++; }
    renderCalendar();
  }

  refs.btnPrev.addEventListener('click', prevMonth);
  refs.btnNext.addEventListener('click', nextMonth);
  refs.miniPrev.addEventListener('click', prevMonth);
  refs.miniNext.addEventListener('click', nextMonth);

  refs.btnToday.addEventListener('click', () => {
    const t = parseDate(state.today);
    state.year  = t.year;
    state.month = t.month - 1;
    renderCalendar();
  });

  // Mini calendar day click — navigate main calendar to that month + open modal
  refs.miniGrid.addEventListener('click', e => {
    const cell = e.target.closest('.mini-cell');
    if (!cell) return;
    const p = parseDate(cell.dataset.date);
    state.year  = p.year;
    state.month = p.month - 1;
    renderCalendar();
    openModal('add', cell.dataset.date);
  });

  // ── Sidebar Toggle ───────────────────────────────────────────

  refs.btnMenu.addEventListener('click', () => {
    refs.sidebar.classList.toggle('collapsed');
  });

  // ── Modal Helpers ────────────────────────────────────────────

  function clearErrors() {
    refs.errTitle.hidden = true; refs.errTitle.textContent = '';
    refs.errDate.hidden  = true; refs.errDate.textContent  = '';
    refs.errTime.hidden  = true; refs.errTime.textContent  = '';
  }

  function showError(el, msg) { el.textContent = msg; el.hidden = false; }

  function openModal(mode, dateStr, eventId) {
    clearErrors();
    if (mode === 'add') {
      refs.modalTitle.textContent = 'New Event';
      refs.form.reset();
      refs.fDate.value  = dateStr || state.today;
      refs.fColor.value = '#1a73e8';
      refs.btnDelete.hidden = true;
      state.editing = null;
    } else {
      const ev = state.events.find(e => e.id === eventId);
      if (!ev) return;
      refs.modalTitle.textContent = 'Edit Event';
      refs.fTitle.value = ev.title;
      refs.fDate.value  = ev.date;
      refs.fStart.value = ev.startTime    || '';
      refs.fEnd.value   = ev.endTime      || '';
      refs.fDesc.value  = ev.description  || '';
      refs.fColor.value = ev.color        || '#1a73e8';
      refs.btnDelete.hidden = false;
      state.editing = eventId;
    }
    refs.overlay.removeAttribute('hidden');
    refs.fTitle.focus();
  }

  function closeModal() {
    refs.overlay.setAttribute('hidden', '');
    state.editing = null;
  }

  // ── Validation ───────────────────────────────────────────────

  function validateForm() {
    let valid = true;
    if (!refs.fTitle.value.trim()) {
      showError(refs.errTitle, 'Title is required.');
      valid = false;
    }
    if (!refs.fDate.value) {
      showError(refs.errDate, 'Date is required.');
      valid = false;
    }
    if (refs.fStart.value && refs.fEnd.value) {
      if (compareTime(refs.fEnd.value, refs.fStart.value) <= 0) {
        showError(refs.errTime, 'End time must be after start time.');
        valid = false;
      }
    }
    return valid;
  }

  // ── Save ─────────────────────────────────────────────────────

  refs.form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    if (!validateForm()) return;

    const ev = {
      id:          state.editing ?? generateId(),
      title:       refs.fTitle.value.trim(),
      date:        refs.fDate.value,
      startTime:   refs.fStart.value || null,
      endTime:     refs.fEnd.value   || null,
      description: refs.fDesc.value.trim() || null,
      color:       refs.fColor.value,
    };

    if (state.editing) {
      const idx = state.events.findIndex(e => e.id === state.editing);
      if (idx !== -1) state.events[idx] = ev;
    } else {
      state.events.push(ev);
    }

    saveEvents();
    closeModal();
    renderCalendar();
  });

  // ── Delete ───────────────────────────────────────────────────

  refs.btnDelete.addEventListener('click', () => {
    if (!state.editing) return;
    state.events = state.events.filter(e => e.id !== state.editing);
    saveEvents();
    closeModal();
    renderCalendar();
  });

  // ── Open Modal Triggers ──────────────────────────────────────

  refs.btnCreate.addEventListener('click',   () => openModal('add', state.today));
  refs.btnAddEvent.addEventListener('click', () => openModal('add', state.today));

  refs.grid.addEventListener('click', e => {
    const cell = e.target.closest('.day-cell');
    if (!cell) return;
    openModal('add', cell.dataset.date);
  });

  function onChipClick(e) {
    e.stopPropagation();
    openModal('edit', null, e.currentTarget.dataset.id);
  }

  // ── Close Modal ──────────────────────────────────────────────

  refs.btnCancel.addEventListener('click', closeModal);
  refs.overlay.addEventListener('click', e => { if (e.target === refs.overlay) closeModal(); });

  // ── Keyboard ─────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (refs.overlay.hasAttribute('hidden')) return;

    if (e.key === 'Escape') { closeModal(); return; }

    if (e.key === 'Tab') {
      const focusable = [...refs.modalBox.querySelectorAll(
        'button:not([hidden]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )].filter(el => !el.disabled && !el.closest('[hidden]'));

      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ── Init ─────────────────────────────────────────────────────

  renderCalendar();
});
