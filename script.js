// script.js
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links li a");

  // Abrir e fechar o menu
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });

  // Fechar o menu ao clicar fora dele
  document.addEventListener("click", function (event) {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      navLinks.classList.remove("active");
    }
  });

  // Fechar o menu ao clicar em uma opção do menu
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      navLinks.classList.remove("active");
    });
  });

  // Formulário de Registro
  const registroForm = document.querySelector("#registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(registroForm);

      fetch("/registro", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.mensagem); // Exibe a mensagem do servidor
          if (data.status === "sucesso") {
            registroForm.reset(); // Limpa o formulário em caso de sucesso
            window.location.href = "/"; // Redireciona para a página inicial
          }
        })
        .catch((error) => {
          console.error("Erro no registro:", error);
          alert("Erro ao processar o registro. Tente novamente.");
        });
    });
  }

  // Formulário de Login
  const loginForm = document.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(loginForm);

      fetch("/login", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.mensagem); // Exibe a mensagem do servidor
          if (data.status === "sucesso") {
            window.location.href = "/"; // Redireciona para a página inicial
          }
        })
        .catch((error) => {
          console.error("Erro no login:", error);
          alert("Erro ao processar o login. Tente novamente.");
        });
    });
  }
});