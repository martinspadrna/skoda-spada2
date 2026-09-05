// Denní úkoly odvozené z přidělení ve směnovém rozpisu.
// KP lze později upravit pouze v tomto přehledu; data se nikam neukládají.
(function installRotationTasks() {
  'use strict';

  const MACHINE_TASKS = Object.freeze({
    TNKS01: Object.freeze([
      Object.freeze({ label: 'O nic se nestarej a jen si užij nýtování.' })
    ]),
    TPKW01: Object.freeze([
      Object.freeze({ label: 'Kontrola měřidel' }),
      Object.freeze({ label: 'TPM' })
    ]),
    TPKW02: Object.freeze([
      Object.freeze({ label: 'TPM za TNKS01', place: 'KP516' })
    ]),
    TBKR01: Object.freeze([
      Object.freeze({ label: 'Kontrola měřidel a TPM', place: 'KP515' })
    ]),
    TBKR07: Object.freeze([
      Object.freeze({ label: 'Kontrola měřidel a TPM', place: 'KP516' })
    ]),
    MSKC01: Object.freeze([
      Object.freeze({ label: 'Kontrola měřidel', place: 'KP518' }),
      Object.freeze({ label: 'TPM', place: 'KP512' })
    ]),
    MSKC03: Object.freeze([
      Object.freeze({ label: 'Kontrola měřidel a TPM', place: 'KP512' })
    ]),
    MSKC04: Object.freeze([
      Object.freeze({ label: 'TPM', place: 'KP512' })
    ]),
    MFKF06: Object.freeze([
      Object.freeze({ label: 'Kontrola měřidel a TPM', place: 'KP511' })
    ]),
    MFKF10: Object.freeze([
      Object.freeze({ label: 'TPM', place: 'KP511' })
    ])
  });

  const TAP_WINDOW_MS = 1100;
  let lastCard = null;
  let tapCount = 0;
  let lastTapAt = 0;

  function assignmentMachine(value) {
    const text = String(value || '').toUpperCase();
    // Při společné obsluze frézek už rozpis uvádí „MFKF10 (+ MFKF06)“.
    // V takovém případě má přednost společný rozsah úkolu z MFKF06.
    if (/\bMFKF06\b/.test(text)) return 'MFKF06';
    const match = text.match(/\b(?:TNKS01|TPKW01|TPKW02|TBKR01|TBKR07|MSKC01|MSKC03|MSKC04|MFKF10)\b/);
    return match ? match[0] : '';
  }

  function getTasksForAssignment(value) {
    const machine = assignmentMachine(value);
    return {
      machine,
      tasks: (MACHINE_TASKS[machine] || []).map((task) => ({ label: task.label, place: task.place || '' }))
    };
  }

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  }

  function hideRotationTaskModal() {
    const overlay = document.getElementById('rotationTaskModal');
    if (!overlay) return;
    overlay.classList.remove('isVisible');
    document.body.classList.remove('rotationTaskModalOpen');
  }

  function ensureRotationTaskModal() {
    let overlay = document.getElementById('rotationTaskModal');
    if (overlay) return overlay;

    overlay = node('div', 'personScheduleOverlay rotationTaskOverlay');
    overlay.id = 'rotationTaskModal';

    const modal = node('section', 'personScheduleModal rotationTaskModal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'rotationTaskModalTitle');

    const close = node('button', 'personScheduleClose', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Zavřít úkol');
    close.addEventListener('click', hideRotationTaskModal);

    const title = node('h3', 'rotationTaskTitle');
    title.id = 'rotationTaskModalTitle';
    const meta = node('div', 'rotationTaskMeta');
    const body = node('div', 'rotationTaskBody');
    body.id = 'rotationTaskModalBody';

    modal.append(close, title, meta, body);
    overlay.appendChild(modal);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) hideRotationTaskModal();
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  function showRotationTaskModal(details) {
    const input = details || {};
    const result = getTasksForAssignment(input.machine);
    const overlay = ensureRotationTaskModal();
    const title = overlay.querySelector('#rotationTaskModalTitle');
    const meta = overlay.querySelector('.rotationTaskMeta');
    const body = overlay.querySelector('#rotationTaskModalBody');
    const person = String(input.person || '').trim();
    const shiftText = [String(input.date || '').trim(), String(input.shift || '').trim()].filter(Boolean).join(' · ');

    title.textContent = person ? 'Úkol pro ' + person : 'Úkol ve směně';
    meta.replaceChildren();
    const machineBadge = node('span', 'rotationTaskMachine', result.machine || String(input.machine || 'Bez stroje'));
    meta.appendChild(machineBadge);
    if (shiftText) meta.appendChild(node('span', 'rotationTaskShift', shiftText));

    body.replaceChildren();
    if (!result.machine) {
      body.appendChild(node('p', 'rotationTaskEmpty', 'Pro toto přidělení zatím není nastavený žádný úkol.'));
    } else {
      const intro = node('p', 'rotationTaskIntro', 'Na této směně zkontroluj:');
      const list = node('ul', 'rotationTaskList');
      result.tasks.forEach((task) => {
        const item = node('li', 'rotationTaskItem');
        item.appendChild(node('span', 'rotationTaskLabel', task.label));
        if (task.place) item.appendChild(node('span', 'rotationTaskPlace', task.place));
        list.appendChild(item);
      });
      body.append(intro, list);
    }

    overlay.classList.add('isVisible');
    document.body.classList.add('rotationTaskModalOpen');
    return result;
  }

  function openTaskFromCard(card) {
    showRotationTaskModal({
      person: card.dataset.rotationTaskPerson || '',
      date: card.dataset.rotationTaskDate || '',
      shift: card.dataset.rotationTaskShift || '',
      machine: card.dataset.rotationTaskMachine || ''
    });
  }

  function registerTap(card) {
    const now = Date.now();
    if (card !== lastCard || now - lastTapAt > TAP_WINDOW_MS) tapCount = 0;
    lastCard = card;
    lastTapAt = now;
    tapCount += 1;
    if (tapCount < 3) return;
    tapCount = 0;
    openTaskFromCard(card);
  }

  document.addEventListener('click', (event) => {
    const card = event.target && event.target.closest ? event.target.closest('.rotaceShiftTaskCard') : null;
    if (card) registerTap(card);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideRotationTaskModal();
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target && event.target.closest ? event.target.closest('.rotaceShiftTaskCard') : null;
    if (!card) return;
    event.preventDefault();
    registerTap(card);
  });

  window.RAK_ROTATION_MACHINE_TASKS = MACHINE_TASKS;
  window.getRotationMachineTasksForAssignment = getTasksForAssignment;
  window.showRotationTaskModal = showRotationTaskModal;
  window.hideRotationTaskModal = hideRotationTaskModal;
})();
