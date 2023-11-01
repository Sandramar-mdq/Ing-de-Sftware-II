const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configura la dirección IP y el puerto en el que el servidor escuchará
const ip = '192.168.100.11'; // Escuchar en todas las interfaces de red (dirección IP pública)
const port = 3000;

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const notes = [];

io.on('connection', (socket) => {
    // Emitir notas existentes al nuevo cliente
   socket.emit('allNotes', notes);

    socket.on('newNote', (note) => {
        notes.push(note);
        io.emit('newNote', note);
    });

    socket.on('updateNotePosition', (noteId, newX, newY) => {
        // Encuentra la nota en la lista y actualiza la posición
        const note = notes.find((note) => note.id === noteId);
        if (note) {
            note.x = newX;
            note.y = newY;
        }
    
        io.emit('updatedNotePosition', noteId, newX, newY);
    });
    
    socket.on('editNote', (editedNote) => {
      // Encuentra la nota en la lista y actualiza el texto
      const index = notes.findIndex(note => note.id === editedNote.id);
      if (index !== -1) {
          notes[index].text = editedNote.text;
          io.emit('editedNote', editedNote);
      }
    });
    
    socket.on('deleteNote', (noteId) => {
        // Elimina la nota de la lista
        console.log('Eliminando nota con ID:', noteId);
        const index = notes.findIndex(note => note.id === noteId);
        if (index !== -1) {
            const deletedNote = notes.splice(index, 1)[0];
            io.emit('deletedNote', deletedNote.id);
            console.log('Deleted note:', noteId);
        }
    });
      
    
});

server.listen(port, ip, () => {
    console.log(`Servidor en ejecución en http://${ip}:${port}`);

});

io.on('connection', (socket) => {
    // Obtiene la dirección IP del cliente que se conecta
    const clientAddress = socket.handshake.address;

    // Registra un mensaje en la consola indicando que un usuario se ha conectado
    console.log(`Usuario conectado en ${clientAddress}`);

    // Resto de tu código para gestionar las notas y la comunicación con el cliente
    // ...

    // Cuando un usuario se desconecta
    socket.on('disconnect', () => {
        console.log(`Usuario desconectado en ${clientAddress}`);
    });
});

