export type Locale = "en" | "es";

const translations = {
  // ── Navbar ──
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.tamales": { en: "Menu", es: "Menú" },
  "nav.about": { en: "Our Story", es: "Nosotros" },
  "nav.signIn": { en: "Sign in", es: "Entrar" },
  "nav.myAccount": { en: "My account", es: "Mi cuenta" },
  "nav.signOut": { en: "Sign out", es: "Cerrar sesión" },
  "nav.cart": { en: "Open cart", es: "Abrir carrito" },
  "nav.changeLanguage": { en: "Change language", es: "Cambiar idioma" },
  "nav.openMenu": { en: "Open menu", es: "Abrir menú" },
  "nav.closeMenu": { en: "Close menu", es: "Cerrar menú" },

  // ── Announcement Bar ──
  "announce.close": { en: "Close announcement", es: "Cerrar aviso" },
  "announce.1": {
    en: "Free shipping on orders over $50",
    es: "Envío gratis en compras mayores a $50",
  },
  "announce.2": {
    en: "Made fresh daily — order before 2pm for next-day delivery in Miami",
    es: "Hechos al día — pide antes de las 2pm y recibe al día siguiente en Miami",
  },
  "announce.3": {
    en: "Planning an event? Ask us about catering and bulk orders",
    es: "¿Celebras algo? Pregunta por catering y pedidos por volumen",
  },

  // ── Hero ──
  "hero.badge": {
    en: "Nixtamal daily · Hand-wrapped · Miami",
    es: "Nixtamal al día · Envueltos a mano · Miami",
  },
  "hero.titleLine1": { en: "Tamales that taste", es: "Tamales con sabor" },
  "hero.titleLine2": { en: "like Sunday", es: "a domingo" },
  "hero.subtitle": {
    en: "We grind masa from real corn, fill each one with care, and steam them slow — then send them warm to your door anywhere in Miami. Order before 2pm for next-day delivery.",
    es: "Molimos maíz de verdad, rellenamos con mimo y los dejamos al vapor sin prisa; después te los mandamos calientitos donde estés en Miami. Pide antes de las 2pm para recibir al día siguiente.",
  },
  "hero.orderNow": { en: "Order now", es: "Pedir ahora" },
  "hero.viewMenu": { en: "View menu", es: "Ver menú" },
  "hero.carouselLabel": { en: "Featured photos", es: "Fotos destacadas" },
  "hero.carouselSlide1Alt": {
    en: "Hand-wrapped tamales in a basket on a wooden tray",
    es: "Tamales envueltos a mano en una canasta sobre bandeja de madera",
  },
  "hero.carouselSlide2Alt": {
    en: "Artisan tamales — close-up of texture and leaves",
    es: "Tamales artesanales, detalle de textura y hojas",
  },
  "hero.goToSlide": { en: "Go to slide", es: "Ir a la imagen" },
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
  "home.seasonalSelections": { en: "Seasonal Selections", es: "Selecciones de Temporada" },
  "home.signatureDesc": {
    en: "Our signature tamales, prepared daily with stone-ground masa.",
    es: "Nuestros tamales insignia, preparados a diario con masa artesanal.",
  },
  "home.viewAllFlavors": { en: "View all flavors", es: "Ver todos los sabores" },
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
  "cart.selectionTitle": { en: "Your selection", es: "Tu selección" },
  "cart.selectionSubtitle": {
    en: "Take a moment to review your picks before checkout",
    es: "Revisa tu pedido con calma antes de pagar",
  },
  "cart.summary": { en: "Order summary", es: "Resumen del pedido" },
  "cart.shippingNote": {
    en: "We’ll show shipping options at checkout",
    es: "El envío se confirma en el checkout",
  },
  "cart.total": { en: "Total", es: "Total" },
  "cart.each": { en: "ea.", es: "c/u" },
  "cart.proceedCheckout": { en: "Continue to checkout", es: "Continuar al pago" },
  "cart.sustainability": { en: "Thoughtful, low-waste packaging", es: "Empaque cuidadoso y con menos desperdicio" },
  "cart.smallBatches": {
    en: "Small batches, made by hand",
    es: "Lotes pequeños, hechos a mano",
  },
  "cart.promoLabel": { en: "Promo code", es: "Código promocional" },
  "cart.promoPlaceholder": { en: "Enter your code", es: "Escribe tu código" },
  "cart.apply": { en: "Apply", es: "Aplicar" },
  "cart.promoNotAvailable": {
    en: "Promo codes aren’t available yet — check back soon.",
    es: "Los códigos promocionales llegarán pronto.",
  },
  "cart.empty": { en: "Nothing in your cart yet", es: "Tu carrito está vacío" },
  "cart.emptyDesc": {
    en: "Explore the menu and add your favorite tamales.",
    es: "Explora el menú y agrega tus tamales favoritos.",
  },
  "cart.browseTamales": { en: "Browse the menu", es: "Ver el menú" },
  "cart.goesGreatWith": { en: "You might also like", es: "También te puede gustar" },
  "cart.subtotal": { en: "Subtotal", es: "Subtotal" },
  "cart.shipping": { en: "Shipping", es: "Envío" },
  "cart.checkout": { en: "Checkout", es: "Pagar" },
  "cart.continueShopping": { en: "Keep shopping", es: "Seguir comprando" },
  "cart.close": { en: "Close cart", es: "Cerrar carrito" },
  "cart.removeItem": { en: "Remove item", es: "Quitar artículo" },
  "cart.decreaseQty": { en: "Decrease quantity", es: "Menos" },
  "cart.increaseQty": { en: "Increase quantity", es: "Más" },
  "cart.addToCart": { en: "Add to cart", es: "Agregar al carrito" },

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
  "about.fannyHeading": { en: "Meet Fanny", es: "Conoce a Fanny" },
  "about.fannyRole": { en: "Our owner and founder", es: "Nuestra propietaria y fundadora" },
  "about.fannyP1": {
    en: "Fanny’s culinary passion, rooted in the vibrant streets of Lima, Peru, found new expression when she moved to the United States. This transition was more than a change of location; it was a turning point in her culinary story.",
    es: "La pasión culinaria de Fanny, con raíces en las calles vibrantes de Lima, Perú, cobró nueva forma al mudarse a Estados Unidos. Fue más que un cambio de lugar: un punto de inflexión en su historia culinaria.",
  },
  "about.fannyP2": {
    en: "Surrounded by a melting pot of cultures yet missing the authentic flavors of home, Fanny was inspired to bring the rich, diverse tastes of Latin-American cuisine to a new audience. This inspiration was the catalyst for the creation of Panka, a platform where she could proudly showcase her heritage and her deep-seated love for Peruvian gastronomy to the world.",
    es: "Rodeada de un crisol de culturas pero con nostalgia de los sabores auténticos de casa, se inspiró a acercar los sabores diversos de la cocina latinoamericana a un nuevo público. Esa inspiración impulsó la creación de Panka: un espacio para mostrar con orgullo su herencia y su amor por la gastronomía peruana.",
  },
  "about.fannyImageAlt": {
    en: "Fanny, chef and founder of Panka",
    es: "Fanny, chef y fundadora de Panka",
  },
  "about.storyImageAlt": {
    en: "Handmade tamales and Panka kitchen",
    es: "Tamales artesanales y cocina Panka",
  },
  "about.storySectionTitle": { en: "Design: our story", es: "Diseño: la historia" },
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
    en: 'Our name, <strong class="text-primary">Panka</strong>, comes from the corn husk that wraps each tamal — a symbol of protection, tradition, and flavor.',
    es: 'Nuestro nombre, <strong class="text-primary">Panka</strong>, viene de la hoja de maíz que envuelve cada tamal — símbolo de protección, tradición y sabor.',
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
    en: "Handmade tamales from family recipes — fresh masa, real ingredients, delivered across Miami.",
    es: "Tamales artesanales con recetas de familia: masa fresca, ingredientes de verdad y entrega en Miami.",
  },
  "footer.shop": { en: "Shop", es: "Tienda" },
  "footer.savory": { en: "Savory", es: "Salados" },
  "footer.sweet": { en: "Sweet", es: "Dulces" },
  "footer.specials": { en: "Specials", es: "Especiales" },
  "footer.allTamales": { en: "Full menu", es: "Todo el menú" },
  "footer.info": { en: "Explore", es: "Explora" },
  "footer.aboutUs": { en: "Our story", es: "Nuestra historia" },
  "footer.menu": { en: "Menu", es: "Menú" },
  "footer.placeOrder": { en: "Order now", es: "Hacer pedido" },
  "footer.contact": { en: "Contact", es: "Contacto" },
  "footer.whatsapp": { en: "WhatsApp", es: "WhatsApp" },
  "footer.privacy": { en: "Privacy", es: "Privacidad" },
  "footer.terms": { en: "Terms", es: "Términos" },
  "footer.tagline": {
    en: "Handcrafted heritage",
    es: "Herencia hecha a mano",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  if (typeof entry === "string") return entry;
  return (entry as Record<Locale, string>)[locale] || key;
}

export default translations;
