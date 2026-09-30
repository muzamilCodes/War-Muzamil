// ===================================================================
// HONEST DEMO CONTACT FORM MODULE
// Validates user input and clearly labels itself as a demo:
// Submissions are acknowledged locally, never sent externally.
// ===================================================================

import confetti from 'canvas-confetti';
import { playConfirm, playDeny } from './audio.js';

export function initContactForm() {
  const form = document.getElementById('cyber-contact-form');
  const receipt = document.getElementById('contact-receipt');
  const resetBtn = document.getElementById('contact-reset-btn');
  const closeReceiptBtn = document.getElementById('close-receipt-btn');
  const sendAnotherBtn = document.getElementById('send-another-btn');

  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasErrors = false;

    // Validate Name
    if (!nameInput.value.trim()) {
      showError(nameInput);
      hasErrors = true;
    } else {
      clearError(nameInput);
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput);
      hasErrors = true;
    } else {
      clearError(emailInput);
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      showError(messageInput);
      hasErrors = true;
    } else {
      clearError(messageInput);
    }

    if (hasErrors) {
      playDeny();
      return;
    }

    // Input is valid! Process honest local demo dispatch
    processLocalSubmission({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      subject: document.getElementById('contact-subject').value,
      message: messageInput.value.trim()
    });
  });

  function showError(inputEl) {
    const parent = inputEl.closest('.form-group');
    if (parent) parent.classList.add('has-error');
  }

  function clearError(inputEl) {
    const parent = inputEl.closest('.form-group');
    if (parent) parent.classList.remove('has-error');
  }

  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener('input', () => clearError(input));
  });

  function processLocalSubmission(data) {
    playConfirm();

    // Generate mock cryptographic transmission hash
    const chars = '0123456789ABCDEF';
    let hash = '0x';
    for (let i = 0; i < 32; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    // Update receipt details
    document.getElementById('receipt-hash').textContent = hash;
    document.getElementById('receipt-time').textContent = timestamp;

    // Show receipt & hide form
    form.style.display = 'none';
    receipt.hidden = false;

    // Trigger cyberpunk confetti particle burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#00ff88', '#ff007f']
      });
    } catch (e) {}

    // Store in browser session storage
    try {
      const records = JSON.parse(sessionStorage.getItem('nexus_demo_transmissions') || '[]');
      records.push({ ...data, hash, timestamp });
      sessionStorage.setItem('nexus_demo_transmissions', JSON.stringify(records));
    } catch (e) {}
  }

  function resetFormView() {
    form.reset();
    form.style.display = 'block';
    receipt.hidden = true;
    [nameInput, emailInput, messageInput].forEach(clearError);
  }

  if (closeReceiptBtn) closeReceiptBtn.addEventListener('click', resetFormView);
  if (sendAnotherBtn) sendAnotherBtn.addEventListener('click', resetFormView);
  if (resetBtn) resetBtn.addEventListener('click', () => {
    [nameInput, emailInput, messageInput].forEach(clearError);
  });
}
