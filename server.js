let noteId = 0;
const notes = [];

const express = require('express');
const expressWs = require('express-ws');
const path = require('path');

const app = express();
const { app: wsApp, getWss } = expressWs(app);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

wsApp.ws('/ws', (ws, req) => {
  console.log('Nueva conexión WebSocket');
  ws.send(JSON.stringify({ type: 'welcome', message: '¡Conexión establecida!' }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'new-note') {
      // Transmite la nueva nota a todos los clientes.
      const id = noteId++;
      const wss = getWss('/ws');
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ type: 'new-note', username: data.username, text: data.text }));
        }
      });
    } else if (data.type === 'update-note') {
      const noteToUpdate = notes.find((n) => n.id === data.id);
      if (noteToUpdate) {
        noteToUpdate.text = data.text;
      }
    } else if (data.type === 'delete-note') {
      const noteToDelete = notes.find((n) => n.id === data.id);
      if (noteToDelete) {
        noteToDelete.element.remove();
        notes.splice(notes.indexOf(noteToDelete), 1);
      }
    };
  });
});
