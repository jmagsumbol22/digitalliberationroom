function showSection(sectionId) {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");

  document.getElementById("message").textContent = "";
}

function wrongAnswer() {
  document.getElementById("message").textContent =
    "PLACEHOLDER ERROR MESSAGE";
}
