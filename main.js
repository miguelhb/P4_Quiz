const readline = require('readline');
const cmds = require('./cmds')
const{log, biglog, errorlog, colorize} = require("./out");

//Mensaje inicial 
//console.log(
//  chalk.green.bold(
//    figlet.textSync('CORE Quiz', {horizontalLayout: 'full'})
//  )
//);




//Mensaje inicial
biglog('CORE Quiz','green');
//biglog('CORRECTO','green');
//biglog('INCORRECTO','red');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize("quiz> ", 'blue'),
  completer : (line) => {
 // function completer(line) {
    const completions = '.h .help .add .delete .edit .list .test .p .play .credits .q .quit'.split(' ');
    const hits = completions.filter((c) => c.startsWith(line));
    // show all completions if none found
    return [hits.length ? hits : completions, line];
  }
});

rl.prompt();

rl.on('line', (line) => {
  
  let args = line.split(" "); 
  let cmd = args[0].toLowerCase().trim();

  switch (cmd) {
    case '':
      rl.prompt();
      break;
    case 'h':
    case 'help':
      cmds.helpCmd(rl);
      break;

    case 'quit':
    case 'q':
      cmds.quitCmd(rl);
      //rl.close();
      break;

    case 'add':
      cmds.addCmd(rl);
      //console.log('Añadir un nuevo quiz.');
      break;

    case 'list':
      cmds.listCmd(rl);
      //console.log('Listar todos los quizzes existentes.');
      break;

    case 'show':
      cmds.showCmd(rl, args[1]);
      //console.log('Mostrar el quiz indicado.');
      break;

    case 'test':
      cmds.testCmd(rl, args[1]);
      //console.log('Probar el quiz indicado.');
      break;

    case 'play':
    case 'p':
      cmds.playCmd(rl);
      //console.log('Jugar.');
      break;
            
    case 'delete':
      cmds.deleteCmd(rl, args[1]);
      //console.log('Borrar el quiz indicado.');
      break;

    case 'edit':
      cmds.editCmd(rl, args[1]);
      //console.log('Editar el quiz indicado.');
      break;

    case 'credits':
      cmds.creditsCmd(rl);
      //console.log('Autor de la práctica:');
      //console.log('Miguel Hernández');
      break;

    default:
      console.log(`Comando desconocido: '${colorize(cmd,'red')}'`);
      console.log(`Use ${colorize('help','green')} para ver todos los comandos disponibles.`);
      rl.prompt();
      break;
  }
})
.on('close', () => {
  log('Adios');
  process.exit(0);
});






