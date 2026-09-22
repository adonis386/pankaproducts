import type { Locale } from "@/lib/translations";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  disclaimer: string;
};

const COMPANY = "FANNY FOOD PERUVIAN CORP";
const BRAND = "Panka";
const ADDRESS = "8051 W 24th Ave Ste 17, Hialeah, FL 33016";
const EMAIL = "hello@pankatamales.com";
const LAST_UPDATED = "September 22, 2026";

export const privacyPolicy: Record<Locale, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: LAST_UPDATED,
    intro: `${COMPANY} (“we”, “us”), operating the ${BRAND} website and online ordering experience, explains how we collect, use, and share personal information when you browse, create an account, or place a food order.`,
    disclaimer:
      "This page is an informational template tailored to a Florida food e-commerce site. It is not legal advice. Have counsel review it before relying on it for compliance.",
    sections: [
      {
        heading: "1. Who we are",
        paragraphs: [
          `${COMPANY} operates ${BRAND} from ${ADDRESS}. Contact: ${EMAIL}.`,
        ],
      },
      {
        heading: "2. Information we collect",
        paragraphs: [
          "Depending on how you use the site, we may process:",
        ],
        bullets: [
          "Identity and contact data: name, email, phone, delivery address, and order notes.",
          "Account data: Firebase authentication identifiers if you register or sign in.",
          "Order and payment metadata: items ordered, amounts, and Stripe payment/session identifiers. Card numbers are processed by Stripe and are not stored on our servers.",
          "Technical data: device/browser type, approximate location derived from IP, and pages viewed.",
          "Preferences: language choice and cart contents stored locally on your device.",
        ],
      },
      {
        heading: "3. Why we use your information",
        paragraphs: ["We use personal data to:"],
        bullets: [
          "Fulfill and deliver food orders and provide customer support.",
          "Process payments and prevent fraud through Stripe.",
          "Maintain your account and order history.",
          "Improve site reliability, accessibility, and menu availability.",
          "Send transactional messages (order confirmation, delivery updates). Marketing messages only if you opt in.",
        ],
      },
      {
        heading: "4. Cookies and similar technologies",
        paragraphs: [
          "We use essential cookies/local storage for cart, language, authentication session, and checkout. Optional analytics or marketing cookies—if enabled later—will only run after you consent. See our Cookie Policy for details.",
        ],
      },
      {
        heading: "5. Sharing with service providers",
        paragraphs: [
          "We share data only as needed to operate the store:",
        ],
        bullets: [
          "Stripe — payments and checkout.",
          "Firebase (Google) — authentication and order records.",
          "Hosting/CDN providers that serve the website.",
          "Delivery partners or kitchen staff fulfilling your order.",
        ],
      },
      {
        heading: "6. Sale of personal data / targeted ads",
        paragraphs: [
          "We do not sell your personal information for money. We do not currently run third-party targeted advertising pixels. If that changes, we will update this notice and provide an opt-out.",
        ],
      },
      {
        heading: "7. Your choices and requests",
        paragraphs: [
          `You may request access, correction, or deletion of personal data we hold, subject to legal retention needs (for example, completed paid orders). Email ${EMAIL} with the subject “Privacy request”. We aim to respond within 45 days.`,
        ],
      },
      {
        heading: "8. Children",
        paragraphs: [
          "The site is not directed to children under 13. We do not knowingly collect personal information from children under 13.",
        ],
      },
      {
        heading: "9. Data retention and security",
        paragraphs: [
          "We keep order records as long as needed for kitchen operations, accounting, dispute resolution, and legal obligations. We use industry-standard safeguards (HTTPS, server-side secrets, signed webhooks). No method of transmission is 100% secure.",
        ],
      },
      {
        heading: "10. Florida and other U.S. notices",
        paragraphs: [
          "We operate in Florida. Broader state privacy laws (including Florida’s Digital Bill of Rights) may apply only when statutory thresholds are met. Regardless, we publish this notice so customers understand how a food-ordering site handles data. California residents may also have rights under the CCPA/CPRA where applicable; contact us to exercise them.",
        ],
      },
      {
        heading: "11. Changes",
        paragraphs: [
          "We may update this policy. The “Last updated” date at the top will change when we do. Continued use of the site after updates means you acknowledge the revised notice.",
        ],
      },
    ],
  },
  es: {
    title: "Política de privacidad",
    lastUpdated: LAST_UPDATED,
    intro: `${COMPANY} (“nosotros”), que opera el sitio y los pedidos en línea de ${BRAND}, explica cómo recopilamos, usamos y compartimos información personal cuando navegas, creas una cuenta o haces un pedido de comida.`,
    disclaimer:
      "Esta página es una plantilla informativa orientada a un e-commerce de comida en Florida. No constituye asesoría legal. Pide revisión a un abogado antes de usarla como cumplimiento definitivo.",
    sections: [
      {
        heading: "1. Quiénes somos",
        paragraphs: [
          `${COMPANY} opera ${BRAND} desde ${ADDRESS}. Contacto: ${EMAIL}.`,
        ],
      },
      {
        heading: "2. Información que recopilamos",
        paragraphs: ["Según cómo uses el sitio, podemos tratar:"],
        bullets: [
          "Datos de identidad y contacto: nombre, correo, teléfono, dirección de entrega y notas del pedido.",
          "Datos de cuenta: identificadores de autenticación de Firebase si te registras o inicias sesión.",
          "Metadatos de pedido y pago: productos, montos e identificadores de sesión/pago de Stripe. Los números de tarjeta los procesa Stripe y no se guardan en nuestros servidores.",
          "Datos técnicos: tipo de dispositivo/navegador, ubicación aproximada por IP y páginas vistas.",
          "Preferencias: idioma y carrito guardados localmente en tu dispositivo.",
        ],
      },
      {
        heading: "3. Para qué usamos la información",
        paragraphs: ["Usamos datos personales para:"],
        bullets: [
          "Preparar, entregar y dar soporte a pedidos de comida.",
          "Procesar pagos y prevenir fraude con Stripe.",
          "Mantener tu cuenta e historial de pedidos.",
          "Mejorar disponibilidad del menú, fiabilidad y accesibilidad del sitio.",
          "Enviar mensajes transaccionales (confirmación, actualizaciones). Marketing solo si optas por recibirlo.",
        ],
      },
      {
        heading: "4. Cookies y tecnologías similares",
        paragraphs: [
          "Usamos cookies/almacenamiento esencial para carrito, idioma, sesión de autenticación y checkout. Cookies opcionales de analítica o marketing—si se activan después—solo correrán con tu consentimiento. Ver la Política de cookies.",
        ],
      },
      {
        heading: "5. Compartición con proveedores",
        paragraphs: ["Compartimos datos solo lo necesario para operar la tienda:"],
        bullets: [
          "Stripe — pagos y checkout.",
          "Firebase (Google) — autenticación y registros de pedidos.",
          "Proveedores de hosting/CDN que sirven el sitio.",
          "Personal de cocina o mensajería que cumple el pedido.",
        ],
      },
      {
        heading: "6. Venta de datos / publicidad dirigida",
        paragraphs: [
          "No vendemos tu información personal a cambio de dinero. Hoy no usamos píxeles de publicidad dirigida de terceros. Si eso cambia, actualizaremos este aviso y ofreceremos exclusión.",
        ],
      },
      {
        heading: "7. Tus opciones y solicitudes",
        paragraphs: [
          `Puedes pedir acceso, corrección o eliminación de datos personales, sujeto a retención legal (p. ej. pedidos pagados). Escribe a ${EMAIL} con el asunto “Solicitud de privacidad”. Buscamos responder en 45 días.`,
        ],
      },
      {
        heading: "8. Menores",
        paragraphs: [
          "El sitio no está dirigido a menores de 13 años. No recopilamos a sabiendas datos de menores de 13.",
        ],
      },
      {
        heading: "9. Conservación y seguridad",
        paragraphs: [
          "Conservamos pedidos el tiempo necesario para cocina, contabilidad, disputas y obligaciones legales. Usamos medidas estándar (HTTPS, secretos en servidor, webhooks firmados). Ningún método es 100% seguro.",
        ],
      },
      {
        heading: "10. Avisos de Florida y otros estados de EE. UU.",
        paragraphs: [
          "Operamos en Florida. Leyes estatales más amplias (incluida la Florida Digital Bill of Rights) pueden aplicar solo si se cumplen umbrales legales. Aun así publicamos este aviso para transparencia en un sitio de pedidos de comida. Residentes de California pueden tener derechos CCPA/CPRA cuando apliquen; contáctanos para ejercerlos.",
        ],
      },
      {
        heading: "11. Cambios",
        paragraphs: [
          "Podemos actualizar esta política. La fecha de “Última actualización” cambiará. Seguir usando el sitio implica que conoces el aviso revisado.",
        ],
      },
    ],
  },
};

export const cookiePolicy: Record<Locale, LegalDoc> = {
  en: {
    title: "Cookie Policy",
    lastUpdated: LAST_UPDATED,
    intro: `This Cookie Policy explains how ${BRAND} (${COMPANY}) uses cookies and similar storage on our food-ordering website.`,
    disclaimer:
      "Informational template for a Florida restaurant e-commerce site — not legal advice.",
    sections: [
      {
        heading: "1. What we mean by cookies",
        paragraphs: [
          "Cookies are small text files stored on your device. We also use browser local storage for preferences such as language and cart contents. Together we call them “cookies” here.",
        ],
      },
      {
        heading: "2. Essential cookies (always on)",
        paragraphs: [
          "These are required to run an online food store and cannot be switched off in our systems:",
        ],
        bullets: [
          "Shopping cart and checkout flow.",
          "Language preference.",
          "Authentication session (Firebase) when you sign in.",
          "Security and payment processing with Stripe.",
          "Cookie-consent choice itself.",
        ],
      },
      {
        heading: "3. Optional cookies",
        paragraphs: [
          "We may add analytics or marketing cookies later (for example, to understand popular dishes). Those are optional and will load only after you accept them in the cookie banner.",
        ],
      },
      {
        heading: "4. How to manage cookies",
        paragraphs: [
          "Use the on-site banner to accept optional cookies or continue with essential only. You can also clear site data in your browser settings. Blocking essential cookies may break ordering and login.",
        ],
      },
      {
        heading: "5. Contact",
        paragraphs: [`Questions: ${EMAIL}.`],
      },
    ],
  },
  es: {
    title: "Política de cookies",
    lastUpdated: LAST_UPDATED,
    intro: `Esta Política de cookies explica cómo ${BRAND} (${COMPANY}) usa cookies y almacenamiento similar en nuestro sitio de pedidos de comida.`,
    disclaimer:
      "Plantilla informativa para un e-commerce de restaurante en Florida — no es asesoría legal.",
    sections: [
      {
        heading: "1. Qué entendemos por cookies",
        paragraphs: [
          "Las cookies son pequeños archivos de texto en tu dispositivo. También usamos almacenamiento local del navegador para preferencias como idioma y carrito. Aquí las llamamos “cookies”.",
        ],
      },
      {
        heading: "2. Cookies esenciales (siempre activas)",
        paragraphs: [
          "Son necesarias para operar una tienda de comida en línea y no se pueden desactivar en nuestros sistemas:",
        ],
        bullets: [
          "Carrito y flujo de checkout.",
          "Preferencia de idioma.",
          "Sesión de autenticación (Firebase) al iniciar sesión.",
          "Seguridad y pagos con Stripe.",
          "La propia elección del banner de cookies.",
        ],
      },
      {
        heading: "3. Cookies opcionales",
        paragraphs: [
          "Más adelante podemos añadir cookies de analítica o marketing (por ejemplo, para saber qué platos gustan más). Serán opcionales y solo se cargarán si las aceptas en el banner.",
        ],
      },
      {
        heading: "4. Cómo gestionarlas",
        paragraphs: [
          "Usa el banner del sitio para aceptar opcionales o continuar solo con esenciales. También puedes borrar datos del sitio en el navegador. Bloquear esenciales puede romper pedidos e inicio de sesión.",
        ],
      },
      {
        heading: "5. Contacto",
        paragraphs: [`Consultas: ${EMAIL}.`],
      },
    ],
  },
};

export const accessibilityStatement: Record<Locale, LegalDoc> = {
  en: {
    title: "Accessibility statement",
    lastUpdated: LAST_UPDATED,
    intro: `${BRAND} wants everyone in Miami to order our tamales with confidence. We aim to conform to WCAG 2.2 Level AA for our public storefront, following W3C guidance used widely for ADA-related web accessibility.`,
    disclaimer:
      "This statement describes our goals and practices. It is not a formal certification of conformance.",
    sections: [
      {
        heading: "1. Our approach",
        paragraphs: [
          "For a food e-commerce experience we prioritize:",
        ],
        bullets: [
          "HTML menu and product text (names, prices, descriptions, ingredients)—not images of text as the only source.",
          "Meaningful alternative text on food photos and meaningful images; empty alt on purely decorative graphics.",
          "Keyboard access to navigation, cart, product details, and forms.",
          "Visible focus styles and sufficient color contrast for text and controls where feasible.",
          "Clear labels on checkout fields and status messages for orders.",
        ],
      },
      {
        heading: "2. Known limitations",
        paragraphs: [
          "Third-party embeds (for example Stripe Embedded Checkout) are controlled by the provider. Some admin-only screens may lag behind public-page accessibility work. We improve issues as we find them.",
        ],
      },
      {
        heading: "3. Feedback",
        paragraphs: [
          `If you find a barrier—missing alt text, a control that cannot be reached by keyboard, or unclear order status—email ${EMAIL} with “Accessibility” in the subject, the page URL, and what you were trying to do. We aim to reply within 5 business days.`,
        ],
      },
      {
        heading: "4. Compatibility",
        paragraphs: [
          "We test with current major browsers and common assistive technologies. Older browsers may not receive the same level of support.",
        ],
      },
    ],
  },
  es: {
    title: "Declaración de accesibilidad",
    lastUpdated: LAST_UPDATED,
    intro: `${BRAND} quiere que cualquiera en Miami pueda pedir nuestros tamales con confianza. Buscamos alinearnos con WCAG 2.2 nivel AA en la tienda pública, siguiendo la guía del W3C usada habitualmente en accesibilidad web relacionada con ADA.`,
    disclaimer:
      "Esta declaración describe metas y prácticas. No es una certificación formal de conformidad.",
    sections: [
      {
        heading: "1. Nuestro enfoque",
        paragraphs: [
          "En un e-commerce de comida priorizamos:",
        ],
        bullets: [
          "Menú y productos en HTML (nombre, precio, descripción, ingredientes)—no solo imágenes con texto.",
          "Textos alternativos (alt) útiles en fotos de comida; alt vacío en gráficos solo decorativos.",
          "Uso con teclado de navegación, carrito, detalle de producto y formularios.",
          "Estilos de foco visibles y contraste suficiente en texto y controles cuando es viable.",
          "Etiquetas claras en checkout y mensajes de estado del pedido.",
        ],
      },
      {
        heading: "2. Limitaciones conocidas",
        paragraphs: [
          "Componentes de terceros (p. ej. Stripe Embedded Checkout) los controla el proveedor. Algunas pantallas solo de admin pueden ir detrás de la tienda pública. Corregimos problemas conforme aparecen.",
        ],
      },
      {
        heading: "3. Comentarios",
        paragraphs: [
          `Si encuentras una barrera—alt faltante, control sin teclado o estado de pedido poco claro—escribe a ${EMAIL} con el asunto “Accesibilidad”, la URL y qué intentabas hacer. Buscamos responder en 5 días hábiles.`,
        ],
      },
      {
        heading: "4. Compatibilidad",
        paragraphs: [
          "Probamos con navegadores actuales y tecnologías de apoyo habituales. Navegadores muy antiguos pueden no recibir el mismo nivel de soporte.",
        ],
      },
    ],
  },
};

export const termsOfService: Record<Locale, LegalDoc> = {
  en: {
    title: "Terms of service",
    lastUpdated: LAST_UPDATED,
    intro: `These Terms govern use of the ${BRAND} website and food orders placed with ${COMPANY}. By ordering, you agree to these Terms.`,
    disclaimer:
      "Template for a Florida food e-commerce site — not a substitute for attorney-reviewed terms.",
    sections: [
      {
        heading: "1. Orders and availability",
        paragraphs: [
          "Menu items are subject to daily kitchen availability. Prices are shown before checkout and charged via Stripe. We may cancel or refund an order if an item becomes unavailable after payment.",
        ],
      },
      {
        heading: "2. Delivery and pickup",
        paragraphs: [
          "Delivery windows and areas (Miami / surrounding) are communicated at checkout or by our team. Provide accurate address and phone so we can complete delivery.",
        ],
      },
      {
        heading: "3. Allergens and food safety",
        paragraphs: [
          "Ingredient lists are provided in good faith. Our kitchen may handle common allergens (such as corn, dairy, eggs, nuts, or gluten-containing items depending on the recipe). Contact us before ordering if you have severe allergies.",
        ],
      },
      {
        heading: "4. Accounts and acceptable use",
        paragraphs: [
          "Keep login credentials confidential. Do not misuse the site (fraud, scraping that harms service, or abusive behavior toward staff).",
        ],
      },
      {
        heading: "5. Payments and refunds",
        paragraphs: [
          "Payments are processed by Stripe. Refunds for qualifying issues are handled through our support channel and, when issued, reflected by Stripe.",
        ],
      },
      {
        heading: "6. Contact",
        paragraphs: [`${COMPANY} · ${ADDRESS} · ${EMAIL}`],
      },
    ],
  },
  es: {
    title: "Términos del servicio",
    lastUpdated: LAST_UPDATED,
    intro: `Estos Términos rigen el uso del sitio ${BRAND} y los pedidos de comida con ${COMPANY}. Al pedir, aceptas estos Términos.`,
    disclaimer:
      "Plantilla para e-commerce de comida en Florida — no sustituye términos revisados por un abogado.",
    sections: [
      {
        heading: "1. Pedidos y disponibilidad",
        paragraphs: [
          "Los platos dependen de la disponibilidad diaria de cocina. Los precios se muestran antes del pago y se cobran con Stripe. Podemos cancelar o reembolsar si un ítem se agota después del pago.",
        ],
      },
      {
        heading: "2. Entrega y retiro",
        paragraphs: [
          "Zonas y ventanas de entrega (Miami / alrededores) se indican en el checkout o por nuestro equipo. Da una dirección y teléfono correctos para completar la entrega.",
        ],
      },
      {
        heading: "3. Alérgenos e inocuidad",
        paragraphs: [
          "Las listas de ingredientes se ofrecen de buena fe. La cocina puede manipular alérgenos comunes (maíz, lácteos, huevo, frutos secos o gluten según la receta). Contáctanos antes de pedir si tienes alergias graves.",
        ],
      },
      {
        heading: "4. Cuentas y uso aceptable",
        paragraphs: [
          "Mantén tus credenciales en privado. No uses el sitio de forma indebida (fraude, scraping dañino o abuso al personal).",
        ],
      },
      {
        heading: "5. Pagos y reembolsos",
        paragraphs: [
          "Los pagos los procesa Stripe. Reembolsos procedentes se gestionan por soporte y, al emitirse, se reflejan en Stripe.",
        ],
      },
      {
        heading: "6. Contacto",
        paragraphs: [`${COMPANY} · ${ADDRESS} · ${EMAIL}`],
      },
    ],
  },
};
