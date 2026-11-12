# La Moncloa · Simulador de presidencia 3D

Un juego de estrategia política en español, hecho en HTML, CSS y JavaScript. Para ordenador, tablet y móvil. Sin cuentas, anuncios, servicios de pago, API ni compilación. Todos los recursos necesarios están incluidos en esta carpeta.

## Jugar ahora

Abre **index.html** en un navegador moderno. No necesitas instalar nada ni tener conexión. En móviles resulta más cómodo acceder a la versión publicada en GitHub Pages. WebGL permite la escena 3D; si no está disponible, aparece una vista ligera y el juego sigue funcionando.

Opcionalmente, con Node.js 18 o posterior:

```sh
npm start
```

Abre la dirección que imprime la terminal, normalmente `http://127.0.0.1:4173`. No hace falta ejecutar `npm install`: no hay dependencias de npm.

## Subir a GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube **el contenido de esta carpeta a la raíz del repositorio**. `index.html` debe quedar en la raíz. Conserva `vendor`, `assets` y el resto de archivos.
3. Abre **Settings → Pages** y elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda. También sirve `master` si es tu rama principal.
4. Cuando termine la publicación, GitHub mostrará la dirección de tu juego. Compártela y ábrela desde el móvil.

Como alternativa, selecciona **GitHub Actions** como origen de Pages. El flujo incluido en `.github/workflows/pages.yml` ejecuta las pruebas y publica al subir cambios a `main` o `master`. Debes subir también la carpeta oculta `.github`; una subida por Git conserva todos los archivos.

Los enlaces y recursos son relativos: funciona tanto en `usuario.github.io` como en `usuario.github.io/repositorio/`. No necesita servidor de aplicación, base de datos ni claves secretas. Repositorio público: https://github.com/NoobieGD/la-moncloa · Jugar: https://noobiegd.github.io/la-moncloa/

## Qué puedes hacer

- Explorar tres escenas 3D: palacio presidencial, hemiciclo de 350 asientos y vista internacional. Cámara giratoria, zoom, controles táctiles y modo ligero.
- Crear tu dirigente, nombrar el partido, elegir ideología y dificultad.
- Empezar en 2027 o en historias alternativas inspiradas en 1978, 2008 y 2020, con distintos indicadores y crisis iniciales.
- Resolver 32 acontecimientos con tres decisiones, consecuencias visibles e inversiones que dan resultados meses después.
- Gestionar aprobación, crecimiento, paro, inflación, deuda, tesorería, estabilidad, sanidad, educación, vivienda, seguridad, infraestructuras, clima, transparencia y relaciones europeas.
- Repartir presupuestos entre seis áreas y modificar tres impuestos. Previsión de ingresos, gasto y balance antes de aprobar.
- Negociar con seis grupos, formar coaliciones y cumplir compromisos con plazos. Los socios pueden abandonarte.
- Proponer 12 leyes, consultar apoyos previstos y ver la votación de cada grupo. Una derrota también tiene consecuencias.
- Renovar seis ministerios con 12 candidatos. Capacidad, lealtad y desgaste tienen efectos mensuales.
- Invertir en 17 comunidades y dos ciudades autónomas. Su apoyo influye en las urnas.
- Impulsar cooperación europea, misiones comerciales, alianzas climáticas y ayuda humanitaria.
- Hacer campaña, consultar sondeos, adelantar elecciones y disputar las ordinarias cada 48 meses.
- Repartir escaños con D’Hondt en 19 circunscripciones de juego, negociar la investidura y continuar otros mandatos.
- Afrontar finales por pérdida de apoyos parlamentarios, crisis extrema de deuda o falta de mayoría tras una elección.
- Cumplir seis objetivos de legado, revisar el historial, ver gráficos y descargar la crónica.
- Guardar automáticamente, exportar e importar partidas entre dispositivos, escuchar efectos diferentes para decisiones, votaciones, elecciones, navegación y cambios de mes, y reducir movimiento o calidad gráfica.

## Reglas rápidas

Cada turno es **un mes**. Tienes **3 acciones** y capital político limitado. Cada decisión, negociación, ley, cambio de ministro o iniciativa consume una acción. Los costes se muestran antes de confirmar. El capital se recupera cada mes; las acciones que no utilices no se acumulan.

Resuelve el asunto de «En tu mesa» para pasar de mes. Puedes aplazarlo perdiendo algo de estabilidad y apoyo; esto evita quedarte bloqueado si gastaste todo el capital. Los presupuestos, la plantilla ministerial y la economía producen efectos mensuales. Las leyes y decisiones aplican los efectos mostrados al confirmarlas; los proyectos diferidos tienen su propio plazo.

El Gobierno empieza con 124 escaños propios y un socio de 53: **177 en total**. Aprobar leyes requiere 176 votos en las reglas de juego. La previsión puede variar por la disciplina de voto. Dialogar mejora la relación; los pactos requieren al menos 55 y un compromiso verificable a seis meses.

Cada 48 meses se celebran elecciones. Puedes adelantarlas a partir del sexto mes del mandato. Los sondeos son aproximados: la distribución territorial y una variación local afectan al resultado. La investidura pide 176 escaños. Para apoyar una nueva coalición, cada socio necesita relación de 45 o más y distancia ideológica compatible. Si no puedes formar Gobierno, acepta el relevo y consulta tu legado.

En el móvil navega con la barra inferior. **Más** abre Sociedad, Gobierno, Territorios, Exteriores, Crónica y Ajustes. Encima tienes siempre el capital, las acciones restantes y **Mes siguiente**, sin tener que volver arriba. En el 3D arrastra con un dedo y pellizca con dos para acercar. Los botones ofrecen los mismos controles. **Ajustes → Calidad → Ligera** reduce la resolución y la frecuencia de dibujo.

## Partidas y privacidad

El autoguardado usa `localStorage` en tu navegador, sin enviar datos a ningún servicio. Exporta una copia JSON desde Ajustes antes de borrar datos del navegador, cambiar de dispositivo o iniciar otra partida. El archivo se valida al importarlo. La importación y la nueva partida piden confirmar la sustitución.

El guardado depende del navegador y la dirección. Una partida abierta con `file://`, en un servidor local y en GitHub Pages puede pertenecer a tres almacenamientos distintos. Algunos navegadores privados no permiten guardar; en ese caso usa la exportación. Exportar un archivo no sincroniza automáticamente los dispositivos.

## Modelo y límites

Es una **simulación ficticia**, no una herramienta de predicción política ni una reproducción exacta de las instituciones o la economía española. Todos los políticos y partidos son inventados. Los escenarios históricos reinterpretan temas de cada época con las mismas reglas; no reconstruyen hechos o repartos parlamentarios reales. Los datos iniciales son parámetros de diseño, no estadísticas actuales.

Las 19 circunscripciones y su reparto fijo de escaños son una simplificación del sistema provincial real. Las mayorías, la censura, los impuestos, la financiación, el comercio y la investidura también se simplifican. El mapa y la arquitectura 3D son ilustraciones esquemáticas. No hay multijugador, datos en directo, navegación libre en primera persona ni un sistema de combate. La escena 3D acompaña un juego estratégico por turnos.

## Archivos y desarrollo

```text
index.html          Página de entrada
styles.css          Interfaz adaptable, móvil y accesibilidad
data.js             Escenarios, decisiones, partidos, leyes y objetivos
engine.js           Motor de turnos, economía, votos y persistencia
scene.js            Escenas Three.js y controles táctiles
app.js              Pantallas, menús, gráficos y acciones
assets/             Icono vectorial local
vendor/             Three.js 0.160.0 y su licencia
tests/              Pruebas del motor
serve.cjs           Servidor local opcional
.github/workflows/  Publicación opcional con GitHub Actions
```

Ejecuta `npm test` para comprobar decisiones, presupuestos, leyes, pactos, proyectos, elecciones, guardado y partidas de varios mandatos. Puedes ampliar los eventos de `data.js` sin tocar el motor. Las partidas utilizan una semilla para que los resultados se puedan reproducir.

Código y recursos propios bajo MIT. Three.js conserva su licencia MIT en `vendor/THREE-LICENSE.txt`.
