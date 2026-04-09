# Panka — Estado del proyecto y fases

Este documento es para **Panka** como cliente: resume en qué va el sitio, qué se entregó en la etapa 2 y qué viene en la etapa 3.

---

## Cómo van las tres fases

| Fase | Qué es | Estado |
|------|--------|--------|
| **1** | Anticipo y planeación (contrato, requisitos, cómo va a quedar el proyecto) | Ya realizada |
| **2** | Desarrollo y diseño (sitio funcionando, pantallas armadas, avance acordado) | **Lista — se puede facturar esta etapa** |
| **3** | Entrega y lanzamiento (poner la tienda “en serio” en internet) | **Pendiente** — empieza cuando se **pague la etapa 2** |

---

## Etapa 2 — Qué es lo que ya tienen

En esta etapa quedó armada la **tienda en línea de Panka** con un estilo editorial (colores, tipografías y sensación de marca) y un recorrido completo para el cliente, más las herramientas para que ustedes **administren el menú** sin depender de terceros para cada cambio pequeño.

Abajo está el detalle en lenguaje sencillo, agrupado por tipo de función.

### Experiencia del visitante (tienda pública)

- **Página de inicio** con mensaje principal de la marca, botones para ver el menú y conocer la historia, y **fotos en carrusel** con las imágenes que compartieron.
- **Menú / catálogo de tamales** con filtros por tipo (salados, dulces, especiales, según lo configurado).
- **Ficha de cada producto**: nombre, descripción, precio, imagen e información de ingredientes cuando aplica.
- **Carrito de compras** que se abre desde el ícono del menú: ver productos, cambiar cantidades, quitar ítems, ver subtotal y total, y seguir comprando o ir al pago. Diseño pensado para **celular y computadora**, con buen uso del espacio al desplazar la lista.
- **Sugerencias** en el carrito (“también te puede gustar”) para invitar a sumar otros productos.
- **Proceso de pedido (checkout)**: datos de entrega (nombre, correo, teléfono, dirección, notas) y **pago con tarjeta** a través de **Stripe** (listo para probar el flujo completo; el paso a cobros “en vivo” para el público se alinea con la etapa 3).
- **Cuenta de cliente**: registro o inicio de sesión (por ejemplo con Google) para volver más adelante; página básica de “mi cuenta”.
- **Sitio en dos idiomas**: español e inglés, con selector visible en el menú.
- **Página “Nosotros”** con la historia de la marca y valores.
- **Bloque de información** sobre entrega a domicilio, recogida en tienda y pedidos programados.
- **Formulario de newsletter** en la página principal.
- **Opiniones / testimonios** de clientes en la home (contenido editable vía textos del sitio).
- **Barra superior de anuncios** con mensajes que rotan (envíos, horarios, etc.).
- **Pie de página** con enlaces al menú, historia, cómo pedir, contacto (correo, teléfono, WhatsApp según lo configurado).
- **Icono de la marca** en la pestaña del navegador para que el sitio se reconozca al tener muchas pestañas abiertas.

### Panel de administración (solo equipo autorizado)

- **Inicio de sesión protegido**: solo quienes ustedes definan como administradores pueden entrar al panel.
- **Resumen tipo tablero** con información general del negocio (incluye datos reales donde ya hay catálogo, y en algunos bloques texto o cifras de **ejemplo** para ilustrar pedidos hasta que exista ese módulo al 100%).
- **Gestión del menú / productos**: ver listado, editar nombre, descripción, precio, categoría, si está activo o destacado, orden de aparición.
- **Alta de productos nuevos** con un asistente paso a paso (datos, foto, revisión).
- **Subida de fotos** para cada producto desde el panel.
- **Navegación del panel** acorde al diseño editorial de Panka; algunas secciones (por ejemplo **pedidos avanzados** o **ajustes generales**) pueden aparecer como “próximamente” hasta una siguiente iteración.

### Diseño y contenidos

- Apariencia alineada con la **guía visual** del proyecto (colores tierra y verde, tipografías serif + sans, tarjetas y botones coherentes).
- **Textos mejorados** en menú, pie, avisos, carrito, página principal y metadatos básicos del sitio (título y descripción que ven buscadores), en ambos idiomas.

---

Algunas funciones del panel o del resumen pueden seguir en modo **demostración** o **próximamente**: eso **no invalida** el cierre de la etapa 2 si el contrato contemplaba “desarrollo y diseño” y un sitio funcional; lo que falte para el día del lanzamiento masivo se encaja en la **etapa 3** o en acuerdos posteriores.

---
 
## Etapa 3 — Qué incluye (después del pago de la etapa 2)

La **fase 3** es cuando la tienda **sale al mundo real**. En términos que importan para el negocio, consta sobre todo de tres bloques:

### 1. Dominio y publicación

- Conectar el **dominio propio** de Panka (por ejemplo *supagina.com*) para que los clientes entren por esa dirección.
- Dejar el sitio **publicado de forma estable** en internet (no solo en modo prueba).

### 2. Activar cobros con Stripe

- **Activar Stripe en modo real** para que los pagos con tarjeta entren a su cuenta y el flujo de compra quede listo para clientes finales.
- Revisar juntos que precios, impuestos (si aplican) y correos de confirmación tengan sentido para ustedes.

### 3. Pruebas

- **Probar** el sitio como lo haría un cliente: navegar, agregar al carrito, pagar (con montos de prueba si hace falta), revisar el panel.
- Corregir lo que salga mal o confuso **antes** del lanzamiento oficial.

Si en el contrato incluyen **capacitación** (cómo actualizar productos, subir fotos, etc.), eso también va en esta etapa, en la fecha y forma acordadas.

---

## Qué puede quedar para después (si no está en el contrato)

Cosas como textos legales finales (privacidad, términos), promociones con código, o funciones extra del panel pueden planificarse aparte si no forman parte de la etapa 3 firmada.

---

## Cierre de la etapa 2

Cuando Panka **confirme** que lo entregado en la etapa 2 está conforme con el contrato, esa etapa queda **cerrada** y se puede **emitir factura y cobrar**. Con el pago recibido, se agenda el trabajo de la **etapa 3** (dominio, Stripe activo y pruebas).

---

*Documento para **Panka** — proyecto sitio y tienda en línea.*
