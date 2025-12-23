const { SerialPort } = require('serialport');

let port = null;

process.on('message', async (msg) => {
  if (msg.type === 'connect') {
    try {
      port = new SerialPort({ path: msg.path, baudRate: msg.baudRate });
      
      port.on('data', (data) => {
        process.send({ type: 'data', data: data.toString() });
      });
      
      port.on('error', (err) => {
        process.send({ type: 'error', error: err.message });
      });
      
      port.on('open', () => {
        process.send({ type: 'connected' });
      });
    } catch (err) {
      process.send({ type: 'error', error: err.message });
    }
  }
  
  if (msg.type === 'send' && port) {
    port.write(msg.data);
  }
  
  if (msg.type === 'disconnect' && port) {
    port.close();
    port = null;
  }
});