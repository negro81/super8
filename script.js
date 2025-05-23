// ======== CLAVES ========
const CLAVES_VALIDAS = ['ABC123', 'XYZ789', 'CLAVE1', 'SUPER8', 'UNICA5'];
let claveUsada = localStorage.getItem('claveUsada');

// ======== INICIO ========
window.addEventListener('DOMContentLoaded', () => {
  if (claveUsada) {
    document.getElementById('clavePantalla').classList.remove('activa');
    mostrarPantalla(1);
    cargarNombres();
  } else {
    document.getElementById('clavePantalla').classList.add('activa');
  }
});

// ======== VALIDAR CLAVE ========
function validarClave() {
  const input = document.getElementById('claveInput').value.trim();
  const error = document.getElementById('claveError');
  if (CLAVES_VALIDAS.includes(input)) {
    localStorage.setItem('claveUsada', input);
    claveUsada = input;
    document.getElementById('clavePantalla').classList.remove('activa');
    mostrarPantalla(1);
    cargarNombres();
  } else {
    error.textContent = 'Clave inválida.';
  }
}

// ======== NOMBRES ========
let nombres = JSON.parse(localStorage.getItem('nombres')) || [];

const nombreInput = document.getElementById('nombreInput');
nombreInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') agregarNombre();
});

function agregarNombre() {
  const valor = nombreInput.value.trim();
  if (!valor || nombres.length >= 8) return;
  const nombre = valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
  nombres.push(nombre);
  localStorage.setItem('nombres', JSON.stringify(nombres));
  nombreInput.value = '';
  actualizarLista();
}

function actualizarLista() {
  const lista = document.getElementById('listaNombres');
  lista.innerHTML = '';
  nombres.forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1} - ${n}`;
    lista.appendChild(li);
  });
  nombreInput.disabled = nombres.length >= 8;
}

function cargarNombres() {
  nombres = JSON.parse(localStorage.getItem('nombres')) || [];
  actualizarLista();
}

// ======== PANTALLAS ========
function mostrarPantalla(n) {
  ['pantalla1','pantalla2','pantalla3','pantalla4'].forEach(id => {
    document.getElementById(id).classList.remove('activa');
  });
  document.getElementById('pantalla' + n).classList.add('activa');
  if (n === 2) crearTablaPartidos();
  if (n === 3) calcularPosiciones();
  if (n === 4) mostrarCampeon();
}

function irAPantalla(n) {
  if (n === 2 && nombres.length < 8) {
    alert('Ingresá los 8 nombres primero.');
    return;
  }
  mostrarPantalla(n);
}

// ======== PARTIDOS ========
const partidos = [
  [7,6,5,2],[1,0,3,4],[6,3,7,4],
  [2,1,5,0],[7,2,4,1],[3,0,6,5],
  [4,6,1,5],[0,2,3,7],[0,4,2,6],
  [5,7,1,3],[2,3,6,1],[4,5,7,0],
  [3,5,4,2],[1,7,0,6]
];

let resultados = JSON.parse(localStorage.getItem('resultados')) 
                  || Array(partidos.length).fill(["",""]);

function crearTablaPartidos() {
  const cont = document.getElementById('tablaPartidos');
  cont.innerHTML = '';
  partidos.forEach((p,i) => {
    const div = document.createElement('div');
    div.className = 'fila-partido';
    // texto centrado
    const texto = document.createElement('div');
    texto.className = 'texto-partido';
    texto.textContent = `P${i+1}: ${nombres[p[0]]} y ${nombres[p[1]]} vs ${nombres[p[2]]} y ${nombres[p[3]]}`;
    // inputs a la derecha
    const inpCont = document.createElement('div');
    inpCont.className = 'inputs-partido';
    const in1 = document.createElement('input');
    const in2 = document.createElement('input');
    [in1,in2].forEach(input => {
      input.type = 'number';
      input.min = 0;
      input.max = 4;
      input.className = 'resultado';
    });
    in1.value = resultados[i][0];
    in2.value = resultados[i][1];
    in1.onchange = () => guardarResultado(i, in1.value, in2.value);
    in2.onchange = () => guardarResultado(i, in1.value, in2.value);
    inpCont.append(in1,in2);
    div.append(texto, inpCont);
    cont.appendChild(div);
  });
}

// ======== GUARDAR RESULTADOS ========
function guardarResultado(idx, r1, r2) {
  resultados[idx] = [r1 || "0", r2 || "0"];
  localStorage.setItem('resultados', JSON.stringify(resultados));
}

// ======== POSICIONES ========
function calcularPosiciones() {
  const tabla = {};
  nombres.forEach(n => tabla[n] = {p:0, d:0});
  partidos.forEach((p,i) => {
    const r = resultados[i].map(x=>parseInt(x)||0);
    const [a,b,c,d] = p.map(j=>nombres[j]);
    if (r[0] > r[1]) { tabla[a].p++; tabla[b].p++; }
    else if (r[1] > r[0]) { tabla[c].p++; tabla[d].p++; }
    tabla[a].d += r[0]-r[1];
    tabla[b].d += r[0]-r[1];
    tabla[c].d += r[1]-r[0];
    tabla[d].d += r[1]-r[0];
  });
  const orden = Object.entries(tabla)
    .sort(([,x],[,y])=> y.p - x.p || y.d - x.d);
  const cont = document.getElementById('tablaPosiciones');
  let html = `<table>
    <tr><th>Jugador</th><th>Puntos</th><th>Diferencia</th></tr>`;
  orden.forEach(([nom,st],i) => {
    html += `<tr${i===0?' class="primero"':''}>
      <td>${nom}</td><td>${st.p}</td><td>${st.d}</td>
    </tr>`;
  });
  html += `</table>`;
  cont.innerHTML = html;
}

// ======== CAMPEÓN ========
function mostrarCampeon() {
  const ganador = document.querySelector('#tablaPosiciones tr.primero td').textContent;
  document.getElementById('campeonTexto').textContent = `🏆 El campeón es ${ganador} 🏆`;
}

// ======== RESET ========
function resetearTodo() {
  // Guardar la clave usada
  const clave = localStorage.getItem('claveUsada');
  // Borrar solo datos de torneo
  localStorage.removeItem('nombres');
  localStorage.removeItem('resultados');
  localStorage.removeItem('tablaOrden');
  // Restaurar la clave
  if (clave) localStorage.setItem('claveUsada', clave);
  // Recargar para reiniciar pantallas y datos
  location.reload();
}
