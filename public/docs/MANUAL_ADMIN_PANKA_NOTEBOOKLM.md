# Manual Completo de Operaciones y Panel de Administración — Panka Products (pankaproducts.com)

## 1. Información General del Negocio
- **Sitio Web Oficial:** https://www.pankaproducts.com
- **Dirección del Local (Pickup / Recogida):** 8051 West 24 Ave. Suite 17, Hialeah, FL 33016
- **Horario de Recogida (Pickup):** Lunes a Viernes de 8:00 AM a 4:00 PM
- **WhatsApp Oficial de Pedidos:** +1 (954) 901-4340

---

## 2. Cómo Funciona la Tienda para los Clientes (Frontend)
1. **Catálogo Bilingüe (Inglés / Español):**
   - Los clientes pueden cambiar el idioma entre Español (`ES`) e Inglés (`EN`) desde la barra superior.
   - Los productos están organizados por categorías: **Salados (Savory)**, **Dulces (Sweet)** y **Especiales (Specials)**.
   - Al hacer clic en cualquier tamal, se abre un modal con su foto, descripción e ingredientes detallados.

2. **Carrito Inteligente y Cálculo de Envío en Estados Unidos:**
   - El carrito lateral permite calcular el costo de envío antes de pagar:
     - **Miami-Dade County, FL:** **Delivery Gratis ($0.00)**
     - **Broward County, FL:** **Delivery Gratis ($0.00)**
     - **Recogida en Local (Pickup en Hialeah — 8051 West 24 Ave. Suite 17, Hialeah, FL 33016, Lunes a Viernes 8:00 AM – 4:00 PM):** **Gratis ($0.00)**
     - **Cualquier otro condado de Florida o cualquiera de los 50 Estados de EE. UU.:** **$25.00 USD Shipping Rate**
   - En la página de Checkout (`/checkout`), al escribir los 5 dígitos del **ZIP Code**, el sistema consulta automáticamente la ciudad, el estado y el condado para aplicar la tarifa correcta sin errores.

3. **Dos Formas de Comprar y Confirmación por WhatsApp en Inglés:**
   - **Pago directo con tarjeta (Stripe Live):** El cliente paga con tarjeta de crédito/débito, Apple Pay o Google Pay directamente dentro de la web sin salir de `pankaproducts.com`.
   - **Confirmación Post-Pago por WhatsApp:** Al completarse el pago en `/pedido-exitoso`, el cliente ve su recibo confirmado y un botón verde (**"Send Paid Order via WhatsApp"**) que envía su orden pagada al WhatsApp de Panka con el mensaje estructurado en inglés.
   - **Pedido directo por WhatsApp desde el Carrito:** Si el cliente prefiere coordinar por WhatsApp desde el carrito, el botón transfiere todos los productos, ubicación y tarifa de envío en inglés.

4. **Portal del Cliente (`/cuenta`):**
   - Los usuarios pueden crear su cuenta con correo y contraseña (con validación de confirmación de contraseña y mensajes en español/inglés) o con Google.
   - En **Mi Cuenta (`/cuenta`)**, el cliente ve su historial de compras, el estado de cocina de cada pedido en tiempo real y puede abrir o imprimir su **Recibo Digital**.

---

## 3. Cómo Usar el Panel de Administración (`/admin`)

### A. Acceso y Seguridad Blindada
- Solo los correos autorizados como Administradores (con permisos criptográficos en Firebase Auth + lista blanca de administradores) pueden entrar a `/admin`.
- Si un usuario normal intenta entrar a `/admin`, el escudo `AdminGuard` bloquea el acceso inmediatamente.

### B. Alertas en Vivo y Campana de Cocina
- En el menú izquierdo del Panel Admin verás el recuadro **"Alertas Navegador"** con el botón **"Activar Notificaciones"**.
- Al activarlo:
  - Cada vez que un cliente pague un pedido en la web, **sonará una campana doble de cocina** en tu computadora o teléfono.
  - Aparecerá una **notificación nativa del navegador** y una **tarjeta flotante en vivo** con el nombre del cliente, monto pagado y botón directo para escribirle por WhatsApp.

### C. Dashboard Principal (`/admin`)
- Muestra tus métricas clave filtrables por **24 Horas**, **7 Días**, **30 Días** o **Histórico**:
  - **Ingresos del Período**
  - **Productos Activos en Menú**
  - **Tamal Más Vendido (Top Seller)**
  - **Tabla de Pedidos Recientes**

### D. Gestión de Pedidos y Despacho (`/admin/pedidos`)
- Es el centro de control de tu cocina:
  1. **Filtros rápidos:** Filtra por *Todos*, *En Cocina*, *Entregados* o *Cancelados*, o busca por nombre, teléfono, dirección o ID.
  2. **Cambiar Estado:** Cambia cada orden entre:
     - `confirmed` (Confirmado en Cocina)
     - `preparing` (En preparación)
     - `delivered` (Entregado)
     - `cancelled` (Cancelado)
  3. **Botón de WhatsApp al Cliente (en Inglés):** En cada fila de la tabla, en las tarjetas móviles y dentro del modal de detalle tienes un botón verde de WhatsApp. Al pulsarlo, abre WhatsApp directamente hacia el número del cliente con un mensaje prellenado en inglés que incluye su número de orden, productos, dirección, total pagado y un saludo acorde al estado actual del pedido.
  4. **Imprimir Comanda de Cocina:** El botón de impresora genera un ticket formato 80mm listo para impresora térmica o PDF con los productos a preparar y notas de entrega.

### E. Gestión de Menú y Productos (`/admin/productos`)
- Permite administrar todo tu catálogo sin tocar código:
  - **Crear o Editar Productos:** Nombre, descripción, categoría (`salados`, `dulces`, `especiales`), precio en USD, stock, ingredientes y fotografía (puedes subir imágenes desde tu computadora o celular).
  - **Disponibilidad inmediata (`isAvailable`):** Si un sabor se agota hoy en cocina, puedes desactivar su disponibilidad con un clic y se marcará como no disponible al instante.
  - **Reordenar:** Puedes cambiar el orden en que aparecen los tamales en la web.
  - **Sincronización Automática:** Cada producto creado o editado se sincroniza automáticamente con Stripe Live y Firestore.

### F. Configuración y Contenido CMS (`/admin/settings`)
- Dividido en pestañas fáciles de usar:
  1. **Contacto & Estado de Tienda:** Abre o cierra temporalmente la tienda, edita el WhatsApp, teléfono, correo, dirección de Pickup (`8051 West 24 Ave. Suite 17, Hialeah, FL 33016`) y horario (`Mon-Fri: 8:00 AM - 4:00 PM`).
  2. **Barra de Anuncios:** Activa, edita o agrega mensajes promocionales en la barra superior (en inglés y español).
  3. **Portada (Hero) & Banner Promocional:** Edita los títulos, subtítulos, botones y fotos del carrusel principal.
  4. **Historia & Delivery Info:** Edita la historia de Panka, la biografía de Fanny y los detalles de Delivery, Pickup en Hialeah y Pedidos Programados.
  5. **Administradores:** Agrega o revoca permisos de administrador para otros miembros de tu equipo.

---

## 4. Blindaje de Seguridad y Alta Disponibilidad
- **Rate Limiting (Protección contra tráfico masivo y bots):** Todas las rutas críticas (`/api/stripe/embedded-session`, `/api/orders/*`, `/admin/api/*`) cuentan con límite de peticiones por IP con limpieza automática de memoria.
- **Protección Anti-XSS e Inyección:** Todos los formularios de clientes y entradas de configuración pasan por sanitización profunda (`sanitizePlainText`, `sanitizeDeep`) que bloquea etiquetas `<script>`, eventos maliciosos y contaminación de prototipos.
- **Cabeceras de Seguridad HTTP (CSP, HSTS, X-Frame-Options, nosniff):** Configuradas en producción para proteger pagos de Stripe y sesiones de usuarios.
