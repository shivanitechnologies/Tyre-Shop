(function () {
  'use strict';

  const MESSAGES_KEY = 'tyrex_contact_messages';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('main form');
    if (!form) return;

    const fields = form.querySelectorAll('input, select, textarea');
    const [nameInput, emailInput, phoneInput, serviceInput, messageInput] = fields;
    if (!nameInput || !emailInput || !phoneInput || !serviceInput || !messageInput) return;

    form.classList.add('torq-contact-form');
    const layout = form.closest('.container')?.firstElementChild;
    if (layout) layout.classList.add('torq-contact-layout');

    nameInput.required = true;
    emailInput.required = true;
    phoneInput.required = true;
    messageInput.required = true;
    const submitButton = form.querySelector('button');
    if (submitButton) {
      submitButton.type = 'submit';
      submitButton.textContent = 'Save message locally';
    }
    const formNote = document.createElement('p');
    formNote.textContent = 'Demo mode: messages are stored in this browser only and are not sent to TORQ.';
    formNote.style.cssText = 'grid-column:1 / -1; margin:0; color:var(--text-muted); font-size:0.85rem;';
    form.appendChild(formNote);

    const address = Array.from(document.querySelectorAll('p')).find((paragraph) =>
      paragraph.textContent.includes('249 Harbor Avenue')
    );
    if (address) {
      const mapLink = document.createElement('a');
      mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address.textContent.trim());
      mapLink.target = '_blank';
      mapLink.rel = 'noopener noreferrer';
      mapLink.className = 'link-arrow';
      mapLink.textContent = 'Open map directions';
      address.parentElement.appendChild(mapLink);
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      let messages;
      try {
        messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
        if (!Array.isArray(messages)) throw new Error('Stored messages are not a list.');
      } catch (error) {
        window.showToast('Could not read saved messages. Please try again later.', 'error');
        console.error('Could not read TORQ contact messages.', error);
        return;
      }

      const submittedAt = new Date();
      messages.unshift({
        id: 'MSG-' + submittedAt.getTime(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        vehicle: 'Not provided',
        service: serviceInput.value,
        message: messageInput.value.trim(),
        date: submittedAt.toISOString().slice(0, 10)
      });

      try {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      } catch (error) {
        window.showToast('Could not save your message in this browser.', 'error');
        console.error('Could not save TORQ contact message.', error);
        return;
      }

      form.reset();
      window.showToast('Message saved in this browser only. It has not been sent to TORQ.', 'success');
    });
  });
})();
