const readline = require('readline');
const cmds = require('./cmds');
const {log, biglog, errorlog, colorize} = require("./out");
const net = require("net");




net.createServer(socket =>{

  console.log("Se ha conectado un cliente desde " + socket.remoteAddress);

  biglog(socket, 'CORE Quiz','green');


  const rl = readline.createInterface({
    input: socket,
    output: socket,
    prompt: colorize("quiz > ", 'blue'),
    completer : (line) => {
  // function completer(line) {
      const completions = '.h .help .add .delete .edit .list .test .p .play .credits .q .quit'.split(' ');
      const hits = completions.filter((c) => c.startsWith(line));
      // show all completions if none found
      return [hits.length ? hits : completions, line];
    }
  });

  socket
  .on("end",()=>{rl.close(); })
  .on("error",()=>{rl.close(); });
  rl.prompt();

  rl
  .on('line', (line) => {
  
   let args = line.split(" "); 
   let cmd = args[0].toLowerCase().trim();

    switch (cmd) {
      case '':
        rl.prompt();
        break;
      case 'h':
      case 'help':
       cmds.helpCmd(socket, rl);
       break;
      case 'quit':
      case 'q':
        cmds.quitCmd(socket, rl);
        //rl.close();
        break;
      case 'add':
        cmds.addCmd(socket, rl);
        //console.log('Añadir un nuevo quiz.');
       break;
      case 'list':
        cmds.listCmd(socket, rl);
        //console.log('Listar todos los quizzes existentes.');
        break;
      case 'show':
        cmds.showCmd(socket, rl, args[1]);
        //console.log('Mostrar el quiz indicado.');
        break;

      case 'test':
        cmds.testCmd(socket, rl, args[1]);
        //console.log('Probar el quiz indicado.');
        break;
      case 'play':
      case 'p':
        cmds.playCmd(socket, rl);
        //console.log('Jugar.');
        break;    
      case 'delete':
        cmds.deleteCmd(socket, rl, args[1]);
        //console.log('Borrar el quiz indicado.');
        break;
      case 'edit':
        cmds.editCmd(socket, rl, args[1]);
        //console.log('Editar el quiz indicado.');
        break;
      case 'credits':
        cmds.creditsCmd(socket, rl);
        //console.log('Autor de la práctica:');
        //console.log('Miguel Hernández');
        break;
      default:
        log(socket, `Comando desconocido: '${colorize(cmd,'red')}'`);
        log(socket, `Use ${colorize('help','green')} para ver todos los comandos disponibles.`);
        rl.prompt();
        break;
    }
  })
  .on('close', () => {
    log(socket, 'Adios');
   // process.exit(0);
  });


})
.listen(3030);

