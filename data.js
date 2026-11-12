/* Datos de juego ficticios. No representan estadísticas ni partidos reales. */
(function (G) {
  'use strict';
  const option = (label, description, effects, cost = 12, extra = {}) => ({ label, description, effects, cost, ...extra });
  const event = (id, category, title, body, options, extra = {}) => ({ id, category, title, body, options, ...extra });
  const parties = [
    { id:'horizonte', name:'Horizonte', short:'HZ', color:'#db8058', ideology:0, seats:124, relation:100 },
    { id:'alianza', name:'Alianza Popular', short:'AP', color:'#5b8aa8', ideology:2, seats:111, relation:33 },
    { id:'progreso', name:'Progreso Social', short:'PS', color:'#b65d70', ideology:-1, seats:53, relation:64 },
    { id:'voz', name:'Voz Nacional', short:'VN', color:'#839c67', ideology:3, seats:31, relation:25 },
    { id:'verde', name:'Verde Común', short:'VC', color:'#4c9a8b', ideology:-2, seats:17, relation:50 },
    { id:'territorial', name:'Liga Territorial', short:'LT', color:'#bb9c5b', ideology:0.5, seats:14, relation:52 }
  ];
  const groups = [
    {id:'workers', name:'Trabajadores', weight:0.26, icon:'◈'},
    {id:'youth', name:'Jóvenes', weight:0.18, icon:'↗'},
    {id:'pensioners', name:'Pensionistas', weight:0.22, icon:'◷'},
    {id:'business', name:'Empresas', weight:0.13, icon:'▥'},
    {id:'rural', name:'Mundo rural', weight:0.12, icon:'♧'},
    {id:'public', name:'Servicios públicos', weight:0.09, icon:'✚'}
  ];
  const regions = [
    ['Andalucía',61,50,7,8],['Aragón',13,51,8,3],['Asturias',7,53,3,1],['Illes Balears',8,44,11,5],
    ['Canarias',15,48,2,12],['Cantabria',5,52,5,1],['Castilla y León',30,49,4,4],['Castilla-La Mancha',21,51,6,6],
    ['Cataluña',48,45,10,3],['Comunitat Valenciana',33,50,9,6],['Extremadura',10,52,3,6],['Galicia',23,51,1,2],
    ['Comunidad de Madrid',37,49,6,4],['Región de Murcia',10,48,9,8],['Navarra',5,48,7,2],['País Vasco',18,46,6,1],
    ['La Rioja',4,50,6,2],['Ceuta',1,47,5,10],['Melilla',1,47,7,10]
  ].map((r,i)=>({id:i,name:r[0],seats:r[1],approval:r[2],x:r[3],y:r[4]}));
  const scenarios = [
    {id:'mandato',name:'Un nuevo mandato',year:2027,tag:'RECOMENDADO',description:'Una mayoría ajustada, vivienda cara y un país que espera respuestas.',metrics:{},event:'housing'},
    {id:'recesion',name:'La gran recesión',year:2008,tag:'ECONOMÍA',description:'Historia alternativa: recesión, desempleo y un sistema financiero en apuros.',metrics:{growth:-2.5,unemployment:18,debt:78,stability:48},event:'banks'},
    {id:'emergencia',name:'Un país en pausa',year:2020,tag:'CRISIS',description:'Historia alternativa: una emergencia sanitaria pone a prueba al Gobierno.',metrics:{growth:-4,health:39,debt:111,stability:52},event:'health'},
    {id:'transicion',name:'Construir la democracia',year:1978,tag:'HISTORIA',description:'Historia alternativa: busca consensos para unas instituciones democráticas sólidas.',metrics:{inflation:12,stability:42,integrity:55,debt:48},event:'constitution'}
  ];
  const events = [
    event('housing','SOCIEDAD','La generación que no puede emanciparse','El alquiler absorbe buena parte del sueldo de los jóvenes. Las ciudades piden un plan de vivienda y tu socio exige una respuesta esta misma semana.',[
      option('Construir vivienda pública','Una inversión a largo plazo. Los primeros pisos llegarán dentro de seis meses.',{cash:-5,youth:5,workers:2},14,{delayed:{months:6,label:'Entrega de vivienda pública',effects:{housing:12,youth:8,workers:3}}}),
      option('Incentivar el alquiler asequible','Beneficios fiscales a propietarios que bajen las rentas.',{cash:-2,housing:4,youth:3,business:3},10),
      option('Limitar los precios del alquiler','Una respuesta inmediata, con resistencia del sector inmobiliario.',{housing:6,youth:7,business:-8,stability:-2},17)
    ]),
    event('banks','ECONOMÍA','El crédito se está congelando','Dos grandes bancos anuncian pérdidas. Sin financiación, miles de pequeñas empresas se preparan para despedir.',[
      option('Rescate con condiciones','Entrar en el capital y exigir transparencia.',{cash:-12,growth:0.8,business:7,integrity:3,workers:-3},16),
      option('Garantizar el crédito a las pymes','Centrar los avales en empresas y empleo.',{cash:-6,growth:0.4,workers:5,business:4},12),
      option('Dejar que el mercado se ajuste','Conservar recursos públicos asumiendo una recesión más dura.',{growth:-1,unemployment:1,business:-5,workers:-6,integrity:2},5)
    ]),
    event('health','SANIDAD','Los hospitales, al límite','La red hospitalaria está cerca de su capacidad. Los equipos sanitarios necesitan personal y las empresas temen nuevas restricciones.',[
      option('Refuerzo sanitario de emergencia','Contratar equipos y habilitar camas.',{cash:-7,health:12,public:7,stability:3},13),
      option('Restricciones temporales y ayudas','Frenar los contagios compensando a los negocios.',{cash:-5,health:8,growth:-0.6,business:-3,workers:4},15),
      option('Coordinar una respuesta territorial','Recursos compartidos con las comunidades.',{cash:-3,health:5,stability:5,eu:2},10)
    ]),
    event('constitution','INSTITUCIONES','Un pacto para el futuro','El país necesita instituciones que sobrevivan a sus gobiernos. Los grupos parlamentarios llegan a la mesa con líneas rojas distintas.',[
      option('Buscar un gran consenso','Ceder protagonismo a cambio de estabilidad democrática.',{stability:15,integrity:8,workers:3,business:3},22),
      option('Impulsar tu propio proyecto','Una reforma ambiciosa que polariza el debate.',{stability:-5,integrity:5,youth:8},12),
      option('Una comisión plural','Acuerdos graduales y garantías de participación.',{stability:8,integrity:6,public:3},14)
    ]),
    event('energy','ENERGÍA','El precio de la luz se dispara','Un aumento del precio internacional del gas llega a los hogares. La industria reclama certidumbre.',[
      option('Bonificar la factura','Un alivio inmediato para las familias.',{cash:-4,inflation:-0.4,workers:5,pensioners:4},11),
      option('Acelerar renovables','Invertir hoy para reducir la dependencia energética.',{cash:-5,climate:4,business:2},14,{delayed:{months:4,label:'Nuevas plantas renovables',effects:{climate:8,inflation:-0.5,growth:0.3}}}),
      option('Pactar compras europeas','Compartir suministro con los socios europeos.',{eu:8,inflation:-0.2,business:3},12)
    ]),
    event('strike','TRABAJO','Los sindicatos anuncian una huelga','La negociación salarial se bloquea. El conflicto amenaza el transporte y los servicios.',[
      option('Mediar en un acuerdo salarial','Los trabajadores ganan poder adquisitivo.',{workers:7,business:-3,stability:4,inflation:0.2},15),
      option('Aliviar las cotizaciones','Apoyar salarios sin cargar todo el coste a las empresas.',{cash:-3,workers:4,business:4},12),
      option('Mantener la posición','El conflicto sigue su curso.',{workers:-7,business:3,stability:-6},5)
    ]),
    event('drought','CLIMA','El campo mira al cielo','Las reservas de agua caen y los agricultores piden ayuda. Las ciudades se preparan para posibles restricciones.',[
      option('Modernizar los regadíos','Una infraestructura que tarda en dar frutos.',{cash:-4,rural:5},12,{delayed:{months:3,label:'Regadíos eficientes',effects:{climate:7,rural:6,growth:0.2}}}),
      option('Ayudas de emergencia al campo','Compensar las pérdidas de esta campaña.',{cash:-3,rural:8,inflation:-0.1},10),
      option('Restricciones y ahorro de agua','Proteger las reservas con límites de consumo.',{climate:5,rural:-4,business:-2,stability:-2},8)
    ]),
    event('scandal','TRANSPARENCIA','Un contrato bajo sospecha','La prensa publica indicios de irregularidades en una adjudicación. La oposición exige responsabilidades.',[
      option('Auditoría independiente','Facilitar los documentos y apartar a los responsables.',{integrity:10,stability:3,public:3},17),
      option('Revisar los contratos internamente','Una investigación más discreta.',{integrity:2,stability:-3},9),
      option('Cerrar filas con el Gobierno','Negar el problema tiene un coste de credibilidad.',{integrity:-14,stability:-5,workers:-3},3)
    ]),
    event('eu-funds','EUROPA','Bruselas abre una ventana de inversión','Un programa de cooperación ofrece fondos a cambio de cofinanciación y reformas.',[
      option('Presentar un plan industrial verde','Aportar fondos y construir capacidad productiva.',{cash:-3,eu:7,climate:3},13,{delayed:{months:3,label:'Fondos de cooperación europea',effects:{cash:8,growth:0.5,business:4}}}),
      option('Priorizar digitalización','Proyectos más pequeños, con retorno rápido.',{cash:-1,education:4,business:3,eu:4},10),
      option('Renunciar a la cofinanciación','Evitar el desembolso inicial.',{eu:-6,business:-3},4)
    ]),
    event('pensions','BIENESTAR','El debate de las pensiones','Los pensionistas piden proteger su poder de compra. Hacienda advierte del coste a largo plazo.',[
      option('Revalorizar con la inflación','Una garantía para los mayores con mayor gasto público.',{cash:-4,pensioners:9,workers:-1},12),
      option('Subir las pensiones más bajas','Concentrar el esfuerzo en quienes más lo necesitan.',{cash:-2,pensioners:5,workers:2},10),
      option('Congelar y revisar el sistema','Aliviar las cuentas asumiendo protestas.',{cash:2,pensioners:-11,stability:-4},8)
    ]),
    event('rail','INFRAESTRUCTURAS','Un tren que no llega','Las averías en cercanías se acumulan. El país necesita elegir entre mantenimiento y nuevas grandes obras.',[
      option('Renovar la red de cercanías','Un proyecto de cuatro meses para el transporte diario.',{cash:-5,workers:3},13,{delayed:{months:4,label:'Cercanías renovadas',effects:{infrastructure:12,workers:6,climate:3}}}),
      option('Un plan urgente de mantenimiento','Menor coste y mejoras más rápidas.',{cash:-2,infrastructure:5,workers:3},9),
      option('Priorizar una línea de alta velocidad','Visibilidad e inversión, con críticas de los usuarios.',{cash:-6,infrastructure:6,business:5,workers:-3},11)
    ]),
    event('teachers','EDUCACIÓN','Las aulas piden un cambio','Las asociaciones educativas reclaman menos alumnos por clase y más medios.',[
      option('Contratar profesorado','Refuerzo directo en la escuela pública.',{cash:-4,education:9,public:7,youth:3},12),
      option('Plan de formación profesional','Conectar los centros con nuevas oportunidades laborales.',{cash:-3,education:5,youth:5,business:4,unemployment:-0.2},11),
      option('Reorganizar con recursos actuales','Mejorar la gestión sin ampliar la plantilla.',{education:2,public:-4,integrity:2},6)
    ]),
    event('borders','DIPLOMACIA','Una respuesta humanitaria','La llegada de personas desplazadas exige coordinación. Los municipios necesitan recursos.',[
      option('Acogida coordinada con la UE','Repartir recursos y responsabilidades.',{cash:-2,eu:7,integrity:3,stability:2},12),
      option('Reforzar atención y fronteras','Más equipos de asistencia y vigilancia.',{cash:-3,security:5,stability:3,eu:1},10),
      option('Delegar en los ayuntamientos','Una respuesta descentralizada sin financiación adicional.',{stability:-5,public:-5,eu:-3},4)
    ]),
    event('cyber','SEGURIDAD','Los servicios digitales caen','Un ataque informático afecta a la administración. Los ciudadanos no pueden hacer sus trámites.',[
      option('Activar un escudo digital','Expertos, auditoría y refuerzo de sistemas.',{cash:-3,security:10,integrity:3},13),
      option('Cooperar con socios europeos','Compartir respuesta y capacidades.',{cash:-1,security:6,eu:5},11),
      option('Restablecer solo lo esencial','Recuperación parcial con los equipos actuales.',{security:2,public:-4,business:-3},5)
    ]),
    event('tourism','ECONOMÍA','Temporada récord, ciudades saturadas','El turismo genera empleo, pero los residentes protestan por el precio de la vivienda y la presión sobre los servicios.',[
      option('Tasa turística y servicios locales','Reinvertir la recaudación en los municipios.',{cash:2,housing:3,business:-3,workers:3},11),
      option('Promover destinos del interior','Distribuir los visitantes y las oportunidades.',{cash:-2,rural:6,business:4,climate:1},10),
      option('Impulsar el crecimiento sin límites','Más ingresos con una mayor presión residencial.',{cash:3,growth:0.4,business:6,housing:-5,youth:-4},7)
    ]),
    event('regional','TERRITORIOS','La financiación autonómica, en la mesa','Varias comunidades reclaman un reparto distinto. Cualquier acuerdo tendrá ganadores y críticos.',[
      option('Acuerdo multilateral','Negociar criterios comunes con todas las comunidades.',{cash:-2,stability:8,public:3},18),
      option('Pactar inversiones concretas','Un plan territorial con resultados visibles.',{cash:-4,infrastructure:5,rural:5,stability:3},12),
      option('Aplazar la reforma','Conservar margen presupuestario.',{stability:-7,rural:-3},5)
    ]),
    event('trade','EXTERIORES','Una nueva barrera comercial','Un socio comercial anuncia aranceles. La industria exportadora teme perder pedidos.',[
      option('Negociar desde la Unión Europea','Una respuesta conjunta y diplomática.',{eu:7,business:4,growth:0.1},13),
      option('Diversificar exportaciones','Buscar nuevos mercados con apoyo público.',{cash:-3,business:5,growth:0.3},11),
      option('Responder con más aranceles','La confrontación protege a unos y perjudica a otros.',{eu:-5,inflation:0.4,growth:-0.3,rural:3},8)
    ]),
    event('fire','EMERGENCIA','Un verano entre incendios','Los equipos de extinción trabajan sin descanso. Varias localidades han sido evacuadas.',[
      option('Movilizar recursos extraordinarios','Ayuda inmediata a equipos y familias.',{cash:-4,security:4,rural:7,stability:3},12),
      option('Respuesta y prevención forestal','Una intervención con trabajo preventivo posterior.',{cash:-5,rural:5,climate:7},15),
      option('Mantener el dispositivo habitual','Preservar las cuentas ante una situación difícil.',{rural:-8,climate:-4,stability:-5},4)
    ]),
    event('science','CIENCIA','Talento que hace las maletas','Los centros de investigación pierden personal. Hay una oportunidad de traer de vuelta a equipos científicos.',[
      option('Programa de retorno investigador','Contratos estables y laboratorios.',{cash:-4,education:7,youth:5},12,{delayed:{months:5,label:'Retorno del talento',effects:{growth:0.5,health:3,education:4}}}),
      option('Colaboración universidad-empresa','Transferencia tecnológica y becas.',{cash:-2,education:4,business:5,youth:3},10),
      option('Concentrar fondos en excelencia','Apoyar menos proyectos con más recursos.',{education:3,public:-3,business:2},7)
    ]),
    event('inflation','ECONOMÍA','La cesta de la compra pesa más','Las familias notan la subida de los alimentos. Las asociaciones de consumidores piden medidas.',[
      option('Bajar temporalmente el IVA básico','Un alivio en los precios con menos recaudación.',{cash:-3,inflation:-0.6,workers:5,pensioners:4},12),
      option('Ayudas a rentas bajas','Concentrar la protección en los hogares vulnerables.',{cash:-2,workers:6,youth:3},10),
      option('Vigilar la competencia','Investigar abusos sin intervenir los precios.',{inflation:-0.2,integrity:3,business:-2},9)
    ]),
    event('leak','GOBIERNO','Una filtración rompe la confianza','Una discusión del Consejo de Ministros llega a las portadas. Los socios exigen más coordinación.',[
      option('Reunir a la coalición','Escuchar a los socios y acordar prioridades.',{stability:7,integrity:2},15),
      option('Remodelar los equipos','Recuperar el control con nuevos responsables.',{stability:3,public:-2},10),
      option('Ignorar el ruido mediático','Seguir adelante sin abordar la tensión.',{stability:-7,integrity:-2},3)
    ]),
    event('industry','INDUSTRIA','La fábrica decide su futuro','Una planta industrial estudia deslocalizarse. Toda una comarca depende de sus empleos.',[
      option('Ayudas ligadas al empleo','Financiación con obligaciones de permanencia.',{cash:-4,workers:6,business:3,unemployment:-0.3},13),
      option('Reconversión tecnológica','Una transición a nuevas actividades.',{cash:-3,education:3},12,{delayed:{months:4,label:'Reconversión industrial',effects:{growth:0.5,unemployment:-0.4,workers:5}}}),
      option('Facilitar la reubicación laboral','Proteger a los trabajadores durante el cambio.',{cash:-2,workers:2,unemployment:0.3},8)
    ]),
    event('justice','JUSTICIA','La justicia acumula retrasos','Abogados y ciudadanos reclaman una respuesta a los procedimientos pendientes.',[
      option('Más personal y medios','Reforzar los juzgados.',{cash:-3,integrity:7,public:5},12),
      option('Digitalizar los procedimientos','Modernizar la tramitación.',{cash:-2,integrity:4,security:2,business:2},10),
      option('Una reforma procesal pactada','Buscar apoyo para simplificar los procesos.',{integrity:5,stability:3},15)
    ]),
    event('press','DERECHOS','Una ley bajo la lupa de la prensa','Periodistas y juristas cuestionan una propuesta que limitaría el acceso a información pública.',[
      option('Ampliar la transparencia','Publicar datos y proteger a los informantes.',{integrity:9,stability:2,youth:3},13),
      option('Revisar el texto con expertos','Introducir garantías y abrir una consulta.',{integrity:5,public:2},9),
      option('Mantener las restricciones','La crítica se convierte en conflicto institucional.',{integrity:-10,stability:-6,eu:-5},4)
    ]),
    event('transport','CLIMA','Moverse sin contaminar','Los alcaldes piden un plan nacional de movilidad. El coche sigue siendo imprescindible en muchas comarcas.',[
      option('Abonos asequibles de transporte','Ayudar a quienes usan la red pública.',{cash:-3,climate:5,youth:5,workers:3},11),
      option('Transporte a demanda rural','Conectar pueblos y servicios.',{cash:-2,rural:8,climate:3},10),
      option('Renovar el parque de vehículos','Incentivos a vehículos de bajas emisiones.',{cash:-3,climate:4,business:5},9)
    ]),
    event('defence','EUROPA','Una cumbre con decisiones difíciles','Los aliados solicitan más capacidad conjunta de defensa y ayuda humanitaria.',[
      option('Cooperación y ayuda humanitaria','Un compromiso compartido con los aliados.',{cash:-3,eu:6,security:4,integrity:2},12),
      option('Invertir en defensa tecnológica','Desarrollar capacidades e industria.',{cash:-5,security:8,business:4},11),
      option('Priorizar la mediación diplomática','Destinar el esfuerzo a una salida negociada.',{eu:2,integrity:3,security:-2},9)
    ]),
    event('rural','TERRITORIOS','El último consultorio del pueblo','El cierre de servicios básicos acelera la despoblación. Los ayuntamientos piden un plan.',[
      option('Servicios básicos garantizados','Mantener asistencia, educación y conectividad.',{cash:-3,rural:9,health:3,education:2},12),
      option('Incentivos para nuevos residentes','Ayudas al emprendimiento y la vivienda.',{cash:-2,rural:5,youth:3,business:3},10),
      option('Concentrar servicios comarcales','Mejor equipamiento, pero mayores desplazamientos.',{cash:1,health:2,rural:-5},7)
    ]),
    event('flood','EMERGENCIA','El agua desborda las previsiones','Lluvias extremas dañan viviendas y carreteras. Los municipios necesitan actuar con rapidez.',[
      option('Reconstrucción y ayudas urgentes','Cubrir necesidades inmediatas.',{cash:-5,stability:5,infrastructure:3,workers:4},12),
      option('Reconstruir con prevención','Adaptar las infraestructuras a futuras inundaciones.',{cash:-6,climate:6,infrastructure:5},15),
      option('Coordinar ayudas existentes','Utilizar los fondos disponibles sin una ampliación.',{cash:-1,stability:-3,workers:-3},6)
    ]),
    event('ai','INNOVACIÓN','La automatización llega al empleo','La tecnología aumenta la productividad mientras algunos puestos desaparecen. Hace falta preparar la transición.',[
      option('Formación para nuevos empleos','Capacitar a trabajadores y jóvenes.',{cash:-3,education:6,workers:4,youth:4},12),
      option('Apoyar la innovación empresarial','Inversión con compromisos de formación.',{cash:-2,growth:0.4,business:6,workers:-2},10),
      option('Regular los usos de alto riesgo','Garantías de derechos y supervisión.',{integrity:5,security:3,business:-3},11)
    ]),
    event('tax','HACIENDA','Una vía de fraude sale a la luz','Una investigación revela un sistema de evasión fiscal. Hay una oportunidad para recuperar ingresos.',[
      option('Reforzar la inspección','Más medios para combatir el fraude.',{cash:3,integrity:7,public:3,business:-2},14),
      option('Cooperación fiscal internacional','Cerrar vías de evasión con otros países.',{cash:2,eu:5,integrity:5},12),
      option('Ofrecer una regularización','Recaudar rápido con un coste de credibilidad.',{cash:5,integrity:-8,workers:-4},7)
    ]),
    event('culture','CULTURA','La cultura pide su sitio','El sector cultural propone un plan para acercar bibliotecas, cine y patrimonio a todos los territorios.',[
      option('Red cultural de proximidad','Bibliotecas, centros locales y programación accesible.',{cash:-2,youth:5,rural:4,education:3},9),
      option('Proteger el patrimonio','Restauración y empleo local.',{cash:-2,rural:4,business:3,education:2},8),
      option('Mantener las ayudas actuales','Conservar recursos para otras prioridades.',{youth:-3,public:-2},4)
    ]),
    event('care','BIENESTAR','Las familias cuidan sin descanso','Las listas de espera de dependencia aumentan. Las personas cuidadoras piden reconocimiento y apoyo.',[
      option('Ampliar la atención a domicilio','Más horas de asistencia y profesionales.',{cash:-4,health:5,pensioners:7,workers:3},12),
      option('Apoyo económico a cuidadores','Compensar parte del esfuerzo familiar.',{cash:-2,pensioners:5,workers:4},10),
      option('Reorganizar las listas de espera','Priorizar los casos más graves.',{health:2,public:-2},6)
    ])
  ];
  const laws = [
    {id:'housing-law',name:'Ley de vivienda asequible',area:'VIVIENDA',description:'Parque público, garantías de alquiler y ayudas a la emancipación.',ideology:-1,effects:{cash:-6,housing:10,youth:7,business:-4},cost:19},
    {id:'labor',name:'Estatuto del empleo estable',area:'TRABAJO',description:'Reducir la temporalidad y reforzar la formación laboral.',ideology:-1,effects:{workers:8,unemployment:-0.5,business:-3,cash:-2},cost:17},
    {id:'business-law',name:'Ley de impulso a las pymes',area:'ECONOMÍA',description:'Menos trámites y crédito para pequeñas empresas.',ideology:1,effects:{business:9,growth:0.4,cash:-3,workers:2},cost:16},
    {id:'climate-law',name:'Ley de transición energética',area:'CLIMA',description:'Una hoja de ruta para energía limpia y eficiencia.',ideology:-1.5,effects:{climate:13,cash:-5,business:-2,youth:5},cost:20},
    {id:'education-law',name:'Pacto por la educación',area:'EDUCACIÓN',description:'Becas, formación profesional y medios en las aulas.',ideology:-0.5,effects:{education:12,cash:-5,youth:5,public:5},cost:18},
    {id:'transparency',name:'Ley de gobierno abierto',area:'INSTITUCIONES',description:'Contratación transparente y protección a informantes.',ideology:0,effects:{integrity:12,stability:4,cash:-1},cost:17},
    {id:'security-law',name:'Plan de seguridad ciudadana',area:'SEGURIDAD',description:'Más prevención, unidades especializadas y garantías.',ideology:1,effects:{security:11,cash:-4,stability:4},cost:16},
    {id:'territory-law',name:'Garantía de servicios rurales',area:'TERRITORIOS',description:'Servicios básicos y conectividad fuera de las grandes ciudades.',ideology:0,effects:{rural:10,infrastructure:6,cash:-4,health:3},cost:17},
    {id:'pension-law',name:'Pacto de protección social',area:'BIENESTAR',description:'Dependencia y pensiones mínimas protegidas.',ideology:-0.8,effects:{pensioners:10,health:5,cash:-5},cost:18},
    {id:'fiscal-law',name:'Reforma fiscal progresiva',area:'HACIENDA',description:'Mejor recaudación con más aportación de las rentas altas.',ideology:-1.5,effects:{cash:7,workers:4,business:-8,integrity:3},cost:19},
    {id:'digital-law',name:'Administración digital',area:'INNOVACIÓN',description:'Trámites accesibles, ciberseguridad y conexión territorial.',ideology:0.5,effects:{security:5,integrity:5,business:6,cash:-3},cost:15},
    {id:'health-law',name:'Garantía de atención primaria',area:'SANIDAD',description:'Reforzar centros de salud y reducir las esperas.',ideology:-0.5,effects:{health:12,public:7,cash:-6,pensioners:4},cost:18}
  ];
  const portfolios = [
    {id:'economy',name:'Economía y Hacienda',metric:'growth',icon:'↗'},
    {id:'health',name:'Sanidad y Bienestar',metric:'health',icon:'✚'},
    {id:'education',name:'Educación y Ciencia',metric:'education',icon:'▤'},
    {id:'interior',name:'Interior y Territorio',metric:'security',icon:'◇'},
    {id:'foreign',name:'Exteriores y Europa',metric:'eu',icon:'◎'},
    {id:'climate',name:'Transición Ecológica',metric:'climate',icon:'♧'}
  ];
  const ministers = [
    {name:'Elena Vidal',skill:84,loyalty:72,trait:'Gestora metódica'}, {name:'Daniel Ríos',skill:78,loyalty:86,trait:'Buen negociador'},
    {name:'Inés Soler',skill:88,loyalty:64,trait:'Perfil científico'}, {name:'Marcos León',skill:75,loyalty:90,trait:'Leal al proyecto'},
    {name:'Clara Montes',skill:82,loyalty:76,trait:'Experiencia europea'}, {name:'Hugo Beltrán',skill:86,loyalty:69,trait:'Visión a largo plazo'},
    {name:'Nadia Torres',skill:91,loyalty:58,trait:'Independiente'}, {name:'Álvaro Costa',skill:73,loyalty:94,trait:'Cohesiona al equipo'},
    {name:'Lucía Romero',skill:85,loyalty:78,trait:'Conexión territorial'}, {name:'Pablo Ferrer',skill:80,loyalty:83,trait:'Comunicador'},
    {name:'Sara Campos',skill:89,loyalty:62,trait:'Especialista técnica'}, {name:'Mateo Gil',skill:77,loyalty:88,trait:'Experiencia política'}
  ];
  const metrics = {
    approval:{name:'Aprobación',unit:'%',good:1},growth:{name:'Crecimiento PIB',unit:'%',good:1},unemployment:{name:'Desempleo',unit:'%',good:-1},
    inflation:{name:'Inflación',unit:'%',good:-1},debt:{name:'Deuda / PIB',unit:'%',good:-1},cash:{name:'Tesorería',unit:' mil M€',good:1},
    stability:{name:'Estabilidad',unit:'/100',good:1},eu:{name:'Relación con la UE',unit:'/100',good:1},climate:{name:'Transición ecológica',unit:'/100',good:1},
    health:{name:'Sanidad',unit:'/100',good:1},education:{name:'Educación',unit:'/100',good:1},security:{name:'Seguridad',unit:'/100',good:1},
    housing:{name:'Acceso a vivienda',unit:'/100',good:1},integrity:{name:'Transparencia',unit:'/100',good:1},infrastructure:{name:'Infraestructuras',unit:'/100',good:1}
  };
  const missions = [
    {id:'homes',name:'Una llave para el futuro',description:'Alcanza 70 de acceso a vivienda.',metric:'housing',target:70},
    {id:'jobs',name:'Un país que trabaja',description:'Reduce el desempleo al 8 %.',metric:'unemployment',target:8,reverse:true},
    {id:'trust',name:'La confianza se gana',description:'Alcanza 80 de transparencia.',metric:'integrity',target:80},
    {id:'green',name:'El siguiente horizonte',description:'Alcanza 75 de transición ecológica.',metric:'climate',target:75},
    {id:'care',name:'Cuidar de todos',description:'Alcanza 80 de calidad sanitaria.',metric:'health',target:80},
    {id:'popular',name:'Un mandato compartido',description:'Alcanza el 65 % de aprobación.',metric:'approval',target:65}
  ];
  // Evita que una crisis estacional aparezca en un mes incoherente.
  events.find(e=>e.id==='fire').months=[5,6,7,8];
  events.find(e=>e.id==='drought').months=[4,5,6,7,8];
  events.find(e=>e.id==='tourism').months=[5,6,7,8];
  G.SimData = {parties,groups,regions,scenarios,events,laws,portfolios,ministers,metrics,missions};
})(globalThis);
