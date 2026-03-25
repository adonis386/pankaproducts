export type Locale = "en" | "es";

const translations = {
  // ── Navbar ──
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.tamales": { en: "Tamales", es: "Tamales" },
  "nav.about": { en: "About", es: "Nosotros" },
  "nav.signIn": { en: "Sign In", es: "Ingresar" },
  "nav.myAccount": { en: "My Account", es: "Mi Cuenta" },
  "nav.signOut": { en: "Sign Out", es: "Cerrar Sesión" },
  "nav.cart": { en: "Cart", es: "Carrito" },

  // ── Announcement Bar ──
  "announce.1": {
    en: "Free shipping on orders over $50",
    es: "Envío gratis en pedidos mayores a $50",
  },
  "announce.2": {
    en: "Freshly made tamales every day — Order before 2pm, next day delivery",
    es: "Tamales recién hechos todos los días — Pedidos antes de las 2pm, entrega al día siguiente",
  },
  "announce.3": {
    en: "Catering for special events? We do bulk orders!",
    es: "¿Evento especial? ¡Hacemos pedidos por mayoreo!",
  },

  // ── Hero ──
  "hero.badge": { en: "Handmade · Fresh · Daily", es: "Artesanales · Frescos · Diarios" },
  "hero.titleLine1": { en: "Tamales like", es: "Tamales como los" },
  "hero.titleLine2": { en: "abuela's", es: "de casa" },
  "hero.subtitle": {
    en: "Generational recipes, fresh ingredients, delivered to your door in Miami. Order today, enjoy tomorrow.",
    es: "Recetas de generaciones, ingredientes frescos y entrega a tu puerta en Miami. Ordena hoy y recíbelos mañana.",
  },
  "hero.orderNow": { en: "Order Now", es: "Ordenar Ahora" },
  "hero.viewMenu": { en: "View Menu", es: "Ver Menú" },
  "hero.ordersMonth": { en: "Orders / month", es: "Pedidos / mes" },
  "hero.rating": { en: "Rating", es: "Calificación" },
  "hero.delivery": { en: "Delivery", es: "Entrega" },
  "hero.bestSeller": { en: "Best Seller", es: "Más Vendido" },

  // ── Product Card ──
  "product.popular": { en: "Popular", es: "Popular" },
  "product.addToCart": { en: "Add to Cart", es: "Agregar" },
  "product.ingredients": { en: "Ingredients", es: "Ingredientes" },
  "product.noIngredients": {
    en: "No ingredients provided.",
    es: "No hay ingredientes disponibles.",
  },

  // ── Product Carousel ──
  "carousel.viewAll": { en: "View all", es: "Ver todo" },

  // ── Homepage Sections ──
  "home.bestSellers": { en: "Best Sellers", es: "Los Favoritos" },
  "home.allTamales": { en: "Menu", es: "Menú" },
  "home.savory": { en: "Savory", es: "Salados" },
  "home.sweet": { en: "Sweet", es: "Dulces" },
  "home.specials": { en: "Specials", es: "Especiales" },
  "home.bannerTitle": { en: "Tamales Oaxaqueños", es: "Tamales Oaxaqueños" },
  "home.bannerDesc": {
    en: "Wrapped in banana leaf with black mole. A culinary experience from southern Mexico, available in limited edition.",
    es: "Envueltos en hoja de plátano con mole negro. Una experiencia gastronómica del sur de México, disponible en edición limitada.",
  },
  "home.discover": { en: "Discover", es: "Descubrir" },
  "home.reviewsTitle": { en: "What our customers say", es: "Lo que dicen nuestros clientes" },
  "home.review1": {
    en: "The best tamales I've ever had. The mole rojo transported me to my abuelita's kitchen. I order every week.",
    es: "Los mejores tamales que he probado. El de mole rojo me transportó a la cocina de mi abuelita. Pido cada semana.",
  },
  "home.review2": {
    en: "Ordered for a party of 30 and everyone loved them. Delivery was on time and the tamales arrived hot.",
    es: "Pedí para una fiesta de 30 personas y todos quedaron encantados. La entrega fue puntual y los tamales llegaron calientes.",
  },
  "home.review3": {
    en: "The rajas con queso tamales are my addiction. Quality is consistent and the service is excellent.",
    es: "Los tamales de rajas con queso son mi adicción. La calidad es consistente y el servicio es excelente.",
  },

  // ── Delivery Info ──
  "delivery.tabDelivery": { en: "Delivery", es: "Delivery" },
  "delivery.tabPickup": { en: "Pick-Up", es: "Recoger" },
  "delivery.tabSchedule": { en: "Schedule", es: "Programar" },
  "delivery.deliveryTitle": { en: "Local Delivery", es: "Entrega a Domicilio" },
  "delivery.deliveryDesc": {
    en: "Get your tamales delivered hot to your door. Orders placed before 2pm are delivered the next day.",
    es: "Recibe tus tamales calientes en la puerta de tu casa. Pedidos antes de las 2pm se entregan al día siguiente.",
  },
  "delivery.deliveryD1": {
    en: "Coverage from Pinecrest to Boca Raton",
    es: "Cobertura de Pinecrest a Boca Raton",
  },
  "delivery.deliveryD2": {
    en: "Free shipping on orders over $50",
    es: "Envío gratis en pedidos mayores a $50",
  },
  "delivery.deliveryD3": {
    en: "Thermal packaging to keep everything warm",
    es: "Empaque térmico para mantener la temperatura",
  },
  "delivery.pickupTitle": { en: "Store Pick-Up", es: "Recoger en Tienda" },
  "delivery.pickupDesc": {
    en: "Pick up your order ready in 30 minutes after placing it at our Miami location.",
    es: "Recoge tu pedido listo en 30 minutos después de confirmar tu orden en nuestra ubicación en Miami.",
  },
  "delivery.pickupD1": { en: "Doral, FL — 9851 NW 58th St", es: "Doral, FL — 9851 NW 58th St" },
  "delivery.pickupD2": { en: "Monday to Friday: 8am - 7pm", es: "Lunes a Viernes: 8am - 7pm" },
  "delivery.pickupD3": { en: "Saturday: 9am - 4pm", es: "Sábados: 9am - 4pm" },
  "delivery.scheduleTitle": { en: "Scheduled Orders", es: "Pedidos Programados" },
  "delivery.scheduleDesc": {
    en: "Schedule your delivery for the day and time you prefer. Perfect for events and celebrations.",
    es: "Programa tu entrega para el día y hora que prefieras. Ideal para eventos y celebraciones.",
  },
  "delivery.scheduleD1": {
    en: "Schedule up to 7 days in advance",
    es: "Programa con hasta 7 días de anticipación",
  },
  "delivery.scheduleD2": {
    en: "Bulk orders starting at 50 pieces",
    es: "Pedidos por mayoreo desde 50 piezas",
  },
  "delivery.scheduleD3": {
    en: "10% discount on scheduled orders",
    es: "10% de descuento en pedidos programados",
  },

  // ── Newsletter ──
  "newsletter.tag": { en: "Newsletter", es: "Newsletter" },
  "newsletter.title": { en: "Get deals & new flavors", es: "Recibe ofertas y novedades" },
  "newsletter.desc": {
    en: "Subscribe and receive exclusive promotions, new flavors and discounts straight to your inbox.",
    es: "Suscríbete y recibe promociones exclusivas, nuevos sabores y descuentos directo en tu correo.",
  },
  "newsletter.placeholder": { en: "your@email.com", es: "tu@correo.com" },
  "newsletter.submit": { en: "Subscribe", es: "Suscribir" },
  "newsletter.thanks": { en: "Thanks for subscribing!", es: "¡Gracias por suscribirte!" },

  // ── Cart Drawer ──
  "cart.title": { en: "Cart", es: "Carrito" },
  "cart.empty": { en: "Your cart is empty", es: "Tu carrito está vacío" },
  "cart.emptyDesc": { en: "Add some tamales to get started", es: "Agrega tamales para comenzar" },
  "cart.browseTamales": { en: "Browse Tamales", es: "Ver Tamales" },
  "cart.goesGreatWith": { en: "Goes great with", es: "Va muy bien con" },
  "cart.subtotal": { en: "Subtotal", es: "Subtotal" },
  "cart.checkout": { en: "Checkout", es: "Finalizar Pedido" },
  "cart.continueShopping": { en: "Continue Shopping", es: "Seguir comprando" },

  // ── Auth Modal ──
  "auth.welcomeBack": { en: "Welcome back", es: "Bienvenido" },
  "auth.createAccount": { en: "Create Account", es: "Crear Cuenta" },
  "auth.signInDesc": { en: "Sign in to continue", es: "Inicia sesión para continuar" },
  "auth.signUpDesc": { en: "Sign up to place your orders", es: "Regístrate para hacer tus pedidos" },
  "auth.google": { en: "Continue with Google", es: "Continuar con Google" },
  "auth.or": { en: "or", es: "o" },
  "auth.namePlaceholder": { en: "Your name", es: "Tu nombre" },
  "auth.emailPlaceholder": { en: "email@example.com", es: "correo@ejemplo.com" },
  "auth.passwordPlaceholder": { en: "Password", es: "Contraseña" },
  "auth.loading": { en: "Loading...", es: "Cargando..." },
  "auth.signInBtn": { en: "Sign In", es: "Iniciar Sesión" },
  "auth.signUpBtn": { en: "Create Account", es: "Crear Cuenta" },
  "auth.noAccount": { en: "Don't have an account? ", es: "¿No tienes cuenta? " },
  "auth.hasAccount": { en: "Already have an account? ", es: "¿Ya tienes cuenta? " },
  "auth.signUpLink": { en: "Sign up", es: "Regístrate" },
  "auth.signInLink": { en: "Sign in", es: "Inicia sesión" },

  // ── Productos Page ──
  "productos.tag": { en: "Menu", es: "Menú" },
  "productos.title": { en: "Our Tamales", es: "Nuestros Tamales" },
  "productos.all": { en: "All", es: "Todos" },
  "productos.savory": { en: "Savory", es: "Salados" },
  "productos.sweet": { en: "Sweet", es: "Dulces" },
  "productos.specials": { en: "Specials", es: "Especiales" },
  "productos.noResults": { en: "No tamales in this category yet.", es: "No hay tamales en esta categoría." },

  // ── About Page ──
  "about.tag": { en: "Our Story", es: "Nuestra Historia" },
  "about.title": { en: "From abuela's kitchen to the heart of Miami", es: "De la cocina de mamá al corazón de Miami" },
  "about.since": { en: "Since 2020", es: "Desde 2020" },
  "about.p1": {
    en: "Panka was born from a family dream: to share with the world the tamales our grandmother made every Sunday. Those tamales that brought the whole family together around the table.",
    es: "Panka nació de un sueño familiar: compartir con el mundo los tamales que nuestra abuela preparaba cada domingo. Esos tamales que reunían a toda la familia alrededor de la mesa.",
  },
  "about.p2": {
    en: "Today, every tamal that leaves our kitchen carries that same recipe, that same love and dedication. We use fresh, natural ingredients, hand-crafted nixtamalized masa and hand-selected chiles.",
    es: "Hoy, cada tamal que sale de nuestra cocina lleva esa misma receta, ese mismo cariño y esa misma dedicación. Usamos ingredientes frescos y naturales, masa nixtamalizada artesanalmente y chiles seleccionados a mano.",
  },
  "about.p3": {
    en: 'Our name, <strong class="text-panka-brown-500">Panka</strong>, comes from the corn husk that wraps each tamal — a symbol of protection, tradition, and flavor.',
    es: 'Nuestro nombre, <strong class="text-panka-brown-500">Panka</strong>, viene de la hoja de maíz que envuelve cada tamal — símbolo de protección, tradición y sabor.',
  },
  "about.valuesTitle": { en: "Our Values", es: "Nuestros Valores" },
  "about.passion": { en: "Passion", es: "Pasión" },
  "about.passionDesc": {
    en: "Every tamal is prepared with dedication and love, as if it were for our own family.",
    es: "Cada tamal es preparado con dedicación y cariño, como si fuera para nuestra propia familia.",
  },
  "about.tradition": { en: "Tradition", es: "Tradición" },
  "about.traditionDesc": {
    en: "We preserve the ancestral recipes that give life to each of our unique flavors.",
    es: "Preservamos las recetas ancestrales que dan vida a cada uno de nuestros sabores únicos.",
  },
  "about.community": { en: "Community", es: "Comunidad" },
  "about.communityDesc": {
    en: "We work with local producers and support the families in our community.",
    es: "Trabajamos con productores locales y apoyamos a las familias de nuestra comunidad.",
  },
  "about.ctaTitle": { en: "Ready to try our tamales?", es: "¿Listo para probar nuestros tamales?" },
  "about.ctaDesc": {
    en: "Place your first order and discover why we're Miami's favorite.",
    es: "Haz tu primer pedido y descubre por qué somos los favoritos de Miami.",
  },
  "about.ctaBtn": { en: "View Tamales", es: "Ver Tamales" },

  // ── Checkout Page ──
  "checkout.title": { en: "Checkout", es: "Finalizar Pedido" },
  "checkout.continueShopping": { en: "Continue shopping", es: "Seguir comprando" },
  "checkout.stepDelivery": { en: "Delivery", es: "Entrega" },
  "checkout.stepPayment": { en: "Payment", es: "Pago" },
  "checkout.stepConfirmation": { en: "Confirmed", es: "Confirmado" },
  "checkout.orderConfirmed": { en: "Order Confirmed!", es: "¡Pedido Confirmado!" },
  "checkout.thankYou": { en: "Thank you,", es: "Gracias," },
  "checkout.confirmationEmail": { en: "We'll send a confirmation to", es: "Te enviaremos la confirmación a" },
  "checkout.backHome": { en: "Back to Home", es: "Volver al Inicio" },
  "checkout.emptyCart": { en: "Your cart is empty", es: "Tu carrito está vacío" },
  "checkout.emptyCartDesc": { en: "Add some tamales before checking out.", es: "Agrega tamales antes de continuar." },
  "checkout.deliveryDetails": { en: "Delivery Details", es: "Datos de Entrega" },
  "checkout.fullName": { en: "Full Name", es: "Nombre completo" },
  "checkout.namePlaceholder": { en: "Your name", es: "Tu nombre" },
  "checkout.email": { en: "Email", es: "Email" },
  "checkout.phone": { en: "Phone", es: "Teléfono" },
  "checkout.address": { en: "Address", es: "Dirección" },
  "checkout.addressPlaceholder": { en: "Street, number, apt", es: "Calle, número, apto" },
  "checkout.city": { en: "City", es: "Ciudad" },
  "checkout.cityPlaceholder": { en: "Miami, FL", es: "Miami, FL" },
  "checkout.notes": { en: "Notes (optional)", es: "Notas (opcional)" },
  "checkout.notesPlaceholder": { en: "Special instructions, allergies, etc.", es: "Indicaciones especiales, alergias, etc." },
  "checkout.processing": { en: "Processing...", es: "Procesando..." },
  "checkout.confirmOrder": { en: "Confirm Order", es: "Confirmar Pedido" },
  "checkout.orderSummary": { en: "Order Summary", es: "Resumen del Pedido" },
  "checkout.subtotal": { en: "Subtotal", es: "Subtotal" },
  "checkout.shipping": { en: "Shipping", es: "Envío" },
  "checkout.free": { en: "Free", es: "Gratis" },
  "checkout.total": { en: "Total", es: "Total" },

  // ── Account Page ──
  "account.tag": { en: "Account", es: "Cuenta" },
  "account.hi": { en: "Hi,", es: "Hola," },
  "account.signInRequired": { en: "Sign In Required", es: "Inicia Sesión" },
  "account.signInDesc": { en: "You need an account to view your orders and profile.", es: "Necesitas una cuenta para ver tus pedidos y datos." },
  "account.goHome": { en: "Go to Home", es: "Ir al Inicio" },
  "account.profile": { en: "Profile", es: "Perfil" },
  "account.noName": { en: "No name set", es: "Sin nombre" },
  "account.myOrders": { en: "My Orders", es: "Mis Pedidos" },
  "account.noOrders": { en: "No orders yet. Place your first one!", es: "Aún no tienes pedidos. ¡Haz tu primer orden!" },
  "account.settings": { en: "Settings", es: "Configuración" },

  // ── Footer ──
  "footer.desc": {
    en: "Handmade tamales crafted from generational recipes. Fresh ingredients, delivered to your door in Miami.",
    es: "Tamales artesanales hechos con recetas de generaciones. Ingredientes frescos, entrega a domicilio en Miami.",
  },
  "footer.shop": { en: "Shop", es: "Comprar" },
  "footer.savory": { en: "Savory", es: "Salados" },
  "footer.sweet": { en: "Sweet", es: "Dulces" },
  "footer.specials": { en: "Specials", es: "Especiales" },
  "footer.allTamales": { en: "All Tamales", es: "Todos los Tamales" },
  "footer.info": { en: "Info", es: "Información" },
  "footer.aboutUs": { en: "About Us", es: "Nosotros" },
  "footer.menu": { en: "Menu", es: "Menú" },
  "footer.placeOrder": { en: "Place Order", es: "Hacer Pedido" },
  "footer.contact": { en: "Contact", es: "Contacto" },
  "footer.privacy": { en: "Privacy", es: "Privacidad" },
  "footer.terms": { en: "Terms", es: "Términos" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  if (typeof entry === "string") return entry;
  return (entry as Record<Locale, string>)[locale] || key;
}

export default translations;
