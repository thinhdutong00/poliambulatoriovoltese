const html = document.documentElement;
const loader = document.querySelector(".page-loader");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader?.classList.add("loader-hidden");
    html.classList.remove("loader-active");
  }, 360);
});

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

const form = document.querySelector("#prenota");
const steps = [...document.querySelectorAll(".form-step")];
const progress = [...document.querySelectorAll(".progress span")];
const nextBtn = document.querySelector("[data-next]");
const prevBtn = document.querySelector("[data-prev]");
const submitBtn = form?.querySelector("[type='submit']");
const errorBox = document.querySelector(".form-error");
const summaryBox = document.querySelector(".summary-box");
const state = {};
let currentStep = 0;

function setStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => {
    const active = stepIndex === currentStep;
    step.hidden = !active;
    step.classList.toggle("is-active", active);
  });
  progress.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex <= currentStep));
  prevBtn.hidden = currentStep === 0;
  nextBtn.hidden = currentStep === steps.length - 1;
  submitBtn.hidden = currentStep !== steps.length - 1;
  errorBox.textContent = "";
  renderSummary();
}

function selectedInCurrentStep() {
  const step = steps[currentStep];
  if (currentStep === steps.length - 1) {
    return true;
  }
  return Boolean(step.querySelector(".choice-btn.is-selected"));
}

document.querySelectorAll(".choice-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const parent = button.closest(".form-step");
    parent.querySelectorAll(".choice-btn").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    state[button.dataset.name] = button.dataset.value || button.textContent.trim();
    errorBox.textContent = "";
    renderSummary();
  });
});

nextBtn?.addEventListener("click", () => {
  if (!selectedInCurrentStep()) {
    errorBox.textContent = "Seleziona un'opzione per continuare.";
    return;
  }
  setStep(currentStep + 1);
});

prevBtn?.addEventListener("click", () => setStep(currentStep - 1));

form?.addEventListener("submit", (event) => {
  const required = [...form.querySelectorAll("[required]")];
  const invalid = required.find((field) => !field.value.trim());
  if (invalid) {
    event.preventDefault();
    invalid.focus();
    errorBox.textContent = "Compila i campi obbligatori prima di inviare.";
    return;
  }
  const hiddenFields = Object.entries(state).map(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  });
  hiddenFields.forEach((field) => form.append(field));
});

function renderSummary() {
  if (!summaryBox) return;
  const lines = Object.entries(state).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`);
  summaryBox.innerHTML = lines.length ? lines.join("") : "<p>Le scelte appariranno qui prima dell'invio.</p>";
}

function buildCalendar() {
  const grid = document.querySelector("#calendar-grid");
  if (!grid) return;
  const formatterDay = new Intl.DateTimeFormat("it-IT", { weekday: "short" });
  const formatterDate = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" });
  const days = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  while (days.length < 10) {
    const day = cursor.getDay();
    if (![0, 4].includes(day)) {
      days.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  grid.innerHTML = days
    .map((date) => {
      const label = `${formatterDay.format(date)} ${formatterDate.format(date)}`;
      return `<button type="button" class="choice-btn calendar-day" data-name="Data" data-value="${label}">
        <strong>${formatterDay.format(date)}</strong><span>${formatterDate.format(date)}</span>
      </button>`;
    })
    .join("");

  grid.querySelectorAll(".choice-btn").forEach((button) => {
    button.addEventListener("click", () => {
      grid.querySelectorAll(".choice-btn").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      state.Data = button.dataset.value;
      errorBox.textContent = "";
      renderSummary();
    });
  });
}

buildCalendar();
setStep(0);

const prompt = document.querySelector(".whatsapp-prompt");
const promptClose = document.querySelector(".whatsapp-prompt-close");

window.setTimeout(() => prompt?.classList.add("is-visible"), 9000);
promptClose?.addEventListener("click", () => prompt?.classList.remove("is-visible"));
