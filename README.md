# Ciberescudo Bolivia

Sitio web estático para educación preventiva sobre estafas digitales en Bolivia.

## Publicar gratis en GitHub Pages

1. Crea un repositorio en GitHub llamado `ciberescudo`.
2. Sube estos archivos: `index.html`, `styles.css`, `app.js` y la carpeta `assets`.
3. En GitHub entra a `Settings > Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Elige la rama `main` y la carpeta `/root`.
6. Guarda los cambios. GitHub mostrará la URL pública.

## Administrador

El botón `Admin` abre un panel para editar:

- Carousel de alertas.
- Tipos de delito.
- Formas de estafa.
- Preguntas del quiz.
- Reportes enviados desde el formulario.
- Imágenes o capturas para enriquecer las alertas y detalles.

PIN inicial: `1234`.

Cambia el PIN en la primera línea de `app.js`:

```js
const ADMIN_PIN = "1234";
```

Importante: al ser un sitio estático, los cambios del panel se guardan en el navegador mediante `localStorage`. Eso sirve para administrar y probar sin pagar servidor, pero no sincroniza automáticamente con todos los visitantes. Para cambios permanentes públicos, edita los datos iniciales dentro de `app.js` y vuelve a subir el archivo a GitHub.

Las imágenes subidas desde el panel también se guardan en el navegador. Para un uso público más avanzado conviene conectar el sitio a un backend o a una base de datos.
