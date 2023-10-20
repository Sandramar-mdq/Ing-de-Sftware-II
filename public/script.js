let noteId = 0; 
// Conecta al servidor WebSocket.
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', (event) => {
  console.log('Conexión WebSocket establecida');
});

// Maneja mensajes entrantes desde el servidor WebSocket.
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  // Maneja diferentes tipos de mensajes.
  if (data.type === 'welcome') {
    // Muestra un mensaje de bienvenida cuando se conecta al servidor.
    console.log(data.message);
  } else if (data.type === 'new-note') {
    // Crea la nota en la interfaz de usuario cuando se recibe una nueva nota.
    createNote(data.username, data.text);
  }
});


const notes = [];

function createNote(username, text) {
    const id = noteId++; 
    if (ws.readyState === WebSocket.OPEN) {
      // Envía el mensaje solo si el WebSocket está en estado abierto.
      ws.send(JSON.stringify({ type: 'new-note', username, text, id }));
    } else {
      console.error('WebSocket no está en estado abierto');
    }

    const note = document.createElement('div');
    note.className = 'note';
    note.draggable = true;
  
    // Crea un elemento de texto para mostrar el contenido.
    const noteText = document.createElement('p');
    noteText.textContent = text; // Establece el texto del elemento.

    const menu = document.createElement('div');
    menu.className = 'menu';

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';

    menu.appendChild(editButton);
    menu.appendChild(deleteButton);

    note.appendChild(noteText); // Agrega el elemento de texto a la nota.
    note.appendChild(menu);

  // Agrega eventos para arrastrar la nota.
  /*note.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'anything'); // Para habilitar el arrastre.
  }); */

  // Variables para el arrastre de notas
let isDragging = false;
let offsetX, offsetY, currentNote;

function dragStart(e) {
  isDragging = true;
  currentNote = e.currentTarget;

  const boundingRect = currentNote.getBoundingClientRect();
  offsetX = e.clientX - boundingRect.left;
  offsetY = e.clientY - boundingRect.top;
}

function drag(e) {
  if (!isDragging) return;

  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;

  currentNote.style.left = x + 'px';
  currentNote.style.top = y + 'px';
}

function dragEnd() {
  isDragging = false;
}

// Agregar eventos de arrastre a las notas existentes
const noteElements = document.querySelectorAll('.note');
noteElements.forEach((note) => {
  note.addEventListener('mousedown', dragStart);
});

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);


  note.style.left = '10px'; // Fija el margen izquierdo a 10px
  note.style.top = `${notes.length * 60}px`; // Alinea las notas una debajo de la otra
  
  // Agrega la nota al contenedor.
  const notesContainer = document.querySelector('.notes-container');
  notesContainer.appendChild(note);

  // Agrega la nota al arreglo de notas.
  notes.push({ username, text, element: note });

  // Agrega eventos para mostrar el menú al hacer clic en la nota.
  note.addEventListener('click', () => {
    menu.style.display = 'block';
  });

  // Agrega eventos para editar y eliminar la nota.
  editButton.addEventListener('click', () => {
    const newText = prompt('Edita tu mensaje:', text);
    if (newText !== null) {
      // Actualiza el texto de la nota.
      text = newText;
      // Envía un mensaje de actualización a través del WebSocket.
      ws.send(JSON.stringify({ type: 'update-note', username, text, id }));
    }
});

  deleteButton.addEventListener('click', () => {
 // Elimina la nota de la interfaz de usuario.
 note.remove();
 // Envía un mensaje de eliminación a través del WebSocket.
 ws.send(JSON.stringify({ type: 'delete-note', id }));
});

  /*/ Envía la nota a través del WebSocket al servidor, incluyendo el id.
  //ws.send(JSON.stringify({ type: 'new-note', username, text, id }));
  if (ws.readyState === WebSocket.OPEN) {
    // Envía el mensaje solo si el WebSocket está en estado abierto.
    ws.send(JSON.stringify({ type: 'new-note', username, text, id }));
  } else {
    console.error('WebSocket no está en estado abierto');
  }*/
  
}

// Evento para crear una nueva nota.
document.querySelector('#new-note-button').addEventListener('click', () => {
  const username = prompt('Ingresa tu nombre de usuario:');
  const text = prompt('Escribe tu mensaje:');
  if (ws.readyState === WebSocket.OPEN) {
    // Envía el mensaje solo si el WebSocket está en estado abierto.
    ws.send(JSON.stringify({ type: 'new-note', username, text, id }));
  } else {
    console.error('WebSocket no está en estado abierto');
  }
});
