# Beach Kitten Cleanup

Proyecto web en Vanilla JavaScript: un juego tipo "recoger basura" ambientado en la playa con soporte para multijugador local.

---

## Contenido
- Descripción
- Requisitos
- Ejecutar localmente
- Estructura del proyecto
- Controles
- Multijugador
- Configuraciones (Contraste, sonido, controles P2)
- Almacenamiento (localStorage)
- Depuración y pruebas
- Contribuir
- Licencia

---

**Descripción**

Beach Kitten Cleanup es un juego 2D (canvas) en el que controlas a un gatito que debe recoger basura en la playa. Algunos niveles incluyen peligros (tiburón, cangrejo, faro) que quitan vidas. El juego soporta multijugador local (2 jugadores en la misma pantalla) con controles independientes y contadores por jugador.


## Requisitos
- Un navegador moderno (Chrome, Edge, Firefox) con soporte para Canvas y JavaScript.
- (Opcional) Python 3 instalado si quieres servir el proyecto con `python -m http.server`.


## Ejecutar localmente
Puedes abrir el archivo directamente (doble clic en `index.html`), pero se recomienda usar un servidor local para evitar problemas CORS con imágenes y assets.

PowerShell (desde la carpeta del proyecto):

```powershell
cd "D:\6to Semestre\APP WEB\IB\ProyectoIB\Proyecto_Aplicaciones_Web"
# Usando Python 3 (servidor simple)
python -m http.server 8000
# Luego abre en el navegador: http://localhost:8000
```

O simplemente abrir `index.html`:
```powershell
Start-Process "D:\6to Semestre\APP WEB\IB\ProyectoIB\Proyecto_Aplicaciones_Web\index.html"
```


## Estructura del proyecto

- `index.html` — entrada principal, overlays (menú, cómo jugar, settings, game over, level complete).
- `css/` — estilos (incluye `style.css`).
- `js/` — código JS dividido por carpetas:
  - `engine/` — `GameEngine.js` (bucle principal, canvas, render, resize responsivo).
  - `game/` — `Game.js`, `WaveManager.js` (lógica de niveles y reglas).
  - `entities/` — `Kitten.js`, `Shark.js`, `Crab.js`, `Lighthouse.js`, `Trash.js`, y tipos de basura.
  - `ui/` — `HUD.js`, `Menu.js` (UI dibujada en canvas + overlays).
  - `utils/` — `InputHandler.js`, `StorageManager.js`, `AudioManager.js`, `CollisionDetector.js`.
  - `main.js` — inicio de la aplicación, handlers de menú y settings.
- `assets/` — imágenes, audios y datos (ej. `assets/data/levels.json`).


## Controles
- Jugador 1: `W A S D` (movimiento) — también puede usar flechas si el usuario lo configura.
- Jugador 2 (multijugador): `I J K L` por defecto — puede cambiarse a `Flechas` en Configuraciones.
- `ESC` — pausa / abrir menú de pausa.


## Multijugador
- Activa la casilla `Multijugador` en el menú principal antes de iniciar.
- Se crea una entidad `kitten2` para el Jugador 2 y tendrá su propio conjunto de vidas (`livesP2`).
- El progreso del nivel (basura recogida) se calcula sumando lo recogido por ambos jugadores.
- Reglas de Game Over:
  - En single-player: cuando `livesP1` llega a 0 → Game Over.
  - En multijugador: el juego muestra Game Over cuando ambos jugadores tienen 0 vidas. Si un jugador queda con 0, aparece una calavera sobre su avatar y queda inhabilitado, pero el otro puede seguir jugando.


## Configuraciones
- Contraste: control deslizante en `Configuraciones` (persistido en `localStorage` como `gameContrastPercent`).
- Silenciar música: checkbox (persistido en `localStorage.gameMuted`).
- Controles Jugador 2: selector entre `Flechas` o `IJKL` (persistido en `localStorage.controlsP2`).
- Selección de personaje: puedes asignar las sprites a Jugador 1 o Jugador 2 desde `Seleccionar personaje`.


## Claves de `localStorage` relevantes
- `multiplayer` — `'1'` si multijugador activo.
- `selectedKitten` — ruta de sprite para Jugador 1 (o `default`).
- `selectedKitten2` — ruta de sprite para Jugador 2.
- `controlsP2` — `'arrows'` o `'ijkl'`.
- `unlockedLevels` — JSON con niveles desbloqueados.
- `highscores` — JSON con mejor tiempo por nivel.
- `gameMuted` — `'1'` si está silenciado.
- `gameContrastPercent` — número 0..100.


## Depuración y pruebas
- Logs importantes se imprimen en la consola del navegador. Mensajes clave añadidos para depurar vidas/colisiones:
  - `💥 Daño aplicado a P{n}: -{x} | Vidas antes P1={v1} P2={v2} -> ahora P1={v1'} P2={v2'}` — cuando se aplica daño.
  - `🐟 Shark collision check:` — verificación de colisión del tiburón.
  - `🦀 Crab collision check:` — verificación de colisión del cangrejo.
  - `🚨 Lighthouse collision check:` — verificaciones del faro.
  - `🛑 Game Over triggered: P1dead=... P2dead=...` — cuando se muestra Game Over.
  - `🔧 Canvas resized to WxH` — cuando el canvas se redimensiona por la ventana.

Recomendaciones para probar multijugador localmente:
1. Abre el juego en el navegador (usar servidor local recomendado).
2. En el menú principal, marca `Multijugador` y asigna sprites si quieres.
3. Inicia un nivel con peligros (por ejemplo nivel 3 o 5).
4. Fuerza colisiones para restar vidas a cada jugador y observa la consola y el HUD.

Si observes que el HUD no refleja cambios de vidas, revisa la consola y copia los logs; el HUD ahora también muestra el número de vidas junto a los corazones para facilitar la comprobación.


## Troubleshooting (problemas comunes)
- Imágenes que no cargan o `getImageData` fallando por CORS: sirve el proyecto con un servidor local en lugar de abrir `index.html` directamente.
- Player 2 no se mueve: revisa `localStorage.controlsP2` y el estado del checkbox `multiplayer` (si no existe `kitten2`, el modo no es multijugador).
- Las vidas vuelven a 3 tras llegar a 0: se corrigió el código para no volver a inicializarlas si son `0`.


## Contribuir
Si quieres mejorar el juego:
- Clona el repo y trabaja en una rama. Mantén los cambios pequeños y prueba en navegador.
- Para cambios en assets (imágenes/audio), incluye archivos optimizados y prueba que no rompan CORS.
- Para pull requests, incluye una descripción breve y pasos para probar tu cambio.


