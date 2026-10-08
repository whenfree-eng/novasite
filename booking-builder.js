/* Build a quote locally. No customer details leave the page until they open an enquiry. */
(function () {
  const form = document.getElementById('session-builder');
  if (!form) return;
  const byId = id => document.getElementById(id);
  const quote = byId('quote');
  const action = byId('session-action');
  const emailAction = byId('email-action');
  const rates = { 1: 99, 2: 160, 4: 300, 8: 560 };
  const serviceNames = { 1: 'Room Only 1 Hour', 2: 'Room Only 2 Hours', 4: 'Room Only 4 Hours (Half Day)', 8: 'Room Only 8 Hours (Full Day)' };
  const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

  function quantity(id, enabled) {
    const input = byId(id + '-count');
    const number = Number(input.value);
    const valid = input.value.trim() !== '' && Number.isInteger(number) && number >= 1 && number <= 99;
    byId(id + '-error').hidden = !enabled || valid;
    input.setAttribute('aria-invalid', String(enabled && !valid));
    for (const button of form.querySelectorAll('[data-count="' + id + '-count"]')) {
      button.disabled = valid && (Number(button.dataset.change) < 0 ? number <= 1 : number >= 99);
    }
    return enabled ? (valid ? number : null) : 0;
  }

  function clearActions(message) {
    quote.textContent = message;
    byId('mobile-price').textContent = 'Choose edits';
    byId('summary-actions').hidden = true;
    action.removeAttribute('href');
    emailAction.removeAttribute('href');
    byId('handoff-note').textContent = '';
  }

  function update() {
    const editingOnly = form.querySelector('input[name="mode"]:checked').value === 'editing';
    const hours = Number(form.querySelector('input[name="duration"]:checked').value);
    const recording = !editingOnly;
    byId('recording-formula').textContent = editingOnly ? 'Your footage' : 'Recording';
    byId('deliverables-step').textContent = editingOnly ? '1' : '2';
    const episodes = byId('episodes').checked;
    const clips = byId('clips').checked;
    const teleprompterInput = byId('teleprompter');
    byId('recording-options').hidden = editingOnly;
    byId('recording-options').disabled = editingOnly;
    byId('teleprompter-option').hidden = editingOnly;
    teleprompterInput.disabled = editingOnly;
    if (editingOnly) teleprompterInput.checked = false;
    byId('recording-help').hidden = editingOnly;
    const teleprompter = recording && teleprompterInput.checked;
    byId('episode-quantity').hidden = !episodes;
    byId('clip-quantity').hidden = !clips;
    const episodeCount = quantity('episode', episodes);
    const clipCount = quantity('clip', clips);
    const appointment = hours + ' hour' + (hours === 1 ? '' : 's');
    byId('appointment').textContent = recording ? 'Studio appointment: ' + appointment + '.' : 'Editing only. No studio appointment needed.';
    byId('clip-description').textContent = clipCount === null ? 'Each pack contains 10 clips' : (clipCount || 1) + ' pack' + ((clipCount || 1) === 1 ? '' : 's') + ' = ' + ((clipCount || 1) * 10) + ' clips';
    if (episodeCount === null || clipCount === null) {
      clearActions('Check the quantities to see your total.');
      byId('mobile-price').textContent = 'Check quantity';
      return;
    }
    if (editingOnly && !episodes && !clips) {
      clearActions('Choose an episode edit or clip pack to build your editing quote.');
      return;
    }

    const rows = [];
    if (recording) rows.push([appointment + ' recording', rates[hours]]);
    if (episodes) rows.push([episodeCount + ' finished episode' + (episodeCount === 1 ? '' : 's') + ' with thumbnail and titles', episodeCount * 220]);
    if (clips) rows.push([clipCount * 10 + ' captioned clips', clipCount * 150]);
    if (teleprompter) rows.push(['Teleprompter', 45]);
    const total = rows.reduce((sum, row) => sum + row[1], 0);
    const needsQuote = editingOnly || episodes || clips || teleprompter;
    const totalLabel = needsQuote ? 'Estimated total' : 'Total';
    const list = document.createElement('dl');
    for (const [name, value] of rows.concat([[totalLabel, total]])) {
      const row = document.createElement('div');
      if (name === totalLabel) row.className = 'total';
      const term = document.createElement('dt');
      term.textContent = name;
      const detail = document.createElement('dd');
      detail.textContent = pounds.format(value);
      row.append(term, detail);
      list.append(row);
    }
    quote.replaceChildren(list);
    byId('mobile-price').textContent = pounds.format(total);
    const brief = byId('session-brief').value.trim().slice(0, 700);
    const lines = [editingOnly ? 'Hi Nova, I would like an editing-only quote:' : 'Hi Nova, I would like to arrange this session:', ...rows.map(([name, value]) => name + ': ' + pounds.format(value)), totalLabel + ': ' + pounds.format(total)];
    if (brief) lines.push('', 'My notes: ' + brief);
    lines.push('', 'Please confirm the scope, availability and delivery dates, and send a payment link.');
    const message = lines.join('\n');
    emailAction.href = 'mailto:info@thenovastudios.co.uk?subject=' + encodeURIComponent(editingOnly ? 'Nova editing enquiry' : 'Nova session enquiry') + '&body=' + encodeURIComponent(message);
    byId('summary-actions').hidden = false;
    if (needsQuote) {
      action.textContent = 'Enquire with these choices';
      action.href = 'https://wa.me/447761075775?text=' + encodeURIComponent(message);
      byId('handoff-note').textContent = 'We confirm your footage, scope, availability and delivery dates before sending a payment link. Your choices and notes are included in the enquiry.';
    } else {
      action.textContent = 'Book ' + appointment;
      action.href = 'https://sumupbookings.com/the-nova-studios';
      byId('handoff-note').textContent = 'On the booking page, select “' + serviceNames[hours] + '” at ' + pounds.format(total) + ', then choose your date. These choices are not automatically added to the booking page. Use email if you need to send your notes first.';
    }
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('click', event => {
    const button = event.target.closest('button[data-count]');
    if (!button) return;
    const input = byId(button.dataset.count);
    const current = Number(input.value);
    const valid = input.value.trim() !== '' && Number.isInteger(current) && current >= 1 && current <= 99;
    input.value = valid ? Math.max(1, Math.min(99, current + Number(button.dataset.change))) : 1;
    update();
  });
  update();
})();
