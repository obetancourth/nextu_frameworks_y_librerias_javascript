$(document).ready(
  function(){
    animacionTitulo();
    init();
    $(".btn-reinicio").on('click', function(e){
        if ($(this).text() === "Reiniciar"){
          window.location.reload(true);
        }else{
          triggerPrimerMovimiento();
        }
    });
  }// end ready
);


var tablero = [];
var puntaje = 0;
var currentOffset = {};
var dulce1 = null, dulce2 = null;
var movimientos = 0;
var primerMovimiento = false;

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

function init(){
  generarTablero();
  mostrarTablero();
  verificarTablero(false);
  movimientos = 0;
  primerMovimiento= false;
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
    function(){
      establecerEventos()
    },
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
    if (contador >= 2) {
      todasPosiciones = todasPosiciones.concat(posiciones);
    }
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
    if (contador >= 2) {
      todasPosiciones = todasPosiciones.concat(posiciones);
    }
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
      var dulce =  $('<img class="elemento" src="image/' + tablero[i][j] + '.png"/>');
      $(".col-" + (j+1)).append(dulce);
    }
  }
}


function removerDulces(posiciones, marcarPuntaje, onComplete){
  var idString  = posiciones.map(function(value, i){
    return ".col-" + (value[1]+1) + " img:nth-child(" + (value[0]+ 1) + ")";
  }).join(', ');

  if (marcarPuntaje) {
    puntaje += posiciones.length;
    $("#score-text").text(puntaje);
  }
  //animando los elementos
  $(idString)
    .fadeIn()
    .fadeOut()
    .fadeIn()
    .fadeOut()
    .fadeIn()
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
    var dulce = $('<img class="elemento" src="image/' + tablero[0][posiciones[i][1]] + '.png" />');
    $(".col-" + (posiciones[i][1] + 1))
      .css("transition", "top 0.5s linear")
      .css("position","relative")
      .prepend(dulce);

    dulce.css("top","-=96")
      .css("transition","top 0.5s linear")
      .css("position","absolute")

  }
  var dint = setInterval(function(){
    clearInterval(dint);
    animateDulces(onComplete)},
    500);
}

function animateDulces(onComplete){
  $('.elemento[style~="top"]').css({ "position": "initial", "top": "initial" });
  onComplete();
}



function establecerEventos(){
  $(".elemento").not(".ui-draggable")
    //.css("transition", "all 0.2s linear")
    .draggable(
      { "containment": $(".panel-tablero"),
        "helper": "clone",
        "revert": true,
        "revertDuration": 200
      }
    )
    .on('dragstart', function(e, ui){
      $(ui.helper).css({"z-index":"9999","transform":"scale(0.8, 0.8)"});
      currentOffset = ui.position;
      var dd = $(e.target);
      dulce1 = [dd.parent().index(), dd.index()];
    })
    .on('drag', function(e, ui){
      if(currentOffset.left -130 > ui.position.left ){
        ui.position.left = currentOffset.left - 130;
      } else if (currentOffset.left + 130 < ui.position.left ){
        ui.position.left = currentOffset.left + 130;
      }
      if (currentOffset.top - 100 > ui.position.top) {
        ui.position.top = currentOffset.top - 100;
      } else if (currentOffset.top + 100 < ui.position.top) {
        ui.position.top = currentOffset.top + 100;
      }
    })
    .droppable(
      {
        "tolerance":"pointer",
      }
    )
    .on("drop",function(e,ui){
      $(ui.helper).hide;
      var dd = $(e.target);
      dulce2 = [dd.parent().index(), dd.index()];
      if (dulce1[0] === dulce2[0] || dulce1[1] === dulce2[1]){
        swapDulces(dulce1, dulce2);
      }
    });
    ;
}

function swapDulces() {
    //modificando tablero
    var t = tablero[dulce1[1]][dulce1[0]];
    tablero[dulce1[1]][dulce1[0]] = tablero[dulce2[1]][dulce2[0]];
    tablero[dulce2[1]][dulce2[0]] = t;
    //modificando ui
    var dulce1S = $(".col-" + (dulce1[0] + 1) + " img:nth-child(" + (dulce1[1]+1) + ")"),
        dulce2S = $(".col-" + (dulce2[0] + 1) + " img:nth-child(" + (dulce2[1]+1) + ")");
    var dc1 = dulce1S.clone();
    var dc2 = dulce2S.clone();

    dc1.removeClass("ui-draggable ui-draggable-handle ui-droppable");
    dc2.removeClass("ui-draggable ui-draggable-handle ui-droppable");

    dulce1S.replaceWith(dc2);
    dulce2S.replaceWith(dc1);

    movimientos ++;
    $("#movimientos-text").text(movimientos);
    if(!primerMovimiento) {
      triggerPrimerMovimiento();
    }
    verificarTablero(true);
}

function showFinalScore(){
  $("#timer").timer("remove");
  $(".panel-score").animate({ width: "100%" }, 1000);
  $(".panel-tablero").animate(
    { height: 0, width: 0, opacity: 0 },
    1000,
    function () { $(this).hide() });
}


function triggerPrimerMovimiento(){
  primerMovimiento = true;
  $(".btn-reinicio").text("Reiniciar");
  $("#timer").timer({
    countdown: true,
    duration: '2m',
    callback: showFinalScore
  })
}
