// document.addEventListener("DOMContentLoaded", function () {
//   console.log("JavaScript Loaded!");

//   // Tab Navigation
//   document.querySelectorAll(".tab-button").forEach((button) => {
//     button.addEventListener("click", function () {
//       // Hide all tabs
//       document
//         .querySelectorAll(".tab-content")
//         .forEach((tab) => tab.classList.add("hidden"));

//       // Remove active class from all buttons
//       document
//         .querySelectorAll(".tab-button")
//         .forEach((btn) => btn.classList.remove("active"));

//       // Show the selected tab
//       const tabId = this.getAttribute("data-tab");
//       document.getElementById(tabId).classList.remove("hidden");
//       this.classList.add("active");
//     });
//   });

//   // Open Modal Listeners
//   const modalTriggers = {
//     "open-reset-password": "reset-password-modal",
//     "open-reset-pin": "reset-pin-modal",
//     "open-delete-profile": "delete-profile-modal",
//   };

//   Object.keys(modalTriggers).forEach((btnId) => {
//     document.getElementById(btnId)?.addEventListener("click", function () {
//       openModal(`#${modalTriggers[btnId]}`);
//     });
//   });

//   // Close Modal Listeners
//   document.querySelectorAll(".close-modal").forEach((button) => {
//     button.addEventListener("click", function () {
//       const modalId = this.getAttribute("data-modal");
//       closeModal(`#${modalId}`);
//     });
//   });

//   // Open Modal Function
//   function openModal(selector) {
//     const modal = document.querySelector(selector);
//     if (modal) modal.classList.remove("hidden");
//     else console.error(`Modal ${selector} not found.`);
//   }

//   // Close Modal Function
//   function closeModal(selector) {
//     const modal = document.querySelector(selector);
//     if (modal) modal.classList.add("hidden");
//     else console.error(`Modal ${selector} not found.`);
//   }
// });

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.dataset.open;
    document.getElementById(modalId).classList.remove("hidden");
  });
});

document.querySelectorAll("[data-close]").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    const modalId = closeBtn.dataset.close;
    document.getElementById(modalId).classList.add("hidden");
  });
});

function openModal(userId) {
  document.getElementById(`modal-${userId}`).classList.remove("hidden");
}

function closeModal(userId) {
  document.getElementById(`modal-${userId}`).classList.add("hidden");
}

document.querySelectorAll(".open-update-modal").forEach((button) => {
  button.addEventListener("click", () => {
    // Get user data from data attributes
    const id = button.dataset.id;
    const name = button.dataset.name;
    const role = button.dataset.role;
    const regNO = button.dataset.regno;
    const contactPerson = button.dataset.contactperson;
    const location = button.dataset.location;

    // Fill the modal form
    document.getElementById("update-id").value = id;
    document.getElementById("update-name").value = name;
    document.getElementById("update-role").value = role;

    // Show advisor fields only if role is advisor
    const advisorFields = document.getElementById("advisor-fields");
    if (role === "advisor") {
      advisorFields.classList.remove("hidden");
      document.getElementById("update-regno").value = regNO;
      document.getElementById("update-contact").value = contactPerson;
      document.getElementById("update-location").value = location;
    } else {
      advisorFields.classList.add("hidden");
      document.getElementById("update-regno").value = "";
      document.getElementById("update-contact").value = "";
      document.getElementById("update-location").value = "";
    }

    // Show the modal
    document.getElementById("update-profile-modal").classList.remove("hidden");
  });
});

// Close modal
document
  .querySelector('[data-close="update-profile-modal"]')
  .addEventListener("click", () => {
    document.getElementById("update-profile-modal").classList.add("hidden");
  });
