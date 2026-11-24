(function () {
  'use strict';

  var WA_MAIN = '573203814443';
  var SALTO = '\n';   /* salto de línea dentro del mensaje */
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
      msg: 'el equipo va muy lento'
    },
    enciende: {
      part: 'bat',
      note: 'Se empieza por la energía: cargador, batería y fuente.',
      level: 'Nivel 2, presencial',
      title: 'Si no enciende, primero hay que ubicar dónde se corta',
      what: 'Puede ser el cargador, la batería, la fuente, la memoria o la pantalla. Son fallas distintas con costos muy distintos, así que el diagnóstico va primero.',
      checks: ['Cargador, batería y fuente de poder', 'Señal de encendido en la placa', 'Memoria RAM y conectores', 'Pantalla y salida de video', 'Qué información se puede rescatar del disco'],
      time: 'Diagnóstico presencial. Te digo qué tiene y si vale la pena repararlo.',
      msg: 'el equipo no enciende'
    },
    virus: {
      part: null,
      note: 'No hay que abrir el equipo: esto se limpia desde el sistema.',
      level: 'Nivel 2, se puede hacer remoto',
      title: 'Anuncios y ventanas que aparecen solas',
      what: 'Normalmente entra por programas descargados de sitios falsos o por extensiones del navegador. Se limpia y se deja el equipo configurado para que no vuelva a pasar.',
      checks: ['Limpieza de malware y adware', 'Extensiones y buscadores del navegador', 'Programas que se instalaron sin permiso', 'Estado del antivirus', 'Contraseñas que puedan estar expuestas'],
      time: 'La mayoría se resuelve en una sesión remota.',
      msg: 'el equipo tiene virus y le salen anuncios'
    },
    internet: {
      part: 'wifi',
      note: 'Puede ser la tarjeta wifi del equipo o la red de la casa.',
      level: 'Nivel 1, a veces nivel 2',
      title: 'Sin internet: puede ser el equipo o la red',
      what: 'Lo primero es separar si falla solo tu equipo o toda la red. Eso cambia por completo la solución.',
      checks: ['Si falla un equipo o todos', 'Configuración de red del equipo', 'Router, claves y canales de wifi', 'Cobertura en el sitio donde trabajas', 'Cableado si es una oficina'],
      time: 'Si es del equipo, se hace remoto. Si es la red, voy al sitio.',
      msg: 'el equipo no se conecta a internet'
    },
    impresora: {
      part: null,
      note: 'La falla está fuera del equipo, en la impresora o en la red.',
      level: 'Nivel 1',
      title: 'La impresora no responde o imprime mal',
      what: 'Casi siempre es el controlador, la cola de impresión o la conexión en red. Rara vez es la impresora dañada.',
      checks: ['Controlador y cola de impresión', 'Conexión por cable, wifi o red', 'Compartir la impresora entre varios equipos', 'Estado de tintas o tóner', 'Escaneo si es multifuncional'],
      time: 'Muchas veces se resuelve remoto en poco tiempo.',
      msg: 'la impresora no funciona bien'
    },
    clave: {
      part: null,
      note: 'Nada que abrir: es un trámite con el proveedor del correo.',
      level: 'Nivel 1',
      title: 'Recuperar el acceso a tu cuenta',
      what: 'Te acompaño en el proceso oficial de recuperación. Nunca necesito que me digas tu contraseña.',
      checks: ['Recuperación por el canal oficial del servicio', 'Correo y teléfono de respaldo', 'Configuración del correo en tu equipo', 'Verificación en dos pasos para que no vuelva a pasar'],
      time: 'Remoto. El tiempo depende del proveedor del correo.',
      msg: 'no puedo entrar a mi cuenta de correo'
    },
    archivos: {
      part: 'disk',
      note: 'Todo depende del disco. Mientras menos se use, más se recupera.',
      level: 'Nivel 2, urgente',
      title: 'Archivos borrados o que ya no aparecen',
      what: 'Mientras menos se use el equipo, más se puede recuperar. Si los archivos son importantes, apaga el equipo y escríbeme antes de instalar nada.',
      checks: ['Estado físico del disco', 'Recuperación de archivos borrados', 'Copias ocultas del sistema y la nube', 'Respaldo de lo que se logre rescatar', 'Una rutina de copias para más adelante'],
      time: 'Te digo qué se puede rescatar antes de cobrar el trabajo.',
      msg: 'perdí archivos importantes y los necesito'
    },
    pantallazo: {
      part: 'fan',
      note: 'El primer sospechoso es el calor: ventilador y disipador.',
      level: 'Nivel 2',
      title: 'Se apaga o se reinicia sin avisar',
      what: 'Suele ser calentamiento, fuente de poder, memoria o un controlador dañado. Los reinicios repetidos terminan afectando el disco, así que conviene revisarlo pronto.',
      checks: ['Temperaturas y ventilación', 'Memoria RAM', 'Fuente de poder o batería', 'Registro de errores de Windows', 'Controladores y actualizaciones'],
      time: 'Diagnóstico presencial, normalmente el mismo día.',
      msg: 'el equipo se apaga y se reinicia solo'
    },
    limpieza: {
      part: 'fan',
      note: 'Aquí va el trabajo: limpieza del ventilador y pasta térmica.',
      level: 'Nivel 2, programado',
      title: 'Mantenimiento antes de que falle',
      what: 'Limpieza interna, cambio de pasta térmica y puesta a punto del sistema. Es lo que evita la mayoría de las fallas de las que se quejan los demás casos.',
      checks: ['Limpieza interna y de ventiladores', 'Cambio de pasta térmica', 'Puesta a punto de Windows', 'Actualizaciones y antivirus', 'Copia de seguridad de tu información'],
      time: 'Se agenda el día y la hora que te sirvan.',
      msg: 'quiero mantenimiento preventivo para el equipo'
    },
    otro: {
      part: null,
      note: 'Descríbelo con tus palabras y te digo dónde mirar.',
      level: 'Lo clasificamos juntos',
      title: 'Cuéntame el caso',
      what: 'Si no está en la lista, descríbelo con tus palabras. Con eso te digo si es algo de nivel 1, de nivel 2 o si no es necesario que pagues por un servicio.',
      checks: ['Qué equipo es', 'Desde cuándo pasa', 'Qué ocurrió justo antes', 'Si ya intentaron algo'],
      time: 'Respondo con un diagnóstico inicial por WhatsApp.',
      msg: 'tengo un problema que no está en la lista'
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
        'https://wa.me/' + WA_MAIN + '?text=' + encodeURIComponent(
          'Hola Omar, te escribo desde tu página web.' + SALTO + SALTO +
          'Mi caso: ' + data.msg + '.' + SALTO + SALTO +
          '¿Me puedes dar un diagnóstico y el costo?'
        );

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
     Entradas al desplazarse.

     Se usa la posición real de cada elemento en vez de
     IntersectionObserver: si el observador no llega a dispararse,
     el contenido se quedaría invisible. Esto no puede fallar en
     silencio, y además revela de entrada lo que ya está en pantalla.
     ========================================================= */
  var ENTRADAS = [
    ['.head', 'rise'],
    ['.level', 'wipe'],
    ['.levels__note', 'rise'],
    ['.level .list li', 'rise'],
    ['.profile__text p', 'rise'],
    ['.facts > div', 'rise'],
    ['.track > li', 'row'],
    ['.courses li', 'rise'],
    ['.faq details', 'rise'],
    ['.channels li', 'rise'],
    ['.form .field', 'rise'],
    ['.form > button', 'rise'],
    ['.foot__in > *', 'rise']
  ];

  if (!quieto) {
    document.documentElement.classList.add('anim');

    /* las píldoras del inicio entran al cargar: solo las numeramos */
    Array.prototype.forEach.call(
      document.querySelectorAll('.symptoms li'),
      function (li, i) { li.style.setProperty('--i', i); }
    );

    /* pendientes: cada uno con la clase que lo revela */
    var pendientes = [];
    var porGrupo = new Map();

    ENTRADAS.forEach(function (par) {
      Array.prototype.forEach.call(document.querySelectorAll(par[0]), function (el) {
        if (el.hasAttribute('data-rev')) return;
        el.setAttribute('data-rev', par[1]);
        var padre = el.parentElement;
        var n = porGrupo.get(padre) || 0;
        el.style.setProperty('--i', Math.min(n, 7));
        porGrupo.set(padre, n + 1);
        pendientes.push({ el: el, cls: 'in' });
      });
    });

    /* los dibujos de nivel 1 y nivel 2 se trazan al verlos */
    Array.prototype.forEach.call(document.querySelectorAll('.spot'), function (sp) {
      sp.classList.add('spot--anim');
      pendientes.push({ el: sp, cls: 'is-in' });
    });

    function revisar() {
      var alto = window.innerHeight || document.documentElement.clientHeight;
      for (var i = pendientes.length - 1; i >= 0; i--) {
        var r = pendientes[i].el.getBoundingClientRect();
        /* Basta con que el elemento haya llegado al borde inferior:
           lo que ya quedó por encima también se revela, para que un
           salto con el menú o con la tecla Fin no deje huecos
           invisibles al volver a subir. */
        if (r.top < alto - 40) {
          pendientes[i].el.classList.add(pendientes[i].cls);
          pendientes.splice(i, 1);
        }
      }
      if (!pendientes.length) {
        window.removeEventListener('scroll', pedir);
        window.removeEventListener('resize', pedir);
      }
    }

    /* Limitado por reloj, no por requestAnimationFrame: si el
       navegador no está componiendo fotogramas, rAF puede no
       llegar a ejecutarse y el contenido se quedaría oculto.
       La llamada final garantiza que se revisa la posición
       en la que el visitante se detuvo. */
    var ultimaRevision = 0;
    var revisionTardia = null;

    function pedir() {
      var ahora = Date.now();
      clearTimeout(revisionTardia);
      if (ahora - ultimaRevision > 90) {
        ultimaRevision = ahora;
        revisar();
      }
      revisionTardia = setTimeout(function () {
        ultimaRevision = Date.now();
        revisar();
      }, 110);
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    revisar();

    /* red de seguridad: si algo quedara pendiente por cualquier
       motivo, a los 4 segundos se muestra igual */
    setTimeout(function () {
      pendientes.forEach(function (x) { x.el.classList.add(x.cls); });
      pendientes.length = 0;
    }, 4000);
  }

  /* =========================================================
     El eje de la cronología se llena al bajar
     ========================================================= */
  var cronologia = document.querySelector('.track');
  var nativo = window.CSS && CSS.supports && CSS.supports('animation-timeline', 'view()');
  if (cronologia && !quieto && !nativo) {
    var ultimoEje = 0;
    var ejeTardio = null;

    function avanzarEje() {
      var r = cronologia.getBoundingClientRect();
      var alto = window.innerHeight || document.documentElement.clientHeight;
      var p = (alto * 0.58 - r.top) / r.height;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      cronologia.style.setProperty('--avance', p.toFixed(3));
    }

    /* con llamada final, para que la posición en la que el
       visitante se detiene quede siempre reflejada */
    function pedirEje() {
      var ahora = Date.now();
      clearTimeout(ejeTardio);
      if (ahora - ultimoEje > 60) {
        ultimoEje = ahora;
        avanzarEje();
      }
      ejeTardio = setTimeout(function () {
        ultimoEje = Date.now();
        avanzarEje();
      }, 80);
    }

    window.addEventListener('scroll', pedirEje, { passive: true });
    window.addEventListener('resize', avanzarEje);
    avanzarEje();
  }

  /* =========================================================
     La cabecera se compacta al bajar
     ========================================================= */
  var cabecera = document.querySelector('.masthead');
  if (cabecera) {
    var ultimoCab = 0;
    window.addEventListener('scroll', function () {
      var ahora = Date.now();
      if (ahora - ultimoCab < 80) return;
      ultimoCab = ahora;
      cabecera.classList.toggle('is-small', window.scrollY > 90);
    }, { passive: true });
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
        'Hola Omar, te escribo desde tu página web.' + SALTO + SALTO +
        'Nombre: ' + nombre + SALTO +
        'Equipo: ' + form.equipo.value + SALTO +
        'Atención: ' + modo + SALTO + SALTO +
        'Qué está pasando:' + SALTO + mensaje + SALTO + SALTO +
        '¿Me puedes dar un diagnóstico y el costo?';

      window.open('https://wa.me/' + linea + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }
})();
