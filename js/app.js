$(document).ready(
  function(){
    animacionTitulo();
    generarTablero();
    mostrarTablero();
    verificarTablero(false);
  }// end ready
);


tablero = [];
puntaje = 0;
function animacionTitulo(){
  var interval = null;
  var matchtitle = $(".main-titulo");
  function toogleTitle(color){
    matchtitle.css("color",color)
    color = (color === "#DCFF0E") ? "#DDD" :"#DCFF0E";
    interval=setInterval(function(){clearInterval(interval);toogleTitle(color);}, 1000);
  }
  toogleTitle('#DDD')
}

function generarTablero(){
  tablero = [];
  for (var i = 0; i<7; i++){
    var row = [];
    for (var j = 0; j<7; j++){
        row.push(Math.ceil(Math.random() * 4));
    }
    tablero.push(row);
  }
}


function verificarTablero(conPuntaje){
  hay3onRow(
    function(){},
    function(todelete){
      removerDulces(todelete, conPuntaje, function(){
        verificarTablero(conPuntaje);
      });
    });
}
function hay3onRow(noElementHandler, hasElementsHandler){
  //validación de tres en la misma linea
  var contador  = 0;
  var anterior = 0;
  var posiciones = [];
  var todasPosiciones = [];
  //verificación horizontal
  for(var i=0; i<7; i++){
    contador = 0;
    anterior = 0;
    posiciones = [];
    for ( var j = 0; j<7; j++){
      if(anterior == tablero[i][j]){
        contador ++;
        posiciones.push([i,j]);
      }else{
        if (contador >= 2) {
          todasPosiciones = todasPosiciones.concat(posiciones);
        }
        contador = 0;
        anterior = tablero[i][j];
        posiciones = [[i,j]];
      }
    }
  }
  if (contador >= 2) {
    todasPosiciones = todasPosiciones.concat(posiciones);
  }
  //verificación vertical
  for (var i = 0; i < 7; i++) {
    contador = 0;
    anterior = 0;
    posiciones = [];
    for (var j = 0; j < 7; j++) {
      if (anterior == tablero[j][i]) {
        contador++;
        posiciones.push([j, i]);
      } else {
        if (contador >= 2) {
          todasPosiciones = todasPosiciones.concat(posiciones);
        }
        contador = 0;
        anterior = tablero[j][i];
        posiciones = [[j, i]];
      }
    }
  }
  if (contador >= 2) {
    todasPosiciones = todasPosiciones.concat(posiciones);
  }
  // Curar las posiciones
  var anteriores = [-1,-1];
  todasPosiciones = todasPosiciones.sort(function(a,b){
    if (a[0] === b[0] && a[1] === b[1]) return 0;
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    if (a[0] === b[0] && a[1] < b[1] ) return -1;
    if (a[0] === b[0] && a[1] > b[1]) return 1;
  });
  todasPosiciones = todasPosiciones.filter(function(pos, i){
      if(!(pos[0]===anteriores[0] && pos[1]===anteriores[1])){
        anteriores = pos;
        return true;
      }
      return false;
  });
  if(todasPosiciones.length > 0){
      hasElementsHandler(todasPosiciones);
  }else{
      noElementHandler();
  }
}


function mostrarTablero(){
  for(var i=0; i<7; i++){
    for(var j=0; j<7; j++){
      var dulce =  $('<img class="elemento" data-id="'+i+","+j+'" src="image/' + tablero[i][j] + '.png"/>');
      $(".col-" + (j+1)).append(dulce);
    }
  }
}


function removerDulces(posiciones, marcarPuntaje, onComplete){
  var idString  = posiciones.map(function(value, i){
    return ".col-" + (value[1]+1) + " img:nth-child(" + (value[0]+ 1) + ")";
  }).join(', ');

  //animando los elementos
  $(idString)
    .fadeIn(500)
    .fadeOut(500)
    .fadeIn(500)
    .fadeOut(500)
    .fadeIn(500)
    .fadeOut(500)
    .fadeIn(500)
    .animate({height:"0px","width":"0px","opacity":"0"}, 500, function(){
      $(this).remove();
      corregirTablero(posiciones, onComplete);
    });
}

var dulces = []

function corregirTablero(posiciones, onComplete){
  if($(".elemento:animated").length ) return;
  for (var i = 0; i < posiciones.length; i++) {
    for (var k = posiciones[i][0]; k > 0; k--) {
      tablero[k][posiciones[i][1]] = tablero[k - 1][posiciones[i][1]];
    }
    tablero[0][posiciones[i][1]] = Math.ceil(Math.random() * 4);
    var dulce = $('<img class="elemento" data-id="n6,' + posiciones[i][1]
      +'" src="image/' + tablero[0][posiciones[i][1]] + '.png" />');
    $(".col-" + (posiciones[i][1] + 1))
      .css("transition", "top 1s linear")
      .css("position","relative")
      .prepend(dulce);

    dulce.css("top","-=96")
      .css("transition","top 1s linear")
      .css("position","absolute")

  }
  var dint = setInterval(function(){clearInterval(dint);animateDulces(onComplete)},500);
}

function animateDulces(onComplete){
  $('.elemento[style~="top"]').css({ "position": "initial", "top": "initial" });
  onComplete();
}
