const {models} = require('./model');
const{log, biglog, errorlog, colorize} = require("./out");
const Sequelize = require('sequelize');
/**
*Muestra la ayuda.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.helpCmd = rl =>{
    log("Commandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
  };

/**
*Lista todos los quizzes existentes en el modelo
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.listCmd = rl => {
//  log('Listar todos los quizzes existentes.','red');
 	models.quiz.findAll()
  .then(quizzes=> {
    quizzes.forEach(quiz=> {
      log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
    })
  })
  .catch(error => {
    errorlog(error.message);
  })
  .then(()=>{
    rl.prompt();
  });
};
  //con la biblioteca Blueberrys
  //models.quiz.findAll()
  //.each(quiz => {
  //  log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
  // })
  // .catch(error => {
  //    errorlog(error.message);
  // })
  //.then(()=>{
  //  rl.prompt();
  //});
    


/**
*Esta funcion devuelve una promesa que:
* -Valida que se ha introducido un valor para el parametro.
* -Convierte el parametro en un numero entero.
*Si todo va bien, la promesa se satisface y devuelve el valor de id a usar.
*
*@param id Parametro con el índice a validar.
*/
const validateId = id => {
  return new Sequelize.Promise((resolve, reject) =>{
    if(typeof id === "undefined"){
      reject(new Error(`Falta el parametro <id>.`));
    }else{
      id = parseInt(id);
      if(Number.isNaN(id)){
        reject(new Error(`El valor del parámetro <id> no es un número`))
      }else{
        resolve(id);
      }
    }
  });
};   


/**
*Muestra el quiz indicado en el parámetro: la pregunta y la respuesta 
*
*@param id Clave del quiz a mostrar.
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.showCmd = (rl, id) => {
  //log('Mostrar el quiz indicado.','red');
 validateId(id)
 .then(id => models.quiz.findById(id))
 .then(quiz=> {
  if(!quiz) {
    throw new Error(`No existe un quiz asociado al id=${id}.`);
  }
  log(`[${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
 })
 .catch(error => {
    errorlog(error.message);
  })
 .then(()=>{
  rl.prompt();
 });
};

/*
*Esta función devuelve una promesa cuando se cumple, proporciona el texto introducido
*Entonces la llamada a then que hay que hacer la promesa devuelta sera: .then(answer =>{..})
*Tambien colorea en rojo el texto de la pregunta, elimina espacios al principio y final
*
*@param rl Objeto readline usado para implementar el CLI.
*@param text Pregunta que hay que hacerle al usuario.
*/
const makeQuestion = (rl,text) => {
  return new Sequelize.Promise ((resolve, reject) =>{
    rl.question(colorize(text + '? ','red'), answer => {
      resolve(answer.trim());
      //trim() quita espacios en blanco por delante y por detras
    });
  });
};

/**
*Añade un nuevo quiz al módelo.
*Pregunta interactivamente por la pregunta y por la respuesta.
*
*Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
*El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
*es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda 
*llamada a rl.question.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.addCmd = rl => {
  //log('Añadir un nuevo quiz','red');
  makeQuestion(rl, 'Introduzca una pregunta: ')
  .then(q => {
    return makeQuestion(rl, 'Introduzca la respuesta')
    .then(a=>{
      return {question: q, answer: a};
    });
  })
  .then(quiz => {
    return models.quiz.create(quiz);
  })
  .then((quiz)=>{
    log(`${colorize('Se ha añadido','magenta')}: ${quiz.question } ${colorize('=>','magenta')} ${quiz.answer}`);
  })
  .catch(Sequelize.ValidationError, error => {
    errorlog('El quiz es erroneo:');
    error.errors.forEach(({message}) => errorlog(message));
  })
  .catch(error=>{
    errorlog(error.message);
  })
  .then(() =>{
    rl.prompt();
  });
};
  
/**
*Borra el quiz del modelo.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl, id) => {
  //log('Borrar el quiz indicado.','red');
  validateId(id)
  .then(id => models.quiz.destroy({where:{id}}))
  .catch(error => {
    errorlog(error.message);
  })
  .then(()=>{
    rl.prompt();
  });
};
  

/**
*Edita un quiz del modelo.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (rl, id) => {
  //log('Editar el quiz indicado.','red');
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz=>{
    if(!quiz){
    throw new Error(`No existe un quiz asociado al id=${id}.`);
    } 
  })
  process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
  return makeQuestion(rl, 'Introduzca la pregunta: ')
  .then(q => {
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
    return makeQuestion(rl, 'Introduzca la respuesta: ')
    .then(a=>{
      quiz.question = q;
      quiz.answer = a;
      return quiz;
    });
  })
.then(quiz=>{
  return quiz.save();
})
.then(quiz => {
  log(`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error =>{
  errorlog('El quiz es erroneo:');
  error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
  errorlog(error.message);
})
.then(() => {
  rl.prompt();
});
};
/**
* Prueba el quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
*@param id Clave del quiz a probar.
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.testCmd = (rl, id) => {
 validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if(!quiz){
    throw new Error(`No existe un quiz asociado al id=${id}.`);
    } 
    //log(`[${colorize(quiz.question + '? ','red')}]`);      
    process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
    // return makeQuestion(rl, colorize(quiz.question + '? ','red'))
    return makeQuestion(rl, colorize(quiz.question + '? '))   
    .then(a=>{
      let a1 = a.split(" "); 
      let a1s = a1[0].toLowerCase().trim();
      let a2 = quiz.answer.split(" "); 
      let a2s = a2[0].toLowerCase().trim();
      if(a1s === a2s){
        log('Su respuesta es correcta.');
        biglog('CORRECTO','green');
      }else{
        log('Su respuesta es incorrecta.');
        biglog('INCORRECTO','red');
      };
      return quiz;
    })
    /*.then(quiz=>{
    })*/
  })
.catch(Sequelize.ValidationError, error =>{
  errorlog('Erroneo');
  error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
  errorlog(error.message);
})
.then(() => {
  rl.prompt();
});
};

//validar id
//sacar la pregunta
//comprobar si esta bien o mal

/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
*Se gana si se contesta a todos satisfactoriamente.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.playCmd = rl => {


 let score=0;
  let toBePlayed = [];
  //si se puede saber cuanto mide BBDD se hace un for, si no un while y salir cuando no sea un quiz
  models.quiz.findAll({raw:true})
  .then(quizzes=>{
    toBePlayed=quizzes
  })
    
  let auxiliar= toBePlayed.length
  
  const playOne = () => {
  return Promise.resolve()
  .then(()=>{
    if(toBePlayed.length<=0){
      console.log("No hay nada más que preguntar");
      console.log('Fin del juego. Aciertos:' + score);
      console.log(score,'magenta');
      return;
    }
    let id = Math.floor(Math.random() * auxiliar);
    let quiz = toBePlayed[id];
    toBePlayed.splice(id,1);    
  
    return makeQuestion(rl, quiz.question)
    .then(a=>{
      let a1 = a.split(" "); 
      let a1s = a1[0].toLowerCase().trim();
      let a2 = quiz.answer.split(" "); 
      let a2s = a2[0].toLowerCase().trim();
      if(a1s === a2s){
        score++;
        console.log('CORRECTO - LLeva ' + score + ' aciertos.');
        playOne();
      }else{
        console.log('INCORRECTO.');
        console.log('Fin del juego. Aciertos:' + score);
        console.log(score,'magenta');
        //rl.prompt();
    };  
    })
  })
  }
  models.quiz.findAll({raw:true})
  .then(quizzes=>{
    toBePlayed=quizzes
  })
  .then(()=>{
    return playOne();
  })
  .catch(e=>{
    console.log("Error: " + e);
  })
  .then(()=>{
    console.log(score);
    rl.prompt();
    })
  
};

/**
* Muestra los nombres de los autores de la práctica.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {

  //return new Promise...
  //.then((){

  //})
  return new Sequelize.Promise ((resolve, reject) =>{
  log('Autor de la práctica:');
  log('Miguel Hernández','green');
  rl.prompt();
  });
};
/**
* Terminar el programa.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
  rl.close();
};