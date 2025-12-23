const { SerialPort } = require('serialport');

process.on('message', async (msg) => {
  if (msg.type === 'connect') {
    try {
      const port = new SerialPort({ path: msg.path, baudRate: msg.baudRate });
      
      port.on('data', (data) => {
        process.send({ type: 'data', data: data.toString() });
      });
      
      port.on('error', (err) => {
        process.send({ type: 'error', error: err.message });
      });
      
      global.port = port;
      process.send({ type: 'connected' });
    } catch (err) {
      process.send({ type: 'error', error: err.message });
    }
  }
  
  if (msg.type === 'send' && global.port) {
    global.port.write(msg.data);
  }
  
  if (msg.type === 'disconnect' && global.port) {
    global.port.close();
    global.port = null;
  }
});