# Panka — Pasar Stripe a producción (cobros reales)

Este documento es para **el dueño del negocio**. No es técnico: lista lo que Stripe pide para que la tienda cobre con tarjetas de verdad y el dinero llegue a su banco.

Hoy el sitio puede hacer el recorrido de compra, pero está en **modo prueba**. Las tarjetas de prueba no cobran. Para cobrar de verdad hay que **activar la cuenta de Stripe** y luego nosotros conectamos esas claves al sitio publicado.

---

## Qué van a lograr

Cuando esto esté listo:

- Un cliente paga un tamal con su tarjeta real.
- El dinero entra a Stripe y luego a **su cuenta de banco**.
- El pedido aparece en el panel de Panka (`/admin/pedidos`).
- En el extracto del banco del cliente se lee algo reconocible, por ejemplo *PANKA TAMALES*.

---

## Lo que tienen que reunir (antes de abrir Stripe)

Ténganlo a mano. Si un dato no coincide con los papeles, Stripe se atrasa.

### Del negocio

- Tipo de negocio: persona, LLC, corporación, etc.
- **Nombre legal exacto** (el mismo del IRS o de Florida, no solo “Panka”).
- Número de impuestos: **EIN** (empresa) o **SSN** (si es persona / sole proprietor).
- Dirección **física** del negocio (no un apartado postal de adorno).
- Teléfono y correo de atención al cliente.
- Dirección del sitio cuando esté publicado (ej. `https://www.pankatamales.com`).
- Texto corto de cómo quieren que salga el cargo en el banco del cliente (máx. ~22 caracteres, claro: *PANKA TAMALES*).

### De las personas dueñas

Stripe pide datos de quien representa el negocio y de quien tenga **25% o más**:

- Nombre legal, fecha de nacimiento, dirección de casa.
- Últimos 4 dígitos del SSN (a veces piden el SSN completo o una foto del ID).

### Del banco

- Cuenta de banco **de Estados Unidos** a nombre del negocio (o de la persona, si Stripe lo acepta así).
- Routing number y account number, o listos para conectar el banco con Plaid.

### Si Stripe pide papeles (pasa a menudo)

Suban fotos o PDF nítidos:

- Identificación oficial (licencia o pasaporte).
- Recibo de luz/agua o estado de cuenta con la dirección.
- Carta del IRS (SS-4 o 147C) o documentos de la LLC.

---

## Qué hacen ustedes en Stripe (paso a paso)

1. Entren a [dashboard.stripe.com](https://dashboard.stripe.com) con la cuenta de Panka.
2. Arriba, cambien de **Test / Prueba** a **Active / Activo** (modo real).
3. Completen el **checklist de activación** que Stripe muestra (empresa, dueños, banco, sitio).
4. Esperen a que Stripe marque todo en verde. Si piden más documentos, súbanlos el mismo día.
5. Activen **verificación en dos pasos** en la cuenta (recomendado).
6. Cuando esté activo, avisen al equipo técnico. **No envíen las claves secretas por WhatsApp ni por correo.** Nosotros las pedimos por un canal seguro o las cargan ustedes en Vercel con nuestra guía.

La verificación la hace Stripe, no Panka. Nosotros no podemos “saltar” ese paso.

---

## Qué hace el equipo técnico después (no lo hacen ustedes)

Cuando Stripe esté verde y el sitio esté en internet:

1. Cambiar las claves de prueba por las de **producción** (`pk_live_…` / `sk_live_…`).
2. Registrar el webhook real: `https://SU-DOMINIO/api/stripe/webhook`.
3. Volver a cargar el **menú** en el panel admin. Los productos de prueba **no se copian solos** al modo real: hay que crearlos otra vez (o confirmarlos) en producción.
4. Hacer **una compra real pequeña** (un tamal) para ver: cargo en Stripe, pedido en el panel y, en 1–2 días hábiles, el depósito en el banco.

---

## Qué no hace falta que resuelvan ustedes

- El código del checkout ya está listo para producción; solo cambian las claves.
- No hay que “instalar” Stripe otra vez.
- El panel de menú y pedidos sigue siendo el de Panka. Stripe sigue siendo la caja: cobros, reembolsos y disputas.

---

## Tiempos típicos

| Paso | Quién | Tiempo habitual |
|---|---|---|
| Juntar papeles y datos | Panka | 1 tarde, si ya tienen EIN y banco |
| Llenar el formulario de Stripe | Panka | 20–40 minutos |
| Revisión de Stripe | Stripe | Horas o 1–3 días hábiles si piden documentos |
| Conectar el sitio y recrear el menú | Equipo técnico | Un bloque de trabajo, cuando haya dominio y cuenta verde |
| Primer depósito al banco | Stripe | Según su calendario de payouts (a menudo 2 días hábiles) |

---

## Lista para marcar

- [ ] Nombre legal e impuestos (EIN o SSN) a la mano
- [ ] Dirección física y contacto de soporte
- [ ] Dueños / representante con ID
- [ ] Banco de EE. UU. listo
- [ ] Sitio publicado con dominio propio
- [ ] Checklist de Stripe en verde (modo activo)
- [ ] Aviso al equipo técnico para conectar producción
- [ ] Menú recargado en el panel (productos reales)
- [ ] Compra de prueba real hecha y revisada

---

## Preguntas frecuentes

**¿Puedo cobrar mañana si lleno Stripe hoy?**  
Solo si Stripe aprueba la cuenta y el sitio ya está publicado con las claves live. El cuello de botella suele ser la verificación, no el código.

**¿El dinero llega el mismo día?**  
Casi nunca. Stripe retiene un poco y deposita según el calendario de la cuenta.

**¿Qué ve el cliente en su tarjeta?**  
El *statement descriptor* que ustedes definan. Si no se entiende, hay más disputas.

**¿Seguimos pudiendo probar sin cobrar?**  
Sí. El modo prueba sigue existiendo aparte. Producción es otro “mundo”: productos y pedidos de prueba no aparecen ahí.

---

Cuando tengan el checklist de Stripe en verde, avisen y conectamos la tienda a cobros reales.
