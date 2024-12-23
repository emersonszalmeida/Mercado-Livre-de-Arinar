// Função para preencher as categorias
function mostrarCategorias() {
  const tipoAnuncio = document.getElementById('tipo-anuncio').value;
  const categoriaSelect = document.getElementById('categoria');

  // Limpar opções anteriores
  categoriaSelect.innerHTML = '<option value="">Selecione</option>';

  if (tipoAnuncio === 'conta') {
    const classes = ['Mago', 'Arqueiro', 'Guerreiro', 'Ladino'];
    classes.forEach(classe => {
      categoriaSelect.innerHTML += `<option value="${classe}">${classe}</option>`;
    });
  } else if (tipoAnuncio === 'itens') {
    categoriaSelect.innerHTML += `<option value="outros">Outros</option>`;
  } else if (tipoAnuncio === 'gold') {
    const lados = ['Legião', 'Sentinelas', 'Ambos os lados'];
    lados.forEach(lado => {
      categoriaSelect.innerHTML += `<option value="${lado}">${lado}</option>`;
    });
  } else if (tipoAnuncio === 'outros') {
    const outros = ['Slot Guild Elfo', 'Slot Guild MC', 'Outros'];
    outros.forEach(outro => {
      categoriaSelect.innerHTML += `<option value="${outro}">${outro}</option>`;
    });
  }
}

// Formatação do valor
function formatarValor(input) {
  let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for número
  valor = (valor / 100).toFixed(2) + ''; // Formata para 2 casas decimais
  valor = valor.replace('.', ','); // Substitui ponto por vírgula
  input.value = valor;
}

// Funções do MENU RESPONSIVO
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links li a');

  // Abrir e fechar o menu
  menuToggle.addEventListener('click', function () {
    navLinks.classList.toggle('active');
  });

  // Fechar o menu ao clicar fora dele
  document.addEventListener('click', function (event) {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      navLinks.classList.remove('active');
    }
  });

  // Fechar o menu ao clicar em uma opção do menu
  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      navLinks.classList.remove('active');
    });
  });

  // ÁREA DE UPLOAD DE IMAGENS
  const dropArea = document.getElementById('drop-area');
  const imagePreview = document.getElementById('image-preview'); // Atualizado para usar o ID correto
  const noImagesMessage = document.getElementById('no-images');
  let images = []; // Array para armazenar imagens carregadas

  // Adicionar eventos de arrastar e soltar
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventType => {
    dropArea.addEventListener(eventType, (e) => e.preventDefault());
  });

  ['dragenter', 'dragover'].forEach(eventType => {
    dropArea.addEventListener(eventType, () => dropArea.classList.add('highlight'));
  });

  ['dragleave', 'drop'].forEach(eventType => {
    dropArea.addEventListener(eventType, () => dropArea.classList.remove('highlight'));
  });

  // Clique para selecionar arquivos
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.multiple = true;
  fileInput.style.display = 'none'; // Esconde o input de arquivos

  // Adiciona o input à página, mas ele ficará invisível
  dropArea.appendChild(fileInput);

  // Clique na área de upload para abrir o seletor de arquivos
  dropArea.addEventListener('click', () => {
    fileInput.click(); // Abre o seletor de arquivos
  });

  // Quando os arquivos forem selecionados, handleFiles é chamado
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files); // Chama a função para processar os arquivos
  });

  // Lidar com arquivos carregados
  function handleFiles(files) {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        addImage(file);
      } else {
        alert('Por favor, envie apenas arquivos de imagem.');
      }
    });
  }

  // Adicionar imagem à pré-visualização
  function addImage(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageUrl = e.target.result;

      // Criar o wrapper para a imagem
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('image-wrapper');
      imgWrapper.draggable = true; // Permitir arrastar

      // Adicionar conteúdo ao wrapper
      imgWrapper.innerHTML = `
        <img src="${imageUrl}" alt="Uploaded Image" />
        <span class="remove-btn">&times;</span>
      `;

      // Adicionar o wrapper ao preview
      imagePreview.appendChild(imgWrapper);
      images.push(imgWrapper);

      // Ocultar mensagem "nenhuma imagem"
      if (noImagesMessage) noImagesMessage.style.display = 'none';

      // Botão para remover a imagem
      imgWrapper.querySelector('.remove-btn').addEventListener('click', () => {
        imgWrapper.remove();
        images = images.filter(img => img !== imgWrapper);

        // Mostrar mensagem se não houver mais imagens
        if (images.length === 0 && noImagesMessage) {
          noImagesMessage.style.display = 'block';
        }
      });

      // Habilitar arrastar e soltar para reordenar
      enableDragAndDrop(imgWrapper);
    };

    reader.readAsDataURL(file); // Ler o arquivo como URL
  }

  // Habilitar arrastar e soltar para reordenar imagens
  function enableDragAndDrop(imageElement) {
    imageElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', images.indexOf(imageElement));
    });

    imagePreview.addEventListener('dragover', (e) => e.preventDefault());

    imagePreview.addEventListener('drop', (e) => {
      const draggedIndex = e.dataTransfer.getData('text/plain');
      const targetIndex = images.indexOf(e.target.closest('.image-wrapper'));

      if (draggedIndex >= 0 && targetIndex >= 0) {
        const draggedImage = images[draggedIndex];

        imagePreview.insertBefore(draggedImage, images[targetIndex]);
        images.splice(targetIndex, 0, images.splice(draggedIndex, 1)[0]);
      }
    });
  }
});