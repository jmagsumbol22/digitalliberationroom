function showSection(sectionId) {
  const sections = document.querySelectorAll(".card");

  sections.forEach(function(section) {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
  document.getElementById("message").textContent = "";
}

function wrongAnswer() {
  document.getElementById("message").textContent =
    "The lock does not open. Try thinking beyond individual blame.";
}