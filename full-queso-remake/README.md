# Full Queso - Website Remake

## 1. Descripción del Proyecto

Este proyecto es una reconstrucción completa y moderna del portal web de la empresa de comida rápida "Full Queso". El objetivo es tomar la base funcional existente y elevarla a una experiencia de usuario (UX) memorable y una interfaz de usuario (UI) visualmente atractiva, consistente y profesional.

El rediseño se centrará en mejorar la navegación, establecer una identidad visual coherente, implementar un diseño totalmente responsivo para dispositivos de escritorio y móviles, y añadir animaciones fluidas para crear una experiencia de compra más placentera y dinámica.

## 2. Objetivos Principales

-   **Diseño Responsivo:** Crear una experiencia de usuario óptima tanto en dispositivos móviles como en escritorio.
-   **Mejora de la UI/UX:** Solucionar problemas de usabilidad como menús ocultos, falta de jerarquía visual y navegación poco intuitiva.
-   **Consistencia Visual:** Definir y aplicar una paleta de colores estratégica y una jerarquía tipográfica coherente en todo el sitio.
-   **Experiencia Dinámica:** Integrar animaciones y microinteracciones para dar vida a la interfaz y proporcionar feedback visual al usuario.
-   **Rendimiento:** Asegurar que el sitio sea rápido y optimizado, utilizando herramientas modernas como Vite.

## 3. Stack Tecnológico

| Categoría                  | Tecnología                                                                       | Propósito                                                              |
| -------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Framework**              | [React](https://react.dev/) con [Vite](https://vitejs.dev/)                      | Construcción de la interfaz de usuario y entorno de desarrollo rápido. |
| **Estilos**                | [Tailwind CSS v4](https://tailwindcss.com/)                                      | Framework CSS "utility-first" para un diseño rápido y consistente.     |
| **Animación UI**           | [Framer Motion](https://www.framer.com/motion/)                                  | Para animaciones declarativas y fluidas en la interfaz de usuario.     |
| **Animación Coreográfica** | [Anime.js](https://animejs.com/)                                                 | Para animaciones complejas y secuencias "estrella".                    |
| **Gestión de Estado**      | [Zustand](https://zustand-demo.pmnd.rs/)                                         | Manejo de estado global simple y potente (ej. carrito de compras).     |
| **Formularios**            | [React Hook Form](https://react-hook-form.com/)                                  | Gestión de formularios de alto rendimiento y fácil validación.         |
| **Iconos**                 | [React-Icons](https://react-icons.github.io/react-icons/)                        | Librería extensa de iconos para la aplicación.                         |
| **Enrutamiento**           | [React Router DOM](https://reactrouter.com/)                                     | Para la navegación y el enrutamiento entre páginas.                    |

## 4. Primeros Pasos

1.  Clonar el repositorio.
2.  Instalar las dependencias: `pnpm install`
3.  Iniciar el servidor de desarrollo: `pnpm run dev`


## 5. Estructura de carpetas y componentes

```
full-queso-remake/
├── public/
│   └── logo.svg
├── src/
│   ├── assets/
│   │   ├── images/         # Imágenes de productos, banners
│   │   └── fonts/
│   ├── components/
│   │   ├── common/         # Componentes 100% reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── AnimatedTitle.jsx 
│   │   ├── layout/         # Componentes de estructura
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── PageWrapper.jsx     # Para animaciones de transición
│   │   └── products/
│   │       ├── ProductCard.jsx
│   │       ├── ProductList.jsx
│   │       └── CategoriesMenu.jsx
│   ├── hooks/
│   │   └── useCart.js          # Podrías crear hooks personalizados
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── CartPage.jsx
│   │   ├── AccountPage.jsx
│   │   ├── PromoPage.jsx 
│   │   └── OrderStatusPage.jsx
│   ├── store/
│   │   └── cartStore.js    # Tu store de Zustand para el carrito
│   ├── styles/
│   │   └── index.css       # Archivo principal de CSS con las directivas de Tailwind
│   ├── App.jsx             # Componente raíz con el enrutador
│   └── main.jsx            # Punto de entrada de la aplicación
├── eslint.config.js
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── vite.config.js
```