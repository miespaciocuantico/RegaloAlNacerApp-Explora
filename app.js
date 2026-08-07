/**
 * REGALO AL NACER — app.js
 * Maneja navegación entre pantallas, formularios, persistencia en
 * localStorage, y el renderizado de los reportes / resumen
 * usando los cálculos de core.js
 *
 * ⚠️ IMPORTANTE PARA REPLIT / BACKEND:
 * La función generarInterpretacionIA() de más abajo es un STUB (texto de
 * ejemplo) para poder ver el diseño funcionando sin backend.
 * En producción, esta función debe llamar a un endpoint propio del
 * servidor (NO directo desde el navegador) que a su vez llame a la API
 * de Claude/OpenAI con la API key guardada del lado del servidor.
 * Nunca expongas la API key en este archivo del navegador.
 *
 * PERSISTENCIA: los datos del bebé se guardan en localStorage bajo la
 * llave "regaloAlNacer_datosBebe", para que al reabrir la app en el
 * mismo dispositivo el reporte siga disponible sin volver a capturarlo.
 */

const LLAVE_STORAGE = 'regaloAlNacer_datosBebe';

let datosBebe = null;       // resultado de Iniciar (persistido en localStorage)
let datosCronos = null;     // resultado de Cronos (2 fechas, no se persiste)

// Símbolos zodiacales en modo "texto" (U+FE0E), no emoji a color,
// para que se vean como símbolo tipográfico y no como emoji de caricatura.
const SIGNO_EMOJI = {
  'Aries': '♈\uFE0E', 'Tauro': '♉\uFE0E', 'Géminis': '♊\uFE0E', 'Cáncer': '♋\uFE0E',
  'Leo': '♌\uFE0E', 'Virgo': '♍\uFE0E', 'Libra': '♎\uFE0E', 'Escorpio': '♏\uFE0E',
  'Sagitario': '♐\uFE0E', 'Capricornio': '♑\uFE0E', 'Acuario': '♒\uFE0E', 'Piscis': '♓\uFE0E',
};

function obtenerAstrologiaSigno(signoSolar) {
  return (window.BIBLIOTECA_ASTROLOGIA || {})[signoSolar] || null;
}

function circuloColorHex(hex) {
  if (!hex) return '';
  return `<span class="circulo-color-hex" style="--color-signo:${hex}" aria-hidden="true"></span>`;
}


// ---------------------------------------------------------------
// ICONOS DE LÍNEA (reemplazan los emojis, en los colores de la marca)
// ---------------------------------------------------------------
const ICONOS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>`,
  fecha: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/><circle cx="8.3" cy="14.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="14.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="14.5" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  cronos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12"/><path d="M7 3c0 4 4 6 5 8-1 2-5 4-5 8M17 3c0 4-4 6-5 8 1 2 5 4 5 8"/></svg>`,
  nombre: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-6 0-13 3-15 12-0.3 1.3 1 2.3 2.3 2 9-2 12-9 12-14Z"/><path d="M9.5 14.5 18 6"/><path d="M4 20l2.5-2.5"/></svg>`,
  resumen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12.3h8M8 15.6h5"/></svg>`,
  destello: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4.2M12 16.8V21M3 12h4.2M16.8 12H21M5.8 5.8l3 3M15.2 15.2l3 3M18.2 5.8l-3 3M8.8 15.2l-3 3"/></svg>`,
  estrella: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5l2.4 6.3L21 11l-6.6 2.2L12 21.5l-2.4-8.3L3 11l6.6-2.2Z"/></svg>`,
  corazon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20.3s-7.3-4.6-9.6-9.2C1 8 2 4.8 5.1 4.1 7.4 3.6 9.8 4.8 12 7.5c2.2-2.7 4.6-3.9 6.9-3.4 3.1 0.7 4.1 3.9 2.7 7-2.3 4.6-9.6 9.2-9.6 9.2Z"/></svg>`,
  brote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9.5"/><path d="M12 12c0-4.2-3.2-6.3-7.3-6.3 0 4.2 3.1 6.3 7.3 6.3Z"/><path d="M12 12.5c0-3.6 2.6-5.7 6.3-5.7 0 3.6-2.7 5.7-6.3 5.7Z"/></svg>`,
  manoCorazon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 19.5s-6.4-4-8.4-8.1C2.3 8.4 3.2 5.6 5.9 5c2-0.4 4 0.6 6.1 2.9 2.1-2.3 4.1-3.3 6.1-2.9 2.7 0.6 3.6 3.4 2.3 6.4-2 4.1-8.4 8.1-8.4 8.1Z"/></svg>`,
};

function aplicarIconos(raiz = document) {
  raiz.querySelectorAll('[data-icono]').forEach(el => {
    const clave = el.dataset.icono;
    if (ICONOS[clave]) el.innerHTML = ICONOS[clave];
  });
}

// ---------------------------------------------------------------
// PERSISTENCIA (localStorage)
// ---------------------------------------------------------------
function guardarDatosBebe() {
  try {
    localStorage.setItem(LLAVE_STORAGE, JSON.stringify(datosBebe));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

function cargarDatosBebe() {
  try {
    const guardado = localStorage.getItem(LLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : null;
  } catch (e) {
    console.warn('No se pudo leer de localStorage:', e);
    return null;
  }
}

// Restaura en el formulario de Iniciar los últimos datos guardados.
// En la versión Exploración solo se conservan nombre, apellidos y fecha.
function cargarFormularioDesdeDatos(datos) {
  if (!datos) return;

  const asignarValor = (id, valor = '') => {
    const campo = document.getElementById(id);
    if (campo) campo.value = valor ?? '';
  };

  const nombreGuardado = datos.nombreCapturado || datos.nombrePila || '';
  let apellidosGuardados = datos.apellidosCapturados || '';

  // Compatibilidad con datos antiguos de la versión completa.
  if (!apellidosGuardados && datos.nombreCompleto && nombreGuardado) {
    const nombreCompleto = String(datos.nombreCompleto).trim();
    const nombreInicial = String(nombreGuardado).trim();
    if (nombreCompleto.toLowerCase().startsWith(nombreInicial.toLowerCase())) {
      apellidosGuardados = nombreCompleto.slice(nombreInicial.length).trim();
    }
  }

  asignarValor('iniciar-nombre', nombreGuardado);
  asignarValor('iniciar-apellidos', apellidosGuardados);
  asignarValor('iniciar-fecha', datos.fechaNacimiento || '');
}

// ---------------------------------------------------------------
// NAVEGACIÓN
// ---------------------------------------------------------------
function irAPantalla(nombre) {
  document.querySelectorAll('.pantalla, .pantalla-cargando').forEach(el => el.classList.add('oculto'));
  const destino = document.getElementById(`pantalla-${nombre}`);
  if (destino) destino.classList.remove('oculto');

  document.querySelectorAll('.nav-boton').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.nav === nombre);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function mostrarCargando(mensaje) {
  document.querySelectorAll('.pantalla').forEach(el => el.classList.add('oculto'));
  const pantallaCarga = document.getElementById('pantalla-cargando');
  document.getElementById('texto-cargando').textContent = mensaje;
  pantallaCarga.classList.remove('oculto');
}

// ---------------------------------------------------------------
// VALIDACIÓN PERSONALIZADA (mensajes en español, sin depender del navegador)
// ---------------------------------------------------------------
function mostrarErrorFormulario(idError) {
  const el = document.getElementById(idError);
  if (el) el.classList.remove('oculto');
}
function ocultarErrorFormulario(idError) {
  const el = document.getElementById(idError);
  if (el) el.classList.add('oculto');
}


// ---------------------------------------------------------------
// FORMULARIO: INICIAR
// ---------------------------------------------------------------
function manejarEnvioIniciar(evento) {
  evento.preventDefault();
  ocultarErrorFormulario('error-iniciar');

  const nombre = document.getElementById('iniciar-nombre').value.trim();
  const apellidos = document.getElementById('iniciar-apellidos').value.trim();
  const fecha = document.getElementById('iniciar-fecha').value;

  if (!nombre || !apellidos || !fecha) {
    mostrarErrorFormulario('error-iniciar');
    return false;
  }

  mostrarCargando('Descifrando el Mapa Energético de tu bebé...');

  setTimeout(() => {
    try {
      const calculado = window.NumerologiaCore.calcularReporteBebe(nombre, apellidos, fecha);

      datosBebe = {
        ...calculado,
        nombreCapturado: nombre,
        apellidosCapturados: apellidos,
      };

      guardarDatosBebe();
      renderizarReporteFecha(datosBebe);
      renderizarReporteNombre(datosBebe);
      renderizarResumen(datosBebe);
      irAPantalla('reporte-fecha');
    } catch (error) {
      console.error('Error al generar el Mapa Energético:', error);
      alert('Ocurrió un error generando el Mapa de tu bebé. Inténtalo más tarde; si persiste, envíanos un correo para solucionarlo.');
    }
  }, 1200);

  return false;
}

// ---------------------------------------------------------------
// FORMULARIO: CRONOS
// ---------------------------------------------------------------
function manejarEnvioCronos(evento) {
  evento.preventDefault();
  ocultarErrorFormulario('error-cronos');

  const fechaA = document.getElementById('cronos-fecha-a').value;
  const fechaB = document.getElementById('cronos-fecha-b').value;

  if (!fechaA || !fechaB) {
    mostrarErrorFormulario('error-cronos');
    return false;
  }

  const resultadoA = window.NumerologiaCore.calcularReporteBebe('', '', fechaA);
  const resultadoB = window.NumerologiaCore.calcularReporteBebe('', '', fechaB);
  datosCronos = { resultadoA, resultadoB };

  renderizarCronos(datosCronos);
  return false;
}

function renderizarCronos({ resultadoA, resultadoB }) {
  const contenedor = document.getElementById('resultado-cronos');
  const filas = [
    ['Alma', 'alma'], ['Personalidad', 'personalidad'], ['Regalo', 'regalo'],
    ['Camino de Crecimiento', 'retos'], ['Misión Natal', 'mision'],
  ];

  const columnaHtml = (resultado, etiqueta) => `
    <div class="columna-fecha">
      <h4>Opción ${etiqueta}<br><span class="fecha-grande">${formatearFecha(resultado.fechaNacimiento)}</span></h4>
      <div class="signo-linea"><span class="signo-emoji">${SIGNO_EMOJI[resultado.signoSolar] || ''}</span>${resultado.signoSolar}</div>
      ${filas.map(([label, key]) => `
        <div class="mini-numero"><span>${label}</span><b>${resultado.fecha[key]}</b></div>
      `).join('')}
    </div>
  `;

  contenedor.innerHTML = `
    <div class="comparacion-columnas">
      ${columnaHtml(resultadoA, 'A')}
      ${columnaHtml(resultadoB, 'B')}
    </div>
    <div class="veredicto-cronos">
      ${generarVeredictoCronos(resultadoA, resultadoB)}
    </div>
  `;
}

function obtenerTextoCronos(seccionKey, numero) {
  const biblioteca = window.BIBLIOTECA_FECHA || {};
  const libroNumero = biblioteca[numero];
  const contenido = libroNumero ? libroNumero[seccionKey] : null;

  if (!contenido || !contenido.textoBreveCronos) {
    return 'Información no disponible para esta energía.';
  }

  return contenido.textoBreveCronos;
}

function generarBloqueOpcionCronos(resultado, etiqueta) {
  const aspectos = [
    { label: 'Alma', campo: 'alma', seccion: 'alma' },
    { label: 'Personalidad', campo: 'personalidad', seccion: 'personalidad' },
    { label: 'Regalo', campo: 'regalo', seccion: 'regalo' },
    { label: 'Camino de Crecimiento', campo: 'retos', seccion: 'caminoDeCrecimiento' },
    { label: 'Misión', campo: 'mision', seccion: 'misionNatal' },
  ];

  return `
    <div class="cronos-opcion-detalle">
      <h4>Opción ${etiqueta}</h4>
      ${aspectos.map(aspecto => {
        const numero = resultado.fecha[aspecto.campo];
        const texto = obtenerTextoCronos(aspecto.seccion, numero);

        return `
          <div class="cronos-aspecto">
            <p><strong>${aspecto.label} ${numero}</strong></p>
            <p>${texto}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function generarVariacionesCronos(resultadoA, resultadoB) {
  const aspectos = [
    { label: 'Alma', campo: 'alma' },
    { label: 'Personalidad', campo: 'personalidad' },
    { label: 'Regalo', campo: 'regalo' },
    { label: 'Camino de Crecimiento', campo: 'retos' },
    { label: 'Misión', campo: 'mision' },
  ];

  const variaciones = aspectos.filter(aspecto =>
    resultadoA.fecha[aspecto.campo] !== resultadoB.fecha[aspecto.campo]
  );

  if (!variaciones.length) {
    return `
      <div class="cronos-variaciones">
        <p><strong>No hay variación en el Mapa de Fecha.</strong></p>
        <p>Ambas fechas comparten la misma configuración energética</p>
      </div>
    `;
  }

  return `
    <div class="cronos-variaciones">
      <p><strong>La variación está en:</strong></p>
      <ul>
        ${variaciones.map(aspecto => `
          <li>
            <strong>${aspecto.label}:</strong>
            ${resultadoA.fecha[aspecto.campo]} en la opción A
            y ${resultadoB.fecha[aspecto.campo]} en la opción B.
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function generarVeredictoCronos(resultadoA, resultadoB) {
  return `
    <h3 style="color:var(--dorado); font-family:'Fraunces',serif; font-size:17px; margin-bottom:10px;">¿Cuál energía elegir?</h3>
    <p style="margin-bottom:18px;">Con la que ustedes como papás se sientan más identificados:</p>

    ${generarBloqueOpcionCronos(resultadoA, 'A')}
    ${generarBloqueOpcionCronos(resultadoB, 'B')}
    ${generarVariacionesCronos(resultadoA, resultadoB)}
  `;
}

// ---------------------------------------------------------------
// BIBLIOTECA DE CONTENIDO — REPORTE DE FECHA
// Lee de window.ESTRUCTURA_FECHA (textos fijos, biblioteca/fecha-estructura.js)
// y window.BIBLIOTECA_FECHA[numero] (contenido por número, biblioteca/fecha-N.js).
// Sin llamadas a IA ni backend: todo el texto ya está en esos archivos.
// ---------------------------------------------------------------

const ORDEN_SECCIONES_FECHA = [
  { campo: 'alma', seccion: 'alma' },
  { campo: 'personalidad', seccion: 'personalidad' },
  { campo: 'regalo', seccion: 'regalo' },
  { campo: 'retos', seccion: 'caminoDeCrecimiento' },
  { campo: 'mision', seccion: 'misionNatal' },
];

const SUBSECCIONES_FECHA = {
  alma: [
    ['¿Qué significa este número en el Alma?', 'queSignifica'],
    ['Fortalezas', 'fortalezas'],
    ['Aprendizajes', 'aprendizajes'],
    ['Cómo darle seguridad', 'comoDarleSeguridad'],
    ['Qué necesita emocionalmente', 'queNecesitaEmocionalmente'],
  ],
  personalidad: [
    ['¿Qué significa este número en la Personalidad?', 'queSignifica'],
    ['Cualidades', 'cualidades'],
    ['Aprendizajes', 'aprendizajes'],
    ['Cómo fortalecer esta Personalidad', 'comoFortalecer'],
    ['Qué necesita emocionalmente', 'queNecesitaEmocionalmente'],
    ['Cómo expresa su energía', 'comoExpresaSuEnergia'],
    ['Cómo lo verán los demás', 'comoLoVeranLosDemas'],
    ['Cómo aprende', 'comoAprende'],
    ['Cómo suele reaccionar', 'comoSueleReaccionar'],
  ],
  regalo: [
    ['¿Qué significa este número como Regalo?', 'queSignificaComoRegalo'],
    ['Talentos naturales', 'talentosNaturales'],
    ['Cómo potenciar este regalo', 'comoPotenciar'],
    ['Riesgos cuando este regalo no se desarrolla', 'riesgos'],
    ['Lo que conviene estimular', 'loQueConvieneEstimular'],
  ],
  caminoDeCrecimiento: [
    ['Lo que viene a aprender', 'loQueVieneAAprender'],
    ['Desafíos que pueden presentarse', 'desafios'],
    ['Cómo acompañar estos aprendizajes', 'comoAcompanar'],
    ['Señales de que está integrando este aprendizaje', 'senalesDeIntegracion'],
    ['Qué tenderá a costarle más esfuerzo', 'queLeCostaraMasEsfuerzo'],
    ['Emociones que aparecerán como desafío', 'emocionesComoDesafio'],
    ['Frases a evitar', 'frasesAEvitar'],
    ['Frases que le ayudan', 'frasesQueAyudan'],
  ],
  misionNatal: [
    ['¿Qué significa este número en la Misión?', 'queSignificaEnMision'],
    ['Fortalezas para cumplir su misión', 'fortalezasParaCumplirMision'],
    ['Desafíos en su camino', 'desafiosEnSuCamino'],
    ['Cómo acompañar el desarrollo de su misión', 'comoAcompanarDesarrolloMision'],
    ['Lo que viene a desarrollar o a trabajar en sí y hacia los demás', 'loQueVieneADesarrollar'],
    ['Su aportación al mundo', 'suAportacionAlMundo'],
  ],
};

const SUBSECCIONES_ESENCIA = [
  ['Potencial en su máxima expresión', 'potencialMaximaExpresion'],
  ['Su superpoder cuando vibra en positivo', 'superpoder'],
  ['Cuando la energía está en desequilibrio', 'desequilibrio'],
  ['Cómo acompañarlo de 0 a 2 años', 'comoAcompanarPorEtapa.0-2'],
  ['Cómo acompañarlo de 3 a 5 años', 'comoAcompanarPorEtapa.3-5'],
  ['Actividades que potencian esta energía', 'actividades'],
  ['Frases que nutren su autoestima', 'frasesQueNutren'],
  ['Frases que conviene evitar', 'frasesQueEvitar'],
  ['Cómo suele aprender', 'comoSueleAprender'],
];

function parrafosHtml(texto) {
  if (!texto) return '';
  return texto.split('\n\n').map(p => `<p>${p}</p>`).join('');
}

function listaHtml(items) {
  if (!items || !items.length) return '';
  return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

function contenidoSubseccionHtml(contenido) {
  if (contenido == null) return '<p><em>Contenido pendiente en la biblioteca.</em></p>';
  if (typeof contenido === 'string') return parrafosHtml(contenido);
  if (Array.isArray(contenido)) return listaHtml(contenido);
  if (typeof contenido === 'object') {
    let html = '';
    if (contenido.intro) html += parrafosHtml(contenido.intro);
    if (contenido.items) html += listaHtml(contenido.items);
    if (contenido.cierre) html += parrafosHtml(contenido.cierre);
    if (contenido.haciaLosDemas) html += parrafosHtml(contenido.haciaLosDemas);
    return html;
  }
  return '';
}

function obtenerValorAnidado(obj, ruta) {
  return ruta.split('.').reduce((acc, llave) => (acc == null ? undefined : acc[llave]), obj);
}

// Elige (y persiste en datosBebe) 1 frase poderosa al azar por sección,
// para que no cambie cada vez que se vuelve a abrir el reporte.
function elegirFrasePersistente(seccionKey, frases) {
  if (!frases || !frases.length) return '';
  if (!datosBebe.frasesElegidas) datosBebe.frasesElegidas = {};
  if (!datosBebe.frasesElegidas[seccionKey]) {
    const indice = Math.floor(Math.random() * frases.length);
    datosBebe.frasesElegidas[seccionKey] = frases[indice];
    guardarDatosBebe();
  }
  return datosBebe.frasesElegidas[seccionKey];
}

const TITULOS_SECCIONES_FECHA = {
  alma: 'ALMA',
  personalidad: 'PERSONALIDAD',
  regalo: 'REGALO',
  caminoDeCrecimiento: 'CAMINO DE CRECIMIENTO',
  misionNatal: 'MISIÓN NATAL',
};

// Renderiza una de las 5 secciones del reporte de fecha a partir de la biblioteca.
function renderizarSeccionFecha(posicion, campo, seccionKey, numero, nombrePila) {
  const estructura = (window.ESTRUCTURA_FECHA || {})[seccionKey] || {};
  const libroNumero = (window.BIBLIOTECA_FECHA || {})[numero];
  const contenido = libroNumero ? libroNumero[seccionKey] : null;

  if (!contenido) {
    return `
      <div class="seccion-numero">
        <div class="numero-cabecera">
          <div class="numero-estrella">${numero}</div>
          <div>
            <h3 class="numero-titulo">${posicion}. ${estructura.titulo || TITULOS_SECCIONES_FECHA[seccionKey] || seccionKey}</h3>
            <p class="numero-vibracion">Vibración número ${numero}</p>
          </div>
        </div>
        <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${estructura.queRepresenta || ''}</p>
        <div class="interpretacion-texto"><p><em>Revisa que la información este completa ${numero}.</em></p></div>
      </div>
    `;
  }

  const frase = elegirFrasePersistente(seccionKey, contenido.frasesPoderosas);
  const subsecciones = (SUBSECCIONES_FECHA[seccionKey] || [])
    .map(([label, campoContenido]) => `
      <details class="subseccion-detalle">
        <summary>${label}</summary>
        <div class="subseccion-detalle-cuerpo">${contenidoSubseccionHtml(contenido[campoContenido])}</div>
      </details>
    `).join('');

  return `
    <div class="seccion-numero">
      <div class="numero-cabecera">
        <div class="numero-estrella">${numero}</div>
        <div>
          <h3 class="numero-titulo">${posicion}. ${estructura.titulo || TITULOS_SECCIONES_FECHA[seccionKey] || seccionKey}</h3>
          <p class="numero-vibracion">Vibración número ${numero}</p>
        </div>
      </div>
      <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${estructura.queRepresenta || ''}</p>
      ${estructura.fraseDestacadaFija ? `<p class="frase-destacada-fija">${estructura.fraseDestacadaFija}</p>` : ''}
      <div class="numero-frase-poder">"${frase}"</div>
      <div class="interpretacion-texto">
        ${parrafosHtml(contenido.resumen)}
        ${contenido.don ? `<p><strong>Don:</strong> ${contenido.don}</p>` : ''}
        ${contenido.reto ? `<p><strong>Reto:</strong> ${contenido.reto}</p>` : ''}
        <div class="subsecciones-grupo">${subsecciones}</div>
        <div class="acompanar-box"><strong>Recomendaciones para los padres</strong><br>${parrafosHtml(contenido.recomendacionesPadres)}</div>
      </div>
    </div>
  `;
}

// Iconos para la ficha de Esencia Energética. Mapa amplio (cubre los
// elementos y colores más comunes en numerología); si aparece uno nuevo
// que no esté aquí, se usa un icono neutro de respaldo.
const ICONO_ELEMENTO = {
  'fuego': '🔥', 'tierra': '🌍', 'agua': '💧', 'aire': '💨',
  'éter': '✨', 'eter': '✨', 'akasha': '✨', 'luz': '☀️', 'metal': '⚙️', 'madera': '🌳',
};
const ICONO_COLOR = {
  'rojo': '🔴', 'naranja': '🟠', 'amarillo': '🟡', 'dorado': '🟡', 'verde': '🟢',
  'azul': '🔵', 'celeste': '🔵', 'turquesa': '🔵', 'índigo': '🟣', 'indigo': '🟣',
  'violeta': '🟣', 'morado': '🟣', 'púrpura': '🟣', 'purpura': '🟣', 'rosa': '🩷',
  'blanco': '⚪', 'plateado': '⚪', 'gris': '⚪', 'negro': '⚫',
};
function iconoPorNombre(mapa, nombre) {
  if (!nombre) return '';
  const clave = Object.keys(mapa).find(k => nombre.toLowerCase().includes(k));
  return clave ? mapa[clave] : '✨';
}


// Renderiza la ficha de Esencia Energética (en base al número del Alma).
// El Signo Solar (ya calculado en core.js) se despliega aquí también.
function renderizarEsenciaEnergetica(numeroAlma, signoSolar) {
  const estructura = (window.ESTRUCTURA_FECHA || {}).esenciaEnergetica || {};
  const libroNumero = (window.BIBLIOTECA_FECHA || {})[numeroAlma];
  const contenido = libroNumero ? libroNumero.esenciaEnergetica : null;
  const astrologia = obtenerAstrologiaSigno(signoSolar);

  if (!contenido) {
    return `<div class="ficha-energetica"><h3>${estructura.titulo || 'Esencia Energética'}</h3><p><em>La biblioteca para el número ${numeroAlma} Información no disponible aún.</em></p></div>`;
  }

  const subsecciones = SUBSECCIONES_ESENCIA
    .map(([label, ruta]) => `
      <details class="subseccion-detalle">
        <summary>${label}</summary>
        <div class="subseccion-detalle-cuerpo">${contenidoSubseccionHtml(obtenerValorAnidado(contenido, ruta))}</div>
      </details>
    `).join('');

  const lenguajeAmorHtml = contenido.lenguajeDeAmor ? `
    <details class="subseccion-detalle">
      <summary>Su lenguaje de amor predominante</summary>
      <div class="subseccion-detalle-cuerpo">
        ${parrafosHtml(contenido.lenguajeDeAmor.intro)}
        <ul>${(contenido.lenguajeDeAmor.items || []).map(i => `<li><strong>${i.nombre}:</strong> ${i.descripcion}</li>`).join('')}</ul>
      </div>
    </details>
  ` : '';

  const fichaItems = [];
  if (contenido.arquetipo) fichaItems.push(`<div class="ficha-item"><span>Arquetipo</span><b>${contenido.arquetipo.nombre}</b><p>${contenido.arquetipo.descripcion}</p></div>`);
  if (contenido.simbolo) fichaItems.push(`<div class="ficha-item"><span>Símbolo</span><b>${contenido.simbolo.nombre}</b><p>${contenido.simbolo.descripcion}</p></div>`);
  if (signoSolar) fichaItems.push(`<div class="ficha-item"><span>Signo solar</span><b>${SIGNO_EMOJI[signoSolar] || ''} ${signoSolar}</b></div>`);
  if (contenido.verbo) fichaItems.push(`<div class="ficha-item"><span>Verbo</span><b>${contenido.verbo}</b></div>`);
  if (astrologia) {
    fichaItems.push(`<div class="ficha-item"><span>Elemento</span><b>${astrologia.elemento}</b></div>`);
    fichaItems.push(`<div class="ficha-item"><span>Color energético</span><b class="ficha-color-linea">${circuloColorHex(astrologia.hex)} ${astrologia.color}</b></div>`);
  }

  return `
    <div class="ficha-energetica">
      <h3>${estructura.titulo || 'Esencia Energética'} <span style="font-size:13px; font-weight:400; color:#6b6180;">${estructura.subtitulo || ''}</span></h3>
      <p class="numero-vibracion" style="margin-bottom:10px;">Vibración número ${numeroAlma}</p>
      ${parrafosHtml(contenido.laEsencia)}
      <div class="subsecciones-grupo">${subsecciones}${lenguajeAmorHtml}</div>
      <div class="ficha-energetica-grid">${fichaItems.join('')}</div>
      ${contenido.afirmacion ? `<div class="afirmacion-box">"${contenido.afirmacion}"</div>` : ''}
    </div>
  `;
}

const CONTENIDO_NUMEROS_NOMBRE = [
  {
    key: 'formaDeSer', bibliotecaKey: 'formaDeSer', numero: 1, titulo: 'Forma de Ser',
    queRepresenta: 'Describe la manera más natural en que tu bebé actuará y enfrentará la vida. Refleja sus talentos innatos, sus capacidades y la forma en que tenderá a desenvolverse en diferentes situaciones.',
  },
  {
    key: 'deseosDelSer', bibliotecaKey: 'deseosDelSer', numero: 2, titulo: 'Deseos del Ser',
    queRepresenta: 'Es la voz de su mundo interior. Revela aquello que anhela profundamente, lo que le inspira, le motiva y le hace sentir realizado, aunque muchas veces no lo exprese con palabras.',
  },
  {
    key: 'comoLoPercibiran', bibliotecaKey: 'comoLoPercibiran', numero: 3, titulo: 'Cómo lo percibirán los demás',
    queRepresenta: 'Muestra la imagen que proyecta hacia el exterior y la impresión que suele generar en quienes lo conocen. No siempre coincide con cómo se siente por dentro, pero influye en la manera en que los demás se relacionan con él.',
  },
  {
    key: 'potenciador', bibliotecaKey: 'potenciador', numero: 4, titulo: 'Su Potenciador',
    queRepresenta: 'Es la energía que ayuda a integrar y fortalecer el resto de las vibraciones de su mapa. Al desarrollarla conscientemente, facilita que sus talentos florezcan y que sus aprendizajes se vivan con mayor equilibrio.',
  },
];

// STUB — reemplazar con la llamada real a IA (vía backend).
function generarInterpretacionIA(seccion, numero, nombrePila, puntos, fraseIntro, conAcompanarBox = true) {
  const listaPuntos = (puntos || [])
    .map(punto => `<li><strong>${punto}:</strong> [generado por IA]</li>`)
    .join('');

  return `
    <div class="numero-frase-poder">${fraseIntro ? fraseIntro : `[Frase poderosa que la IA generará para la vibración ${numero} en ${seccion}]`}</div>
    <div class="interpretacion-texto">
      <p>Interpretación ${nombrePila || 'tu bebé'}.]</p>
      <ul>${listaPuntos}</ul>
      ${conAcompanarBox ? `<div class="acompanar-box"><strong>Los padres pueden ayudarle cuando...</strong> [generado por IA]</div>` : ''}
    </div>
  `;
}

// ---------------------------------------------------------------
// RENDERIZADO: REPORTE DE FECHA
// ---------------------------------------------------------------
function renderizarReporteFecha(datos) {
  const { nombrePila, fecha, signoSolar } = datos;

  const seccionesFecha = ORDEN_SECCIONES_FECHA
    .map((item, indice) => renderizarSeccionFecha(indice + 1, item.campo, item.seccion, fecha[item.campo], nombrePila))
    .join('');

  const esenciaEnergeticaHtml = renderizarEsenciaEnergetica(fecha.alma, signoSolar);

  document.getElementById('reporte-fecha-contenido').innerHTML = `
    <div class="reporte-bienvenida">
      <div class="eyebrow">Mapa de Fecha de Nacimiento</div>
      <h2>Lo que revela la fecha de, ${nombrePila}</h1>
      <p>La fecha de nacimiento revela la energía con la que tu bebé llega a este mundo, es una mirada a los talentos, regalos y propósito que acompañan su llegada a esta vida.</p>
    </div>

    ${seccionesFecha}

    ${esenciaEnergeticaHtml}

    <button class="boton-secundario" onclick="irAPantalla('reporte-nombre')">Ver el Mapa del Nombre de ${nombrePila}</button>
  `;
}

// ---------------------------------------------------------------
// RENDERIZADO: REPORTE DE NOMBRE
// ---------------------------------------------------------------
function renderizarReporteNombre(datos) {
  const { nombrePila, nombreNumerologia } = datos;
  const bibliotecaNombre = window.BIBLIOTECA_NOMBRE || {};

  const seccionesNombre = CONTENIDO_NUMEROS_NOMBRE.map(item => {
    const numero = nombreNumerologia[item.key];
    const contenidoNumero = bibliotecaNombre[numero] || {};
    const texto = contenidoNumero[item.bibliotecaKey];

    return `
      <div class="seccion-numero">
        <div class="numero-cabecera">
          <div class="numero-estrella">${numero}</div>
          <div>
            <h3 class="numero-titulo">${item.numero}. ${item.titulo}</h3>
            <p class="numero-vibracion">Vibración número ${numero}</p>
          </div>
        </div>
        <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${item.queRepresenta}</p>
        <div class="interpretacion-texto">
          ${texto ? parrafosHtml(texto) : '<p><em>Información no disponible en este momento.</em></p>'}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('reporte-nombre-contenido').innerHTML = `
    <div class="reporte-bienvenida">
      <div class="eyebrow">Mapa del Nombre</div>
      <h2>Lo que revela el nombre de ${nombrePila}</h2>
      <p>El nombre representa la energía que elegimos para acompañar el alma del bebé. Es una vibración que influye en la manera en que su esencia se expresa y se desarrolla a lo largo de la vida.</p>
    </div>


    ${seccionesNombre}


<button class="boton-secundario" onclick="irAPantalla('reporte-fecha')">Ver el Mapa de Fecha de ${nombrePila}</button>  `;
}

// ---------------------------------------------------------------
// RENDERIZADO: RESUMEN
// ---------------------------------------------------------------
function renderizarResumen(datos) {
  const { nombrePila } = datos;

  document.getElementById('resumen-contenido').innerHTML = `
    <div class="resumen-titulo">
      <div class="eyebrow">Resumen</div>
      <h2>El Mapa Energético de ${nombrePila}</h2>
    </div>

    <div class="resumen-item">
      <div class="icono" data-icono="estrella"></div>
      <div class="texto"><strong>Su mayor fortaleza</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono icono-rosa" data-icono="corazon"></div>
      <div class="texto"><strong>Lo que más necesitará</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono" data-icono="brote"></div>
      <div class="texto"><strong>Su aprendizaje más importante</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono" data-icono="estrella"></div>
      <div class="texto"><strong>El talento que vino a compartir</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono icono-rosa" data-icono="manoCorazon"></div>
      <div class="texto"><strong>Cómo pueden acompañarle mejor sus padres</strong><span>[generado por IA]</span></div>
    </div>

    <div class="carta-final">
      <p>Querid@ ${nombrePila}:</p>
      <p>Hoy aún eres muy pequeño para leer estas palabras... pero algún día quizá vuelvas a este documento y descubras que muchas de estas semillas ya vivían dentro de ti desde el día en que naciste.</p>
      <p>Nunca olvides que los números no escriben tu destino. Solo iluminan el potencial que siempre ha habitado en ti.</p>
      <p>Que tu camino esté lleno de amor, curiosidad y propósito.</p>
      <p class="firma">Con cariño.<br><small>Este estudio fue preparado para acompañarte desde tus primeros pasos.</small></p>
    </div>
  `;

  aplicarIconos(document.getElementById('resumen-contenido'));
}

// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${dia} ${meses[Number(mes) - 1]} ${anio}`;
}

// ---------------------------------------------------------------
// ESTADOS VACÍOS: si entran sin haber hecho Iniciar
// ---------------------------------------------------------------
function verificarEstadosVacios() {
  if (!datosBebe) {
    document.getElementById('reporte-fecha-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>Aún no has generado un Mapa Energético.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
    document.getElementById('reporte-nombre-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>Aún no has generado un Mapa Energético.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
    document.getElementById('resumen-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>Aún no hay un resumen que mostrar.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarIconos();

  datosBebe = cargarDatosBebe();

  if (datosBebe) {
    // Recupera los últimos datos capturados y deja disponibles de inmediato
    // tanto el formulario como los reportes ya generados.
    cargarFormularioDesdeDatos(datosBebe);
    renderizarReporteFecha(datosBebe);
    renderizarReporteNombre(datosBebe);
    renderizarResumen(datosBebe);
  } else {
    verificarEstadosVacios();
  }

  // La pantalla de Bienvenida siempre se muestra primero al entrar.
  irAPantalla('bienvenida');
});
