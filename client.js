document.addEventListener("DOMContentLoaded", function () {
    const newNoteButton = document.getElementById('newNote');
    const noteModal = document.getElementById('noteModal');
    const saveNoteButton = document.getElementById('saveNote');
    const usernameInput = document.getElementById('username');
    const noteTextInput = document.getElementById('noteText');
    const board = document.getElementById('board');

    newNoteButton.addEventListener('click', () => {
        noteModal.style.display = 'block';
    });

    document.getElementsByClassName('close')[0].addEventListener('click', () => {
        noteModal.style.display = 'none';
    });

    saveNoteButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const noteText = noteTextInput.value;

        if (username && noteText) {
            const note = {
                id: Date.now(),
                username,
                text: noteText,
                type: 'default'
            };

            socket.emit('newNote', note);
            noteModal.style.display = 'none';
            usernameInput.value = '';
            noteTextInput.value = '';

            // Renderizar la nota en el tablero después de crearla
            renderNote(note);
        }
    });

    socket.on('allNotes', (notes) => {
        // Limpiar el tablero antes de agregar las notas
        board.innerHTML = '';

        // Renderizar todas las notas existentes
        for (const note of notes) {
            renderNote(note);
        }
    });

    socket.on('newNote', (note) => {
        // Verificar si la nota ya existe en el tablero
        const existingNote = document.querySelector(`[data-id="${note.id}"]`);
        
        if (!existingNote) {
            // Crear un nuevo elemento de nota solo si no existe
            renderNote(note);
        }
    });

    socket.on('updatedNotePosition', (noteId, newX, newY) => {
        const note = document.querySelector(`[data-id="${noteId}"]`);
        if (note) {
            updateNotePosition(note, newX, newY);
        }
    });

    socket.on('editedNote', (editedNote) => {
        // Encontrar el elemento de la nota en el DOM según su ID
        const noteElement = document.querySelector(`[data-id="${editedNote.id}"]`);
        if (noteElement) {
            // Actualizar el contenido de la nota con el nuevo texto editado
            const noteTextElement = noteElement.querySelector('.note-text');
            if (noteTextElement) {
                noteTextElement.textContent = editedNote.text;
            }
        }
    });
   
      socket.on('deletedNote', (noteId) => {
        // Encontrar el elemento de la nota en el DOM según su ID
        const noteElement = document.querySelector(`[data-id="${noteId}"]`);
        if (noteElement) {
            // Eliminar la nota del DOM
            board.removeChild(noteElement);
        }
    });
    

    function renderNote(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.dataset.id = note.id;

        noteElement.innerHTML = `
            <div class="note-header">
                <span class="username">${note.username}</span>
            </div>
            <div class="note-text" contenteditable="true">${note.text}</div>
            <div class="note-actions">
                <button class="delete-button">Eliminar</button>
            </div>
        `;

        board.appendChild(noteElement);

        
        // Configurar la interacción para mover las notas
        // Configurar la interacción para mover y redimensionar las notas

        interact('.note')
        .draggable({
        onmove: onNoteMove,
        })
        .resizable({
        edges: { left: true, right: true, top: true, bottom: true },
        onmove: onNoteResize,
        });

        function onNoteMove(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Actualizar la posición de la nota
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Guardar las coordenadas
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        }

        function onNoteResize(event) {
        const target = event.target;
        const x = parseFloat(target.style.left) || 0;
        const y = parseFloat(target.style.top) || 0;

        const newWidth = event.rect.width;
        const newHeight = event.rect.height;

        // Actualizar el tamaño de la nota
        target.style.width = newWidth + 'px';
        target.style.height = newHeight + 'px';

        // Actualizar la posición
        target.style.transform = `translate(${x}px, ${y}px)`;
        }

       
        const deleteButton = noteElement.querySelector('.delete-button');

        // Agregar evento para guardar la edición
        const noteTextElement = noteElement.querySelector('.note-text');
        noteTextElement.addEventListener('blur', () => {
            const newText = noteTextElement.textContent;
            const noteId = noteElement.dataset.id;
            socket.emit('editNote', { id: noteId, text: newText });
        });       

        // Agregar evento para eliminar la nota
        deleteButton.addEventListener('click', () => {
            const noteId = noteElement.dataset.id;
            socket.emit('deleteNote', noteId);
            board.removeChild(noteElement);
        }
        )};
     
});
