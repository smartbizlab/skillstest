import { useState, useEffect, useRef } from "react";

/* ── TOKENS ─────────────────────────────────────────── */
/* Paleta vigente Smart Business — carbón / rust / esmeralda.
   rust = acción (CTA), esmeralda = informativo (dato/badge). Nunca ambos como CTA en la misma pieza. */
const C = {
  bg:      "#161512",
  surface: "#201f1b",   /* carbon-soft — hex exacto de design-tokens-diagnostico.md */
  border:  "#332f28",   /* carbon-line — hex exacto */
  rust:    "#C2622E",
  emerald: "#2EE6A6",
  text:    "#F2F0EA",   /* hex exacto */
  sub:     "#a8a49a",   /* text-muted — hex exacto */
  muted:   "#6b665c",
};
const ACCENT     = C.emerald;          // único acento informativo (sustituye la rotación de 3 colores anterior)
const ACCENT_RGB = "46,230,166";
const fontDisplay = "'Playfair Display',serif";  // H1 / H2 / H3 y cifras destacadas
const fontBody    = "'DM Sans',sans-serif";      // cuerpo, labels, botones, UI
const font        = fontBody;                    // alias — mantiene compatibilidad con el resto del archivo

const GHL_FORM_ID   = "E0DGPlNKwF71BjKkElAU";
const GHL_FORM_BASE = `https://link.centralize.es/widget/form/${GHL_FORM_ID}`;
const GHL_JS_URL    = "https://link.centralize.es/js/form_embed.js";

/* ── DATA ────────────────────────────────────────────── */
const PERFILES = [
  { id:"consultor",    icon:"◈", titulo:"Consultor o Coach independiente",            desc:"Vendes tu conocimiento o acompañamiento de forma independiente" },
  { id:"vendedor",     icon:"◆", titulo:"Vendedor B2B empleado",                      desc:"Vendes productos o servicios de una empresa a otras empresas" },
  { id:"afiliado",     icon:"◇", titulo:"Afiliado de productos digitales",            desc:"Promueves productos de otros y ganas comisiones por ventas" },
  { id:"emprendedor",  icon:"○", titulo:"Emprendedor online construyendo su negocio", desc:"Quieres vender algo online pero aún defines qué y a quién" },
  { id:"inmobiliario", icon:"□", titulo:"Agente inmobiliario independiente",          desc:"Vendes o rentas propiedades de forma independiente" },
  { id:"creador",      icon:"◉", titulo:"Creador de contenido que quiere monetizar",  desc:"Tienes audiencia y quieres convertirla en ingresos reales" },
  { id:"rrhh",         icon:"◐", titulo:"Profesional de recursos humanos",            desc:"Gestionas talento, selección, onboarding o capacitación en una empresa" },
  { id:"independiente",icon:"◑", titulo:"Abogado independiente",                          desc:"Ofreces servicios profesionales de forma independiente" },
  { id:"docente",      icon:"◒", titulo:"Docente o formador corporativo",             desc:"Diseñas y facilitas capacitaciones, talleres o programas de formación" },
  { id:"pyme",         icon:"◓", titulo:"Gerente de pequeña empresa (PYME)",          desc:"Diriges una pequeña empresa y usualmente operas en múltiples roles" },
];

const SINTOMAS = {
  consultor:   [
    { id:"horas",    txt:"Trabajo muchas horas pero no veo crecer mis ingresos" },
    { id:"clientes", txt:"No me llegan clientes solos y no sé cómo conseguirlos sin sentirme vendiendo" },
    { id:"precio",   txt:"Cuando me preguntan cuánto cobro, no sé cómo justificar mi precio" },
    { id:"cero",     txt:"Cada cliente nuevo me exige empezar todo desde cero" },
  ],
  vendedor:    [
    { id:"admin",       txt:"Paso más tiempo en papeleos y reportes que hablando con clientes" },
    { id:"prospectos",  txt:"Escribo mensajes a prospectos y la mayoría no me responde" },
    { id:"seguimiento", txt:"Mando propuestas y después no sé cómo darle seguimiento sin molestar" },
    { id:"reunion",     txt:"Llego a las reuniones sin saber bien cómo prepararme para ese cliente específico" },
  ],
  afiliado:    [
    { id:"conversion", txt:"Tengo visitas pero casi nadie compra a través de mis links" },
    { id:"email",      txt:"Mando emails a mi lista y las ventas no reflejan el esfuerzo que pongo" },
    { id:"anuncios",   txt:"Gasto en anuncios pero no logro que sean rentables de forma consistente" },
    { id:"sistema",    txt:"Promoción tras promoción y siento que siempre estoy empezando de nuevo" },
  ],
  emprendedor: [
    { id:"producto",  txt:"Sé que tengo conocimiento valioso pero no sé cómo convertirlo en algo que vender" },
    { id:"inicio",    txt:"No sé por dónde empezar y cada vez que investigo me confundo más" },
    { id:"ideas",     txt:"Tengo varias ideas pero no sé cuál elegir ni si alguna tiene mercado real" },
    { id:"abandono",  txt:"Arranco proyectos con energía pero a la semana los abandono sin saber por qué" },
  ],
  inmobiliario:[
    { id:"frios",        txt:"Tengo prospectos interesados pero se me enfrían porque no les doy seguimiento a tiempo" },
    { id:"redes",        txt:"No sé cómo usar redes sociales para atraer clientes sin parecer desesperado" },
    { id:"contacto",     txt:"Cuando escribo para contactar a alguien no sé qué decir para que me respondan" },
    { id:"presentacion", txt:"Cada presentación de propiedad la improviso porque no tengo una estructura fija" },
  ],
  creador:[
    { id:"seguidores", txt:"Tengo seguidores pero no sé cómo convertirlos en ingresos reales" },
    { id:"sinventas",  txt:"Creo contenido constantemente pero no genera ventas de nada" },
    { id:"producto",   txt:"No sé qué producto o servicio lanzar con mi audiencia actual" },
    { id:"gratis",     txt:"Me comparan con creadores gratuitos y no sé cómo justificar que me paguen" },
  ],
  rrhh:[
    { id:"repetitivo", txt:"Paso horas redactando descripciones de cargo, evaluaciones y comunicados repetitivos" },
    { id:"entrevistas",txt:"Me cuesta hacer entrevistas consistentes y documentar bien los procesos de selección" },
    { id:"reportes",   txt:"Los reportes de gestión humana me toman demasiado tiempo y no tienen impacto" },
    { id:"onboarding", txt:"No tengo sistema para onboarding y cada ingreso nuevo es diferente" },
  ],
  independiente:[
    { id:"admin",      txt:"Dedico demasiado tiempo a tareas administrativas que no puedo facturar" },
    { id:"valor",      txt:"Mis clientes no entienden lo que hago y me cuesta explicar mi valor" },
    { id:"seguimiento",txt:"No tengo un sistema para dar seguimiento a mis casos o clientes activos" },
    { id:"propuestas", txt:"Cada propuesta o contrato lo empiezo desde cero y me consume horas" },
  ],
  docente:[
    { id:"materiales", txt:"Diseñar materiales de capacitación nuevos me toma días enteros" },
    { id:"aplicacion", txt:"Mis participantes no aplican lo que aprenden y no sé cómo mejorarlo" },
    { id:"evaluacion", txt:"No tengo un sistema para evaluar si mis formaciones realmente funcionan" },
    { id:"adaptar",    txt:"Me cuesta adaptar el mismo contenido para audiencias distintas" },
  ],
  pyme:[
    { id:"todo",       txt:"Soy el que hace todo y no tengo tiempo para trabajar en el negocio" },
    { id:"dinero",     txt:"No tengo claridad de qué áreas del negocio me están costando dinero" },
    { id:"equipo",     txt:"Me cuesta comunicarle a mi equipo las prioridades sin reuniones constantes" },
    { id:"delegar",    txt:"Cada vez que quiero delegar algo tengo que explicarlo todo desde cero" },
  ],
};

const SKILLS = {
  consultor:{
    horas:[
      {n:"Diagnóstico de modelo de negocio", r:"Identifica dónde se pierde el dinero antes de optimizar cualquier otra cosa."},
      {n:"Diseño de oferta y precio",        r:"Para cobrar por valor entregado, no por horas trabajadas."},
      {n:"Propuestas comerciales",           r:"Para cerrar mejor los clientes que ya llegan sin dejar dinero sobre la mesa."},
    ],
    clientes:[
      {n:"Posicionamiento personal",     r:"Define desde dónde hablas antes de salir a buscar clientes."},
      {n:"Contenido que atrae clientes", r:"Para que el contenido haga la prospección sin que tú vendas directamente."},
      {n:"Conversación de ventas",       r:"Para cerrar cuando llega el prospecto sin sentir que estás presionando."},
    ],
    precio:[
      {n:"Propuesta de valor",             r:"Articula en lenguaje del cliente qué resultado concreto produce tu trabajo."},
      {n:"Estructura de precios",          r:"Diseña paquetes que justifican la tarifa sin negociar hacia abajo."},
      {n:"Manejo de objeciones de precio", r:"Para responder sin descuentos y sin perder al cliente."},
    ],
    cero:[
      {n:"Onboarding de clientes",            r:"Un proceso de entrada estándar que no dependa de improvisar cada vez."},
      {n:"Entregables y reportes",            r:"Para producir documentos de cliente en minutos, no en horas."},
      {n:"Seguimiento y gestión de relación", r:"Para mantener al cliente informado sin que te consuma tiempo."},
    ],
  },
  vendedor:{
    admin:[
      {n:"Actualización de CRM",     r:"Convierte notas de reunión en campos estructurados en minutos."},
      {n:"Reportes y forecast",      r:"Genera el reporte semanal al manager sin invertir media mañana."},
      {n:"Preparación de reuniones", r:"Para que el tiempo que sí tienes con clientes sea más efectivo."},
    ],
    prospectos:[
      {n:"Investigación de cuentas",   r:"Entiende al prospecto antes de escribirle y personaliza el ángulo de entrada."},
      {n:"Mensajes de prospección",    r:"Para escribir por canal con estructura que genera respuesta real."},
      {n:"Seguimiento de prospección", r:"Para saber qué decir en el segundo y tercer contacto sin repetirte."},
    ],
    seguimiento:[
      {n:"Propuestas comerciales",     r:"Para que la propuesta en sí genere el siguiente paso claro desde el inicio."},
      {n:"Seguimiento post-propuesta", r:"Mensajes de seguimiento con pretexto real, no con frases genéricas."},
      {n:"Manejo de objeciones",       r:"Para responder bien cuando el silencio se rompe con una objeción."},
    ],
    reunion:[
      {n:"Investigación de cuentas",  r:"Construye el brief de la empresa antes de la reunión con criterio."},
      {n:"Preparación de reuniones",  r:"Agenda, preguntas y posibles objeciones listas antes de entrar."},
      {n:"Seguimiento post-reunión",  r:"Para cerrar bien con el email correcto después de cada reunión."},
    ],
  },
  afiliado:{
    conversion:[
      {n:"Análisis de páginas de ventas", r:"Entiende qué promete el producto para alinear tu contenido con eso."},
      {n:"Bridge pages",                  r:"Para precalentar al prospecto antes de mandarlo a la página de ventas."},
      {n:"Reviews y comparativas",        r:"El contenido que más convierte en afiliación cuando está bien estructurado."},
    ],
    email:[
      {n:"Segmentación de lista",            r:"Para no mandar el mismo mensaje a todos y aumentar relevancia."},
      {n:"Secuencias de email de promoción", r:"Campañas de 5–7 emails en lugar de un solo disparo."},
      {n:"Análisis de métricas de email",    r:"Para identificar dónde se rompe la secuencia y qué corregir primero."},
    ],
    anuncios:[
      {n:"Creación de anuncios para afiliación", r:"Hooks y copies que convierten sin disparar moderación de plataforma."},
      {n:"Análisis de métricas de campaña",      r:"Diagnostica dónde está el cuello de botella antes de gastar más."},
      {n:"Bridge pages",                         r:"Para mejorar la conversión entre el anuncio y la página de ventas."},
    ],
    sistema:[
      {n:"Calendario editorial de promociones", r:"Planifica con anticipación y deja de reaccionar al último momento."},
      {n:"Contenido evergreen de afiliación",   r:"Piezas que generan comisiones sin depender de lanzamientos."},
      {n:"Análisis de portafolio de productos", r:"Decide qué productos vale la pena seguir promoviendo y cuáles cortar."},
    ],
  },
  emprendedor:{
    producto:[
      {n:"Autodiagnóstico de activos",        r:"Inventaría lo que sabes y tradúcelo en problemas reales que resuelve."},
      {n:"Diseño de oferta mínima validable", r:"Construye algo vendible en días, no en meses."},
      {n:"Propuesta de valor",                r:"Para comunicar lo que vendes en lenguaje que el cliente entiende."},
    ],
    inicio:[
      {n:"Desbloqueador de parálisis", r:"Identifica la decisión real que hay que tomar y el siguiente paso mínimo."},
      {n:"Validación de nicho",        r:"Evalúa ideas con criterios objetivos en lugar de buscar la idea perfecta."},
      {n:"Definición de avatar",       r:"Claridad de a quién le hablas antes de crear cualquier contenido."},
    ],
    ideas:[
      {n:"Validación de nicho",          r:"Compara ideas con criterios de mercado concretos y medibles."},
      {n:"Conversaciones de validación", r:"Habla con 10 personas del perfil y confirma si el problema es real."},
      {n:"Análisis de competencia",      r:"Identifica si hay mercado y dónde está el espacio diferenciado."},
    ],
    abandono:[
      {n:"Desbloqueador de parálisis",        r:"Identifica si el abandono es miedo, falta de claridad o modelo equivocado."},
      {n:"Diseño de oferta mínima validable", r:"Reduce el proyecto a algo ejecutable en días, no en meses."},
      {n:"Planificación semanal",             r:"Estructura de ejecución que no dependa de la motivación del momento."},
    ],
  },
  inmobiliario:{
    frios:[
      {n:"Sistema de seguimiento",           r:"Un protocolo claro de contacto por etapa del prospecto."},
      {n:"Mensajes de seguimiento",          r:"El mensaje correcto según el momento de la relación con cada prospecto."},
      {n:"Gestión de pipeline inmobiliario", r:"Visualiza el estado de cada prospecto sin depender de la memoria."},
    ],
    redes:[
      {n:"Posicionamiento del agente",        r:"Define desde qué ángulo hablar en redes antes de publicar cualquier cosa."},
      {n:"Contenido inmobiliario para redes", r:"Publicaciones que educan y atraen sin sonar a anuncio."},
      {n:"Calendario editorial inmobiliario", r:"Para publicar de forma consistente sin improvisar cada semana."},
    ],
    contacto:[
      {n:"Investigación de prospecto",           r:"Personaliza el primer contacto con contexto real de esa persona."},
      {n:"Mensajes de prospección inmobiliaria", r:"Escribe por canal con un ángulo que genera respuesta."},
      {n:"Seguimiento de prospección",           r:"Qué decir en el segundo contacto sin repetir el primero."},
    ],
    presentacion:[
      {n:"Ficha de propiedad",        r:"Describe cualquier inmueble con estructura persuasiva en minutos."},
      {n:"Presentación de propiedad", r:"Un guión de visita que destaca los puntos correctos según el comprador."},
      {n:"Seguimiento post-visita",   r:"El mensaje correcto después de mostrar la propiedad para mantener el interés."},
    ],
  },
  creador:{
    seguidores:[
      {n:"Auditoría de audiencia",          r:"Entiende qué problema real tiene tu audiencia antes de crear cualquier oferta."},
      {n:"Diseño de oferta mínima validable",r:"Crea algo vendible en días usando lo que ya tienes."},
      {n:"Contenido de conversión",         r:"Para pasar de contenido de valor a contenido que vende sin perder autenticidad."},
    ],
    sinventas:[
      {n:"Análisis de contenido existente", r:"Identifica qué piezas tienen potencial de conversión y cuáles solo generan likes."},
      {n:"Bridge content",                  r:"Para insertar llamadas a la acción naturales sin que el contenido se sienta comercial."},
      {n:"Embudo de contenido",             r:"Estructura una secuencia que lleva al seguidor desde el descubrimiento hasta la compra."},
    ],
    producto:[
      {n:"Validación de idea con audiencia", r:"Pregúntale a tu comunidad qué quiere comprar sin hacer encuestas genéricas."},
      {n:"Mapeo de activos",                 r:"Identifica qué conocimiento tuyo tiene valor de mercado real."},
      {n:"Diseño de primer producto digital",r:"Estructura un producto de entrada de bajo riesgo y alta conversión."},
    ],
    gratis:[
      {n:"Posicionamiento del creador",      r:"Diferencia tu propuesta de valor de todo lo que existe gratis."},
      {n:"Propuesta de valor premium",       r:"Comunica por qué tu versión pagada vale lo que cuesta."},
      {n:"Manejo de objeciones de precio",   r:"Para responder sin descuentos y sin perder al cliente."},
    ],
  },
  rrhh:{
    repetitivo:[
      {n:"Redacción de descripciones de cargo", r:"Produce una JD completa en minutos con el input mínimo."},
      {n:"Comunicados internos",                r:"Redacta anuncios, políticas y mensajes de RRHH con tono consistente."},
      {n:"Evaluaciones de desempeño",           r:"Estructura feedback escrito justo, específico y accionable."},
    ],
    entrevistas:[
      {n:"Guías de entrevista por competencias",r:"Preguntas calibradas por cargo y nivel de experiencia."},
      {n:"Scorecard de candidatos",             r:"Documenta y compara candidatos con criterios objetivos."},
      {n:"Reportes de selección",               r:"Comunica decisiones de contratación con argumento claro al negocio."},
    ],
    reportes:[
      {n:"Análisis de datos de RRHH",    r:"Convierte datos crudos en insights accionables para la gerencia."},
      {n:"Reportes ejecutivos de RRHH",  r:"Presenta métricas de talento en lenguaje de negocio, no de RRHH."},
      {n:"Dashboards narrativos",        r:"Construye el argumento detrás de los números."},
    ],
    onboarding:[
      {n:"Diseño de proceso de onboarding",r:"Construye una secuencia estructurada de primeros 30 días."},
      {n:"Materiales de bienvenida",       r:"Produce documentos, guías y checklists de ingreso consistentes."},
      {n:"Seguimiento de nuevos ingresos", r:"Un sistema de check-ins que detecta problemas temprano."},
    ],
  },
  independiente:{
    admin:[
      {n:"Gestión de agenda y prioridades",r:"Separa el tiempo facturable del tiempo operativo."},
      {n:"Comunicación con clientes",      r:"Redacta emails, recordatorios y actualizaciones en minutos."},
      {n:"Documentación de casos",         r:"Mantén el expediente actualizado sin consumir tiempo de trabajo."},
    ],
    valor:[
      {n:"Traducción técnica al cliente",  r:"Explica conceptos legales o contables sin jerga que el cliente no entiende."},
      {n:"Propuesta de valor profesional", r:"Comunica qué problema resuelves y qué riesgo eliminas para el cliente."},
      {n:"Educación del cliente",          r:"Produce contenido que posiciona tu expertise sin que suene a publicidad."},
    ],
    seguimiento:[
      {n:"Gestión de pipeline de casos",   r:"Visualiza el estado de cada cliente y próximo paso sin depender de la memoria."},
      {n:"Mensajes de seguimiento",        r:"Mantén al cliente informado sin invertir tiempo en cada actualización."},
      {n:"Reportes de avance",             r:"Comunica progreso en lenguaje que el cliente entiende y valora."},
    ],
    propuestas:[
      {n:"Propuestas de servicios",        r:"Produce una propuesta profesional en minutos con el contexto del cliente."},
      {n:"Contratos base",                 r:"Una estructura estándar adaptable a cada caso sin empezar desde cero."},
      {n:"Cartas y comunicados formales",  r:"Redacta documentación profesional con el tono correcto."},
    ],
  },
  docente:{
    materiales:[
      {n:"Arquitectura de contenido formativo",r:"Estructura un módulo completo en una fracción del tiempo habitual."},
      {n:"Materiales de apoyo",                r:"Produce presentaciones, guías y ejercicios coherentes con el objetivo."},
      {n:"Actividades de aprendizaje",         r:"Diseña dinámicas y casos prácticos calibrados al nivel del grupo."},
    ],
    aplicacion:[
      {n:"Diseño de transferencia",        r:"Construye planes de aplicación práctica que van más allá del taller."},
      {n:"Seguimiento post-formación",     r:"Check-ins que refuerzan el aprendizaje después de la sesión."},
      {n:"Ajuste de contenido por feedback",r:"Itera el material basado en lo que no funcionó."},
    ],
    evaluacion:[
      {n:"Diseño de evaluaciones",         r:"Mide aprendizaje real, no solo satisfacción del participante."},
      {n:"Reportes de impacto formativo",  r:"Demuestra el ROI de la capacitación al cliente o empresa."},
      {n:"Análisis de resultados",         r:"Identifica qué cambiar en la siguiente iteración con datos concretos."},
    ],
    adaptar:[
      {n:"Perfilado de audiencia formativa",r:"Diagnostica el nivel, contexto y necesidades del grupo antes de diseñar."},
      {n:"Adaptación de contenido",         r:"Toma un módulo existente y calibralo a un nuevo perfil en poco tiempo."},
      {n:"Comunicación pre-formación",      r:"Gestiona expectativas y prepara al grupo antes de la sesión."},
    ],
  },
  pyme:{
    todo:[
      {n:"Diagnóstico de delegación",      r:"Identifica qué tareas estás haciendo tú que no deberías."},
      {n:"Instrucciones para delegar",     r:"Documenta procesos de forma que otro los pueda ejecutar sin preguntarte."},
      {n:"Priorización semanal",           r:"Enfócate en las tareas de alto impacto y suelta las operativas."},
    ],
    dinero:[
      {n:"Diagnóstico financiero básico",  r:"Lee tus números y detecta dónde se pierde dinero sin ser contador."},
      {n:"Análisis de rentabilidad por área",r:"Sabe qué parte del negocio vale la pena y cuál no."},
      {n:"Reportes para tomar decisiones", r:"Convierte datos financieros en decisiones concretas de operación."},
    ],
    equipo:[
      {n:"Comunicación de prioridades",    r:"Transmite foco y dirección por escrito sin ambigüedad."},
      {n:"Actualizaciones de equipo",      r:"Produce briefings semanales que reemplazan reuniones innecesarias."},
      {n:"Feedback al equipo",             r:"Da retroalimentación clara y directa que genera cambio real."},
    ],
    delegar:[
      {n:"Documentación de procesos",      r:"Crea SOPs simples que cualquier persona puede seguir."},
      {n:"Onboarding de colaboradores",    r:"Un nuevo miembro entiende su rol y tareas sin depender de ti."},
      {n:"Instrucciones operativas",       r:"Comunica exactamente qué hacer, cómo y con qué criterio de calidad."},
    ],
  },
};

/* ── HELPERS ────────────────────────────────────────── */
function buildGHLUrl(perfil, sintoma) {
  const perfilLabel  = PERFILES.find(p => p.id === perfil)?.titulo || "";
  const sintomaLabel = SINTOMAS[perfil]?.find(s => s.id === sintoma)?.txt || "";
  const skills3       = perfil && sintoma ? (SKILLS[perfil]?.[sintoma] || []) : [];
  const params = new URLSearchParams({
    perfil: perfilLabel,
    problema: sintomaLabel,
    // Mismo patrón que perfil/problema — requiere 3 campos ocultos en GHL con
    // Query Key = skill_1 / skill_2 / skill_3 para poder usarlos como merge tag en el email.
    skill_1: skills3[0]?.n || "",
    skill_2: skills3[1]?.n || "",
    skill_3: skills3[2]?.n || "",
  });
  return GHL_FORM_BASE + "?" + params.toString();
}

/* ── GHL IFRAME FORM COMPONENT ───────────────────────── */
function GHLForm({ onSubmit, perfilId, sintomaId }) {
  const scriptLoaded = useRef(false);

  // Load GHL embed script once
  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    const s = document.createElement("script");
    s.src = GHL_JS_URL;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Listen for GHL postMessage on successful form submit
  useEffect(() => {
    const handler = (e) => {
      try {
        // GHL sends different message shapes depending on version
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const isGHL = (
          e.origin.includes("centralize.es") ||
          e.origin.includes("leadconnectorhq.com") ||
          e.origin.includes("msgsndr.com")
        );
        if (!isGHL) return;

        // Señal explícita de envío exitoso — sin heurístico de resize (ver nota en el componente principal)
        const isSubmit =
          data?.type === "form_submitted" ||
          data?.event === "form_submitted" ||
          data?.message === "form_submitted" ||
          data?.action === "submit" ||
          data?.submitted === true;

        if (isSubmit) {
          onSubmit();
        }
      } catch {}
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSubmit]);

  return (
    <iframe
      src={buildGHLUrl(perfilId, sintomaId)}
      id={`inline-${GHL_FORM_ID}`}
      data-layout={`{"id":"INLINE"}`}
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name="Form Diagnostico Skills"
      data-height="465"
      data-layout-iframe-id={`inline-${GHL_FORM_ID}`}
      data-form-id={GHL_FORM_ID}
      title="Form Diagnostico Skills"
      style={{
        width:"100%",
        height:"465px",
        border:"none",
        borderRadius:"10px",
        display:"block",
      }}
    />
  );
}

// Ref outside component to track submit state for resize fallback
const paso3Submitted = { current: false };

/* ── MAIN COMPONENT ──────────────────────────────────── */
export default function App() {
  // 0=intro 1=perfil 2=sintoma 3=form 4=resultado
  const [paso,     setPaso]    = useState(0);
  const [perfil,   setPerfil]  = useState(null);
  const [sintoma,  setSintoma] = useState(null);
  const [fade,     setFade]    = useState(false);
  const [hov,      setHov]     = useState(null);
  const [isMobile, setIsMobile]= useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  // showManual se activa únicamente por la señal explícita de éxito de GHL (ver useEffect abajo).
  // manualTimer queda declarado sin uso activo — no hay temporizador de fallback por tiempo.
  const [showManual, setShowManual] = useState(false);
  const manualTimer = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Detecta el envío exitoso del formulario GHL con dos señales combinadas:
  //
  // 1) postMessage explícito (ideal, instantáneo) — si GHL lo envía en un formato reconocible.
  // 2) Fallback por resize del iframe, AJUSTADO para no repetir el falso positivo original:
  //    - Requiere un ÚNICO salto de altura GRANDE (>80px), no dos cambios pequeños cualesquiera.
  //      Un error de validación (campos vacíos) suele mover la altura unos pocos px al insertar
  //      texto de error; el reemplazo completo del formulario por la tarjeta de "gracias" de GHL
  //      (confirmado visualmente: caso real reportado) es un salto grande y único.
  //    - Ignora resizes durante los primeros 1200ms tras montar el iframe (es solo la carga
  //      inicial del formulario, no una respuesta a un submit).
  //
  // Este fallback existe porque no hay certeza de que el postMessage de GHL llegue en el
  // formato exacto que se está escuchando — no hay forma de verificarlo empíricamente sin
  // acceso a un entorno GHL real. Si el postMessage sí llega, el resize nunca llega a activarse
  // (paso3Submitted.current ya estaría en true).
  useEffect(() => {
    if (paso !== 3) return;
    paso3Submitted.current = false;
    setShowManual(false);

    const mountedAt = Date.now();
    const GRACE_MS = 1200;
    const MIN_JUMP_PX = 80;

    const handler = (e) => {
      try {
        const raw = typeof e.data === "string" ? e.data : JSON.stringify(e.data);
        const signals = [
          "form_submitted", "formSubmitted", "submitted",
          "thankyou", "thank_you", "success", "gtm.formSubmit"
        ];
        const hit = signals.some(s => raw.toLowerCase().includes(s.toLowerCase()));
        if (hit && !paso3Submitted.current) {
          paso3Submitted.current = true;
          setShowManual(true);
        }
      } catch {}
    };
    window.addEventListener("message", handler);

    const iframe = document.querySelector('iframe[data-form-id]');
    let prevHeight = 0;
    const resizeObserver = iframe ? new ResizeObserver(() => {
      if (paso3Submitted.current) return;
      if (Date.now() - mountedAt < GRACE_MS) { prevHeight = iframe.offsetHeight; return; }
      const h = iframe.offsetHeight;
      if (prevHeight > 0 && Math.abs(h - prevHeight) >= MIN_JUMP_PX) {
        paso3Submitted.current = true;
        setShowManual(true);
      }
      prevHeight = h;
    }) : null;
    if (resizeObserver && iframe) resizeObserver.observe(iframe);

    return () => {
      window.removeEventListener("message", handler);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [paso]);

  const go = (n) => {
    setFade(true);
    setTimeout(() => { setPaso(n); setFade(false); }, 240);
  };

  const pickPerfil  = (id) => { setPerfil(id); setSintoma(null); go(2); };
  const pickSintoma = (id) => { setSintoma(id); go(3); };
  const handleFormSubmit = () => {
    paso3Submitted.current = true;
    setShowManual(true);
  };
  const reset = () => { setPerfil(null); setSintoma(null); go(0); };

  const skills     = perfil && sintoma ? SKILLS[perfil]?.[sintoma] || [] : [];
  const perfilObj  = PERFILES.find(p => p.id === perfil);
  const sintomaObj = SINTOMAS[perfil]?.find(s => s.id === sintoma);

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"flex-start",
      padding: isMobile ? "0" : "40px 24px 60px",
      position:"relative", overflowX:"hidden",
    }}>

      {/* GLOWS */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:`
          radial-gradient(ellipse 80vw 50vh at 0% 0%,   rgba(46,230,166,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 70vw 50vh at 100% 100%, rgba(46,230,166,0.06) 0%, transparent 60%)
        `,
      }}/>
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`
          linear-gradient(rgba(46,230,166,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,230,166,0.022) 1px, transparent 1px)
        `,
        backgroundSize:"52px 52px",
      }}/>

      {/* CARD */}
      <div style={{
        width:"100%",
        maxWidth: isMobile ? "100%" : (paso === 0 ? "860px" : "680px"),
        background: isMobile ? C.bg : C.surface,
        border: isMobile ? "none" : `1px solid ${C.border}`,
        borderRadius: isMobile ? 0 : "12px",
        padding: isMobile ? "28px 20px 48px" : "48px 52px",
        position:"relative", zIndex:1,
        minHeight: isMobile ? "100vh" : "auto",
        opacity: fade ? 0 : 1,
        transform: fade ? "translateY(8px)" : "translateY(0)",
        transition:"opacity 0.24s ease, transform 0.24s ease",
      }}>

        {/* EYEBROW */}
        <div style={{
          fontSize: isMobile?"13px":"11px", letterSpacing:"0.16em", color:C.emerald,
          textTransform:"uppercase", marginBottom:"12px",
          opacity:0.6, fontFamily:font, fontWeight:500,
        }}>
          Skills Diagnóstico · Smart Business
        </div>

        {/* PROGRESS — pasos 2-4 (sintoma, form, resultado) */}
        {paso > 1 && (
          <div style={{ display:"flex", gap:"6px", marginBottom: isMobile?"28px":"36px" }}>
            {[2,3,4].map((n,i)=>(
              <div key={i} style={{
                height:"3px", flex:1, borderRadius:"2px",
                background: paso > n ? C.emerald : paso === n ? C.emerald : "rgba(46,230,166,0.1)",
                transition:"background 0.4s ease",
              }}/>
            ))}
          </div>
        )}

        {/* ══ LANDING PAGE — PASO 0 ══ */}
        {paso === 0 && (
          <div>

            {/* ── HERO ── */}
            <div style={{
              textAlign: isMobile ? "left" : "center",
              paddingBottom: isMobile ? "40px" : "60px",
              borderBottom: `1px solid ${C.border}`,
              marginBottom: isMobile ? "40px" : "56px",
            }}>
              {/* Badge */}
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                background:"rgba(46,230,166,0.08)", border:"1px solid rgba(46,230,166,0.2)",
                borderRadius:"100px", padding:"6px 18px",
                marginBottom: isMobile?"20px":"28px",
              }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:C.emerald, display:"inline-block", flexShrink:0, animation:"pulse 2s ease-in-out infinite" }}/>
                <span style={{ fontSize: isMobile?"13px":"12px", color:C.emerald, fontFamily:font, fontWeight:600, letterSpacing:"0.04em" }}>
                  Sistema de diagnóstico · Smart Business
                </span>
              </div>

              {/* H1 */}
              <h1 style={{
                fontSize: isMobile?"30px":"52px",
                fontFamily:fontDisplay, fontWeight:800, lineHeight:1.1,
                marginBottom: isMobile?"18px":"24px",
                color:"#faf8f4", letterSpacing:"-0.03em",
                maxWidth:"780px",
                marginLeft:"auto", marginRight:"auto",
              }}>
                Descubre las 3 Skills que necesitas{" "}
                <span style={{
                  background:"linear-gradient(135deg, #2EE6A6, #1BA77E)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                }}>
                  ahora mismo en Claude
                </span>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: isMobile?"16px":"20px",
                lineHeight:1.7, color:C.sub, fontFamily:font,
                maxWidth:"580px",
                marginLeft:"auto", marginRight:"auto",
                marginBottom: isMobile?"28px":"36px",
              }}>
                Identifica tu perfil, tu cuello de botella y la ruta exacta de Skills que debes construir primero — en el orden correcto.
              </p>

            </div>

            {/* ── PERFILES ── */}
            <div style={{ marginBottom: isMobile?"40px":"56px" }}>
              <h2 style={{
                fontSize: isMobile?"22px":"32px",
                fontFamily:fontDisplay, fontWeight:800, color:"#faf8f4",
                lineHeight:1.2, letterSpacing:"-0.02em",
                marginBottom: isMobile?"8px":"12px",
                textAlign: isMobile?"left":"center",
              }}>
                Elige el perfil más cercano a lo que haces hoy
              </h2>
              <p style={{
                fontSize: isMobile?"14px":"16px", color:C.sub,
                fontFamily:font, lineHeight:1.6,
                marginBottom: isMobile?"24px":"36px",
                textAlign: isMobile?"left":"center",
                maxWidth:"480px",
                marginLeft:"auto", marginRight:"auto",
              }}>
                Cada perfil tiene sus propias Skills prioritarias. Elige el tuyo para ver cuáles necesitas primero.
              </p>

              {/* Grid de perfiles — 1 columna mobile, 2 desktop. Vía CSS puro (sin dependencia de isMobile/JS) para evitar el parpadeo de layout de escritorio antes de que React monte. */}
              <div id="perfiles-grid" className="perfiles-grid">
                {PERFILES.map((p, i)=>{
                  const accentColor = C.emerald;
                  const accentRgb   = C.emerald_rgb || "46,230,166";
                  const isHov       = hov === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={()=>pickPerfil(p.id)}
                      onMouseEnter={()=>setHov(p.id)}
                      onMouseLeave={()=>setHov(null)}
                      style={{
                        background: isHov ? `rgba(${accentRgb},0.06)` : C.surface,
                        border:`1.5px solid ${isHov ? accentColor : C.border}`,
                        borderRadius:"12px",
                        padding:"16px 18px",
                        display:"flex", gap:"14px", alignItems:"flex-start",
                        position:"relative", overflow:"hidden",
                        cursor:"pointer", textAlign:"left",
                        transition:"all 0.16s ease",
                      }}
                    >
                      {/* Accent — único acento del bloque: borde izquierdo 2px (regla design-tokens: nunca dos usos del mismo color compitiendo) */}
                      <div style={{
                        position:"absolute", top:0, left:0,
                        width:"2px", height:"100%",
                        background: accentColor, borderRadius:"12px 0 0 12px",
                      }}/>
                      {/* Icon — glifo plano en esmeralda, sin fondo/borde propio para no competir con el acento del borde */}
                      <div style={{
                        width:38, height:38, flexShrink:0,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"19px", color: accentColor,
                      }}>{p.icon}</div>
                      {/* Text */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{
                          fontSize: isMobile?"15px":"15px", fontWeight:700,
                          color: isHov ? "#faf8f4" : C.text,
                          fontFamily:font, marginBottom:"4px",
                          lineHeight:1.3, transition:"color 0.16s ease",
                        }}>{p.titulo}</div>
                        <div style={{
                          fontSize: isMobile?"13px":"13px", color:C.sub,
                          fontFamily:font, lineHeight:1.5,
                        }}>{p.desc}</div>
                      </div>
                      {/* Arrow on hover */}
                      <span style={{
                        fontSize:"16px", color: isHov ? accentColor : "transparent",
                        flexShrink:0, alignSelf:"center",
                        transition:"color 0.16s ease",
                      }}>→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── NOTA FINAL ── (botón "Comenzar diagnóstico" eliminado — se accede directo desde las cards de perfil arriba) */}
            <div style={{
              textAlign: isMobile ? "left" : "center",
              paddingTop: isMobile?"0":"8px",
            }}>
              <p style={{
                fontSize: isMobile?"14px":"16px", color:C.sub,
                fontFamily:font, lineHeight:1.6,
                maxWidth:"420px",
                marginLeft:"auto", marginRight:"auto",
              }}>
                Recibe el diagnóstico en tu correo
              </p>
            </div>

          </div>
        )}

        {/* Paso 1 eliminado — perfil se elige desde la landing */}

        {/* ══ SÍNTOMA ══ */}
        {paso === 2 && (
          <div>
            <div style={{ fontSize:"12px", color:C.emerald, letterSpacing:"0.14em", fontFamily:font, fontWeight:700, marginBottom:"10px", textTransform:"uppercase" }}>
              Paso 1 de 2 — Tu problema
            </div>
            <h2 style={{ fontSize: isMobile?"22px":"30px", fontFamily:fontDisplay, fontWeight:800, color:"#faf8f4", lineHeight:1.2, marginBottom:"8px", letterSpacing:"-0.02em" }}>
              ¿Qué te está costando más?
            </h2>
            <p style={{ fontSize: isMobile?"14px":"16px", color:C.sub, marginBottom: isMobile?"20px":"28px", fontFamily:font }}>
              Elige el problema que más te pesa hoy
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {(SINTOMAS[perfil]||[]).map((s,i)=>(
                <button
                  key={s.id}
                  onClick={()=>pickSintoma(s.id)}
                  onMouseEnter={()=>setHov(s.id)}
                  onMouseLeave={()=>setHov(null)}
                  style={{
                    background: hov===s.id ? "rgba(46,230,166,0.08)" : "rgba(36,32,25,0.92)",
                    border:`1.5px solid ${hov===s.id ? C.emerald : C.border}`,
                    borderRadius:"10px",
                    padding: isMobile?"14px 16px":"16px 20px",
                    textAlign:"left", cursor:"pointer",
                    transition:"all 0.16s ease",
                    display:"flex", alignItems:"center", gap:"14px",
                  }}
                >
                  <span style={{
                    width:32, height:32, borderRadius:"8px", flexShrink:0,
                    background: hov===s.id ? "rgba(46,230,166,0.15)" : C.border,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"12px", fontWeight:700,
                    color: hov===s.id ? C.emerald : C.muted,
                    fontFamily:font, transition:"all 0.16s ease",
                  }}>0{i+1}</span>
                  <span style={{
                    flex:1, fontSize: isMobile?"14px":"15px",
                    color: hov===s.id ? C.text : C.sub,
                    fontFamily:font, lineHeight:1.55, fontWeight:500,
                    transition:"color 0.16s ease",
                  }}>{s.txt}</span>
                  <span style={{ fontSize:"18px", flexShrink:0, color: hov===s.id?C.emerald:"transparent", transition:"color 0.16s ease" }}>→</span>
                </button>
              ))}
            </div>

            <button
              onClick={()=>{ setPerfil(null); go(0); }}
              style={{ marginTop:"20px", background:"transparent", border:"none", color:C.muted, fontSize:"14px", cursor:"pointer", fontFamily:font, fontWeight:500, padding:"6px 0" }}
            >
              ← Cambiar perfil
            </button>
          </div>
        )}

        {/* ══ PASO 3 — FORMULARIO GHL ══ */}
        {paso === 3 && (
          <div>
            {/* Header */}
            <div style={{
              display:"flex", alignItems:"center", gap:"10px",
              marginBottom: isMobile?"20px":"28px",
            }}>
              <div style={{
                width:40, height:40, borderRadius:"10px", flexShrink:0,
                background:"rgba(46,230,166,0.1)",
                border:"1.5px solid rgba(46,230,166,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"18px",
              }}>🔒</div>
              <div>
                <div style={{ fontSize: isMobile?"15px":"16px", fontWeight:700, color:"#faf8f4", fontFamily:font, marginBottom:"3px" }}>
                  Tu diagnóstico está listo
                </div>
                <div style={{ fontSize: isMobile?"13px":"14px", color:C.sub, fontFamily:font, lineHeight:1.5 }}>
                  Déjanos tus datos para ver las 3 Skills que necesitas
                </div>
              </div>
            </div>

            {/* GHL iframe */}
            <div style={{
              background:"rgba(36,32,25,0.75)",
              border:`1px solid ${C.border}`,
              borderRadius:"12px",
              overflow:"hidden",
              marginBottom:"12px",
            }}>
              <GHLForm onSubmit={handleFormSubmit} perfilId={perfil} sintomaId={sintoma} />
            </div>

            {/* Mensaje instructivo — visible mientras no llega la señal real de envío exitoso de GHL.
                No detecta "formulario en blanco" como evento propio (imposible desde la página padre,
                restricción cross-origin) — informa qué hacer en vez de asumir un estado que no se puede verificar. */}
            {!showManual && (
              <p style={{
                fontSize:"13px", color:C.sub, fontFamily:font,
                textAlign:"center", marginBottom:"16px", lineHeight:1.5,
              }}>
                Introduce tus datos para ver las habilidades para tu perfil.
              </p>
            )}

            {/* Confirmación final — el reporte se envía por email Y se muestra en la siguiente pantalla (paso 4). */}
            {showManual && (
              <div style={{
                textAlign:"center",
                padding:"20px",
                background:"rgba(46,230,166,0.04)",
                border:"1px solid rgba(46,230,166,0.12)",
                borderRadius:"10px",
                marginBottom:"16px",
              }}>
                <p style={{ fontSize:"14px", color:"#faf8f4", fontFamily:font, fontWeight:700, marginBottom:"6px" }}>
                  ✓ Datos enviados correctamente
                </p>
                <p style={{ fontSize:"13px", color:C.sub, fontFamily:font, lineHeight:1.5, marginBottom:"16px" }}>
                  También te lo enviamos a tu correo.
                </p>
                <button
                  onClick={()=>go(4)}
                  onMouseEnter={()=>setHov("manual")}
                  onMouseLeave={()=>setHov(null)}
                  style={{
                    background: hov==="manual" ? "#A24F23" : C.rust,
                    color:"#161512", border:"none", borderRadius:"100px",
                    padding:"13px 26px", fontSize:"13px", textTransform:"uppercase",
                    fontFamily:font, fontWeight:700, letterSpacing:"0.06em",
                    cursor:"pointer", transition:"background 0.16s ease",
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Ver mi diagnóstico →
                </button>
              </div>
            )}

            <button
              onClick={()=>go(2)}
              style={{ background:"transparent", border:"none", color:C.muted, fontSize:"14px", cursor:"pointer", fontFamily:font, fontWeight:500, padding:"4px 0" }}
            >
              ← Volver
            </button>
          </div>
        )}

        {/* ══ PASO 4 — RESULTADO ══ */}
        {paso === 4 && (
          <div>
            <div style={{
              display:"flex", alignItems:"flex-start", gap:"14px",
              marginBottom: isMobile?"24px":"32px",
            }}>
              <div style={{
                width:44, height:44, borderRadius:"10px", flexShrink:0,
                background:"rgba(46,230,166,0.1)", border:"1px solid rgba(46,230,166,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
              }}>🔓</div>
              <div>
                <h2 style={{ fontSize: isMobile?"20px":"24px", fontFamily:fontDisplay, fontWeight:800, color:"#faf8f4", marginBottom:"4px", lineHeight:1.2 }}>
                  Tu diagnóstico está listo
                </h2>
                <p style={{ fontSize:"14px", color:C.sub, fontFamily:font, lineHeight:1.5 }}>
                  Perfil: <span style={{ color:C.text, fontWeight:600 }}>{perfilObj?.titulo}</span>
                  {" · "}
                  Problema: <span style={{ color:C.text, fontWeight:600 }}>{sintomaObj?.txt}</span>
                </p>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom: isMobile?"28px":"36px" }}>
              {skills.map((sk,i)=>(
                <div key={i} style={{
                  background:"rgba(36,32,25,0.75)", border:`1px solid ${C.border}`,
                  borderRadius:"12px", padding: isMobile?"16px":"18px 20px",
                  display:"flex", gap:"14px", alignItems:"flex-start",
                }}>
                  <span style={{ fontSize:"14px", color:C.emerald, fontWeight:800, fontFamily:font, flexShrink:0, marginTop:"2px" }}>0{i+1}</span>
                  <div>
                    <div style={{ fontSize: isMobile?"15px":"16px", fontWeight:700, color:"#faf8f4", fontFamily:font, marginBottom:"4px" }}>
                      {sk.n}
                    </div>
                    <div style={{ fontSize:"13px", color:C.sub, fontFamily:font, lineHeight:1.5 }}>
                      {sk.r}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background:"rgba(46,230,166,0.04)", border:"1px solid rgba(46,230,166,0.12)",
              borderRadius:"12px", padding: isMobile?"18px":"22px", marginBottom:"20px", textAlign:"center",
            }}>
              <p style={{ fontSize:"13px", color:C.sub, fontFamily:font, marginBottom:"14px", lineHeight:1.5 }}>
                Estas 3 Skills ya están construidas y listas para instalar en Claude.
              </p>
              <button
                onMouseEnter={()=>setHov("pack")}
                onMouseLeave={()=>setHov(null)}
                style={{
                  background: hov==="pack" ? "#A24F23" : C.rust,
                  color:"#161512", border:"none", borderRadius:"100px",
                  padding: isMobile?"16px 24px":"16px 28px",
                  fontSize:"13px", textTransform:"uppercase",
                  fontFamily:font, fontWeight:700, letterSpacing:"0.06em",
                  cursor:"pointer", transition:"background 0.16s ease", width:"100%",
                }}
                onClick={()=>window.open("https://skillspack.rodolfobuitrago.com/","_blank")}
              >
                Ver Pack completo para mi perfil →
              </button>
            </div>

            <button
              onClick={reset}
              onMouseEnter={e=>e.currentTarget.style.color=C.sub}
              onMouseLeave={e=>e.currentTarget.style.color=C.muted}
              style={{ background:"transparent", border:"none", color:C.muted, fontSize:"14px", cursor:"pointer", fontFamily:font, fontWeight:500, padding:"4px 0" }}
            >
              ← Hacer diagnóstico de nuevo
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div style={{
          marginTop: isMobile?"40px":"52px",
          paddingTop:"16px",
          borderTop:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          fontSize: isMobile?"12px":"11px", color:C.muted, fontFamily:font, letterSpacing:"0.06em",
        }}>
          <span style={{ fontWeight:600 }}>SMART BUSINESS</span>
          <span style={{ color:"rgba(46,230,166,0.2)", fontSize:"16px" }}>◈</span>
          <span>SKILLS PARA CLAUDE</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { -webkit-text-size-adjust:100%; }
        button { -webkit-tap-highlight-color:transparent; }
        button:focus-visible { outline:2px solid rgba(46,230,166,0.5); outline-offset:2px; }
        @media (max-width:639px) { body { overflow-x:hidden; } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        body { font-weight:300; } /* regla de design-tokens-diagnostico.md sección 2 */
        @media (max-width:599px) { body { font-weight:400; } }
        .perfiles-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        @media (max-width:700px) { .perfiles-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
