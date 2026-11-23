(function () {
  'use strict';

  var WA_MAIN = '573203814443';
  var $ = function (s) { return document.querySelector(s); };
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     Triaje por síntoma
     part: pieza que se señala en el dibujo del equipo.
     note: lo que dice el pie del dibujo.
     ========================================================= */
  var CASES = {
    lento: {
      part: 'disk',
      note: 'Casi siempre es el disco: es la pieza más lenta del equipo.',
      level: 'Suele ser nivel 2',
      title: 'Un equipo lento casi nunca necesita cambio',
      what: 'En la mayoría de los casos es el disco mecánico, poca memoria, programas que arrancan solos o polvo que calienta el equipo. Se revisa antes de proponer cualquier compra.',
      checks: ['Estado y salud del disco', 'Memoria disponible frente a lo que usas', 'Programas que arrancan con Windows', 'Temperatura y limpieza interna', 'Malware que consume recursos'],
      time: 'Revisión el mismo día. Si conviene cambiar a disco SSD, te paso el costo antes.',
      msg: 'mi equipo está muy lento'
    },
    enciende: {
      part: 'bat',
      note: 'Se empieza por la energía: cargador, batería y fuente.',
      level: 'Nivel 2, presencial',
      title: 'Si no enciende, primero hay que ubicar dónde se corta',
      what: 'Puede ser el cargador, la batería, la fuente, la memoria o la pantalla. Son fallas distintas con costos muy distintos, así que el diagnóstico va primero.',
      checks: ['Cargador, batería y fuente de poder', 'Señal de encendido en la placa', 'Memoria RAM y conectores', 'Pantalla y salida de video', 'Qué información se puede rescatar del disco'],
      time: 'Diagnóstico presencial. Te digo qué tiene y si vale la pena repararlo.',
      msg: 'mi equipo no enciende'
    },
    virus: {
      part: null,
      note: 'No hay que abrir el equipo: esto se limpia desde el sistema.',
      level: 'Nivel 2, se puede hacer remoto',
      title: 'Anuncios y ventanas que aparecen solas',
      what: 'Normalmente entra por programas descargados de sitios falsos o por extensiones del navegador. Se limpia y se deja el equipo configurado para que no vuelva a pasar.',
      checks: ['Limpieza de malware y adware', 'Extensiones y buscadores del navegador', 'Programas que se instalaron sin permiso', 'Estado del antivirus', 'Contraseñas que puedan estar expuestas'],
      time: 'La mayoría se resuelve en una sesión remota.',
      msg: 'mi equipo tiene virus o le salen anuncios'
    },
    internet: {
      part: 'wifi',
      note: 'Puede ser la tarjeta wifi del equipo o la red de la casa.',
      level: 'Nivel 1, a veces nivel 2',
      title: 'Sin internet: puede ser el equipo o la red',
      what: 'Lo primero es separar si falla solo tu equipo o toda la red. Eso cambia por completo la solución.',
      checks: ['Si falla un equipo o todos', 'Configuración de red del equipo', 'Router, claves y canales de wifi', 'Cobertura en el sitio donde trabajas', 'Cableado si es una oficina'],
      time: 'Si es del equipo, se hace remoto. Si es la red, voy al sitio.',
      msg: 'mi equipo no se conecta a internet'
    },
    impresora: {
      part: null,
      note: 'La falla está fuera del equipo, en la impresora o en la red.',
      level: 'Nivel 1',
      title: 'La impresora no responde o imprime mal',
      what: 'Casi siempre es el controlador, la cola de impresión o la conexión en red. Rara vez es la impresora dañada.',
      checks: ['Controlador y cola de impresión', 'Conexión por cable, wifi o red', 'Compartir la impresora entre varios equipos', 'Estado de tintas o tóner', 'Escaneo si es multifuncional'],
      time: 'Muchas veces se resuelve remoto en poco tiempo.',
      msg: 'mi impresora no funciona bien'
    },
    clave: {
      part: null,
      note: 'Nada que abrir: es un trámite con el proveedor del correo.',
      level: 'Nivel 1',
      title: 'Recuperar el acceso a tu cuenta',
      what: 'Te acompaño en el proceso oficial de recuperación. Nunca necesito que me digas tu contraseña.',
      checks: ['Recuperación por el canal oficial del servicio', 'Correo y teléfono de respaldo', 'Configuración del correo en tu equipo', 'Verificación en dos pasos para que no vuelva a pasar'],
      time: 'Remoto. El tiempo depende del proveedor del correo.',
      msg: 'no puedo entrar a mi cuenta o a mi correo'
    },
    archivos: {
      part: 'disk',
      note: 'Todo depende del disco. Mientras menos se use, más se recupera.',
      level: 'Nivel 2, urgente',
      title: 'Archivos borrados o que ya no aparecen',
      what: 'Mientras menos se use el equipo, más se puede recuperar. Si los archivos son importantes, apaga el equipo y escríbeme antes de instalar nada.',
      checks: ['Estado físico del disco', 'Recuperación de archivos borrados', 'Copias ocultas del sistema y la nube', 'Respaldo de lo que se logre rescatar', 'Una rutina de copias para más adelante'],
      time: 'Te digo qué se puede rescatar antes de cobrar el trabajo.',
      msg: 'perdí archivos importantes'
    },
    pantallazo: {
      part: 'fan',
      note: 'El primer sospechoso es el calor: ventilador y disipador.',
      level: 'Nivel 2',
      title: 'Se apaga o se reinicia sin avisar',
      what: 'Suele ser calentamiento, fuente de poder, memoria o un controlador dañado. Los reinicios repetidos terminan afectando el disco, así que conviene revisarlo pronto.',
      checks: ['Temperaturas y ventilación', 'Memoria RAM', 'Fuente de poder o batería', 'Registro de errores de Windows', 'Controladores y actualizaciones'],
      time: 'Diagnóstico presencial, normalmente el mismo día.',
      msg: 'mi equipo se apaga o se reinicia solo'
    },
    limpieza: {
      part: 'fan',
      note: 'Aquí va el trabajo: limpieza del ventilador y pasta térmica.',
      level: 'Nivel 2, programado',
      title: 'Mantenimiento antes de que falle',
      what: 'Limpieza interna, cambio de pasta térmica y puesta a punto del sistema. Es lo que evita la mayoría de las fallas de las que se quejan los demás casos.',
      checks: ['Limpieza interna y de ventiladores', 'Cambio de pasta térmica', 'Puesta a punto de Windows', 'Actualizaciones y antivirus', 'Copia de seguridad de tu información'],
      time: 'Se agenda el día y la hora que te sirvan.',
      msg: 'quiero mantenimiento preventivo para mi equipo'
    },
    otro: {
      part: null,
      note: 'Descríbelo con tus palabras y te digo dónde mirar.',
      level: 'Lo clasificamos juntos',
      title: 'Cuéntame el caso',
      what: 'Si no está en la lista, descríbelo con tus palabras. Con eso te digo si es algo de nivel 1, de nivel 2 o si no es necesario que pagues por un servicio.',
      checks: ['Qué equipo es', 'Desde cuándo pasa', 'Qué ocurrió justo antes', 'Si ya intentaron algo'],
      time: 'Respondo con un diagnóstico inicial por WhatsApp.',
      msg: 'tengo un problema con mi equipo'
    }
  };

  var picker = document.getElementById('symptoms');
  var ticket = document.getElementById('ticket');
  var rig = document.getElementById('rig');
  var rigNote = document.getElementById('rigNote');

  if (picker && ticket && rig) {
    var buttons = Array.prototype.slice.call(picker.querySelectorAll('.symptom'));
    var parts = Array.prototype.slice.call(rig.querySelectorAll('.part'));
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });

    picker.addEventListener('click', function (e) {
      var btn = e.target.closest('.symptom');
      if (!btn) return;

      var data = CASES[btn.dataset.key];
      if (!data) return;

      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });

      /* señalar la pieza en el dibujo */
      parts.forEach(function (p) {
        if (data.part && p.dataset.part === data.part) p.setAttribute('data-on', '');
        else p.removeAttribute('data-on');
      });
      if (data.part) rig.setAttribute('data-hot', data.part);
      else rig.removeAttribute('data-hot');

      rigNote.textContent = data.note;

      if (!quieto) {
        /* barrido de diagnostico sobre el dibujo */
        rig.removeAttribute('data-scan');
        void rig.offsetWidth;
        rig.setAttribute('data-scan', '');

        rigNote.classList.remove('is-new');
        void rigNote.offsetWidth;
        rigNote.classList.add('is-new');
      }

      /* llenar la ficha */
      document.getElementById('ticketLevel').textContent = data.level;
      document.getElementById('ticketTitle').textContent = data.title;
      document.getElementById('ticketWhat').textContent = data.what;
      document.getElementById('ticketTime').textContent = data.time;

      var ul = document.getElementById('ticketChecks');
      ul.textContent = '';
      data.checks.forEach(function (c) {
        var li = document.createElement('li');
        li.textContent = c;
        ul.appendChild(li);
      });

      document.getElementById('ticketWa').href =
        'https://wa.me/' + WA_MAIN + '?text=' +
        encodeURIComponent('Hola Omar, ' + data.msg + '. ¿Me puedes ayudar?');

      if (ticket.hidden) {
        ticket.hidden = false;
      } else {
        ticket.style.animation = 'none';
        void ticket.offsetWidth;
        ticket.style.animation = '';
      }

      /* En pantallas angostas el dibujo queda bajo la lista:
         hay que llevar la vista hasta el resultado. */
      if (window.matchMedia('(max-width: 980px)').matches) {
        rig.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* =========================================================
     Los dibujos de nivel 1 y nivel 2 se trazan al verlos.
     Sin JS o con movimiento reducido quedan ya dibujados.
     ========================================================= */
  var spots = Array.prototype.slice.call(document.querySelectorAll('.spot'));
  if (spots.length && !quieto && 'IntersectionObserver' in window) {
    spots.forEach(function (sp) { sp.classList.add('spot--anim'); });
    var ver = new IntersectionObserver(function (filas) {
      filas.forEach(function (f) {
        if (!f.isIntersecting) return;
        f.target.classList.add('is-in');
        ver.unobserve(f.target);
      });
    }, { threshold: .4 });
    spots.forEach(function (sp) { ver.observe(sp); });
  }

  /* =========================================================
     Formulario hacia WhatsApp
     ========================================================= */
  var form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre = form.nombre.value.trim();
      var mensaje = form.mensaje.value.trim();
      var errN = document.getElementById('errNombre');
      var errM = document.getElementById('errMensaje');

      errN.hidden = !!nombre;
      errM.hidden = !!mensaje;

      if (!nombre || !mensaje) {
        form.classList.remove('shake');
        void form.offsetWidth;
        form.classList.add('shake');
        (nombre ? form.mensaje : form.nombre).focus();
        return;
      }

      var modo = form.querySelector('input[name="modo"]:checked').value;
      var linea = form.querySelector('input[name="linea"]:checked').value;

      var texto =
        'Hola Omar, soy ' + nombre + '.\n' +
        'Equipo: ' + form.equipo.value + '\n' +
        'Atención: ' + modo + '\n\n' +
        mensaje;

      window.open('https://wa.me/' + linea + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }
})();
