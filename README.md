# Snake Game (Vanilla JS + HTML5 Canvas)

Implementacion clasica del juego Snake desarrollada sin dependencias externas para practicar renderizado 2D, gestion de estados y bucles de juego en el navegador.

## Caracteristicas tecnicas
- **Bucle de juego desacoplado:** Uso de `requestAnimationFrame` con control de delta de tiempo para mantener velocidad constante independientemente de la tasa de refresco del monitor.
- **Buffer de entradas (Input Queue):** Cola de comandos de tamano limitado que previene colisiones accidentales por pulsaciones simultaneas en el mismo tick logico.
- **Persistencia local:** Almacenamiento del record mediante `localStorage`.

## Como ejecutarlo
Clona el repositorio y abre `index.html` directamente en cualquier navegador moderno, o utiliza una extension como *Live Server*.