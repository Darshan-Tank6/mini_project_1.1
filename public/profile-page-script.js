document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript Loaded!");

  // Tab Navigation
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      // Hide all tabs
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.add("hidden"));

      // Remove active class from all buttons
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));

      // Show the selected tab
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.remove("hidden");
      this.classList.add("active");
    });
  });

  // Open Modal Listeners
  const modalTriggers = {
    "open-reset-password": "reset-password-modal",
    "open-reset-pin": "reset-pin-modal",
    "open-delete-profile": "delete-profile-modal",
  };

  Object.keys(modalTriggers).forEach((btnId) => {
    document.getElementById(btnId)?.addEventListener("click", function () {
      openModal(`#${modalTriggers[btnId]}`);
    });
  });

  // Close Modal Listeners
  document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal");
      closeModal(`#${modalId}`);
    });
  });

  // Open Modal Function
  function openModal(selector) {
    const modal = document.querySelector(selector);
    if (modal) modal.classList.remove("hidden");
    else console.error(`Modal ${selector} not found.`);
  }

  // Close Modal Function
  function closeModal(selector) {
    const modal = document.querySelector(selector);
    if (modal) modal.classList.add("hidden");
    else console.error(`Modal ${selector} not found.`);
  }
});
