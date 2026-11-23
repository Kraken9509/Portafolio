# Portafolio · Omar Camilo Santiago García

Sitio de **Omar Camilo Santiago García**, ingeniero de sistemas y especialista en
seguridad informática. Ofrece soporte técnico independiente **nivel 1 y nivel 2**
en Villavicencio, Meta, y de forma remota en Colombia.

## Idea de la interfaz

La página abre preguntando *"¿Qué le pasa a tu equipo?"*. Quien llega elige el
síntoma que más se parece a su caso y la ficha de la derecha responde con el nivel
de soporte que suele corresponder, qué se revisa, cuánto tarda y un mensaje de
WhatsApp ya redactado. El contacto deja de ser un formulario en blanco y pasa a ser
un triaje.

## Tecnologías

- HTML5 semántico con datos estructurados (Schema.org) para SEO local
- CSS sin frameworks, con una escala tipográfica y una sola variable de acento
- JavaScript sin dependencias para el triaje y el envío a WhatsApp

## Estructura

```
index.html      Página principal
css/styles.css  Diseño y responsive
js/main.js      Triaje por síntoma y formulario
favicon.svg     Ícono del sitio
robots.txt      Indicaciones para buscadores
sitemap.xml     Mapa del sitio
```

## Ejecutar localmente

```bash
npx serve .
```

## Despliegue

Se publica en Vercel y se actualiza con cada `push` a la rama `main`.
