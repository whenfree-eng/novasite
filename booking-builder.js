/* Quotes stay in the browser until a customer opens their chosen enquiry channel. */
(function () {
  const form = document.getElementById('session-builder');
  if (!form) return;
  const byId = id => document.getElementById(id);
  const quote = byId('quote');
  const action = byId('session-action');
  const emailAction = byId('email-action');
  const rates = { 1: 99, 2: 160, 4: 300, 8: 560 };
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
    const episodes = byId('episodes').checked;
    const clips = byId('clips').checked;
    const publishPack = byId('publish-pack').checked;
    const clipSize = Number(form.querySelector('input[name="clip-size"]:checked').value);
    const clipPrice = clipSize === 5 ? 100 : 180;
    const episodePrice = publishPack ? 220 : 180;
    byId('episode-name').textContent = publishPack ? 'Episode Ready' : 'Episode Edit Only';
    byId('episode-description').textContent = publishPack ? 'Your finished video and audio episode, plus a thumbnail and the words you need to publish it.' : 'Your finished video and audio episode. You supply your own thumbnail and publishing copy.';
    byId('episode-inclusions').textContent = 'Camera cuts, tightened pacing, cleaned sound and colour correction.' + (publishPack ? ' One thumbnail, three title options, a description and chapters.' : ' Publishing assets are not included.');
    const teleprompterInput = byId('teleprompter');
    byId('recording-options').hidden = editingOnly;
    byId('recording-options').disabled = editingOnly;
    byId('teleprompter-option').hidden = editingOnly;
    teleprompterInput.disabled = editingOnly;
    if (editingOnly) teleprompterInput.checked = false;
    byId('episode-options').hidden = !episodes;
    byId('clip-options').hidden = !clips;
    byId('episode-price').replaceChildren(document.createTextNode('+ ' + pounds.format(episodePrice)));
    const epUnit = document.createElement('small'); epUnit.textContent = 'per episode'; byId('episode-price').append(epUnit);
    byId('clip-price').replaceChildren(document.createTextNode('+ ' + pounds.format(clipPrice)));
    const clipUnit = document.createElement('small'); clipUnit.textContent = 'for ' + clipSize + ' clips'; byId('clip-price').append(clipUnit);
    const episodeCount = quantity('episode', episodes);
    const clipCount = quantity('clip', clips);
    const appointment = hours + ' hour' + (hours === 1 ? '' : 's');
    byId('appointment').textContent = editingOnly ? 'Editing only. No studio appointment.' : 'Studio time requested: ' + appointment + ', including setup.';
    byId('clip-description').textContent = clipCount === null ? 'Each pack contains ' + clipSize + ' highlights' : (clipCount || 1) + ' pack' + ((clipCount || 1) === 1 ? '' : 's') + ' = ' + ((clipCount || 1) * clipSize) + ' highlights';
    if (episodeCount === null || clipCount === null) {
      clearActions('Check the quantities to see your total.');
      byId('mobile-price').textContent = 'Check quantity';
      return;
    }
    if (editingOnly && !episodes && !clips) {
      clearActions('Choose Episode Ready or Social Highlights for your editing enquiry.');
      return;
    }
    const rows = [];
    if (!editingOnly) rows.push(['Studio Session · ' + appointment, rates[hours]]);
    if (episodes) rows.push([episodeCount + ' × ' + (publishPack ? 'Episode Ready (with publishing assets)' : 'Episode edit only (no publishing assets)'), episodeCount * episodePrice]);
    if (clips) rows.push([clipCount + ' × Social Highlights (' + clipSize + ' clips per pack)', clipCount * clipPrice]);
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
    if (episodes || clips) lines.push('', 'Scope: up to 90 minutes of source conversation per episode / highlights pack; one consolidated revision round. Dates and source suitability to be confirmed. Files for me to publish.');
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
      byId('episodes').checked = true; byId('publish-pack').checked = true; byId('episode-count').value = 1;
      byId('clips').checked = button.dataset.example !== 'episode'; byId('clip-count').value = 1;
      form.querySelector('input[name="clip-size"][value="' + (button.dataset.example === 'ten' ? 10 : 5) + '"]').checked = true;
      byId('teleprompter').checked = false;
      update();
      byId('episodes').focus({ preventScroll: true });
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
