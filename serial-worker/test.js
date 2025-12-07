const { fork } = require('child_process');
const path = require('path');
const readline = require('readline');

// Fork the worker
const worker = fork(path.join(__dirname, 'index.js'));

// Handle messages from worker
worker.on('message', (msg) => {
  console.log('Worker:', msg);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Simple CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Commands:');
console.log('  connect <port> <baudRate>  - e.g., connect /dev/ttyS3 115200');
console.log('  send <message>             - e.g., send Hello');
console.log('  disconnect');
console.log('  list');
console.log('  exit');
console.log('');

rl.on('line', async (line) => {
  const [command, ...args] = line.trim().split(' ');

  switch (command) {
    case 'connect':
      worker.send({ 
        type: 'connect', 
        path: args[0] || '/dev/ttyS3', 
        baudRate: parseInt(args[1]) || 115200 
      });
      break;

    case 'send':
      worker.send({ type: 'send', data: args.join(' ') + '\n' });
      break;

    case 'disconnect':
      worker.send({ type: 'disconnect' });
      break;

    case 'list':
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();
      console.log('Available ports:', ports);
      break;

    case 'exit':
      worker.kill();
      process.exit(0);
      break;

    default:
      console.log('Unknown command:', command);
  }
});