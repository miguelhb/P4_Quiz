const model = require('./model');
const{log, biglog, errorlog, colorize} = require("./out");

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
 	model.getAll().forEach((quiz, id)=>{
 		log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
  });
  rl.prompt();
};
/**
*Muestra el quiz indicado en el parámetro: la pregunta y la respuesta 
*
*@param id Clave del quiz a mostrar.
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.showCmd = (rl, id) => {
  //log('Mostrar el quiz indicado.','red');
 if(typeof id === "undefined"){
 	errorlog(`Falta el parámetro id.`);
 }else{
 	try{
 		const quiz = model.getByIndex(id);
 		log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
 	}catch(error){
 		errorlog(error.message);
 	}
 }  
 rl.prompt();
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
  rl.question(colorize('Introduzca una pregunta: ','red'),question =>{
  	rl.question(colorize('Introduzca una respuesta ','red'),answer =>{

  		model.add(question,answer);
  		log(`${colorize('Se ha añadido','magenta')}: ${question } ${colorize('=>','magenta')} ${answer}`);
  		rl.prompt();
  	});
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
  if(typeof id === "undefined"){
 	errorlog(`Falta el parámetro id.`);
 }else{
 	try{
 		model.deleteByIndex(id);		
 	}catch(error){
 		errorlog(error.message);
 	}
 }  
 rl.prompt();
  rl.prompt();
}

/**
*Edita un quiz del modelo.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (rl, id) => {
  //log('Editar el quiz indicado.','red');
  if (typeof id === "undefined"){
  	errorlog(`Falta el parámetro id.`);
  	rl.prompt();
  }else{
  	try{
  		const quiz = model.getByIndex(id);

  		process.stdout.isTTY && setTimeout(() =>{rl.write(quiz.question)},0);

  		rl.question(colorize('Introduzca una pregunta: ','red'),question=>{
  			
  			process.stdout.isTTY && setTimeout(() =>{rl.write(quiz.answer)},0);

  			rl.question(colorize('Introduzca una respuesta ', 'red'), answer=>{
  				model.update(id,question,answer);
  				log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
  				rl.prompt();
  			});
  		});
  	}catch (error){
  		errorlog(error.message);
  		rl.prompt();
  	}
  }
};

/**
* Prueba el quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
*@param id Clave del quiz a probar.
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.testCmd = (rl, id) => {
  //log('Probar el quiz indicado.','red');
  //rl.prompt();
  if (typeof id === "undefined"){
  	errorlog(`Falta el parámetro id.`);
  	rl.prompt();
  }else{
  	try{
  	 	const quiz = model.getByIndex(id);
  	 	rl.question(colorize(quiz.question + '? ','red'), resp=>{
			let args = resp.split(" "); 
			let cmd = args[0].toLowerCase().trim();
			let args1 = quiz.answer.split(" "); 
			let cmd1 = args1[0].toLowerCase().trim();
			
			if(cmd === cmd1){
				log('Su respuesta es correcta.');
				biglog('CORRECTO','green');
				rl.prompt();
			}else{
				log('Su respuesta es incorrecta.');
				biglog('INCORRECTO','red');
				rl.prompt();
			};
			//rl.prompt();
  	 	});
  	}catch (error){
  		errorlog(error.message);
  		rl.prompt();
  	}
};

}
/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
*Se gana si se contesta a todos satisfactoriamente.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.playCmd = rl => {
  //log('Jugar.','red');
  //rl.prompt();
  let score=0;
  let toBeResolver = [];
  for(meter=0; meter<model.count(); meter++){
  	toBeResolver[meter]=model.getByIndex(meter);
  	//log(toBeResolver[meter]);
  }

  const playOne = () => {

  if(toBeResolver.length===0){
  	log('No hay nada más que preguntar.');
  	log('Fin del examen. Aciertos:');
  	biglog(score, 'magenta');
    rl.prompt();
  }else{
  	let auxiliar= toBeResolver.length-1
  	let id = Math.floor(Math.random() * auxiliar);
  	//let auxiliar2=parseInt(id);
  	//toBeResolver.splice(id,1);
  	//model.save;
  	let quiz = toBeResolver[id];
  	toBeResolver.splice(id,1);
  	rl.question(colorize(quiz.question + '? ','red'), resp=>{
		let args = resp.split(" "); 
		let cmd = args[0].toLowerCase().trim();
		let args1 = quiz.answer.split(" "); 
		let cmd1 = args1[0].toLowerCase().trim();
		if(cmd === cmd1){
        score++;
  			log('CORRECTO - LLeva ' + score + ' aciertos.');
   			playOne();	
  		}else{
  			log('INCORRECTO.');
        log('Fin del juego. Aciertos:');
  			biglog(score,'magenta');
        rl.prompt();
  		}
  	});
	};
	}
	playOne();
};

/**
* Muestra los nombres de los autores de la práctica.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {
  log('Autor de la práctica:');
  log('Miguel Hernández','green');
  rl.prompt();
};
/**
* Terminar el programa.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
  rl.close();
};