'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Globe2 } from 'lucide-react';

type Lang = 'en' | 'es';
type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void; toggle: () => void };

const LanguageContext = createContext<LanguageContextValue | null>(null);

const ES: Record<string, string> = {
  // Global navigation
  'Features': 'Funciones',
  'How it works': 'Cómo funciona',
  'Pricing': 'Precios',
  'Log in': 'Iniciar sesión',
  'Home': 'Inicio',
  'Inbox': 'Bandeja',
  'Customers': 'Clientes',
  'Money': 'Dinero',
  'Automations': 'Automatizaciones',
  'More': 'Más',
  'Log out': 'Cerrar sesión',
  'Business line': 'Línea del negocio',

  // Homepage
  'ONE BUSINESS OS': 'SISTEMA ONE PARA NEGOCIOS',
  'Run your business from one number.': 'Maneja tu negocio desde un solo número.',
  'Text customers. Translate conversations. Send invoices. Get paid. Follow up. That’s it.': 'Escribe a clientes. Traduce conversaciones. Envía facturas. Cobra. Da seguimiento. Así de simple.',
  'Get your number': 'Obtén tu número',
  'See how it works': 'Mira cómo funciona',
  'Real business number': 'Número real para tu negocio',
  'English ↔ Spanish': 'Inglés ↔ Español',
  'Invoices + follow-up': 'Facturas + seguimiento',
  'BUSINESS LINE · ACTIVE': 'LÍNEA DEL NEGOCIO · ACTIVA',
  'Translation on · 3 leads': 'Traducción activa · 3 prospectos',
  'Replies translate automatically': 'Las respuestas se traducen automáticamente',
  'Sent in Spanish ✓': 'Enviado en español ✓',
  'Yes, we can be there at 10.': 'Sí, podemos estar ahí a las 10.',
  'Invoice': 'Factura',
  'Global': 'Global',
  'Auto': 'Auto',
  'Service': 'Servicio',
  'Amount': 'Monto',
  'Send pay link': 'Enviar enlace de pago',
  'PAYMENT STATUS': 'ESTADO DEL PAGO',
  'Deposit paid · $350': 'Depósito pagado · $350',
  'Invoice #1048 updated automatically.': 'Factura #1048 actualizada automáticamente.',
  'US ↔ Mexico': 'EE. UU. ↔ México',
  'Message route': 'Ruta del mensaje',
  'ONE / SMS': 'ONE / SMS',
  'ONE user detected': 'Usuario de ONE detectado',
  'Send over internet': 'Enviar por internet',
  'SMS fallback': 'SMS de respaldo',
  'FOLLOW-UP': 'SEGUIMIENTO',
  'Missed call text-back': 'Mensaje automático por llamada perdida',
  'Invoice reminder': 'Recordatorio de factura',
  'Review request': 'Solicitud de reseña',
  'ON': 'ACTIVO',
  'Simple by design. Powerful underneath.': 'Simple por diseño. Potente por dentro.',
  'One number connects your conversations, customer history, payments and follow-up.': 'Un número conecta tus conversaciones, historial de clientes, pagos y seguimiento.',
  'Business number': 'Número del negocio',
  'Payments': 'Pagos',
  'Follow-up': 'Seguimiento',
  'Live': 'Activo',
  'Your business number. Your customers. One place.': 'Tu número de negocio. Tus clientes. Un solo lugar.',
  'Start free and open your inbox in minutes.': 'Empieza gratis y abre tu bandeja en minutos.',

  // Features page
  'FEATURES': 'FUNCIONES',
  'The customer communication essentials.': 'Lo esencial para comunicarte con tus clientes.',
  'The launch version focuses on messaging, customers, translation, invoices and payment reminders.': 'La versión de lanzamiento se enfoca en mensajes, clientes, traducción, facturas y recordatorios de pago.',
  'Your own business number': 'Tu propio número de negocio',
  'Choose a local number during onboarding. SMS/MMS stays tied to your business identity.': 'Elige un número local durante el registro. SMS/MMS queda ligado a la identidad de tu negocio.',
  'Customer inbox': 'Bandeja de clientes',
  'Keep text conversations, customer details and follow-up in one clean workspace.': 'Mantén conversaciones, datos de clientes y seguimiento en un solo espacio limpio.',
  'CRM without the CRM feeling': 'CRM sin sentirse como un CRM complicado',
  'Messages create a customer history automatically, so you spend less time entering data.': 'Los mensajes crean el historial del cliente automáticamente para que captures menos datos manualmente.',
  'Connect Stripe, create an invoice and give the customer a secure payment link.': 'Conecta Stripe, crea una factura y envía al cliente un enlace de pago seguro.',
  'Invoice reminders': 'Recordatorios de facturas',
  'Unpaid invoices can schedule an automatic reminder and stop automatically after payment.': 'Las facturas sin pagar pueden programar recordatorios automáticos que se detienen al recibir el pago.',
  'International messaging': 'Mensajería internacional',
  'Built for real businesses': 'Hecho para negocios reales',
  'Start with the business number.': 'Empieza con el número de tu negocio.',
  'Turn on more when you need it.': 'Activa más funciones cuando las necesites.',
  'Start free': 'Empieza gratis',

  // How it works
  'HOW IT WORKS': 'CÓMO FUNCIONA',
  'A simple experience.': 'Una experiencia simple.',
  'Complex infrastructure.': 'Infraestructura potente por detrás.',
  'Create your account': 'Crea tu cuenta',
  'Sign up and create your private business workspace.': 'Regístrate y crea el espacio privado de tu negocio.',
  'Choose your area code': 'Elige tu código de área',
  'Search available carrier inventory for your preferred local area code.': 'Busca números disponibles del operador para el código de área que prefieras.',
  'Pick your number': 'Elige tu número',
  'ONE provisions the selected number and assigns it to your business.': 'ONE activa el número seleccionado y lo asigna a tu negocio.',
  'Open your inbox': 'Abre tu bandeja',
  'Incoming and outgoing texts live inside your CRM.': 'Los mensajes entrantes y salientes viven dentro de tu CRM.',
  'Translate automatically': 'Traduce automáticamente',
  'English and Spanish messages can be translated while the original stays visible.': 'Los mensajes en inglés y español pueden traducirse mientras el original sigue visible.',
  'Connect Stripe, send a payment link and automate an unpaid-invoice reminder.': 'Conecta Stripe, envía un enlace de pago y automatiza recordatorios de facturas pendientes.',
  'Your customer sees your business number. ONE handles the software and provider connections behind the scenes.': 'Tu cliente ve el número de tu negocio. ONE maneja el software y las conexiones con proveedores por detrás.',
  'Explore features': 'Explorar funciones',
  'Start onboarding': 'Empezar registro',
  'Roadmap after launch': 'Próximamente',
  'Messaging': 'Mensajes',
  'Number inventory': 'Inventario de números',
  'Auth + CRM data': 'Autenticación + datos CRM',
  'SMS/MMS webhooks': 'Webhooks SMS/MMS',
  'Invoices + payments': 'Facturas + pagos',

  // Pricing
  'PRICING': 'PRECIOS',
  'Simple pricing.': 'Precios simples.',
  'Start free. Upgrade when the extra usage and business tools save you time.': 'Empieza gratis. Mejora tu plan cuando más uso y herramientas te ahorren tiempo.',
  'Free': 'Gratis',
  'AI Pro': 'AI Pro',
  '/ forever': '/ para siempre',
  '/ month': '/ mes',
  '1 business number': '1 número de negocio',
  'Customer CRM': 'CRM de clientes',
  'Limited texting': 'Mensajes limitados',
  'Free-plan ads': 'Anuncios en plan gratis',
  'For businesses using ONE every day.': 'Para negocios que usan ONE todos los días.',
  'No ads': 'Sin anuncios',
  'Full CRM': 'CRM completo',
  'Higher messaging allowance': 'Más capacidad de mensajes',
  'Invoices + payment links': 'Facturas + enlaces de pago',
  'Automatic invoice reminders': 'Recordatorios automáticos de facturas',
  'International SMS where supported': 'SMS internacional donde esté disponible',
  'Coming': 'Próximamente',
  'Conversation summaries': 'Resúmenes de conversaciones',
  'Smart follow-ups': 'Seguimientos inteligentes',
  'Advanced automations': 'Automatizaciones avanzadas',
  'Team tools': 'Herramientas de equipo',
  'Join waitlist': 'Unirse a la lista',
  'Start with the essentials.': 'Empieza con lo esencial.',

  // Auth
  'WELCOME BACK': 'BIENVENIDO',
  'Run your business.': 'Maneja tu negocio.',
  'Your number, customers, messages and money are waiting.': 'Tu número, clientes, mensajes y dinero te esperan.',
  'Email': 'Correo electrónico',
  'Password': 'Contraseña',
  'New to ONE?': '¿Nuevo en ONE?',
  'Create account': 'Crear cuenta',
  '← Back to website': '← Volver al sitio',
  'START FREE': 'EMPIEZA GRATIS',
  'Your new business line starts here.': 'Tu nueva línea de negocio empieza aquí.',
  'Create an account, choose a local number and open your CRM.': 'Crea una cuenta, elige un número local y abre tu CRM.',
  'Continue': 'Continuar',
  'Already have an account?': '¿Ya tienes una cuenta?',
  'No card required': 'No requiere tarjeta',
  'Free plan': 'Plan gratis',
  '8+ characters': '8+ caracteres',

  // Onboarding
  '60-SECOND ONBOARDING': 'REGISTRO EN 60 SEGUNDOS',
  'Set up your business line.': 'Configura la línea de tu negocio.',
  'ONE handles the complexity in the background. You only choose what matters.': 'ONE maneja la complejidad por detrás. Tú solo eliges lo importante.',
  'Secure setup': 'Configuración segura',
  'Business': 'Negocio',
  'Area code': 'Código de área',
  'Number': 'Número',
  'Usage': 'Uso',
  'Tell us about your business.': 'Cuéntanos sobre tu negocio.',
  'This creates your private CRM workspace.': 'Esto crea el espacio privado de tu CRM.',
  'Business name': 'Nombre del negocio',
  'English': 'Inglés',
  'Spanish': 'Español',
  'Portuguese': 'Portugués',
  'Choose your local area code.': 'Elige tu código de área local.',
  'We’ll search live number inventory when Telnyx is connected.': 'Buscaremos números disponibles en vivo cuando Telnyx esté conectado.',
  'Enter 3 digits': 'Ingresa 3 dígitos',
  'Local presence for your business': 'Presencia local para tu negocio',
  'Find available numbers': 'Buscar números disponibles',
  'Searching numbers…': 'Buscando números…',
  'Pick the number that feels right.': 'Elige el número que mejor te funcione.',
  'This becomes the business identity for calls and texts.': 'Este número será la identidad de tu negocio para llamadas y mensajes.',
  'LOCAL BUSINESS LINE': 'LÍNEA LOCAL DE NEGOCIO',
  'Use this number': 'Usar este número',
  'What should ONE help you do?': '¿Qué quieres que ONE haga por ti?',
  'We’ll tailor your CRM and messaging setup around these choices.': 'Adaptaremos tu CRM y mensajería según estas opciones.',
  'Customer conversations': 'Conversaciones con clientes',
  'Appointment reminders': 'Recordatorios de citas',
  'Estimates & invoices': 'Presupuestos y facturas',
  'Promotions & campaigns': 'Promociones y campañas',
  'Available directly from your CRM.': 'Disponible directamente desde tu CRM.',
  'Requires appropriate customer consent and carrier registration.': 'Requiere el consentimiento adecuado del cliente y registro con el operador.',
  'I agree to ONE’s Terms, Acceptable Use Policy and messaging rules.': 'Acepto los Términos de ONE, la Política de Uso Aceptable y las reglas de mensajería.',
  'Your selected number': 'Tu número seleccionado',
  'Activate my number': 'Activar mi número',
  'Activating…': 'Activando…',
  'Telecom and messaging activation may require identity, business or carrier verification depending on use.': 'La activación de telecomunicaciones y mensajería puede requerir verificación de identidad, negocio u operador según el uso.',

  // Dashboard
  'Your business': 'Tu negocio',
  'Number activating…': 'Activando número…',
  'Translation ready': 'Traducción lista',
  'QUICK ACTIONS': 'ACCIONES RÁPIDAS',
  'Text': 'Mensaje',
  'Call': 'Llamar',
  'Automate': 'Automatizar',
  'RECENT CUSTOMERS': 'CLIENTES RECIENTES',
  'View all': 'Ver todo',
  'Your CRM is ready.': 'Tu CRM está listo.',
  'Add a customer or receive your first text to begin.': 'Agrega un cliente o recibe tu primer mensaje para comenzar.',
  'Translations appear beneath the original message': 'Las traducciones aparecen debajo del mensaje original',
  'WORKSPACE': 'ESPACIO DE TRABAJO',
  'Calls': 'Llamadas',
  'Appointments': 'Citas',

  // Inbox
  'COMMUNICATIONS': 'COMUNICACIONES',
  'New conversation': 'Nueva conversación',
  'No conversations yet.': 'Todavía no hay conversaciones.',
  'Add a customer to start messaging.': 'Agrega un cliente para comenzar a enviar mensajes.',
  'No messages yet. Send the first message below.': 'Todavía no hay mensajes. Envía el primero abajo.',
  'Send': 'Enviar',
  'Voice': 'Voz',
  'Appointment': 'Cita',
  'Schedule appointment': 'Programar cita',
  'Date & time': 'Fecha y hora',
  'Note': 'Nota',
  'Estimate / service / follow-up': 'Presupuesto / servicio / seguimiento',
  'Save': 'Guardar',
  'Close': 'Cerrar',
  'Cancel': 'Cancelar',
  'Open Money': 'Abrir Dinero',
  'Message sent.': 'Mensaje enviado.',
  'Sent with automatic translation.': 'Enviado con traducción automática.',
  'Message failed': 'No se pudo enviar el mensaje',
  'Could not load inbox': 'No se pudo cargar la bandeja',


  'New message': 'Nuevo mensaje',
  'Pinned': 'Fijados',
  'Recent': 'Recientes',
  'Search conversations': 'Buscar conversaciones',
  'Delivered': 'Entregado',
  'Read': 'Leído',
  'Sent': 'Enviado',
  'Typing…': 'Escribiendo…',
  'Message': 'Mensaje',
  'Attach': 'Adjuntar',
  'Voice note': 'Nota de voz',
  'Contact info': 'Información del contacto',
  'Back': 'Atrás',
  'Automatic translation on': 'Traducción automática activa',
  'Sent in Spanish': 'Enviado en español',
  'Business text': 'Mensaje de negocio',
  'SMS': 'SMS',
  'ONE': 'ONE',
  'Message details': 'Detalles del mensaje',
  'Today': 'Hoy',
  'Yesterday': 'Ayer',

  // Customers
  'CRM': 'CRM',
  'Add customer': 'Agregar cliente',
  'Search name or phone': 'Buscar nombre o teléfono',
  'Name': 'Nombre',
  'Phone': 'Teléfono',
  'Language': 'Idioma',
  'Lead stage': 'Etapa del prospecto',
  'Status': 'Estado',
  'New lead': 'Nuevo prospecto',
  'Preferred language': 'Idioma preferido',
  'Could not load customers': 'No se pudieron cargar los clientes',
  'Could not add customer': 'No se pudo agregar el cliente',

  // Calls
  'PHONE': 'TELÉFONO',
  'New call': 'Nueva llamada',
  'Search calls': 'Buscar llamadas',
  'Latest voicemail': 'Último buzón de voz',
  'Play': 'Reproducir',
  'Transcript': 'Transcripción',
  'AUTOMATION': 'AUTOMATIZACIÓN',
  'Missed-call text-back': 'Mensaje por llamada perdida',
  'Unknown caller': 'Llamante desconocido',
  'VOICEMAIL': 'BUZÓN DE VOZ',

  // Money
  'MONEY': 'DINERO',
  'Get paid.': 'Cobra.',
  'Collected': 'Cobrado',
  'Outstanding': 'Pendiente',
  'Invoices paid': 'Facturas pagadas',
  'Customer payments': 'Pagos de clientes',
  'Payment rails': 'Infraestructura de pagos',
  'Stripe': 'Stripe',
  'Connected': 'Conectado',
  'Connect': 'Conectar',
  'Connect Stripe': 'Conectar Stripe',
  'Continue Stripe setup': 'Continuar configuración de Stripe',
  'Connect to accept invoices': 'Conecta para aceptar pagos de facturas',
  'International transfers': 'Transferencias internacionales',
  'Not enabled in launch scope': 'Aún no activado para lanzamiento',
  'RECENT': 'RECIENTE',
  'No invoices yet.': 'Todavía no hay facturas.',
  'Create payment link': 'Crear enlace de pago',
  'Creating…': 'Creando…',
  'Description': 'Descripción',
  'Deposit / project / service': 'Depósito / proyecto / servicio',
  'Due date': 'Fecha de vencimiento',
  'Send invoice': 'Enviar factura',
  'All time': 'Todo el tiempo',
  'Open invoices': 'Facturas abiertas',
  'Paid invoices': 'Facturas pagadas',
  'Not now': 'Ahora no',

  // Automations + campaigns + more
  'WORKFLOWS': 'FLUJOS',
  'Create automation': 'Crear automatización',
  'New automation': 'Nueva automatización',
  'When': 'Cuando',
  'Then': 'Entonces',
  'Create task': 'Crear tarea',
  'New lead created': 'Nuevo prospecto creado',
  'No reply for 24 hours': 'Sin respuesta por 24 horas',
  'Send message': 'Enviar mensaje',
  'Send SMS': 'Enviar SMS',
  'Send email': 'Enviar correo',
  'Request review': 'Solicitar reseña',
  'Invoice unpaid': 'Factura pendiente',
  'Invoice paid': 'Factura pagada',
  'Missed call': 'Llamada perdida',
  'MESSAGING': 'MENSAJERÍA',
  'Campaigns': 'Campañas',
  'Select contacts': 'Seleccionar contactos',
  'Selected': 'Seleccionados',
  'Eligible': 'Elegibles',
  'Not eligible': 'No elegibles',
  'Opted in': 'Con consentimiento',
  'MESSAGE': 'MENSAJE',
  'Prepare & send': 'Preparar y enviar',
  'Campaign status': 'Estado de campaña',
  'Draft': 'Borrador',
  'SETTINGS & TOOLS': 'CONFIGURACIÓN Y HERRAMIENTAS',
  'MANAGE': 'ADMINISTRAR',
  'Business profile': 'Perfil del negocio',
  'Company details, hours and preferred language': 'Datos de la empresa, horario e idioma preferido',
  'Phone number': 'Número de teléfono',
  'Translation': 'Traducción',
  'Automatic translation': 'Traducción automática',
  'Dedicated translation API': 'API dedicada de traducción',
  'My language': 'Mi idioma',
  'Translation provider': 'Proveedor de traducción',
  'Auto translate messages': 'Traducir mensajes automáticamente',
  'Show translated text below the original': 'Mostrar traducción debajo del original',
  'Runs automatically when enabled': 'Funciona automáticamente cuando está activo',
  'Team': 'Equipo',
  'Invite staff and manage permissions': 'Invitar personal y administrar permisos',
  'Consent-aware bulk messaging': 'Mensajería masiva con control de consentimiento',
  'Regulated provider connection': 'Conexión con proveedor regulado',
  'Stripe Connect for invoices': 'Stripe Connect para facturas',
  'Create campaign': 'Crear campaña',

  // V21 production launch scope
  'Settings': 'Configuración',
  'AI Assist': 'Asistente IA',
  'AI Writing Assist': 'Asistente de escritura IA',
  'AI reply drafts': 'Borradores de respuesta con IA',
  'Grammar + translation': 'Gramática + traducción',
  'Reply faster. Stay in control.': 'Responde más rápido. Mantén el control.',
  'ONE suggestion': 'Sugerencia de ONE',
  'Use reply': 'Usar respuesta',
  'WRITING TOOLS': 'HERRAMIENTAS DE ESCRITURA',
  'Fix grammar · Professional · Shorten': 'Corregir gramática · Profesional · Acortar',
  'AI never sends on its own. You review the draft and press Send.': 'La IA nunca envía sola. Tú revisas el borrador y presionas Enviar.',
  'Fix grammar': 'Corregir gramática',
  'Professional': 'Profesional',
  'Shorten': 'Acortar',
  'Suggest reply': 'Sugerir respuesta',
  'Try another': 'Intentar otra',
  'Writing a suggestion…': 'Escribiendo una sugerencia…',
  'AI drafts. You press Send.': 'La IA crea borradores. Tú presionas Enviar.',
  'Grammar and clarity updated. Review before sending.': 'Gramática y claridad actualizadas. Revisa antes de enviar.',
  'Message rewritten. Review before sending.': 'Mensaje reescrito. Revisa antes de enviar.',
  'Write a message first, then use the writing tools.': 'Escribe un mensaje primero y después usa las herramientas de escritura.',
  'AI Writing Assist needs OPENAI_API_KEY in your environment.': 'El asistente de escritura IA necesita OPENAI_API_KEY en tu entorno.',
  'Messages translate automatically to the customer language': 'Los mensajes se traducen automáticamente al idioma del cliente',
  'Invoices & payments': 'Facturas y pagos',
  'New invoice': 'Nueva factura',
  'Create invoice': 'Crear factura',
  'Text the payment link': 'Enviar el enlace de pago por mensaje',
  'Send from your ONE business number after creating the invoice.': 'Envía desde tu número de negocio ONE después de crear la factura.',
  'Activate a business number first.': 'Activa primero un número de negocio.',
  'Invoice created and payment link sent by SMS.': 'Factura creada y enlace de pago enviado por SMS.',
  'Invoice created. Copy or open the payment link below.': 'Factura creada. Copia o abre el enlace de pago.',
  'PAYMENTS': 'PAGOS',
  'Get paid': 'Cobra',
  'Activate customer payments': 'Activar pagos de clientes',
  'Connected to this business': 'Conectado a este negocio',
  'Invoice from the conversation.': 'Factura desde la conversación.',
  'Create the invoice here or tap the invoice icon inside Messages. ONE can text the secure payment link from your business number.': 'Crea la factura aquí o toca el ícono de factura dentro de Mensajes. ONE puede enviar el enlace seguro desde tu número de negocio.',
  'Activate payments': 'Activar pagos',
  'DO BUSINESS': 'HAZ NEGOCIO',
  'Messages': 'Mensajes',
  'Customer': 'Cliente',
  'Inbound': 'Entrantes',
  'TODAY': 'HOY',
  'Launch essentials': 'Esenciales de lanzamiento',
  'Only the production features you need to run customer conversations and get paid.': 'Solo las funciones de producción que necesitas para atender conversaciones y cobrar.',
  'Workspace active': 'Espacio activo',
  'Setup required': 'Configuración requerida',
  'Server-side translation': 'Traducción del lado del servidor',
  'AI reply suggestions and writing help': 'Sugerencias de respuesta y ayuda de escritura con IA',
  'Ready': 'Listo',
  'Focused production scope': 'Alcance de producción enfocado',
  'International transfers, Sites, POS, advanced campaigns and autonomous sending are intentionally outside this launch build. AI drafts messages; the business owner always presses Send.': 'Transferencias internacionales, Sitios, POS, campañas avanzadas y envíos autónomos quedan fuera de esta versión de lanzamiento. La IA crea borradores; el dueño siempre presiona Enviar.',
  'AI reply drafts + grammar': 'Borradores con IA + gramática',
  'Built for production': 'Hecho para producción',
  'Generate reply drafts, fix grammar, make messages professional, or shorten them. You always press Send.': 'Genera borradores de respuesta, corrige gramática, haz mensajes profesionales o acórtalos. Tú siempre presionas Enviar.',
};

const PHRASES: Array<[string, string]> = [
  [' workspace', ' espacio'],
  [' customers', ' clientes'],
  [' customer', ' cliente'],
  [' leads', ' prospectos'],
  [' lead', ' prospecto'],
  [' active', ' activo'],
  [' messages', ' mensajes'],
  [' invoices', ' facturas'],
  [' payments', ' pagos'],
];

function translateText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (ES[trimmed]) return value.replace(trimmed, ES[trimmed]);
  let out = trimmed;
  for (const [en, es] of PHRASES) out = out.replace(new RegExp(en, 'gi'), es);
  return out === trimmed ? value : value.replace(trimmed, out);
}

function shouldSkip(el: Element | null) {
  if (!el) return false;
  return Boolean(el.closest('[data-no-ui-translate="true"], script, style, code, pre'));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem('one-language');
    if (saved === 'es' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem('one-language', next);
  }, []);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'es' : 'en'), [lang, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    const originalText = new WeakMap<Text, string>();
    const originalAttrs = new WeakMap<Element, Record<string, string>>();

    function applyNode(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const parent = textNode.parentElement;
        if (shouldSkip(parent)) return;
        if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue || '');
        const original = originalText.get(textNode) || '';
        textNode.nodeValue = lang === 'es' ? translateText(original) : original;
        return;
      }
      if (!(node instanceof Element) || shouldSkip(node)) return;
      const attrs = ['placeholder', 'title', 'aria-label'];
      let saved = originalAttrs.get(node);
      if (!saved) { saved = {}; originalAttrs.set(node, saved); }
      for (const attr of attrs) {
        const value = node.getAttribute(attr);
        if (value && saved[attr] === undefined) saved[attr] = value;
        if (saved[attr] !== undefined) node.setAttribute(attr, lang === 'es' ? translateText(saved[attr]) : saved[attr]);
      }
      node.childNodes.forEach(applyNode);
    }

    applyNode(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) mutation.addedNodes.forEach(applyNode);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggle }), [lang, setLang, toggle]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export function GlobalLanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="global-language-toggle" role="group" aria-label="Language / Idioma">
      <Globe2 size={14} />
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      <span>/</span>
      <button type="button" className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
    </div>
  );
}
