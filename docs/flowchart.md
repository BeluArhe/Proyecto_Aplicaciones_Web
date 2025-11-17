# Diagrama de flujo: Beach Kitten Cleanup

Este archivo contiene un diagrama de flujo (Mermaid) que describe el flujo principal del juego: desde el menú hasta las condiciones de Game Over y nivel completado. Puedes visualizar este diagrama en GitHub (si tu visualizador soporta Mermaid) o en https://mermaid.live

---

```mermaid
flowchart TD
  Start([Inicio]) --> Menu["Menú principal"]
  Menu -->|Iniciar| StartGame["Iniciar juego / Elegir nivel"]
  Menu -->|Seleccionar personaje| Character["Seleccionar personaje"]
  Menu -->|Configurar| Settings["Configuraciones"]
  Settings --> SettingsOptions["Contraste / Sonido / Controles P2 (si multijugador)"]

  StartGame --> Init["GameEngine.init()\nGame constructor\nCargar assets\nCrear kitten(s) según multiplayer"]
  Init --> Loop["Bucle principal\n(requestAnimationFrame)"]

  subgraph GameLoop [Loop por frame]
    Loop --> Input["Leer Input por jugador (P1 y P2)"]
    Input --> Update["Game.update(deltaTime)"]
    Update --> Entities["Actualizar entidades:\n- Kitten(s)\n- Trash\n- Hazards (Shark/Crab/Lighthouse)"]
    Entities --> Collisions["Comprobar colisiones:\n- Trash vs bag(s)\n- Hazards vs kitten(s)"]
    Collisions -->|Trash pickup| Pickup["Asignar a picker (P1/P2)\nEliminar trash\nActualizar contador"]
    Collisions -->|Hazard hit| Damage["_damage(playerId, amount)\n- Restar vidasP1/vidasP2\n- Poner invulnerabilidad de actor\n- Marcar kitten.dead si vidas=0"]
    Damage --> HUDUpdate["Actualizar HUD (vidas y contadores)"]
    Pickup --> HUDUpdate
    HUDUpdate --> CheckComplete["¿Objetivo alcanzado? (targetTrashCollected >= target)"]
    CheckComplete -->|Sí| LevelComplete["Pausar juego\nMostrar overlay Nivel Completado\nActualizar highscores / unlockedLevels"]
    CheckComplete -->|No| ContinueLoop["Continuar bucle"]
    HUDUpdate --> CheckGameOver["¿Game Over?\n- Single: P1 vidas=0 -> GameOver\n- Multi: P1 vidas=0 && P2 vidas=0 -> GameOver"]
    CheckGameOver -->|Sí| GameOver["Pausar juego\nMostrar overlay Game Over (mensaje según modo)\nReproducir audio triste"]
    CheckGameOver -->|No| ContinueLoop
    ContinueLoop --> Loop
  end

  %% Opciones después de GameOver / LevelComplete
  LevelComplete --> MenuReturn["Volver al menú / Siguiente / Repetir"]
  GameOver --> MenuReturn
  MenuReturn --> Menu

  %% Notas
  classDef note fill:#fff3b0,stroke:#f7b500,color:#222;
  SettingsOptions:::note
  HUDUpdate:::note

``` 

## Explicación rápida de nodos clave
- Input: `InputHandler` recoge teclas para P1 y P2. P2 usa `IJKL` por defecto o `Arrows` si así se configura.
- Pickup: cada `Trash` al colisionar con la bolsa se marca como recogida por el jugador correspondiente; el total es la suma de las bolsas.
- Damage: `_damage(playerId, amount)` decrementa `livesP1` o `livesP2`. Se marca `kitten.dead = true` cuando sus vidas llegan a 0.
- Game Over: en multijugador solo ocurre cuando ambos jugadores están sin vidas; en single-player si P1 llega a 0.

## Cómo ver el diagrama
- En GitHub: el archivo `.md` con Mermaid debería renderizarse si tu repositorio/preview soporta Mermaid.
- En el navegador: copia el bloque `mermaid` y pégalo en https://mermaid.live para ver/editar el diagrama.

---

Si quieres que genere además:
- Un PNG/SVG exportado del diagrama y lo añada a `docs/` (necesitaría una herramienta externa o que tú lo confirmes),
- Más detalle en sub-diagramas (por ejemplo, un sub-diagrama para `Kitten.update()` o para el sistema de `Trash`), o
- Una versión en PlantUML/PNG para insertar en presentaciones,
dímelo y lo preparo.