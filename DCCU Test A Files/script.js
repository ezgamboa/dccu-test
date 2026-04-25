const optionButtons = document.querySelectorAll(".choice");
const nextButton = document.querySelector(".next-btn");
const panel = document.querySelector(".question-panel");

let hasSelection = false;

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    optionButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    hasSelection = true;
    nextButton.classList.add("visible");
  });
});

nextButton?.addEventListener("click", () => {
  if (!hasSelection) return;
  const destination = nextButton.dataset.next;

  panel.classList.add("fade-out");
  setTimeout(() => {
    if (destination) {
      window.location.href = destination;
      return;
    }

    // Final question: full black screen with message only (user closes tab).
    const overlay = document.createElement("div");
    overlay.className = "quiz-end-overlay";
    overlay.innerHTML = `
      <div class="quiz-end-inner">
        <p class="quiz-end-text">(You continue taking the test, answering the next 15 questions with the knowledge you have. Close this tab to continue the story)</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }, 330);
});
