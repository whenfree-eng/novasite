/* Quotes stay in the browser until a customer opens their chosen enquiry channel. */
(function () {
  const form = document.getElementById('session-builder');
  if (!form) return;
  const byId = id => document.getElementById(id);
  const quote = byId('quote');
  const action = byId('session-action');
  const emailAction = byId('email-action');
  const rates = { 1: 99, 2: 170, 4: 350, 8: 620 };
  const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  let bookingSummary = '';

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
    bookingSummary = '';
    quote.textContent = message;
    byId('mobile-price').textContent = 'Choose edits';
    byId('summary-actions').hidden = true;
    action.removeAttribute('href');
    emailAction.removeAttribute('href');
  }

  function update() {
    byId('copy-status').textContent = '';
    const editingOnly = form.querySelector('input[name="mode"]:checked').value === 'editing';
    const hours = Number(form.querySelector('input[name="duration"]:checked').value);
    const bundle = byId('bundle').checked;
    const services = [
      ['episodes', 'episode', 'Full long-form episode edit', 175],
      ['clips', 'clip', 'Five professionally edited vertical social clips', 150],
      ['trailer', 'trailer', 'One-minute episode trailer', 100],
      ['bundle', 'bundle', 'Complete Editing Bundle (long-form + 5 clips + 1-minute trailer; save £75 per episode)', 350]
    ];
    const teleprompterInput = byId('teleprompter');
    byId('recording-options').hidden = editingOnly;
    byId('recording-options').disabled = editingOnly;
    byId('teleprompter-option').hidden = editingOnly;
    teleprompterInput.disabled = editingOnly;
    if (editingOnly) teleprompterInput.checked = false;
    const appointment = hours + ' hour' + (hours === 1 ? '' : 's');
    byId('appointment').textContent = editingOnly ? 'Editing only. No studio appointment.' : 'Studio time requested: ' + appointment + ', including setup. Editing adds no studio hours.';
    const rows = [];
    if (!editingOnly) rows.push(['Studio hire · ' + appointment, rates[hours]]);
    let hasEditing = false;
    let invalid = false;
    for (const [id, key, name, price] of services) {
      const input = byId(id);
      input.disabled = bundle && id !== 'bundle';
      if (input.disabled) input.checked = false;
      const enabled = input.checked;
      byId(key + '-options').hidden = !enabled;
      const count = quantity(key, enabled);
      if (enabled) {
        hasEditing = true;
        if (count === null) invalid = true;
        else rows.push([count + ' × ' + name + ' (per episode)', count * price]);
      }
    }
    if (invalid) {
      clearActions('Check the quantities to see your total.');
      byId('mobile-price').textContent = 'Check quantity';
      return;
    }
    if (editingOnly && !hasEditing) {
      clearActions('Choose an editing service or the Complete Editing Bundle.');
      return;
    }
    if (!editingOnly && teleprompterInput.checked) rows.push(['Teleprompter · flat booking fee', 45]);
    const total = rows.reduce((sum, row) => sum + row[1], 0);
    const list = document.createElement('dl');
    for (const [name, value] of rows.concat([['Estimated total', total]])) {
      const row = document.createElement('div');
      if (name === 'Estimated total') row.className = 'total';
      const term = document.createElement('dt'); term.textContent = name;
      const detail = document.createElement('dd'); detail.textContent = pounds.format(value);
      row.append(term, detail); list.append(row);
    }
    quote.replaceChildren(list);
    byId('mobile-price').textContent = pounds.format(total);
    const brief = byId('session-brief').value.trim().slice(0, 700);
    const lines = [editingOnly ? 'Hi Nova, I would like an editing-only quote:' : 'Hi Nova, I would like to book:', ...rows.map(([name, value]) => name + ': ' + pounds.format(value)), 'Estimated total: ' + pounds.format(total)];
    if (hasEditing) lines.push('', 'Editing prices are per episode. One consolidated revision round; for bundles, one combined round across all three deliverables. Footage length, scope, suitability and delivery dates to be confirmed. Studio hire is separate.');
    if (brief) lines.push('', 'My brief: ' + brief);
    lines.push('', 'Please confirm availability, scope and delivery dates, then send an itemised payment link.');
    bookingSummary = lines.join('\n');
    action.href = 'https://wa.me/447761075775?text=' + encodeURIComponent(bookingSummary);
    action.textContent = 'Send choices via WhatsApp';
    emailAction.href = 'mailto:info@thenovastudios.co.uk?subject=' + encodeURIComponent(editingOnly ? 'Nova editing enquiry' : 'Nova booking request') + '&body=' + encodeURIComponent(bookingSummary);
    byId('summary-actions').hidden = false;
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
  for (const button of document.querySelectorAll('[data-example]')) {
    button.addEventListener('click', () => {
      form.querySelector('input[name="mode"][value="record"]').checked = true;
      form.querySelector('input[name="duration"][value="2"]').checked = true;
      for (const id of ['episodes', 'clips', 'trailer', 'bundle']) byId(id).checked = false;
      byId(button.dataset.example === 'bundle' ? 'bundle' : 'episodes').checked = true;
      for (const key of ['episode', 'clip', 'trailer', 'bundle']) byId(key + '-count').value = 1;
      byId('teleprompter').checked = false;
      update();
      byId(button.dataset.example === 'bundle' ? 'bundle' : 'episodes').focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }
  byId('copy-summary').addEventListener('click', async () => {
    if (!bookingSummary) return;
    try {
      await navigator.clipboard.writeText(bookingSummary);
      byId('copy-status').textContent = 'Booking summary copied.';
    } catch (_) {
      byId('copy-status').textContent = 'Copy is unavailable here. Use WhatsApp or email to open the same summary.';
    }
  });
  update();
})();
