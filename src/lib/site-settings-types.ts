export interface BilingualText {
  en: string;
  es: string;
}

export interface AnnouncementItem {
  id: string;
  textEn: string;
  textEs: string;
  active: boolean;
}

export interface HeroSlide {
  id: string;
  src: string;
  altEn: string;
  altEs: string;
  active: boolean;
}

export interface PromoBanner {
  active: boolean;
  tag: BilingualText;
  title: BilingualText;
  description: BilingualText;
  buttonText: BilingualText;
  buttonHref: string;
  image: string;
}

export interface DeliveryTabContent {
  title: BilingualText;
  description: BilingualText;
  detail1: BilingualText;
  detail2: BilingualText;
  detail3: BilingualText;
}

export interface DeliverySectionSettings {
  delivery: DeliveryTabContent;
  pickup: DeliveryTabContent;
  schedule: DeliveryTabContent;
}

export interface SiteSettings {
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    hours: string;
    footerDesc: BilingualText;
  };
  announcements: AnnouncementItem[];
  hero: {
    badge: BilingualText;
    titleLine1: BilingualText;
    titleLine2: BilingualText;
    subtitle: BilingualText;
    primaryBtnText: BilingualText;
    primaryBtnHref: string;
    secondaryBtnText: BilingualText;
    secondaryBtnHref: string;
    slides: HeroSlide[];
  };
  promoBanner: PromoBanner;
  story: {
    tag: BilingualText;
    title: BilingualText;
    sectionTitle: BilingualText;
    since: BilingualText;
    p1: BilingualText;
    p2: BilingualText;
    p3: BilingualText;
    fannyHeading: BilingualText;
    fannyRole: BilingualText;
    fannyP1: BilingualText;
    fannyP2: BilingualText;
    valuesTitle: BilingualText;
    passionTitle: BilingualText;
    passionDesc: BilingualText;
    traditionTitle: BilingualText;
    traditionDesc: BilingualText;
    communityTitle: BilingualText;
    communityDesc: BilingualText;
  };
  deliveryInfo: DeliverySectionSettings;
  storeStatus: {
    isOpen: boolean;
    noticeEn: string;
    noticeEs: string;
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact: {
    email: "hello@pankatamales.com",
    phone: "+1 (954) 901-4340",
    whatsapp: "19549014340",
    address: "Doral, FL — 9851 NW 58th St",
    hours: "Mon-Fri: 8am - 7pm · Sat: 9am - 4pm",
    footerDesc: {
      en: "Small-batch artisan tamales made with freshly nixtamalized corn masa. Handcrafted recipes steamed fresh and delivered to your door in Miami.",
      es: "Tamales artesanales en lotes pequeños, preparados con masa nixtamalizada fresca. Recetas hechas a mano, cocidas al vapor y entregadas en Miami.",
    },
  },
  announcements: [
    {
      id: "ann-1",
      textEn: "Free shipping on orders over $50",
      textEs: "Envío gratis en compras mayores a $50",
      active: true,
    },
    {
      id: "ann-2",
      textEn: "Made fresh daily — order before 2pm for next-day delivery in Miami",
      textEs: "Hechos al día — pide antes de las 2pm y recibe al día siguiente en Miami",
      active: true,
    },
    {
      id: "ann-3",
      textEn: "Planning an event? Ask us about catering and bulk orders",
      textEs: "¿Celebras algo? Pregunta por catering y pedidos por volumen",
      active: true,
    },
  ],
  hero: {
    badge: {
      en: "Nixtamal daily · Hand-wrapped · Miami",
      es: "Nixtamal al día · Envueltos a mano · Miami",
    },
    titleLine1: {
      en: "Tamales that taste",
      es: "Tamales con sabor",
    },
    titleLine2: {
      en: "like tradition",
      es: "a tradición",
    },
    subtitle: {
      en: "We grind masa from real corn, fill each one with care, and steam them slow — then send them warm to your door anywhere in Miami. Order before 2pm for next-day delivery.",
      es: "Molimos maíz de verdad, rellenamos con mimo y los dejamos al vapor sin prisa; después te los mandamos calientitos donde estés en Miami. Pide antes de las 2pm para recibir al día siguiente.",
    },
    primaryBtnText: {
      en: "Order now",
      es: "Pedir ahora",
    },
    primaryBtnHref: "/productos",
    secondaryBtnText: {
      en: "Our Story",
      es: "Nosotros",
    },
    secondaryBtnHref: "/nosotros",
    slides: [
      {
        id: "slide-1",
        src: "/assets/photo2.jpg",
        altEn: "Hand-wrapped tamales in a basket on a wooden tray",
        altEs: "Tamales envueltos a mano en una canasta sobre bandeja de madera",
        active: true,
      },
      {
        id: "slide-2",
        src: "/assets/photo3.jpg",
        altEn: "Artisan tamales — close-up of texture and leaves",
        altEs: "Tamales artesanales, detalle de textura y hojas",
        active: true,
      },
    ],
  },
  promoBanner: {
    active: true,
    tag: {
      en: "Specials",
      es: "Especiales",
    },
    title: {
      en: "Tamales Oaxaqueños",
      es: "Tamales Oaxaqueños",
    },
    description: {
      en: "Wrapped in banana leaf with black mole. A culinary experience from southern Mexico, available in limited edition.",
      es: "Envueltos en hoja de plátano con mole negro. Una experiencia gastronómica del sur de México, disponible en edición limitada.",
    },
    buttonText: {
      en: "Discover",
      es: "Descubrir",
    },
    buttonHref: "/productos?cat=especiales",
    image: "/hero_3.jpg",
  },
  story: {
    tag: {
      en: "Our Story",
      es: "Nuestra Historia",
    },
    title: {
      en: "From abuela's kitchen to the heart of Miami",
      es: "De la cocina de mamá al corazón de Miami",
    },
    sectionTitle: {
      en: "Design: our story",
      es: "Diseño: la historia",
    },
    since: {
      en: "Since 2020",
      es: "Desde 2020",
    },
    p1: {
      en: "Panka was born from a family dream: to share with the world the tamales our grandmother made every Sunday. Those tamales that brought the whole family together around the table.",
      es: "Panka nació de un sueño familiar: compartir con el mundo los tamales que nuestra abuela preparaba cada domingo. Esos tamales que reunían a toda la familia alrededor de la mesa.",
    },
    p2: {
      en: "Today, every tamal that leaves our kitchen carries that same recipe, that same love and dedication. We use fresh, natural ingredients, hand-crafted nixtamalized masa and hand-selected chiles.",
      es: "Hoy, cada tamal que sale de nuestra cocina lleva esa misma receta, ese mismo cariño y esa misma dedicación. Usamos ingredientes frescos y naturales, masa nixtamalizada artesanalmente y chiles seleccionados a mano.",
    },
    p3: {
      en: 'Our name, <strong class="text-primary">Panka</strong>, comes from the corn husk that wraps each tamal — a symbol of protection, tradition, and flavor.',
      es: 'Nuestro nombre, <strong class="text-primary">Panka</strong>, viene de la hoja de maíz que envuelve cada tamal — símbolo de protección, tradición y sabor.',
    },
    fannyHeading: {
      en: "Meet Fanny",
      es: "Conoce a Fanny",
    },
    fannyRole: {
      en: "Our owner and founder",
      es: "Nuestra propietaria y fundadora",
    },
    fannyP1: {
      en: "Fanny’s culinary passion, rooted in the vibrant streets of Lima, Peru, found new expression when she moved to the United States. This transition was more than a change of location; it was a turning point in her culinary story.",
      es: "La pasión culinaria de Fanny, con raíces en las calles vibrantes de Lima, Perú, cobró nueva forma al mudarse a Estados Unidos. Fue más que un cambio de lugar: un punto de inflexión en su historia culinaria.",
    },
    fannyP2: {
      en: "Surrounded by a melting pot of cultures yet missing the authentic flavors of home, Fanny was inspired to bring the rich, diverse tastes of Latin-American cuisine to a new audience. This inspiration was the catalyst for the creation of Panka, a platform where she could proudly showcase her heritage and her deep-seated love for Peruvian gastronomy to the world.",
      es: "Rodeada de un crisol de culturas pero con nostalgia de los sabores auténticos de casa, se inspiró a acercar los sabores diversos de la cocina latinoamericana a un nuevo público. Esa inspiración impulsó la creación de Panka: un espacio para mostrar con orgullo su herencia y su amor por la gastronomía peruana.",
    },
    valuesTitle: {
      en: "Our Values",
      es: "Nuestros Valores",
    },
    passionTitle: {
      en: "Passion",
      es: "Pasión",
    },
    passionDesc: {
      en: "Every tamal is prepared with dedication and love, as if it were for our own family.",
      es: "Cada tamal es preparado con dedicación y cariño, como si fuera para nuestra propia familia.",
    },
    traditionTitle: {
      en: "Tradition",
      es: "Tradición",
    },
    traditionDesc: {
      en: "We preserve the ancestral recipes that give life to each of our unique flavors.",
      es: "Preservamos las recetas ancestrales que dan vida a cada uno de nuestros sabores únicos.",
    },
    communityTitle: {
      en: "Community",
      es: "Comunidad",
    },
    communityDesc: {
      en: "We work with local producers and support the families in our community.",
      es: "Trabajamos con productores locales y apoyamos a las familias de nuestra comunidad.",
    },
  },
  deliveryInfo: {
    delivery: {
      title: {
        en: "Local Delivery",
        es: "Entrega a Domicilio",
      },
      description: {
        en: "Get your tamales delivered warm to your door. Orders placed before 2pm are delivered the next day.",
        es: "Recibe tus tamales calientes en la puerta de tu casa. Pedidos antes de las 2pm se entregan al día siguiente.",
      },
      detail1: {
        en: "Exclusive coverage in Miami-Dade & Broward County",
        es: "Cobertura exclusiva en condados de Miami-Dade y Broward",
      },
      detail2: {
        en: "Free shipping on selected items and eligible orders",
        es: "Envío gratis en productos seleccionados y compras elegibles",
      },
      detail3: {
        en: "Thermal packaging to keep everything warm and fresh",
        es: "Empaque térmico para mantener la temperatura y frescura",
      },
    },
    pickup: {
      title: {
        en: "Store Pick-Up",
        es: "Recoger en Tienda",
      },
      description: {
        en: "Pick up your order ready in 30 minutes after placing it at our Miami location.",
        es: "Recoge tu pedido listo en 30 minutos después de confirmar tu orden en nuestra ubicación en Miami.",
      },
      detail1: {
        en: "Doral, FL — 9851 NW 58th St",
        es: "Doral, FL — 9851 NW 58th St",
      },
      detail2: {
        en: "Monday to Friday: 8am - 7pm",
        es: "Lunes a Viernes: 8am - 7pm",
      },
      detail3: {
        en: "Saturday: 9am - 4pm",
        es: "Sábados: 9am - 4pm",
      },
    },
    schedule: {
      title: {
        en: "Scheduled Orders",
        es: "Pedidos Programados",
      },
      description: {
        en: "Schedule your delivery for the day and time you prefer. Perfect for events and celebrations.",
        es: "Programa tu entrega para el día y hora que prefieras. Ideal para eventos y celebraciones.",
      },
      detail1: {
        en: "Schedule up to 7 days in advance",
        es: "Programa con hasta 7 días de anticipación",
      },
      detail2: {
        en: "Bulk orders starting at 50 pieces",
        es: "Pedidos por mayoreo desde 50 piezas",
      },
      detail3: {
        en: "Catering service and custom event packaging",
        es: "Servicio de catering y empaque especial para eventos",
      },
    },
  },
  storeStatus: {
    isOpen: true,
    noticeEn: "",
    noticeEs: "",
  },
};
