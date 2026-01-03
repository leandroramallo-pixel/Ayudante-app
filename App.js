import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert, // <--- EL NUEVO QUE FALTABA
  FlatList,
  Image,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}



// --- SEGURIDAD ---
const ACCESS_PIN = "2025"; // PIN DE ACCESO

// --- SISTEMA DE DISEÑO ---
const COLORS = {
  primary: '#e30613',       // Rojo (Identidad)
  primaryDark: '#b91c1c',   // Rojo oscuro para bordes/status
  secondary: '#334155',     // Gris Azulado Oscuro (Texto principal)
  textLight: '#64748b',     // Gris medio (Subtítulos)
  bg: '#f1f5f9',            // Gris muy suave (Fondo de pantalla)
  card: '#ffffff',          // Blanco (Tarjetas)
  border: '#cbd5e1',        // Bordes grises
  accent: '#fbbf24',        // Amarillo (Detalles)
  success: '#10b981',       // Verde (Botones de acción positiva)
  error: '#ef4444',         // Rojo alerta
};


// --- 1. CASOS ESPECÍFICOS (BASE DE CONOCIMIENTO COMPLETA) ---
const CASOS_ESPECIFICOS = {
  // --- R.T.O. ---
  "Elementos falsos o con errores inexcusables en el certificado de RTO": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / C.5",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación."
  },
  "Certificado RTO vencido": {
    norma: "Dec 254/03 Anexo C Art. 1 C.3 / Anexo A Art. 41",
    texto: "C.3.- No realización de la revisión técnica de los vehículos autorizados con la periodicidad establecida o que determine la Autoridad de Aplicación.   Anexo A Art. 41.- Los vehículos afectados a los servicios previstos en el Artículo 9º de la Ley Nº 8669 excepto aquellos habilitados para Servicio Especial Restringido, serán sometidos a una revisión técnica obligatoria (RTO) cada CIENTO OCHENTA (180) días, en talleres expresamente habilitados para tal fin por la Dirección de Transporte, donde se verificarán las condiciones mecánicas, estructurales y funcionales de acuerdo a las distintas modalidades."
  },
  "No presenta certificado de RTO": {
    norma: "Dec 254/03 Anexo C Art. 1 C.5 / Art. 9 d.3",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación.   Art. 9 d.3.- Someter el parque móvil afectado al servicio a la revisación técnica obligatoria que disponga y reglamente la Dirección de Transporte."
  },


  // --- VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA (NUEVO BLOQUE) ---
  "Luneta trasera rota/mal estado (salidas de Emergencias)": {
    norma: "Dec 254/03 Anexo A Art. 20.7.3 / Anexo C",
    texto: "20.7.3. Luneta trasera. Los vehículos deberán poseer luneta trasera volcable, expulsable o destructible, de superficie equivalente a la especificada en el punto precedente. La luneta trasera podrá sustituirse por no menos de DOS (2) aberturas utilizables como salidas de emergencia... C.4.- Deficiencias mecánicas, en la carrocería, equipamiento... o la carencia de los elementos de seguridad."
  },
  "Luneta trasera rota/mal estado": {
    norma: "Dec 254/03 Anexo A Art. 20.7.3 / Anexo C",
    texto: "20.7.3. Luneta trasera. Los vehículos deberán poseer luneta trasera volcable, expulsable o destructible... La cubierta, tapa o cerramiento de dichas aberturas, deberá ser volcable o expulsable hacia el exterior, corrediza, o destructible, debiendo ser operadas sólo desde el interior. C.4.- Deficiencias mecánicas... o la carencia de los elementos de seguridad."
  },
  "Salidas de emergencias selladas/en mal estado": {
    norma: "Dec 254/03 Anexo A Art. 20.7 / Anexo C",
    texto: "20.7.- Salidas de emergencia. Los vehículos deberán poseer como mínimo, TRES (3) salidas de emergencia... En ningún caso y una vez abiertas o expulsadas o rotos los vidrios de las ventanillas de emergencia, la abertura resultante quedará ocupada por elementos de cualquier naturaleza... C.4.- Deficiencias mecánicas... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Ventanillas en mal estado": {
    norma: "Dec 254/03 Anexo A Art. 20.8.1 / Anexo C",
    texto: "20.8.1. Características. Los paneles laterales de la carrocería y las partes superiores de las puertas... estarán dotados de ventanillas en correspondencia con los asientos. Las ventanillas deberán abrirse mediante desplazamientos horizontales en un mismo plano. C.4.- Deficiencias mecánicas... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Ventanillas con vidrio fisurado": {
    norma: "Dec 254/03 Anexo A Art. 20.8.4 / Anexo C",
    texto: "20.8.4. Material. Los paños de las ventanillas llevarán vidrios de seguridad inastillables, de un espesor no menor de 0,005 m... Podrán ser tonalizados o incoloros. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento... o la carencia de los elementos de seguridad."
  },
  "Panel de vidrio fijo fisurado": {
    norma: "Dec 254/03 Anexo A Art. 20.8.4 / Anexo C",
    texto: "20.8.4. Material. Los paños de las ventanillas llevarán vidrios de seguridad inastillables, de un espesor no menor de 0,005 m... C.4.- Deficiencias mecánicas, en la carrocería, equipamiento... o la carencia de los elementos de seguridad."
  },
  "Puerta con vidrio fisurado": {
    norma: "Dec 254/03 Anexo A Art. 20.6.2 / Anexo C",
    texto: "Todos los vidrios de las puertas serán de seguridad, quedando prohibida la colocación de varillas protectoras en los mismos. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento... o la carencia de los elementos de seguridad."
  },
  "Puerta en mal estado": {
    norma: "Dec 254/03 Anexo A Art. 20.6.2 / Anexo C",
    texto: "El accionamiento de todas las puertas del vehículo se efectuará mediante sistemas hidráulicos, neumáticos, eléctricos... debiendo contar con un dispositivo que permita abrirlas manualmente, desde el interior, en caso de emergencia. C.4.- Deficiencias mecánicas... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Faltan martillos rompe cristales": {
    norma: "Dec 254/03 Anexo A Art. 20.7.4 / Anexo C",
    texto: "20.7.4. Dispositivos de accionamiento. En los casos de ventanillas provista de materiales destructibles deberán utilizarse dispositivos de destrucción o “martillo de seguridad”... Este dispositivo deberá ser fijado a la carrocería en correspondencia con la salida de emergencia indicándose su localización. C.4.- Deficiencias mecánicas... o la carencia de los elementos de seguridad."
  },

  // --- RECORRIDOS Y PARADAS ---
  "Presta servicio en tramo no autorizado": {
    norma: "Dec 254/03 Anexo C Art. 1 B.6 / Art. 9 A.a.1",
    texto: "B.6.- Circulación de un vehículo afectado al servicio fuera de la ruta autorizada por la Autoridad de Aplicación en el respectivo permiso. a.1- Prestar el servicio en corredores de tráficos determinados, con recorridos, paradas, horarios y frecuencias previamente autorizadas por la autoridad de aplicación."
  },
  "Realiza ascenso y descenso de pasajeros en parada no autorizada": {
    norma: "Dec 254/03 Anexo C Art. 1 B.2 / Art. 9 A.b.1",
    texto: "B.2.- Incumplimiento de las restricciones al trafico y/o la alteración del recorrido en los servicios. b.1- Efectuar las paradas destinadas al ascenso y/o descenso de pasajeros en los lugares que determine al efecto la autoridad de aplicación, sin perjuicio del ejercicio de la competencia municipal o comunal reglada en el artículo 3 de la ley."
  },
  "No ingresa a terminal": {
    norma: "Dec 254/03 Anexo C Art. 1 B.2 / Art. 9 A.a.1",
    texto: "B.2.- Incumplimiento de las restricciones al trafico y/o la alteración del recorrido en los servicios. a.1- Prestar el servicio en corredores de tráficos determinados, con recorridos, paradas, horarios y frecuencias previamente autorizadas por la autoridad de aplicación."
  },
  "No levanta pasajeros en parada autorizada": {
    norma: "Dec 254/03 Anexo C Art. 2 A.4 / Art. 9 A.b.1",
    texto: "A.4.- No detención de la marcha del vehículo por parte del transportista o su personal de conducción en los lugares autorizados, para permitir el ascenso o descenso de pasajeros que lo hubieren solicitado. b.1- Efectuar las paradas destinadas al ascenso y/o descenso de pasajeros en los lugares que determine al efecto la autoridad de aplicación."
  },

  // --- SEGURO ---
  "Cobertura de seguro vencida": {
    norma: "Dec 254/03 Anexo C Art. 1 A.2 / Art. 9 A.d.7",
    texto: "A.2.- Falta de cobertura de los seguros exigidos por la Ley 8669 y su reglamentación. d.7- Contratar seguro por responsabilidad civil con los límites autorizados por el organismo nacional competente, cuya vigencia deberá mantenerse durante todo el tiempo que dure la prestación y que brinde cobertura por lesiones, daños o perjuicios ocasionados a terceros transportados y no transportados."
  },
  "No presenta Certificado de cobertura de seguro": {
    norma: "Dec 254/03 Anexo C Art. 1 C.5 / Art. 9 A.d.7",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta. Para acreditar la cobertura por el riesgo de responsabilidad civil, el responsable de prestar el servicio, con carácter previo a librar el servicio al público, deberá presentar un certificado expedido por la entidad aseguradora."
  },
  "Elementos falsos o con errores inexcusables en la cobertura del Seguro": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / Art. 9 A.d.7",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. d.7- Contratar seguro por responsabilidad civil con los límites autorizados... manteniendo indemne de toda responsabilidad a la Provincia como poder concedente."
  },

  // --- TARIFA ---
  "Violacion al régimen tarifario": {
    norma: "Dec 254/03 Anexo C Art. 1 B.3 / Ley 8669 Art. 28 B",
    texto: "B.3.- Violación del régimen tarifario autorizado. B.- Respetar el valor y cuadro tarifario establecido."
  },

  // --- MOP (PLACAS) ---
  "No presenta Chapa MOP en lugar reglamentario": {
    norma: "Dec 254/03 Anexo A Art. 30.2 a) / Anexo C",
    texto: "a) Con letras técnicas normalizadas de una altura mínima de 0,20 m... -Número de chapa MOP del vehículo otorgada por la Dirección de Transporte de la Provincia (en la parte frontal y posterior). C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación."
  },
  "Chapa MOP desactualizada": {
    norma: "Dec 254/03 Anexo C Art. 1 C.5 / Anexo A 30.2",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación. a) Con letras técnicas normalizadas... Número de chapa MOP."
  },
  "No presenta chapa dominio en lugar reglamentario": {
    norma: "Ley 8560 Art. 41 Inc. d) / Dec 254/03",
    texto: "d) Que el vehículo, incluyendo acoplados y semirremolques tenga colocadas las placas de identificación de dominio, con las características y en los lugares que establece la reglamentación, las mismas deben ser legibles de tipos normalizados y sin aditamentos. Art 1 (Dec 254/03).- Los vehículos afectados al servicio... deberán cumplimentar los requisitos que se establecen en el presente reglamento."
  },
  "Chapa MOP ilegible": {
    norma: "Dec 254/03 Anexo A Art. 30.2 / Anexo C",
    texto: "a) Con letras técnicas normalizadas... Número de chapa MOP... C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación."
  },
  "Chapa dominio ilegible": {
    norma: "Ley 8560 Art. 41 Inc. d) / Dec 254/03 Anexo C",
    texto: "d) Que el vehículo... tenga colocadas las placas de identificación de dominio... las mismas deben ser legibles de tipos normalizados y sin aditamentos. C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc."
  },
  "Elementos falsos o con errores inexcusables en la Chapa MOP": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / C.1",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. C.1.- Adulteración o utilización indebida de chapas de habilitación de unidades de transporte."
  },

  // --- MOP / HABILITACIÓN ---
  "No presenta permiso precario": {
    norma: "Dec 254/03 Anexo C C.5 / Ley 8669 Art. 25",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento... cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta. ARTÍCULO 25.- LA Autoridad de Aplicación podrá autorizar la operación de servicios públicos de transporte, bajo la forma de permisos excepcionales y precarios... Estos permisos serán nominativos, intransferibles."
  },
  "No posee habilitación provincial - Extraña jurisdicción": {
    norma: "Dec 254/03 Anexo C Art. 6 / Ley 8669 Art. 2",
    texto: "Artículo 6º.- La prestación de servicios públicos de transporte de pasajeros por quien sea titular de una concesión, autorización o permiso conferido por el Estado Nacional o de extraña jurisdicción, en violación al artículo 2º de la Ley 8669, será reprimido... ARTÍCULO 2.- QUEDA estrictamente prohibido a las Empresas concesionarias del Estado Nacional o de extraña jurisdicción, la realización de tráfico de pasajeros entre puntos situados dentro del territorio Provincial."
  },
  "Permiso precario vencido": {
    norma: "Dec 254/03 Anexo C C.5 / Ley 8669 Art. 25",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento... ARTÍCULO 25.- [...] Estos permisos serán nominativos, intransferibles, por plazo determinado y podrán ser revocados mediante resolución fundada en cualquier momento por el otorgante."
  },
  "No presenta habilitación de la Autoridad de Aplicación": {
    norma: "Dec 254/03 Anexo C Art. 5 / Ley 8669 Art. 22",
    texto: "Artículo 5º.- La prestación de servicios públicos de transporte de pasajeros sin la debida autorización o permiso otorgado por la autoridad provincial competente, será reprimida... ARTÍCULO 22.- EN ningún caso la autoridad competente podrá otorgar concesiones o autorizaciones para el transporte en sus diversas clases, sin que medie el cumplimiento de la inscripción en el Registro de Prestatarios."
  },
  "No presenta Permiso de Explotación": {
    norma: "Dec 254/03 Anexo C C.5 / A.1",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento... A.1.- Falta de iniciación de la ejecución de los servicios autorizados dentro del plazo previsto, su suspensión o el abandono de los mismos sin la previa conformidad de la Autoridad de Aplicación."
  },
  "Permiso de Explotación Vencido": {
    norma: "Dec 254/03 Anexo C C.5 / Ley 8669 Art. 32",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento... ARTÍCULO 32.- LA sanción de caducidad de la concesión, permiso, autorización, habilitación, o inscripción en el Registro... producirá la extinción de la relación jurídica que vincula a su titular con el Gobierno."
  },
  "No presenta Certificado Alta de Unidad (CAU)": {
    norma: "Dec 254/03 Anexo C C.5 / Res 66/2020",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento... Artículo 1° (Res 66/2020).- ENCOMENDAR a la Dirección General de Transporte... proceda a la habilitación de las unidades... debiendo expedir en todos los casos, la constancia que certifique la habilitación de cada unidad (CAU)."
  },
  "Certificado Alta de Unidad (CAU) vencido": {
    norma: "Dec 254/03 Anexo C C.5 / Res 66/2020",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento... Artículo 1°.- ...proceda a la habilitación de las unidades propuestas por los prestatarios... cuando las mismas se ajusten a las exigencias técnicas, formales y de fiscalización previstas en Ley."
  },
  "Elementos falsos o con errores inexcusables en el Permiso de Explotación": {
    norma: "Dec 254/03 Anexo C A.5 / Ley 8669 Art. 28 J",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. J.- Cumplir las obligaciones que se establezcan reglamentariamente como así también las que sin estar expresamente consagradas, derivan de la calidad de prestatario del servicio público."
  },
  "Elementos falsos o con errores inexcusables en el Certificado Alta de Unidad (CAU)": {
    norma: "Dec 254/03 Anexo C A.5 / C.1",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. C.1.- Adulteración o utilización indebida de chapas de habilitación de unidades de transporte."
  },
  "Elementos falsos o con errores inexcusables en el Permiso Precario": {
    norma: "Dec 254/03 Anexo C A.5 / Ley 8669 Art. 25",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. ARTÍCULO 25.- [...] Estos permisos serán nominativos, intransferibles, por plazo determinado y podrán ser revocados mediante resolución fundada en cualquier momento por el otorgante."
  },

  // --- MÓDULO DE REGISTRO DE OPERACIONES ---
  "Modulo registro de operaciones memoria llena": {
    norma: "Dec 254/03 Anexo A Art. 18.1.1 b) / Anexo C",
    texto: "b) Módulo de registro. Es el elemento en el que se registra la información volcada por el dispositivo indicado. Debe tener la capacidad de mantener en forma fidedigna dicha información durante un plazo no menor de UN (1) año. La que deberá estar a disposición y ser proporcionado cuando así lo requiera la Dirección de Transporte. C.4.- Deficiencias mecánicas..."
  },
  "Módulo registro de operaciones no emite señal sonora y luminosa de limite de velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 d) 1 / Anexo C",
    texto: "1.- El equipo indicador o tablero de emisión de señal de superación de la velocidad máxima, será del tipo luminoso y acústico. La señal luminosa se activará al superar la máxima velocidad reglamentaria. De persistir el exceso de velocidad por un tiempo mayor de DOS (2) minutos, se activará la señal acústica, la cual no podrá ser inferior a SETENTA Y CINCO DECIBELES A (75 db (A))."
  },
  "Modulo registro de operaciones suelto": {
    norma: "Dec 254/03 Anexo A Art. 18 / Anexo C",
    texto: "Artículo 18.- PANEL DE INSTRUMENTOS. El panel de instrumentos deberá contar con todo el instrumental necesario para el control integral del correcto funcionamiento del vehículo. El mismo deberá ser de fácil lectura y su ubicación deberá permitir la visión directa y operación desde la posición normal del conductor. Adicionalmente, los vehículos afectados a todos los servicios definidos en el Artículo 9º de la Ley Nº 8669 deberán contar con un Módulo de Registro de Operaciones (tacógrafo). C.4.- Deficiencias mecánicas..."
  },
  "Disco diagrama de velocidad mal colocado o al revés": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 a) / Anexo C",
    texto: "a) Dispositivo de registro (D.R.) Los D.R. deben registrar los datos correspondientes en función del tiempo, siendo los mismos estipulados los siguientes: 1- distancias recorridas por el vehículo 2- velocidad del vehículo 3- período de conducción... 8- en los vehículos donde la conducción se cumple con un equipo de conductores el D.R. ha de estar construido de forma tal que los tiempos indicados... puedan registrarse para todos los conductores en el mismo Módulo de Registro, en forma simultánea."
  },
  "Módulo registro de operaciones descalibrado": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 b) / Anexo C",
    texto: "2.- El instrumental deberá brindar en forma constante al conductor la siguiente información como mínimo: kilometraje recorrido (odómetro), velocidad de circulación (velocímetro), horario (reloj) no pudiendo las dos primeras ser modificadas directamente. La hora del reloj debe poder corregirse directamente en el equipo para el caso de atraso o adelantos con respecto al horario real. C.4.- Deficiencias mecánicas..."
  },
  "Módulo registro de operaciones desprogramado en fecha y hora": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 b) / Anexo C",
    texto: "2.- El instrumental deberá brindar en forma constante al conductor la siguiente información como mínimo: kilometraje recorrido (odómetro), velocidad de circulación (velocímetro), horario (reloj) no pudiendo las dos primeras ser modificadas directamente. La hora del reloj debe poder corregirse directamente en el equipo para el caso de atraso o adelantos con respecto al horario real. C.4.- Deficiencias mecánicas..."
  },
  "Módulo registro de operaciones calibrado en mas de 90km/h / Adulterado / Descalibrado en velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 c) 3 / Anexo C",
    texto: "3.- El equipo debe almacenar los datos detallados en el apartado a) en función de la distancia y el tiempo en un medio que asegure los mismos no puedan ser alterados no sólo durante el registro sino después del mismo. C.4.- Deficiencias mecánicas... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Módulo registro de operaciones no funciona / no funciona correctamente / no registra": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 a) / Anexo C",
    texto: "a) Dispositivo de registro (D.R.) Los D.R. deben registrar los datos correspondientes en función del tiempo, siendo los mismos estipulados los siguientes: 1- distancias recorridas 2- velocidad 3- período de conducción 4- otros períodos de trabajo... 6- interrupción de la alimentación eléctrica o mecánica... 7- retiro del módulo. C.4.- Deficiencias mecánicas..."
  },
  "No presenta módulo registro de operaciones": {
    norma: "Dec 254/03 Anexo A Art. 18 / Anexo C",
    texto: "Artículo 18.- PANEL DE INSTRUMENTOS... Adicionalmente, los vehículos afectados a todos los servicios definidos en el Artículo 9º de la Ley Nº 8669 deberán contar con un Módulo de Registro de Operaciones (tacógrafo) de acuerdo a las siguientes especificaciones. C.4.- Deficiencias mecánicas... o la carencia de los elementos de seguridad."
  },
  "Módulo registro de operaciones apagado / Desconectado / encendido antes del control": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 a) / Anexo C",
    texto: "a) Dispositivo de registro (D.R.) Los D.R. deben registrar los datos correspondientes en función del tiempo... 6- interrupción de la alimentación eléctrica o mecánica, indicando tiempo y kilómetro recorrido. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Disco diagrama de velocidad vencido": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 a) / Anexo C",
    texto: "a) Dispositivo de registro (D.R.) Los D.R. deben registrar los datos correspondientes en función del tiempo... 7- retiro del módulo registrador si el mismo es extraído... C.4.- Deficiencias mecánicas, en la carrocería, equipamiento... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Disco diagrama de velocidad sobreimpreso / sobregrabados / reimpresos": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 c) 3 / Anexo C",
    texto: "3.- El equipo debe almacenar los datos detallados en el apartado a) en función de la distancia y el tiempo en un medio que asegure los mismos no puedan ser alterados no sólo durante el registro sino después del mismo. C.4.- Deficiencias mecánicas... o el inadecuado funcionamiento de esos dispositivos."
  },
  "Disco diagrama de velocidad registra excesos de velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 b) 4 / Anexo C",
    texto: "4.- El sistema de lectura de registros deberá brindar a los efectos de la fiscalización la velocidad en el automotor por un período de las últimas VEINTICUATRO (24) horas y dará la velocidad horaria promedio “máxima sostenida” por espacio de más de DOS (2) minutos y si esta supera a la máxima autorizada, se informarán todas las ocurrencias con indicación del lugar (km), duración y hora."
  },
  "Modulo registro de operaciones emite ticket incompleto / no imprime / no se lee / no tiene tinta la impresora": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 c) 4 / Anexo C",
    texto: "4.- El equipo debe brindar en forma directa o a través de equipos auxiliares, un informe según el modelo del punto 3, con los parámetros indicados y por un tiempo no inferior a SIETE (7) días, sin perjuicio de otros datos que pudieran servir a la autoridad de aplicación y al propietario. C.4.- Deficiencias mecánicas..."
  },
  "No tiene discos diagrama de velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.1 b) / Anexo C",
    texto: "b) Módulo de registro. Es el elemento en el que se registra la información volcada por el dispositivo indicado. Debe tener la capacidad de mantener en forma fidedigna dicha información durante un plazo no menor de UN (1) año. La que deberá estar a disposición y ser proporcionado cuando así lo requiera la Dirección de Transporte."
  },
  "Disco diagrama de velocidad sin datos identificatorios": {
    norma: "Dec 254/03 Anexo A Art. 18.1.3 / Anexo C",
    texto: "18.1.3- MODELO DE INFORME QUE DEBE BRINDAR A LA AUTORIDAD DE APLICACIÓN EL DISPOSITIVO DE REGISTRO. 18.1.3.1.-DATOS DEL VIAJE: Datos del vehículo, Nombre del conductor, Lugar de partida, Fecha de partida, Hora de partida, Fecha de finalización del viaje, Duración del viaje, Tiempo o Tiempos de detención, Tiempo de marcha, Total de kilómetros recorridos, Velocidad máxima (Vmáx)..."
  },
  "Ticket sin datos identificatorios de la unidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 c) 6 / Anexo C",
    texto: "6.- Cada equipo de control debe contar con una identificación única e inalterable (número de serie) la cual debe denunciarse a la Autoridad de Aplicación, con correspondencia estricta al automotor aplicado, cumpliendo la veces de clave de identificación y de sus reportes. C.4.- Deficiencias mecánicas..."
  },
  "Ticket registra excesos de velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 b) 4 / Anexo C",
    texto: "4.- El sistema de lectura de registros deberá brindar a los efectos de la fiscalización la velocidad en el automotor por un período de las últimas VEINTICUATRO (24) horas y dará la velocidad horaria promedio “máxima sostenida” por espacio de más de DOS (2) minutos y si esta supera a la máxima autorizada, se informarán todas las ocurrencias."
  },
  "Módulo registro de operaciones sin papel para imprimir ticket": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 c) 4 / Anexo C",
    texto: "4.- El equipo debe brindar en forma directa o a través de equipos auxiliares, un informe según el modelo del punto 3, con los parámetros indicados y por un tiempo no inferior a SIETE (7) días, sin perjuicio de otros datos que pudieran servir a la autoridad de aplicación y al propietario. C.4.- Deficiencias mecánicas..."
  },
  "Módulo registro de operaciones no emite señal luminosa de limite de velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 d) 1 / Anexo C",
    texto: "1.- El equipo indicador o tablero de emisión de señal de superación de la velocidad máxima, será del tipo luminoso y acústico. La señal luminosa se activará al superar la máxima velocidad reglamentaria. De persistir el exceso de velocidad por un tiempo mayor de DOS (2) minutos, se activará la señal acústica."
  },
  "Módulo registro de operaciones no emite señal sonora de limite de velocidad": {
    norma: "Dec 254/03 Anexo A Art. 18.1.2 d) 1 / Anexo C",
    texto: "1.- El equipo indicador o tablero de emisión de señal de superación de la velocidad máxima, será del tipo luminoso y acústico... De persistir el exceso de velocidad por un tiempo mayor de DOS (2) minutos, se activará la señal acústica, la cual no podrá ser inferior a SETENTA Y CINCO DECIBELES A (75 db (A))."
  },

  // --- MODALIDAD NO AUTORIZADA ---
  "Vehículo habilitado para prestar servicio especial, realiza un viaje regular diferencial": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 D.1",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. D.1.- Servicio Especial Normal: Es aquel que se realiza mediante contratación previa en cada caso, pactándose las condiciones del viaje sin recorrido permanente según establezca la reglamentación."
  },
  "Vehículo habilitado para prestar servicio especial, realiza un viaje regular ordinario": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 D.1",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. D.1.- Servicio Especial Normal: Es aquel que se realiza mediante contratación previa en cada caso, pactándose las condiciones del viaje sin recorrido permanente según establezca la reglamentación."
  },
  "Vehículo habilitado para prestar servicio regular diferencial, realiza un viaje regular ordinario": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 A.2",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. A.2.- Regular Diferencial: Es aquel que, reuniendo idénticas características que el anterior, se presta cumpliendo mayores exigencias de calidad según establezca la reglamentación."
  },
  "Vehículo habilitado para prestar servicio regular diferencial, realiza un viaje especial": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 A.1",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. A.1.- Regular Común: Es aquel que cubre los corredores predeterminados por la Autoridad de Aplicación, con posibilidad de efectuar tráfico de pasajeros en estaciones intermedias mediante coches-ómnibus que cumplan las normas reglamentarias pertinentes."
  },
  "Vehículo habilitado para prestar servicio regular ordinario, realiza un viaje especial": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 A.1",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. A.1.- Regular Común: Es aquel que cubre los corredores predeterminados por la Autoridad de Aplicación, con posibilidad de efectuar tráfico de pasajeros en estaciones intermedias mediante coches-ómnibus que cumplan las normas reglamentarias pertinentes."
  },
  "Vehículo habilitado para prestar servicio regular ordinario, realiza un viaje regular diferencial": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 A.1.1",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. A.1.1.- Regular Común Ordinario: Es el servicio que hace escala en cada una de las poblaciones de la ruta."
  },
  "Vehículo habilitado para prestar servicio especial restringido, realiza un viaje regular diferencial": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 D.2",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. D.2.- Servicio Especial Restringido: es similar al anterior, siendo este de carácter zonal, eventual, cubriendo una distancia máxima preestablecida, por vía reglamentaria."
  },
  "Vehículo habilitado para prestar servicio especial restringido, realiza un viaje regular ordinario": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 D.2",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. D.2.- Servicio Especial Restringido: es similar al anterior, siendo este de carácter zonal, eventual, cubriendo una distancia máxima preestablecida, por vía reglamentaria."
  },
  "Vehículo habilitado para prestar servicio especial restringido, realiza un viaje especial": {
    norma: "Dec 254/03 Anexo C Art. 1 B.1 / Ley 8669 Art. 9 D.2",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. D.2.- Servicio Especial Restringido: es similar al anterior, siendo este de carácter zonal, eventual, cubriendo una distancia máxima preestablecida, por vía reglamentaria."
  },

  // --- LIBRETA DE TRABAJO ---
  "No presenta libreta de trabajo": {
    norma: "Dec 254/03 Art. 9 Inc. A.e.4 / Anexo C",
    texto: "e.4- Poseer libreta de trabajo y portarla en todo momento en ocasión del servicio, en la que deberá constar claramente los horarios de salida y llegada del servicio a cargo del conductor. C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación."
  },
  "Libreta de trabajo incompleta": {
    norma: "Dec 254/03 Art. 9 Inc. A.e.4 / Anexo C",
    texto: "e.4- Poseer libreta de trabajo y portarla en todo momento en ocasión del servicio, en la que deberá constar claramente los horarios de salida y llegada del servicio a cargo del conductor. C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación."
  },
  "No cumple con las horas de descanso": {
    norma: "Dec 254/03 Art. 28 F.1 / Anexo C Art. 1 C.7",
    texto: "F.1.- Contratar al personal que integrará la dotación conforme el convenio colectivo que rija, constituyéndose en único y directo responsable de su cumplimiento. C.7.- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas."
  },
  "En la libreta figura día franco y el conductor se encuentra trabajando": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / Art. 9",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. e.4- Poseer libreta de trabajo y portarla en todo momento en ocasión del servicio, en la que deberá constar claramente los horarios de salida y llegada del servicio a cargo del conductor."
  },
  "Libreta de trabajo vencida": {
    norma: "Dec 254/03 Anexo C Art. 1 C.5 / Art. 9",
    texto: "C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación. e.4- Poseer libreta de trabajo y portarla en todo momento en ocasión del servicio, en la que deberá constar claramente los horarios de salida y llegada del servicio a cargo del conductor."
  },
  "Libreta de trabajo sobrecompleta": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / Art. 9",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. e.4- Poseer libreta de trabajo y portarla en todo momento en ocasión del servicio, en la que deberá constar claramente los horarios de salida y llegada del servicio a cargo del conductor."
  },
  "Elementos falsos o con errores inexcusables en la libreta de trabajo": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / Art. 9",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. e.4- Poseer libreta de trabajo y portarla en todo momento en ocasión del servicio, en la que deberá constar claramente los horarios de salida y llegada del servicio a cargo del conductor."
  },

  // --- LISTA DE PASAJEROS ---
  "Lista de Pasajeros (Contrato con el usuario) - No la presenta": {
    norma: "Dec 254/03 Art. 9 D.a.3 / Anexo C",
    texto: "a.3.- A los fines de la prestación del servicio, el prestatario deberá celebrar en forma previa un contrato escrito con los usuarios... Nómina del contingente que incluya: nombre y apellido de los transportados, documento de identidad, edad y domicilio real. [...] El contrato deberá ser exhibido cada vez que lo requiera la autoridad competente... C.5.- Carencia o deficiente conservación de documento..."
  },
  "Lista de Pasajeros (Contrato con el usuario) - Incompleta": {
    norma: "Dec 254/03 Art. 9 D.a.3 / Anexo C",
    texto: "a.3.- A los fines de la prestación del servicio, el prestatario deberá celebrar en forma previa un contrato escrito con los usuarios, que contendrá como mínimo lo siguiente: - Objeto de la contratación. - Precio del servicio. - Datos correspondientes a la identificación de la unidad... - Recorrido... - Día y hora... - Nómina del contingente... - Firma de las partes. C.5.- Carencia o deficiente conservación..."
  },

  // --- LETREROS ---
  "No presenta letrero exterior 0800 - número telefónico de cobro revertido para efectuar consultas y reclamos": {
    norma: "Dec 254/03 Art. 46 / Anexo C Art. 1 C.5",
    texto: "Art. 46 - Las empresas prestatarias... deberán disponer necesariamente de una línea telefónica de cobro revertido... cuyo número deberá exhibirse en un lugar visible en el interior y exterior de las unidades y publicitarse en forma permanente. C.5.- Carencia o deficiente conservación... de todo aquel documento, información, carteles, etc., cuya exhibición... fuera expresamente dispuesta."
  },
  "No presenta letrero interior 0800 - número telefónico de cobro revertido para efectuar consultas y reclamos": {
    norma: "Dec 254/03 Anexo A Art. 30.1 b) / Art. 46",
    texto: "Art. 30.1. Leyendas Interiores [...] b) Con letras de altura mínima de 0,02 m. las siguientes: [...] -Número telefónico de cobro revertido para efectuar consultas y reclamos. Las empresas prestatarias... deberán disponer necesariamente de una línea telefónica de cobro revertido... cuyo número deberá exhibirse en un lugar visible."
  },
  "No presenta cartelería exterior": {
    norma: "Dec 254/03 Anexo A Art. 30.2 a) / Anexo C Art. 1 C.5",
    texto: "Art. 30.2. Leyendas Exteriores: a) Con letras técnicas normalizadas... -Número de chapa MOP del vehículo otorgada por la Dirección de Transporte de la Provincia (en la parte frontal y posterior). Art. 1 C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc."
  },
  "No presenta cartelería interior": {
    norma: "Dec 254/03 Anexo A Art. 30.1 a) / Anexo C Art. 1 C.5",
    texto: "Art. 30.1. Leyendas Interiores a) Con letras de altura mínima de 0,01 m las siguientes: -Prohibido fumar -Prohibido conversar con el conductor -Asiento reservado para personas con movilidad reducida -Guarda o acompañante -Botiquín. Art. 1 C.5.- Carencia o deficiente conservación... de carteles cuya exhibición fuera dispuesta."
  },
  "No presenta razón social": {
    norma: "Dec 254/03 Anexo A Art. 30.2 c) / Anexo C Art. 1 C.5",
    texto: "Art. 30.2 c) En los vehículos afectados a todas las clases de servicios, deberá colocarse en ambos costados del vehículo el nombre de la empresa y el nombre de fantasía autorizado para circular, con letras de cualquier tipo y tamaño... que posibiliten su identificación. Art. 1 C.5.- Carencia o deficiente conservación de información/carteles."
  },
  "Cartelería interior incompleta": {
    norma: "Dec 254/03 Anexo A Art. 30.1 b) / Anexo C Art. 1 C.5",
    texto: "Art. 30.1. Leyendas Interiores [...] b) Con letras de altura mínima de 0,02 m.: -Cantidad máx. pasajeros de pie -Prohibición pasajeros de pie -Baño -Manijas ventanillas/puertas emergencia -Extintor -Número asiento -Salida emergencia -Libro Quejas -0800. Art. 1 C.5.- Carencia o deficiente conservación."
  },
  "No posee cartelería de modalidad y categoría del servicio": {
    norma: "Dec 254/03 Anexo A Art. 30.2 b) / Anexo C Art. 1 C.5",
    texto: "Art. 30.2. Leyendas Exteriores: [...] b) Con letras técnicas normalizadas... -Modalidad y categoría del servicio. Art. 1 C.5.- Carencia o deficiente conservación de la chapa habilitante... o de todo aquel documento, información, carteles, etc."
  },
  "No presenta Cartel de Velocidad Máxima": {
    norma: "Ley 8560 Art. 56 h) / Dec 254/03 Anexo C Art. 1 C.5",
    texto: "Art. 56 h) Los vehículos lleven en la parte trasera, sobre un círculo reflectivo la cifra indicativa de la velocidad máxima que le está permitido desarrollar. Art. 1 C.5.- Carencia o deficiente conservación de carteles cuya exhibición fuera dispuesta."
  },
  "No presenta cartelería indicando destino": {
    norma: "Dec 254/03 Anexo A Art. 30.2 b) / Anexo C Art. 1 C.5",
    texto: "Art. 30.2. Leyendas Exteriores: [...] b) Con letras técnicas normalizadas... -Puntos terminales del recorrido (en el frente y también en la parte posterior). Podrán colocarse además en esos mismos lugares leyendas con los puntos intermedios. Art. 1 C.5.- Carencia o deficiente conservación."
  },
  "Publicidad o letreros sin autorización de la autoridad de aplicación en exterior o interior de los vehículos": {
    norma: "Dec 254/03 Anexo A Art. 32 / Anexo C Art. 1 C.6",
    texto: "Artículo 32. PROHIBICIONES. Está terminantemente prohibida la colocación de: [...] - Adornos, calcomanías, fotografías... y leyendas no autorizadas, tanto en el interior como en el exterior del vehículo. C.6.- Incumplimiento de las normas vigentes en materia de realización de publicidad comercial."
  },
  "Pintado de cristales en puertas, ventanillas y parabrisas, pintado de símbolos patrios, nacionales y/o extranjeros": {
    norma: "Dec 254/03 Anexo A Art. 27 / Art. 32",
    texto: "Artículo 27. PINTURA... Los cristales de las puertas, ventanillas y parabrisas no podrán pintarse. Queda prohibido el pintado de símbolos patrios, tanto nacionales como extranjeros. Art 32: Prohibida la colocación de adornos, calcomanías... y leyendas no autorizadas."
  },
  "No presenta bandas reflectivas": {
    norma: "Ley 8560 Art. 31 j) / Dec 254/03 Anexo A Art. 28",
    texto: "Art. 31 j) Retrorreflectantes ubicados con criterio similar a las luces de posición. En el caso de vehículos para el servicio de transporte deberán disponerse en bandas que delimiten los perímetros laterales y trasero. Art 28: La Dirección de Transporte determinará los tipos y características técnicas de los dispositivos de identificación y notoriedad."
  },

  // --- INCUMPLIMIENTO DE HORARIOS ---
  "El horario autorizado por la Secretaría de Transporte se prestó con anterioridad a la hora oficial": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que -en función de los factores climatológicos, derivados del tránsito o del estado de la vía- contemple la autoridad. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios produciendo los informes que solicite la autoridad."
  },
  "El horario autorizado por la Secretaría de Transporte no se prestó": {
    norma: "Dec 254/03 Art. 28 A.1 / Anexo C Art. 1 A.1",
    texto: "A.1.- Mantener la regularidad, frecuencia y horarios de los servicios produciendo los informes que solicite la autoridad. A.1 (Anexo C).- Falta de iniciación de la ejecución de los servicios autorizados dentro del plazo previsto, su suspensión o el abandono de los mismos sin la previa conformidad de la Autoridad de Aplicación."
  },
  "El horario autorizado por la Secretaría de Transporte se prestó con demora mayor a 15 minutos": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios produciendo los informes que solicite la autoridad."
  },
  "El horario autorizado por la Secretaría de Transporte se prestó con demora menor a 15 minutos": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios."
  },
  "Presta servicio en horario no autorizado por la Autoridad de Aplicación": {
    norma: "Dec 254/03 Art. 9 A.a.1 / Anexo C Art. 1 B.1",
    texto: "a.1- Prestar el servicio en corredores de tráficos determinados, con recorridos, paradas, horarios y frecuencias previamente autorizadas. B.1 (Anexo C).- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista."
  },
  "El horario autorizado por la Secretaría de Transporte no se prestó-Intermedia": {
    norma: "Dec 254/03 Art. 28 A.1 / Art. 9 A.c.4",
    texto: "A.1.- Mantener la regularidad, frecuencia y horarios de los servicios... c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación."
  },
  "El horario autorizado por la Secretaría de Transporte se prestó con demora mayor a 15 minutos-Intermedia": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios."
  },
  "El horario autorizado por la Secretaría de Transporte se prestó con demora menor a 15 minutos-Intermedia": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios."
  },
  "El horario autorizado por la Secretaría de Transporte se prestó con anterioridad a la hora oficial-Intermedia": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios."
  },
  "El servicios arriba a terminal con una demora mayor a 30 minutos": {
    norma: "Dec 254/03 Art. 9 A.c.4 / Art. 28 A.1",
    texto: "c.4- Cumplir estrictamente los horarios aprobados, con las tolerancias que contemple la autoridad de aplicación. A.1.- Mantener la regularidad, frecuencia y horarios de los servicios."
  },

  // --- ILUMINACIÓN ---
  "Luz de posicion lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B.- Luces de posición: que indican junto con las anteriores dimensión y sentido de marcha desde los puntos de observación reglamentados: l - Delanteras de color blanco o amarillo; 2 - Traseras de color rojo;"
  },
  "Luz de posicion lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B.- Luces de posición: que indican junto con las anteriores dimensión y sentido de marcha desde los puntos de observación reglamentados..."
  },
  "Luz de posicion delantera lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 1.- l - Delanteras de color blanco o amarillo;"
  },
  "Luz de posicion delantera lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 1.- l - Delanteras de color blanco o amarillo;"
  },
  "Luz de posicion trasera lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 2.- 2 - Traseras de color rojo;"
  },
  "Luz de posicion trasera lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 2.- 2 - Traseras de color rojo;"
  },
  "Luces de posicion traseras no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 2.- 2 - Traseras de color rojo;"
  },
  "Luces de posicion delanteras no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 1.- l - Delanteras de color blanco o amarillo;"
  },
  "Luces de posicion traseras lado izquierdo no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 2.- 2 - Traseras de color rojo;"
  },
  "Luces de posicion traseras lado derecho no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 B.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. B Ap. 2.- 2 - Traseras de color rojo;"
  },
  "Luz de giro delantera lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. C.- Luces de giro: intermitentes de color amarillo, delante y atrás. En los vehículos que indique la reglamentación llevarán otras a los costados;"
  },
  "Luz de giro delantera lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. C.- Luces de giro: intermitentes de color amarillo, delante y atrás."
  },
  "Luz de giro trasera lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. C.- Luces de giro: intermitentes de color amarillo, delante y atrás."
  },
  "Luz de giro trasera lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. C.- Luces de giro: intermitentes de color amarillo, delante y atrás."
  },
  "Luces de giro traseras no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley Provincial de Tránsito N° 8560, Artículo 32, Inciso C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Artículo 32, Inciso C)- Luces de giro: intermitentes de color amarillo, delante y atrás. En los vehículos que indique la reglamentación llevarán otras a los costados."
  },
  "Luces de giro delanteras no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley Provincial de Tránsito N° 8560, Artículo 32, Inciso C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Artículo 32, Inciso C) Luces de giro: intermitentes de color amarillo, delante y atrás. En los vehículos que indique la reglamentación llevarán otras a los costados."
  },
  "Luz de freno izquierda no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 D",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. D.- Luces de freno traseras: de color rojo, encenderán al accionarse el mando de frenos antes de actuar éste;"
  },
  "Luz de freno derecha no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 D",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. D.- Luces de freno traseras: de color rojo, encenderán al accionarse el mando de frenos antes de actuar éste;"
  },
  "Luces de freno no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 D",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. D.- d) Luces de freno traseras: de color rojo, encenderán al accionarse el mando de frenos antes de actuar éste;"
  },
  "Tercera luz de freno no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 D",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. D.- d) Luces de freno traseras: de color rojo, encenderán al accionarse el mando de frenos antes de actuar éste;"
  },
  "Luz alta izquierda no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. A.- a) Faros delanteros: de luz blanca o amarilla en no más de dos pares, con alta y baja, ésta de proyección asimétrica;"
  },
  "Luz alta derecha no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. A.- a) Faros delanteros: de luz blanca o amarilla en no más de dos pares, con alta y baja, ésta de proyección asimétrica;"
  },
  "Luces altas no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. A.- a) Faros delanteros: de luz blanca o amarilla en no más de dos pares, con alta y baja, ésta de proyección asimétrica;"
  },
  "Luz baja lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. A.- a) Faros delanteros: de luz blanca o amarilla en no más de dos pares, con alta y baja, ésta de proyección asimétrica;"
  },
  "Luz baja lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. A.- a) Faros delanteros: de luz blanca o amarilla en no más de dos pares, con alta y baja, ésta de proyección asimétrica;"
  },
  "Luces bajas no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. A.- a) Faros delanteros: de luz blanca o amarilla en no más de dos pares, con alta y baja, ésta de proyección asimétrica;"
  },
  "Luz de retroceso lado izquierdo no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 F",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. F.- f) Luz de retroceso blanca;"
  },
  "Luz de retroceso lado derecho no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 F",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. F.- f) Luz de retroceso blanca;"
  },
  "Luces de retroceso no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 32 F",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 32 Inc. F.- f) Luz de retroceso blanca;"
  },
  "1 luz de gran porte no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 33 C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 33 Inc. C.- c) Los vehículos de transporte de pasajeros: cuatro luces de color excluyendo el rojo, en la parte superior delantera y una roja en la parte superior trasera;"
  },
  "Luces de gran porte no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 33 C",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 33 Inc. C.- c) Los vehículos de transporte de pasajeros: cuatro luces de color excluyendo el rojo, en la parte superior delantera y una roja en la parte superior trasera;"
  },
  "Luces interiores no funcionan": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 29.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 29.1 (Anexo A).- 29.1. Luces interiores. La iluminación interior se efectuará con luces de color blanca y de intensidad tal que permita una adecuada visibilidad."
  },
  "Luz de escalera no funciona": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 29.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 29.1 (Anexo A).- Todos los vehículos llevarán, sin excepción, en las cajas de escalones de las puertas de ascenso y descenso UNA (1) luz ubicada al costado del estribo."
  },
  "Sistema Eléctrico con cables sueltos": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 17",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 17 (Anexo A).- La red de distribución de la instalación eléctrica en la carrocería deberá estar embutida, sus conductores deberán poseer aislamiento suficiente para tal fin."
  },
  "Plafones de luces interiores sueltos, fisurados o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 29.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 29.1 (Anexo A).- En ningún caso los plafones deberán presentar cantos vivos."
  },

  // --- HIGIENE ---
  "Falta de Higiene": {
    norma: "Dec 254/03 Anexo C Art. 1 C.7 / Ley 8669 Art. 28 I",
    texto: "Anexo C Art. 1 Inc. C.7.- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas. Ley 8669 Art. 28 Inc. I.- Cumplir con las condiciones de higiene aquí especificadas, mas las determinadas por reglamentación, como así las condiciones de seguridad..."
  },
  "El baño no tiene agua": {
    norma: "Dec 254/03 Anexo C Art. 1 C.7 / Ley 8669 Art. 28 I.3",
    texto: "Anexo C Art. 1 Inc. C.7.- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas. Ley 8669 Art. 28 Inc. I Ap. 3.- Los baños deben estar permanentemente limpios y provistos de suficientes elementos higiénicos, instruyéndose al personal de conducción sobre el uso discrecional de los mismos."
  },
  "Falta higiene en cortinas": {
    norma: "Dec 254/03 Anexo C Art. 1 C.7 / Ley 8669 Art. 28 I",
    texto: "Anexo C Art. 1 Inc. C.7.- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas. Ley 8669 Art. 28 Inc. I.- Cumplir con las condiciones de higiene aquí especificadas, mas las determinadas por reglamentación..."
  },
  "Falta higiene en asientos": {
    norma: "Dec 254/03 Anexo C Art. 1 C.7 / Anexo A Art. 20.9.1",
    texto: "Anexo C Art. 1 Inc. C.7.- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas. Anexo A Art. 20.9.1.- ... La banqueta, el respaldo y el apoyabrazos estarán revestidos de materiales que permitan adecuadamente las condiciones de higiene."
  },

  // --- EXTINTOR (BLOQUE ACTUALIZADO) ---
  "Extintor sin carga": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Los extintores deberán responder las correspondientes normas IRAM. Su capacidad extintora no podrá ser inferior a 4 BC en los vehículos de corta, media y larga distancia."
  },
  "Extintor con carga vencida": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Los extintores deberán responder las correspondientes normas IRAM. Su capacidad extintora no podrá ser inferior a 4 BC en los vehículos de corta, media y larga distancia."
  },
  "Extintor sin certificado/oblea de carga": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Los extintores deberán responder las correspondientes normas IRAM. Su capacidad extintora no podrá ser inferior a 4 BC en los vehículos de corta, media y larga distancia."
  },
  "Extintor con manómetro roto": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / MET Cap. 5 Pt. 6",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). MET Cap 5 Pt 6.- Los matafuegos deberán responder a las correspondientes Normas IRAM o equivalentes y tener indicadores de carga."
  },
  "Extintor no correspondiente al tipo de unidad": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Su capacidad extintora no podrá ser inferior a 4 BC en los vehículos de corta, media y larga distancia."
  },
  "No presenta extintor": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / Ley 8669 Art. 28 A",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Ley 8669 Art. 28 A.- Cumplimentar todas las normas técnicas y de seguridad que determine la Autoridad de Aplicación, prestando el servicio bajo las pautas de continuidad, regularidad, generalidad y obligatoriedad, en resguardo de los intereses de los usuarios."
  },
  "Elementos falsos o con errores inexcusables en el certificado u oblea del extintor": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / C.4",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.). C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "No presenta marbete - No cumple con la Norma IRAM 3517-2": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Los extintores deberán responder las correspondientes normas IRAM. Su capacidad extintora no podrá ser inferior a 4 BC en los vehículos de corta, media y larga distancia."
  },
  "Marbete no corresponde el color - No cumple con la Norma IRAM 3517-2": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / IRAM 3517-2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). IRAM 3517-2: A cada año le corresponde un color distinto de marbete para control visual rápido."
  },
  "Extintor suelto": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Los extintores estarán colocados en un lugar de fácil acceso para el personal de conducción y/o pasajeros ante emergencias."
  },
 "Extintor precintado": {
    norma: "Dec 254/03 Anexo C Art. 1 Inc. C.4 / Anexo A Art. 20.11.7",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Anexo A Art. 20.11.7.- Los extintores estarán colocados en un lugar de fácil acceso para el personal de conducción y/o pasajeros ante emergencias."
  },
    "Extintor despresurizado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / MET Cap. 5 Pt. 6",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). MET Cap 5 Pt 6.- Los matafuegos deberán responder a las correspondientes Normas IRAM o equivalentes y tener indicadores de carga."
  },


  // --- CUBIERTAS ---
  "Cubierta delantera lado izquierdo lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta delantera lado derecho lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta trasera lado izquierdo lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta trasera lado derecho lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta trasera dual externa lado izquierdo lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta trasera dual externa lado derecho lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta trasera dual interna lado izquierdo lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta trasera dual interna lado derecho lisa o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- Queda prohibido el uso de cubiertas que presten un desgaste que no permita la observación nítida de su dibujo en la banda de rodamiento..."
  },
  "Cubierta delantera derecha recapada": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- ...como así también el empleo de neumáticos reconstruidos en las ruedas delanteras."
  },
  "Cubierta delantera izquierda recapada": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 16",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 16 (Anexo A).- ...como así también el empleo de neumáticos reconstruidos en las ruedas delanteras."
  },

  // --- DEFICIENCIAS MECÁNICAS ---
  "Deficiencias mecánica no hacen a la seguridad": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 29",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 29.- Todo vehículo para poder ser habilitado al tránsito público en el ámbito de la Provincia de Córdoba, debe cumplir las condiciones de seguridad activas y pasivas..."
  },
  "Deficiencias mecánica hacen a la seguridad": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 41 h",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 41 Inc. h.- Que posea los sistemas de seguridad originales en buen estado de funcionamiento, so riesgo de aplicación del Artículo 76º inciso c) punto l;"
  },
  "Llanta de rueda trasera lado derecho con fluido/aceite": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 15",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 15 (Anexo A).- El vehículo estará dotado con un sistema de frenos de servicio y otro de estacionamiento... Este sistema de frenado deberá ser silencioso, progresivo y no debe provocar desaceleraciones irregulares bajo ninguna condición de frenado..."
  },
  "Llanta de rueda trasera lado izquierdo con fluido/aceite": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 15",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 15 (Anexo A).- El vehículo estará dotado con un sistema de frenos de servicio y otro de estacionamiento... Este sistema de frenado deberá ser silencioso, progresivo y no debe provocar desaceleraciones irregulares bajo ninguna condición de frenado..."
  },
  "Problemas con la suspensión / Suspensión en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 14",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 14 (Anexo A).- Los chasis destinados al carrozado de vehículos para el transporte público de pasajeros, contarán con un sistema de suspensión que garanticen el mayor confort."
  },
  "Escapes en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 10",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 10 (Anexo A) / MET Cap 3.2.- Deberá darse estricto cumplimiento a las disposiciones que al respecto determina la Ley 8.560 y/o la que la sustituya. ... La hermeticidad del conjunto del sistema de escape deberá cumplirse desde la salida del múltiple de escape hasta el final del caño."
  },
  "Embrague en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 11",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 11 (Anexo A).- Podrá ser accionado mediante sistema mecánico, hidráulico o de cualquier otro tipo siempre que sea de alta eficiencia y de accionar suave y liviano."
  },
  "Perdida de aceite/combustible": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / MET Cap. 3 Pto. 12",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. MET Cap. 3 Pto. 12 (Anexo A Art. 12).- La tubería de y hacia el tanque del combustible, así como el resto del sistema, deberán estar provistos de uniones herméticas, con abrazaderas ajustables u otras de efectividad equivalente."
  },

  // --- CARROCERÍA ---
  "Piso en malas condiciones / Deficiencias en la carrocería piso": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.2 y 20.2.1 (Anexo A).- El piso... Podrá ser construido de metal o materiales sintéticos de resistencia equivalente, con juntas herméticas en las uniones, revestido con goma, plásticos o materiales de características similares... La superficie del pasillo central y los accesos a las puertas de ascenso y descenso, tendrá características antideslizantes."
  },
  "Deficiencias en la carroceria costado y frente": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.3",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.3 (Anexo A).- Los laterales de la carrocería, se revestirán exteriormente con chapas metálicas y/o de otros materiales de resistencia equivalente. El revestimiento exterior formará una superficie sólidamente unida y amarradas a la estructura mediante tornillos, remaches y/o soldaduras."
  },
  "Pasamanos y asideros sueltos o en malas condiciones": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.11.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.11.1 (Anexo A).- Los pasamanos y sus soportes deberán ser rígidos y seguros, con superficie perfectamente lisa y no resultarán peligrosos para pasajeros y peatones... Los extremos de todos los pasamanos deberán terminar empotrados en los paneles frontal, trasero y/o laterales de carrocería, marcos de puertas de ascenso y descenso, columnas o piso."
  },
  "Mamparas en malas condiciones": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.11.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.11.2 (Anexo A).- Delante del primer asiento de la hilera derecha se colocará una mampara de protección o cubrepolleras, provista de pasamanos en su parte superior construida con materiales apropiados..."
  },
  "Portaequipajes sueltos o en malas condiciones": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.11.4",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.11.4 (Anexo A).- Los vehículos de corta, media y larga distancia llevarán en su interior, sobre los paneles laterales de la carrocería y por encima de las ventanillas, portaequipajes en forma de estantes, destinados a la colocación de bultos pequeños y liviano. El borde exterior será redondeado y acolchado o recubierto con materiales apropiados para tal fin. La parte inferior será lisa, sin rebordes ni salientes o estará acolchada."
  },
  "Elementos desgarrantes o con cantos vivos en los asientos, parantes, revestimiento interior de la carrocería.": {
    norma: "Dec 254/03 Anexo A Art. 32 / Anexo C Art. 2 B.2",
    texto: "Art. 32 (Anexo A).- Está terminantemente prohibida la colocación de: - Elementos desgarrantes o con cantos vivos en los asientos, parantes, revestimiento interior de la carrocería, defensas, etc. Anexo C Art. 2 Inc. B.2.- Transporte de todo objeto que entrañe molestias o resulte peligroso para el pasaje."
  },
  "Deficiencias en la carroceria techo": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.4",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.4 (Anexo A).- Llevará cielorraso de fibra o materiales sintéticos. Los vehículos podrán poseer techo construido total o parcialmente de vidrio o material de características similares a condición de que sean tonalizados e inastillables... deberán ser seguros y totalmente herméticos, bloqueando corrientes de aire, polvo y agua, siendo sus dimensiones acordes con la superficie del techo."
  },
  "Caja de Velocidad suelta o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 12",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 12 (Anexo A).- Deberá poseer como mínimo CINCO (5), marchas hacia adelante sincronizadas, excepto la primera, y UNA (1) marcha atrás, cuando se provea al vehículo con eje propulsor con diferencial simple."
  },
  "Paneles interiores en mal estado que no afecta a la seguridad.": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / MET Cap. 4 Pto. 1.2",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. MET Cap. 4 Pto. 1.2.- El interior del vehículo deberá estar recubierto por un revestimiento de madera, plástico, fibra o materiales similares, que no produzcan manchas con el roce ni perjuicios o deterioros de ninguna especie al tomar contacto con los pasajeros o sus vestimentas..."
  },
  "Paneles interiores en mal estado que afecta a la seguridad.": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 32",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 32 (Anexo A).- Está terminantemente prohibida la colocación de: - Elementos desgarrantes o con cantos vivos en los asientos, parantes, revestimiento interior de la carrocería, defensas, etc."
  },
  "No presenta bodega/Bodega en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.11.5",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.11.5 (Anexo A).- Los compartimientos para equipajes, ubicados debajo del piso o en la parte posterior de la carrocería, deberán ser herméticos y su construcción tal, que impida la entrada de polvo, agua, gases provenientes de la combustión, etc. ... Las puertas tendrán un dispositivo de seguridad para evitar su apertura durante la marcha del vehículo."
  },
  "Tapa de tanque de combustible suelta/rota/en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 19",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 19 (Anexo A) / Ley 24.449 Art. 33.- El depósito de combustible y/o cilindros de GNC y su boca de llenado, deberán estar ubicados fuera del recinto destinado a los pasajeros."
  },
  "Fuelle de la palanca de cambio roto/en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 31 K",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 31 Inc. K.- Sistema de renovación de aire interior, sin posibilidad de ingreso de emanaciones del propio vehículo;"
  },
  "Paragolpes delantero roto / en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 31 B",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 31 Inc. B.- Paragolpes y guardabarros o carrocería que cumplan tales funciones. La reglamentación establece la uniformidad de las dimensiones y alturas de los paragolpes;"
  },
  "Paragolpes trasero roto / en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 31 B",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Ley 8560 Art. 31 Inc. B.- Paragolpes y guardabarros o carrocería que cumplan tales funciones. La reglamentación establece la uniformidad de las dimensiones y alturas de los paragolpes;"
  },

  // --- AIRE / VENTILACIÓN ---
"Calefaccion no funciona/mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 22",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 22 (Anexo A).- El sistema de calefacción será tal, que durante los días de más baja temperatura permita asegurar en el interior del vehículo una temperatura no inferior a los VEINTIDÓS (22) grados centígrados, medida a nivel del piso en toda su extensión."
  },
  "Aire acondicionado no funciona/mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 24",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 24 (Anexo A).- Los equipos acondicionadores de aire deberán estar diseñados de manera tal que la temperatura en el interior del coche sea uniforme y no produzcan corrientes concentradas de aire frío y/o caliente debiendo ser éste previamente filtrado."
  },
  "Ventilacion no funciona/mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 21",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 21 (Anexo A).- Los vehículos de transporte de pasajeros, estarán dotados de un sistema de ventilación por circulación forzada de aire, calefaccionado y/o refrigerado o no, que funcione aún estando el vehículo detenido."
  },
  "Boquillas sueltas o en malas condiciones": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 24",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 24 (Anexo A).- Los equipos acondicionadores de aire deberán estar diseñados de manera tal que la temperatura en el interior del coche sea uniforme y no produzcan corrientes concentradas de aire frío y/o caliente debiendo ser éste previamente filtrado."
  },

  // --- BOLETERÍA / PASAJES ---
  "Boleteria cerrada": {
    norma: "Dec 254/03 Art. 28 B.2 / Ley 8669 Art. 28 H",
    texto: "B.2.- El expendio de los pasajes deberá efectuarse en las administraciones de las empresas, boleterías, o en el interior de los vehículos en viaje, o mediante otra forma de comercialización que beneficie al usuario, quedando prohibida la venta ambulante de los mismos. Ley 8669 Art. 28 Inc. H.- Exhibir públicamente los elementos típicos que definen la oferta de servicios, tales como, tarifas, horarios, vehículos, servicios complementarios y otros que por vía reglamentaria se determinen."
  },
  "Venta de pasajes en plataforma": {
    norma: "Dec 254/03 Art. 28 B.2 / Anexo C Art. 1 B.4",
    texto: "B.2.- El expendio de los pasajes deberá efectuarse en las administraciones de las empresas, boleterías, o en el interior de los vehículos en viaje, o mediante otra forma de comercialización que beneficie al usuario, quedando prohibida la venta ambulante de los mismos. Anexo C Art. 1 Inc. B.4.- Falta de emisión de boletos o pasajes, o su expendio sin adecuarse en forma y contenido a lo establecido en las normas reglamentarias, y especialmente, la falta de mención en dichos documentos del tipo y categoría del servicio, origen y destino del viaje, fecha de emisión del pasaje, día y hora del servicio si correspondiera, y la tarifa cobrada. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.)."
  },
  "No cumple con la devolución del monto de pasaje": {
    norma: "Dec 254/03 Anexo C Art. 1 B.5 / Art. 28 B.3",
    texto: "B.5.- No restitución total o parcial -según corresponda- de los importes abonados por pasajes para servicios que se suspendieran antes de su iniciación o interrumpieran durante su prestación, por causas ajenas a la voluntad de los usuarios. Igual sanción merecerá el transportista que no observara las normas sobre devolución de pasajes adquiridos con anticipación. De aplicarse multa, el máximo será equivalente a DIEZ UNIDADES DE MULTA (10 U.M.). Art. 28 B.3.- Cuando el viajero por causa fortuita o fuerza mayor tuviera que suspender el viaje, tendrá derecho a la sustitución del pasaje para un nuevo servicio en idénticas condiciones. En caso de solicitar reintegro el mismo podrá sufrir las siguientes retenciones, siempre que lo solicite antes de la salida del servicio que se trate..."
  },
  "Suspensión del servicio o interrupcion por causas ajenas de los usuarios (no devolucion del pasaje)": {
    norma: "Dec 254/03 Anexo C Art. 1 B.5 / Art. 9 A.a.4",
    texto: "B.5.- No restitución total o parcial -según corresponda- de los importes abonados por pasajes para servicios que se suspendieran antes de su iniciación o interrumpieran durante su prestación, por causas ajenas a la voluntad de los usuarios. Igual sanción merecerá el transportista que no observara las normas sobre devolución de pasajes adquiridos con anticipación. De aplicarse multa, el máximo será equivalente a DIEZ UNIDADES DE MULTA (10 U.M.). Art. 9 A.a.4.- En caso de desperfecto del vehículo o circunstancias de fuerza mayor, cuando la prestataria no adoptare medidas idóneas para superarlo o no ofreciese razones fundadas que lo justifiquen, el usuario podrá exigir el reintegro del valor del pasaje abonado."
  },
  "Expendio de boletos y pasajes sin adecuación en forma y contenido a lo establecido en normas reglamentarias": {
    norma: "Dec 254/03 Anexo C Art. 1 B.4 / Art. 47",
    texto: "B.4.- Falta de emisión de boletos o pasajes, o su expendio sin adecuarse en forma y contenido a lo establecido en las normas reglamentarias, y especialmente, la falta de mención en dichos documentos del tipo y categoría del servicio, origen y destino del viaje, fecha de emisión del pasaje, día y hora del servicio si correspondiera, y la tarifa cobrada. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.). Art. 47.- El contenido del comprobante del pasaje, como así también el procedimiento a que debe someterse previo a su habilitación para la venta, será establecido por resolución de la autoridad de aplicación."
  },
  "Falta de emisión de boletos y pasajes": {
    norma: "Dec 254/03 Anexo C Art. 1 B.4 / Art. 47",
    texto: "B.4.- Falta de emisión de boletos o pasajes, o su expendio sin adecuarse en forma y contenido a lo establecido en las normas reglamentarias, y especialmente, la falta de mención en dichos documentos del tipo y categoría del servicio, origen y destino del viaje, fecha de emisión del pasaje, día y hora del servicio si correspondiera, y la tarifa cobrada. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.). Art. 47.- El comprobante del pasaje que expida el transportista podrá ser provisto por la Dirección de Transporte quien los hará imprimir por cuenta de aquellos, conforme un modelo especial que permita una perfecta fiscalización y en lugares que cumplan los requisitos que exija la autoridad de aplicación."
  },
  "Boleteria no presenta horarios, ni tarifas": {
    norma: "Ley 8669 Art. 28 H / Dec 254/03 Anexo C Art. 1 C.5",
    texto: "Ley 8669 Art. 28 Inc. H.- Exhibir públicamente los elementos típicos que definen la oferta de servicios, tales como, tarifas, horarios, vehículos, servicios complementarios y otros que por vía reglamentaria se determinen. Anexo C Art. 1 Inc. C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación. De aplicarse multa, el máximo será equivalente a TRES UNIDADES DE MULTA (3 U.M.)."
  },
  "Boleteria no presenta carteleria 0800 Ersep": {
    norma: "Dec 254/03 Art. 46 / Anexo C Art. 1 C.5",
    texto: "Art. 46.- Las empresas prestatarias de los servicios previstos en el artículo 9 (Incisos A, B y C de la Ley nº 8669), deberán disponer necesariamente de una línea telefónica de cobro revertido, destinada exclusivamente a la atención de reclamos, sugerencias e información del público usuario, cuyo número deberá exhibirse en un lugar visible en el interior y exterior de las unidades y publicitarse en forma permanente. Anexo C Art. 1 Inc. C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación."
  },

  // --- BOTIQUÍN ---
  "No presenta botiquín": {
    norma: "Dec 254/03 Anexo A Art. 20.11.8 / Anexo C Art. 1 C.4",
    texto: "Art. 20.11.8 (Anexo A).- Todo vehículo deberá contar con un botiquín para primeros auxilios, con los elementos que establezca el Ministerio de Salud Pública de la Provincia. Anexo C Art. 1 Inc. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Botiquín incompleto": {
    norma: "Dec 254/03 Anexo A Art. 20.11.8 / Anexo C Art. 1 C.4",
    texto: "Art. 20.11.8 (Anexo A).- Todo vehículo deberá contar con un botiquín para primeros auxilios, con los elementos que establezca el Ministerio de Salud Pública de la Provincia. Anexo C Art. 1 Inc. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio."
  },
  "Presenta insumos vencidos (Botiquin)": {
    norma: "Dec 254/03 Anexo A Art. 20.11.8 / Anexo C Art. 1 C.4",
    texto: "Art. 20.11.8 (Anexo A).- Todo vehículo deberá contar con un botiquín para primeros auxilios, con los elementos que establezca el Ministerio de Salud Pública de la Provincia. Anexo C Art. 1 Inc. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio."
  },

  // --- ALCOHOLEMIA ---
  "El conductor presenta alcohol en sangre (Positivo)": {
    norma: "Ley 8560 Art. 51 A / Dec 254/03 Anexo C C.7",
    texto: "Art. 51 Inc. A (Ley 8560).- Conducir con impedimentos físicos o psíquicos, sin la licencia especial correspondiente, en estado de intoxicación alcohólica o habiendo tomado estupefacientes o medicamentos que disminuyan la aptitud para conducir; Art. 1 Inc. C.7 (Anexo C Dec 254/03).- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas."
  },

  // --- ASIENTOS ---
  "No presenta cinturon de seguridad del conductor o el mismo se encuentra en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.3",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.3 (Anexo A).- No llevará apoyabrazos y será desplazable horizontal y verticalmente. Deberá contar con cinturón de seguridad y apoyacabezas."
  },
  "Asiento del conductor en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.3",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.3 (Anexo A).- No llevará apoyabrazos y será desplazable horizontal y verticalmente. Deberá contar con cinturón de seguridad y apoyacabezas."
  },

  "Exceso Y/O Modificación-No coincide el número de asientos habilitados con el número de asientos constatados": {
    norma: "Dec 254/03 Anexo C Art. 1 C.2 / Anexo A Art. 7",
    texto: "C.2.- Modificaciones que se introdujeran en las unidades de transporte que alterasen las características originales de habilitación. De aplicarse multa, el máximo será equivalente a CINCUENTA UNIDADES DE MULTA (50 U.M.). Como medida accesoria, podrá prohibirse la utilización de dichos vehículos, en tanto no se supriman las modificaciones no autorizadas. Art. 7 (Anexo A).- La Dirección de Transporte determinará la capacidad máxima de carga de cada vehículo, en función de las características del servicio al cual sea afectado y de modo tal que el peso total del vehículo sea inferior o eventualmente igual al fijado por la terminal y/o el fabricante del chasis."
  },
  "Exceso Y/O Modificación-No coincide el número de asientos en RTO con el número de asientos constatados": {
    norma: "Dec 254/03 Anexo C Art. 1 C.2 / Anexo A Art. 7",
    texto: "C.2.- Modificaciones que se introdujeran en las unidades de transporte que alterasen las características originales de habilitación. De aplicarse multa, el máximo será equivalente a CINCUENTA UNIDADES DE MULTA (50 U.M.). Como medida accesoria, podrá prohibirse la utilización de dichos vehículos, en tanto no se supriman las modificaciones no autorizadas. Art. 7 (Anexo A).- La Dirección de Transporte determinará la capacidad máxima de carga de cada vehículo, en función de las características del servicio al cual sea afectado y de modo tal que el peso total del vehículo sea inferior o eventualmente igual al fijado por la terminal y/o el fabricante del chasis."
  },
  "Exceso Y/O Modificación-No coincide el número de asientos habilitados con el número de asientos en RTO": {
    norma: "Dec 254/03 Anexo C Art. 1 C.2 / Anexo A Art. 7",
    texto: "C.2.- Modificaciones que se introdujeran en las unidades de transporte que alterasen las características originales de habilitación. De aplicarse multa, el máximo será equivalente a CINCUENTA UNIDADES DE MULTA (50 U.M.). Como medida accesoria, podrá prohibirse la utilización de dichos vehículos, en tanto no se supriman las modificaciones no autorizadas. Art. 7 (Anexo A).- La Dirección de Transporte determinará la capacidad máxima de carga de cada vehículo, en función de las características del servicio al cual sea afectado y de modo tal que el peso total del vehículo sea inferior o eventualmente igual al fijado por la terminal y/o el fabricante del chasis."
  },

  "No presenta apoya cabezas/Apoya cabezas en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.1 (Anexo A).- La banqueta, el respaldo y el apoyabrazos estarán revestidos de materiales que permitan adecuadamente las condiciones de higiene. Tanto la banqueta como el respaldo serán mullidos y cómodos para los pasajeros... Deberán poseer apoyabrazos siendo los centrales rebatibles y embutidos al rebatirlos. Los respaldos serán reclinables con TRES (3) posiciones como mínimo."
  },
  "Asientos en mal estado menos del 20 %": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.1 (Anexo A).- La banqueta, el respaldo y el apoyabrazos estarán revestidos de materiales que permitan adecuadamente las condiciones de higiene. Tanto la banqueta como el respaldo serán mullidos y cómodos para los pasajeros... Deberán poseer apoyabrazos siendo los centrales rebatibles y embutidos al rebatirlos. Los respaldos serán reclinables con TRES (3) posiciones como mínimo."
  },
  "Asientos en mal estado mas del 20 %": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.1 (Anexo A).- La banqueta, el respaldo y el apoyabrazos estarán revestidos de materiales que permitan adecuadamente las condiciones de higiene. Tanto la banqueta como el respaldo serán mullidos y cómodos para los pasajeros... Deberán poseer apoyabrazos siendo los centrales rebatibles y embutidos al rebatirlos. Los respaldos serán reclinables con TRES (3) posiciones como mínimo."
  },
  "Asientos sin apoya brazos/Apoya brazos roto o en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.1 (Anexo A).- La banqueta, el respaldo y el apoyabrazos estarán revestidos de materiales que permitan adecuadamente las condiciones de higiene. Tanto la banqueta como el respaldo serán mullidos y cómodos para los pasajeros... Deberán poseer apoyabrazos siendo los centrales rebatibles y embutidos al rebatirlos. Los respaldos serán reclinables con TRES (3) posiciones como mínimo."
  },
  "Asientos con el sistema de reclinacion roto": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Anexo A Art. 20.9.1",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 20.9.1 (Anexo A).- La banqueta, el respaldo y el apoyabrazos estarán revestidos de materiales que permitan adecuadamente las condiciones de higiene. Tanto la banqueta como el respaldo serán mullidos y cómodos para los pasajeros... Deberán poseer apoyabrazos siendo los centrales rebatibles y embutidos al rebatirlos. Los respaldos serán reclinables con TRES (3) posiciones como mínimo."
  },

  "No presentan fundas amarillas en los primeros asientos": {
    norma: "Dec 254/03 Art. 9 A.d.4 / Anexo C Art. 1 C.4",
    texto: "Art. 9 Inc. A.d.4.- Garantizar el acceso y utilización de los vehículos afectados al servicio a personas con movilidad reducida, entendiéndose por tales a quienes tienen limitada temporal o permanentemente la posibilidad de desplazarse. A tal efecto todos los vehículos deberán disponer de dos (2) asientos de conformación ergonómica especial, ubicados en el costado izquierdo de la primera fila, destinados a los mismos. Los asientos se identificarán con fundas de color amarillo. Art. 1 Inc. C.4 (Anexo C).- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort... o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio."
  },

  "No presenta cinturon de seguridad /cinturón en mal estado": {
    norma: "Dec 254/03 Anexo C Art. 1 C.4 / Ley 8560 Art. 41 J",
    texto: "C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort... o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. Art. 41 Inc. J (Ley 8560).- Que sus ocupantes usen los correajes de seguridad, en los vehículos que por reglamentación deben poseerlos."
  },

  // --- CARNET DE CONDUCTOR ---
  "No presenta carnet de conducir expedido por Autoridad Aplicación": {
    norma: "Dec 254/03 Anexo C Art. 1 C.8 / Art. 9 e.2",
    texto: "C.8.- Utilización de personal de conducción que no contase con la previa habilitación de la Autoridad de Aplicación o quien determine la legislación vigente. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.) pudiéndose elevar a un máximo CINCUENTA UNIDADES DE MULTA (50 U.M.) cuando el personal en servicio hubiera resultado expresamente inhabilitado y la decisión comunicada debidamente a la empresa transportista. Art. 9 e.2.- Exigir al personal la posesión de licencia habilitante para conducir unidades de transporte automotor de pasajeros de jurisdicción provincial, expedida por la autoridad competente."
  },
  "No presenta carnet de conducir (No porta)": {
    norma: "Ley 8560 Art. 41 a / Art. 38",
    texto: "Ley 8560 Art. 41 Inc. a.- Que su conductor esté habilitado para conducir este tipo de vehículo y que lleve consigo la licencia correspondiente; Art. 38.- Al sólo requerimiento de la autoridad competente se debe presentar la licencia de conductor y demás documentación exigible, la que debe ser devuelta inmediatamente de verificada no pudiendo retenerse sino en los casos que la Ley contempla."
  },
  "Carnet de conducir vencido": {
    norma: "Dec 254/03 Anexo C Art. 1 C.8 / Ley 8560 Art. 41 a",
    texto: "C.8.- Utilización de personal de conducción que no contase con la previa habilitación de la Autoridad de Aplicación o quien determine la legislación vigente. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.)... Ley 8560 Art. 41 Inc. a.- Que su conductor esté habilitado para conducir este tipo de vehículo y que lleve consigo la licencia correspondiente;"
  },
  "Elementos falsos o con errores inexcusables en el carnet de conducir": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / Ley 8560 Art. 76 b.4",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.). Ley 8560 Art. 76 Inc. b.4.- Hayan sido adulteradas o surja una evidente violación a los requisitos exigidos en esta Ley; ... la autoridad de comprobación o aplicación puede retener..."
  },
  "El carnet de conducir no está en condiciones": {
    norma: "Criterio Op. Oct 2025 / Ley 8560 Art. 18",
    texto: "Carnet Ilegible: - Se inhabilita, no sirve carnet digital, sí o sí debe presentar carnet físico. (Documento 'Acuerdos 13 y 14 Octubre de 2025' - Criterio operativo). Ley 8560 Art. 18.- El titular de una licencia de conductor debe denunciar a la brevedad todo cambio de los datos consignados en ella... La licencia caduca a los 90 días de producido el cambio no denunciado."
  },
  
    // --- PASAJEROS PARADOS / EXCESO (NUEVO BLOQUE) ---
  "Transporta pasajeros de pie (E)": {
    norma: "Dec 254/03 Anexo C Art. 2 B.1 / Art. 9 D.a.1",
    texto: "B.1.- Transporte de pasajeros de pie en los servicios en los que la reglamentación lo prohíbe, como así también el exceso de pasajeros parados en las modalidades de servicios que se encuentra autorizado. De aplicarse multa, el máximo será equivalente a, DIEZ UNIDADES DE MULTA (10 U.M.). a.1.- Prestarse mediante contratación previa entre el titular de la autorización y el representante legal autorizado de instituciones, entidades, o cualquier otra forma de agrupaciones de personas. Queda expresamente prohibido en cualquier caso el transporte de pasajeros de pie."
  },
  "Transporta exceso de pasajeros ( R )": {
    norma: "Dec 254/03 Anexo C Art. 2 B.1 / Art. 9 A.a.5",
    texto: "B.1.- Transporte de pasajeros de pie en los servicios en los que la reglamentación lo prohíbe, como así también el exceso de pasajeros parados en las modalidades de servicios que se encuentra autorizado. De aplicarse multa, el máximo será equivalente a, DIEZ UNIDADES DE MULTA (10 U.M.). a.5- Asimismo, podrá utilizar hasta un número equivalente al cincuenta por ciento (50%) de la capacidad total de asientos del vehículo para transportar pasajeros parados cuando el servicio regular (común) no supere un recorrido de sesenta (60) kilómetros."
  },
  "Pasajeros sin asientos ( RD )": {
    norma: "Dec 254/03 Anexo C Art. 2 B.1 / Art. 9 A.a.6",
    texto: "B.1.- Transporte de pasajeros de pie en los servicios en los que la reglamentación lo prohíbe, como así también el exceso de pasajeros parados en las modalidades de servicios que se encuentra autorizado. De aplicarse multa, el máximo será equivalente a, DIEZ UNIDADES DE MULTA (10 U.M.). a.6- Le queda expresamente prohibido -en cualquier caso- el transporte de pasajeros de pie para la categoría regular (diferencial)."
  },
  // --- PLANILLA DE DESINFECCION ---
  "No presenta planilla de desinfección": {
    norma: "Dec 254/03 Anexo A Art. 33 c) / Anexo C Art. 1 C.5",
    texto: "c) planilla de inspección mecánico y constancia de desinfección. C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación. De aplicarse multa, el máximo será equivalente a TRES UNIDADES DE MULTA (3 U.M.)."
  },
  "Planilla de desinfección vencida": {
    norma: "Dec 254/03 Anexo C Art. 1 C.7 / Ley 8669 Art. 6",
    texto: "C.7.- Inobservancia de las condiciones esenciales de higiene en los vehículos y en las instalaciones fijas, o el desempeño de la función de conducción en condiciones higiénicas inadecuadas. De aplicarse multa, el máximo será equivalente a TRES UNIDADES DE MULTA (3 U.M.). Ley 8669 Art. 6.- La Autoridad de Aplicación ejercerá el control de higiene y desinfección en todo vehículo de transporte de pasajeros con servicio de baño y comida o bar a bordo, que ingrese, parta y/o circule por territorio provincial."
  },
  "Elementos falsos o con errores inexcusables en la planilla de desinfección": {
    norma: "Dec 254/03 Anexo C Art. 1 A.5 / C.5",
    texto: "A.5.- Presentación de datos u otros elementos falsos o con errores inexcusables ante el requerimiento de la Autoridad de Aplicación o en cumplimiento de sus obligaciones. De aplicarse multa, el máximo será equivalente a TREINTA UNIDADES DE MULTA (30 U.M.). C.5.- Carencia o deficiente conservación de la chapa habilitante o de la Planilla de Inspección Técnica o de Revisión Técnica Obligatoria, o de todo aquel documento, información, carteles, etc., cuya exhibición externa o interna en los vehículos, fuera expresamente dispuesta por la Autoridad de Aplicación. De aplicarse multa, el máximo será equivalente a TRES UNIDADES DE MULTA (3 U.M.)."
  },
  // --- OPTICAS (NUEVO BLOQUE) ---
  "Optica delantera lado izquierdo sucia, fisurada o en mal estado": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica delantera lado derecho sucia, fisurada o en mal estado": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica trasera lado izquierdo sucia, fisurada o en mal estado": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica trasera lado derecho sucia, fisurada o en mal estado": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de posicion lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de posicion lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de posicion delantera lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de posicion delantera lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de posicion trasera lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de posicion trasera lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de giro delantera lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de giro delantera lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de giro trasera lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de giro trasera lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de freno izquierda no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de freno derecha no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz alta izquierda no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz alta derecha no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz baja lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz baja lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de retroceso lado izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Optica de luz de retroceso lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte, vehículos, equipamiento, personal de conducción e instalaciones fijas. Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  // --- PARABRISAS (NUEVO BLOQUE) ---
  "Parabrisas perforado": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Parabrisas fisurado sin obstaculizar la visual del conductor": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Parabrisas fisurado obstaculiza la visual del conductor": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Parabrisas superior fisurado": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Parabrisas con desprendimiento de material": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Limpia parabrisas lado derecho no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Limpia parabrisas izquierdo no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },
  "Desempañador no funciona": {
    norma: "Ley 8669 Art. 30 C / Dec 254/03 Anexo C C.4",
    texto: "Ley 8669 Art. 30 C.- Las infracciones a las disposiciones vigentes y exigencias técnicas en materia de medios de transporte... Dec 254/03 C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort, de instrumental o la carencia de los elementos de seguridad o el inadecuado funcionamiento de esos dispositivos en los vehículos afectados al servicio. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  },

  // --- DESOBEDIENCIA / CONDUCTA (NUEVO BLOQUE) ---
  "Desobediencia a la autoridad de control": {
    norma: "Dec 254/03 Anexo C C.2 / Ley 8669 Art. 31 C",
    texto: "C.2.- Desobediencia a las órdenes de la Autoridad de Aplicación o de Control o de sus agentes. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Ley 8669 Art. 31 C.- Las infracciones a las normas relativas a las relaciones de los transportistas con la Autoridad de Aplicación y los usuarios."
  },
  "No permite a la autoridad de control realizar la inspección": {
    norma: "Dec 254/03 Anexo C C.1 / Art. 28 A.4",
    texto: "C.1.- Desconocimiento de las atribuciones de la Autoridad de Aplicación o de Control o de sus agentes autorizados, el trato desconsiderado a estos agentes, o la comisión de actos que impidan u obstaculicen el cumplimiento de sus funciones. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Art. 28 A.4.- Facilitar las inspecciones de cualquier tipo que disponga efectuar la autoridad competente en los depósitos, garajes, talleres, áreas destinadas a la prestación de los servicios..."
  },
  "Circulación de los vehículos de transporte con la puerta abierta, o en condiciones antireglamentarias": {
    norma: "Dec 254/03 Anexo C A.5 / Ley 8669 Art. 28 A",
    texto: "A.5.- Circulación de los vehículos de transporte con la puerta abierta, o en condiciones antirreglamentarias. De aplicarse multa, el máximo será equivalente a CUATRO UNIDADES DE MULTA (4 U.M.). Ley 8669 Art. 28 A.- Cumplimentar todas las normas técnicas y de seguridad que determine la Autoridad de Aplicación, prestando el servicio bajo las pautas de continuidad, regularidad, generalidad y obligatoriedad, en resguardo de los intereses de los usuarios."
  },
  "Mal trato al inspector": {
    norma: "Dec 254/03 Anexo C C.1 / Ley 8669 Art. 31 C",
    texto: "C.1.- Desconocimiento de las atribuciones de la Autoridad de Aplicación o de Control o de sus agentes autorizados, el trato desconsiderado a estos agentes, o la comisión de actos que impidan u obstaculicen el cumplimiento de sus funciones. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Ley 8669 Art. 31 C.- Las infracciones a las normas relativas a las relaciones de los transportistas con la Autoridad de Aplicación y los usuarios."
  },
  "El personal de la prestataria no se encuentra debidamente identificado (vestimenta)": {
    norma: "Dec 254/03 Art. 9 E.e.5 / Ley 8669 Art. 31 B",
    texto: "e.5- Dotar al personal de vestimenta y signos exteriores que aseguren su autoridad, correcta presencia y faciliten su individualización. Ley 8669 Art. 31 B.- Las infracciones cometidas por el personal de conducción en caso de observar una conducta imprudente o negligente en el desempeño de sus funciones."
  },
  "Mal trato al pasajero": {
    norma: "Dec 254/03 Anexo C A.1 / Ley 8669 Art. 31 A",
    texto: "A.1.- Trato desconsiderado o incorrecto a usuarios o terceros por parte del personal dependiente. De aplicarse multa, el máximo será equivalente a TRES UNIDADES DE MULTA (3 U.M.). Ley 8669 Art. 31 A.- Las infracciones a las disposiciones vigentes en materia de comportamiento del personal respecto de pasajeros, terceros transportados y no transportados."
  },
  "Abandono por parte del conductor -sin justa causa- de su puesto de conducción": {
    norma: "Dec 254/03 Anexo C A.3 / Ley 8669 Art. 31 B",
    texto: "A.3.- Abandono sin justa causa que los conductores hiciesen de su puesto de conducción, durante la prestación del servicio, o la falta de colaboración para superar cualquier circunstancia que hiciere peligrar la seguridad de los pasajeros transportados o transeúntes. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Ley 8669 Art. 31 B.- Las infracciones cometidas por el personal de conducción en caso de observar una conducta imprudente o negligente en el desempeño de sus funciones."
  },
  "Incumplimiento a las restricciones al tráfico - Estacionamiento en zona de circulación": {
    norma: "Dec 254/03 Anexo C B.2 / Ley 8669 Art. 30 B",
    texto: "B.2.- Incumplimiento de las restricciones al trafico y/o la alteración del recorrido en los servicios. De aplicarse multa, el máximo será equivalente a CUARENTA UNIDADES DE MULTA (40 U.M.). Ley 8669 Art. 30 B.- Las infracciones a las modalidades de explotación de los servicios."
  },
  "Desobediencia a la autoridad de aplicación": {
    norma: "Dec 254/03 Anexo C C.2 / Ley 8669 Art. 31 C",
    texto: "C.2.- Desobediencia a las órdenes de la Autoridad de Aplicación o de Control o de sus agentes. De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.). Ley 8669 Art. 31 C.- Las infracciones a las normas relativas a las relaciones de los transportistas con la Autoridad de Aplicación y los usuarios."
  },
  "Inobservancia por parte del conductor de las normas relativas a las prohibiciones de fumar o de utilizar celulares": {
    norma: "Dec 254/03 Anexo C A.6 / Ley 8669 Art. 28 A",
    texto: "A.6.- No observancia por parte del personal de conducción de las normas relativas a las prohibiciones de fumar, salivar o conversar con los pasajeros, de utilizar aparatos electrónicos radiofónicos, instalados o portátiles, o en condiciones que afecten la comodidad del usuario, será sancionado con multa máxima equivalente a DOS UNIDADES DE MULTA. Ley 8669 Art. 28 A.- Cumplimentar todas las normas técnicas y de seguridad..."
  },
  "Permaneció estacionado en plataforma más tiempo del reglamentario": {
    norma: "Res N° 0041/1990 Art. 1 / Ley 8669 Art. 30 B",
    texto: "DISPONER, a partir de la fecha de la presente Resolución, que las empresas con servicios de corta distancia podrán permanecer estacionadas en las respectivas plataformas por un tiempo máximo de CINCO MINUTOS (5'), para las operaciones de carga y descarga de pasajeros, bulto y/o equipajes. Ley 8669 Art. 30 B.- Las infracciones a las modalidades de explotación de los servicios."
  },
  "Ascenso y Descenso de pasajeros fuera de Plataforma": {
    norma: "Dec 254/03 Anexo C B.1 / Art. 9 B.b.1",
    texto: "B.1.- Realización de los servicios de transporte de pasajeros en violación de las modalidades autorizadas, por acto u omisión del transportista. De aplicarse multa, el máximo será equivalente a DIEZ UNIDADES DE MULTA (10 U.M.). b.1- Efectuar las paradas destinadas al ascenso y/o descenso de pasajeros en los lugares que determine al efecto la autoridad de aplicación..."
  },

  // --- DISCAPACIDAD (NUEVO BLOQUE) ---
  "Incumple a la Ley N°9440, Pase Libre, Único y Universal con el titular del Pase de discapacidad": {
    norma: "Dec 1178/08 Anexo I Art. 6 / Ley 9440 Art. 2",
    texto: "El incumplimiento por parte de la Empresa prestataria a la obligación que establecen los Artículos 2°, 3° y 5° de la Ley N° 9440 traerá aparejado la aplicación por parte de la Autoridad Sancionatoria... de las sanciones establecidas en el Artículo 1° apartado B 7, artículo 11° y sus concordantes del Anexo C del Decreto N° 254/03. Ley 9440 Art. 2.- LAS empresas de transporte automotor de pasajeros sometidas al contralor de la autoridad provincial, deberán transportar gratuitamente a las personas con discapacidad y a un acompañante..."
  },
  "Incumple a la Ley N°9440, Pase Libre, Único y Universal con el acompañante del Pase de discapacidad": {
    norma: "Dec 1178/08 Anexo I Art. 6 / Ley 9440 Art. 2",
    texto: "El incumplimiento por parte de la Empresa prestataria a la obligación que establecen los Artículos 2°, 3° y 5° de la Ley N° 9440 traerá aparejado la aplicación por parte de la Autoridad Sancionatoria... de las sanciones establecidas en el Artículo 1° apartado B 7, artículo 11° y sus concordantes del Anexo C del Decreto N° 254/03. Ley 9440 Art. 2.- LAS empresas de transporte automotor de pasajeros sometidas al contralor de la autoridad provincial, deberán transportar gratuitamente a las personas con discapacidad y a un acompañante..."
  },
  "Incumplimiento de los dos primeros asientos para personas con movilidad reducida": {
    norma: "Dec 254/03 Art. 9 D.d.4 / Anexo C C.4",
    texto: "d.4- Garantizar el acceso y utilización de los vehículos afectados al servicio a personas con movilidad reducida... A tal efecto todos los vehículos deberán disponer de dos (2) asientos de conformación ergonómica especial, ubicados en el costado izquierdo de la primera fila, destinados a los mismos. Los asientos se identificarán con fundas de color amarillo. C.4.- Deficiencias mecánicas, en la carrocería, equipamiento, condiciones de confort... De aplicarse multa, el máximo será equivalente a CINCO UNIDADES DE MULTA (5 U.M.)."
  }

};

// --- 2. BIBLIOTECA LEGAL GENERAL (PARA EL RESTO DE LAS 300) ---
const BIBLIOTECA_GENERAL = {
  DEFAULT: { norma: "Dec 254/03", texto: "Infracción a las condiciones de habilitación y seguridad vigentes." },
  BOLETERIA: { norma: "Ley 8669 / Dec 254/03", texto: "Obligación de emitir boleto, respetar tarifas y horarios aprobados. Atención al usuario." },
  BOTIQUIN: { norma: "Dec 254/03 Anexo A", texto: "Portación obligatoria de botiquín de primeros auxilios completo y vigente." },
  CARNET: { norma: "Ley 8560 Art. 40", texto: "Conductor debe poseer licencia habilitante vigente acorde a la categoría." },
  CARROCERIA: { norma: "Dec 254/03 Anexo A", texto: "Carrocería en perfecto estado. Prohibidos elementos desgarrantes, aristas vivas o deterioro." },
  CUBIERTAS: { norma: "Dec 254/03 Art. 16", texto: "Neumáticos con profundidad reglamentaria. Prohibido recapados en eje delantero." },
  MECANICA: { norma: "Dec 254/03 - Chasis", texto: "Condiciones mecánicas de seguridad (dirección, frenos, suspensión). Prohibidas pérdidas de fluidos." },
  DESOBEDIENCIA: { norma: "Ley 8669 / Dec 254/03 Anexo C", texto: "Obligación de acatar órdenes de la autoridad y trato correcto al pasajero." },
  DISCAPACIDAD: { norma: "Ley 9440 / Dec 1178/08", texto: "Transporte gratuito obligatorio para PCD y acompañante (Pase Libre)." },
  EQUIPAJE: { norma: "Dec 254/03 Art. 39", texto: "Obligación de entrega de guía y resguardo del equipaje en bodega." },
  ESPEJOS: { norma: "Ley 8560 / Dec 254/03", texto: "Sistemas de retrovisión obligatorios en perfecto estado." },
  EXTINTOR: { norma: "Dec 254/03 / IRAM 3517-2", texto: "Matafuegos con carga vigente, marbete oficial color correspondiente, sujeto y accesible." },
  HIGIENE: { norma: "Ley 8669 Art. 28 Inc I", texto: "Condiciones de higiene y desinfección obligatorias en unidades." },
  HORARIOS: { norma: "Dec 254/03 Anexo C", texto: "Cumplimiento estricto de horarios. Prohibido adelanto o retraso injustificado." },
  LETREROS: { norma: "Dec 254/03 / Res 178/18", texto: "Identificación obligatoria: Chapa MOP, Razón Social, 0800-ERSEP, Velocidad." },
  LIBRETA: { norma: "Ley 8669 / Dec 254/03", texto: "Libreta de trabajo a bordo y al día. Respeto de régimen de descanso." },
  LISTA: { norma: "Dec 254/03", texto: "Obligación de lista de pasajeros en servicios especiales." },
  ILUMINACION: { norma: "Dec 254/03 Anexo A", texto: "Sistema de luces reglamentario completo y operativo." },
  MODALIDAD: { norma: "Dec 254/03 Anexo C", texto: "Prestación de servicios en modalidades no autorizadas. Violación al permiso." },
  TACOGRAFO: { norma: "Dec 254/03 Anexo A", texto: "Módulo de Registro de Operaciones (Tacógrafo) obligatorio, calibrado y en funcionamiento." },
  MOP: { norma: "Res. 178/2018 / Dec 254/03", texto: "Chapa identificatoria MOP legible y actualizada según cronograma vigente." },
  OPTICAS: { norma: "Dec 254/03 Anexo A", texto: "Ópticas y faros en buen estado, sin roturas." },
  PARABRISAS: { norma: "Dec 254/03 Anexo A", texto: "Parabrisas de seguridad sin fisuras que obstaculicen la visual." },
  PASAJEROS: { norma: "Dec 254/03 Art. 9", texto: "Límites en el transporte de pasajeros de pie según modalidad." },
  DOCUMENTACION: { norma: "Dec 254/03", texto: "Falta de documentación habilitante a bordo (Habilitación, Seguro, RTO)." },
  RTO: { norma: "Dec 254/03 Anexo C", texto: "Certificación de Revisión Técnica Obligatoria vigente." },
  RECORRIDO: { norma: "Dec 254/03 Anexo C", texto: "Prestación de servicio en tramos no autorizados." },
  SEGURO: { norma: "Ley 8669 Art. 28", texto: "Seguro obligatorio de responsabilidad civil vigente." },
  TARIFA: { norma: "Res. Ersep", texto: "Respeto estricto al cuadro tarifario autorizado." },
  EMERGENCIA: { norma: "Dec 254/03 Anexo A", texto: "Salidas de emergencia operables y libres. Martillos obligatorios." },
  AIRE: { norma: "Dec 254/03 Anexo A", texto: "Sistemas de calefacción y aire acondicionado operativos." },
  ALCOHOL: { norma: "Ley 10.181", texto: "Prohibición de alcohol en sangre." },
  CINTURON: { norma: "Dec 254/03 Anexo A", texto: "Cinturones de seguridad obligatorios." },
  ASIENTOS_PMR: { norma: "Dec 254/03 Anexo A", texto: "Asientos PMR obligatorios y señalizados." },
  ASIENTOS_ESTADO: { norma: "Dec 254/03 - Confort", texto: "Asientos y tapizados en buen estado." }
};

// --- 3. LISTADO DE INFRACCIONES COMPLETO ---
const DB_RAW = [
  // MOP
  { cat: 'MOP', nombre: 'No presenta Chapa MOP en lugar reglamentario' },
  { cat: 'MOP', nombre: 'Chapa MOP desactualizada' },
  { cat: 'MOP', nombre: 'No presenta chapa dominio en lugar reglamentario' },
  { cat: 'MOP', nombre: 'Chapa MOP ilegible' },
  { cat: 'MOP', nombre: 'Chapa dominio ilegible' },
  { cat: 'MOP', nombre: 'Elementos falsos o con errores inexcusables en la Chapa MOP' },

  // MOP/HABILITACION
  { cat: 'MOP/HABILITACION', nombre: 'No presenta permiso precario' },
  { cat: 'MOP/HABILITACION', nombre: 'No posee habilitación provincial - Extraña jurisdicción' },
  { cat: 'MOP/HABILITACION', nombre: 'Permiso precario vencido' },
  { cat: 'MOP/HABILITACION', nombre: 'No presenta habilitación de la Autoridad de Aplicación' },
  { cat: 'MOP/HABILITACION', nombre: 'No presenta Permiso de Explotación' },
  { cat: 'MOP/HABILITACION', nombre: 'Permiso de Explotación Vencido' },
  { cat: 'MOP/HABILITACION', nombre: 'No presenta Certificado Alta de Unidad (CAU)' },
  { cat: 'MOP/HABILITACION', nombre: 'Certificado Alta de Unidad (CAU) vencido' },
  { cat: 'MOP/HABILITACION', nombre: 'Elementos falsos o con errores inexcusables en el Permiso de Explotación' },
  { cat: 'MOP/HABILITACION', nombre: 'Elementos falsos o con errores inexcusables en el Certificado Alta de Unidad (CAU)' },
  { cat: 'MOP/HABILITACION', nombre: 'Elementos falsos o con errores inexcusables en el Permiso Precario' },

  // PARABRISAS
  { cat: 'PARABRISAS', nombre: 'Parabrisas perforado' },
  { cat: 'PARABRISAS', nombre: 'Parabrisas fisurado sin obstaculizar la visual del conductor' },
  { cat: 'PARABRISAS', nombre: 'Parabrisas fisurado obstaculiza la visual del conductor' },
  { cat: 'PARABRISAS', nombre: 'Parabrisas superior fisurado' },
  { cat: 'PARABRISAS', nombre: 'Parabrisas con desprendimiento de material' },
  { cat: 'PARABRISAS', nombre: 'Limpia parabrisas lado derecho no funciona' },
  { cat: 'PARABRISAS', nombre: 'Limpia parabrisas izquierdo no funciona' },
  { cat: 'PARABRISAS', nombre: 'Desempañador no funciona' },

  // OPTICAS
  { cat: 'OPTICAS', nombre: 'Óptica delantera lado izquierdo sucia, fisurada o en mal estado' },
  { cat: 'OPTICAS', nombre: 'Óptica delantera lado derecho sucia, fisurada o en mal estado' },
  { cat: 'OPTICAS', nombre: 'Óptica trasera lado izquierdo sucia, fisurada o en mal estado' },
  { cat: 'OPTICAS', nombre: 'Óptica trasera lado derecho sucia, fisurada o en mal estado' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de posición lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de posición lado derecho no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de posición delantera lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de posición delantera lado derecho no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de posición trasera lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de posición trasera lado derecho no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de giro delantera lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de giro delantera lado derecho no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de giro trasera lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de giro trasera lado derecho no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de freno izquierda no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de freno derecha no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz alta izquierda no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz alta derecha no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz baja lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz baja lado derecho no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de retroceso lado izquierdo no funciona' },
  { cat: 'OPTICAS', nombre: 'Óptica de luz de retroceso lado derecho no funciona' },

  // MODULO DE REGISTRO DE OPERACIONES
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Modulo registro de operaciones memoria llena' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones no emite señal sonora y luminosa de limite de velocidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Modulo registro de operaciones suelto' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Disco diagrama de velocidad mal colocado o al revés' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones descalibrado' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones desprogramado en fecha y hora' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones calibrado en mas de 90km/h / Adulterado / Descalibrado en velocidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones no funciona / no funciona correctamente / no registra' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'No presenta módulo registro de operaciones' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones apagado / Desconectado / encendido antes del control' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Disco diagrama de velocidad vencido' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Disco diagrama de velocidad sobreimpreso / sobregrabados / reimpresos' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Disco diagrama de velocidad registra excesos de velocidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Modulo registro de operaciones emite ticket incompleto / no imprime / no se lee / no tiene tinta la impresora' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'No tiene discos diagrama de velocidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Disco diagrama de velocidad sin datos identificatorios' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Ticket sin datos identificatorios de la unidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Ticket registra excesos de velocidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones sin papel para imprimir ticket' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones no emite señal luminosa de limite de velocidad' },
  { cat: 'MODULO DE REGISTRO DE OPERACIONES', nombre: 'Módulo registro de operaciones no emite señal sonora de limite de velocidad' },

  // MODALIDAD NO AUTORIZADA
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio especial, realiza un viaje regular diferencial' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio especial, realiza un viaje regular ordinario' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio regular diferencial, realiza un viaje regular ordinario' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio regular diferencial, realiza un viaje especial' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio regular ordinario, realiza un viaje especial' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio regular ordinario, realiza un viaje regular diferencial' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio especial restringido, realiza un viaje regular diferencial' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio especial restringido, realiza un viaje regular ordinario' },
  { cat: 'MODALIDAD NO AUTORIZADA', nombre: 'Vehículo habilitado para prestar servicio especial restringido, realiza un viaje especial' },
  
  // LIBRETA DE TRABAJO
  { cat: 'LIBRETA DE TRABAJO', nombre: 'No presenta libreta de trabajo' },
  { cat: 'LIBRETA DE TRABAJO', nombre: 'Libreta de trabajo incompleta' },
  { cat: 'LIBRETA DE TRABAJO', nombre: 'No cumple con las horas de descanso' },
  { cat: 'LIBRETA DE TRABAJO', nombre: 'En la libreta figura día franco y el conductor se encuentra trabajando' },
  { cat: 'LIBRETA DE TRABAJO', nombre: 'Libreta de trabajo vencida' },
  { cat: 'LIBRETA DE TRABAJO', nombre: 'Libreta de trabajo sobrecompleta' },
  { cat: 'LIBRETA DE TRABAJO', nombre: 'Elementos falsos o con errores inexcusables en la libreta de trabajo' },

  // LISTA DE PASAJEROS
  { cat: 'LISTA DE PASAJEROS', nombre: 'Lista de Pasajeros (Contrato con el usuario) - No la presenta' },
  { cat: 'LISTA DE PASAJEROS', nombre: 'Lista de Pasajeros (Contrato con el usuario) - Incompleta' },

  // INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte se prestó con anterioridad a la hora oficial' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte no se prestó' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte se prestó con demora mayor a 15 minutos' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte se prestó con demora menor a 15 minutos' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'Presta servicio en horario no autorizado por la Autoridad de Aplicación' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte no se prestó-Intermedia' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte se prestó con demora mayor a 15 minutos-Intermedia' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte se prestó con demora menor a 15 minutos-Intermedia' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El horario autorizado por la Secretaría de Transporte se prestó con anterioridad a la hora oficial-Intermedia' },
  { cat: 'INCUMPLIMIENTO DE HORARIOS Y FRECUENCIAS', nombre: 'El servicios arriba a terminal con una demora mayor a 30 minutos' },
  
  // LETREROS
  { cat: 'LETREROS', nombre: 'No presenta letrero exterior 0800 - número telefónico de cobro revertido para efectuar consultas y reclamos' },
  { cat: 'LETREROS', nombre: 'No presenta letrero interior 0800 - número telefónico de cobro revertido para efectuar consultas y reclamos' },
  { cat: 'LETREROS', nombre: 'No presenta cartelería exterior' },
  { cat: 'LETREROS', nombre: 'No presenta cartelería interior' },
  { cat: 'LETREROS', nombre: 'No presenta razón social' },
  { cat: 'LETREROS', nombre: 'Cartelería interior incompleta' },
  { cat: 'LETREROS', nombre: 'No posee cartelería de modalidad y categoría del servicio' },
  { cat: 'LETREROS', nombre: 'No presenta Cartel de Velocidad Máxima' },
  { cat: 'LETREROS', nombre: 'No presenta cartelería indicando destino' },
  { cat: 'LETREROS', nombre: 'Publicidad o letreros sin autorización de la autoridad de aplicación en exterior o interior de los vehículos' },
  { cat: 'LETREROS', nombre: 'Pintado de cristales en puertas, ventanillas y parabrisas, pintado de símbolos patrios, nacionales y/o extranjeros' },
  { cat: 'LETREROS', nombre: 'No presenta bandas reflectivas' },

  // ILUMINACION
  { cat: 'ILUMINACION', nombre: 'Luz de posicion lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de posicion lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de posicion delantera lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de posicion delantera lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de posicion trasera lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de posicion trasera lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces de posicion traseras no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luces de posicion delanteras no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luces de posicion traseras lado izquierdo no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luces de posicion traseras lado derecho no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luz de giro delantera lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de giro delantera lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de giro trasera lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de giro trasera lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces de giro traseras no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luces de giro delanteras no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luz de freno izquierda no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de freno derecha no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces de freno no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Tercera luz de freno no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz alta izquierda no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz alta derecha no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces altas no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luz baja lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz baja lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces bajas no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luz de retroceso lado izquierdo no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luz de retroceso lado derecho no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces de retroceso no funcionan' },
  { cat: 'ILUMINACION', nombre: '1 luz de gran porte no funciona' },
  { cat: 'ILUMINACION', nombre: 'Luces de gran porte no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luces interiores no funcionan' },
  { cat: 'ILUMINACION', nombre: 'Luz de escalera no funciona' },
  { cat: 'ILUMINACION', nombre: 'Sistema Eléctrico con cables sueltos' },
  { cat: 'ILUMINACION', nombre: 'Plafones de luces interiores sueltos, fisurados o en mal estado' },
  
  // AIRE ACONDICIONADO
  { cat: 'AIRE ACONDICIONADO', nombre: 'Calefaccion no funciona/mal estado' },
  { cat: 'AIRE ACONDICIONADO', nombre: 'Aire acondicionado no funciona/mal estado' },
  { cat: 'AIRE ACONDICIONADO', nombre: 'Ventilacion no funciona/mal estado' },
  { cat: 'AIRE ACONDICIONADO', nombre: 'Boquillas sueltas o en malas condiciones' },
  // ALCOHOLEMIA
  { cat: 'ALCOHOLEMIA', nombre: 'El conductor presenta alcohol en sangre (Positivo)' },
  // ASIENTOS
  { cat: 'ASIENTOS', nombre: 'No presenta cinturon de seguridad del conductor o el mismo se encuentra en mal estado' },
  { cat: 'ASIENTOS', nombre: 'No presenta cinturon de seguridad /cinturón en mal estado' },
  { cat: 'ASIENTOS', nombre: 'Asiento del conductor en mal estado' },
  { cat: 'ASIENTOS', nombre: 'Exceso Y/O Modificación-No coincide el número de asientos habilitados con el número de asientos constatados' },
  { cat: 'ASIENTOS', nombre: 'Exceso Y/O Modificación-No coincide el número de asientos en RTO con el número de asientos constatados' }, // Texto corregido (largo)
  { cat: 'ASIENTOS', nombre: 'Exceso Y/O Modificación-No coincide el número de asientos habilitados con el número de asientos en RTO' }, // Nueva agregada
  { cat: 'ASIENTOS', nombre: 'No presenta apoya cabezas/Apoya cabezas en mal estado' },
  { cat: 'ASIENTOS', nombre: 'Asientos en mal estado menos del 20 %' },
  { cat: 'ASIENTOS', nombre: 'Asientos en mal estado mas del 20 %' },
  { cat: 'ASIENTOS', nombre: 'Asientos sin apoya brazos/Apoya brazos roto o en mal estado' },
  { cat: 'ASIENTOS', nombre: 'Asientos con el sistema de reclinacion roto' },
  { cat: 'ASIENTOS', nombre: 'No presentan fundas amarillas en los primeros asientos' },
  // BOLETERIA
  { cat: 'BOLETERIA / PASAJES', nombre: 'Boleteria cerrada' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'Venta de pasajes en plataforma' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'No cumple con la devolución del monto de pasaje' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'Falta de emisión de boletos y pasajes' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'Suspensión del servicio o interrupcion (no devolucion)' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'Expendio de boletos sin adecuación a normas' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'Boleteria no presenta horarios, ni tarifas' },
  { cat: 'BOLETERIA / PASAJES', nombre: 'Boleteria no presenta carteleria 0800 Ersep' },
  // BOTIQUIN
  { cat: 'BOTIQUIN', nombre: 'No presenta botiquín' },
  { cat: 'BOTIQUIN', nombre: 'Botiquín incompleto' },
  { cat: 'BOTIQUIN', nombre: 'Presenta insumos vencidos (Botiquin)' },
  // CARNET
  { cat: 'CARNET DE CONDUCTOR', nombre: 'No presenta carnet de conducir expedido por Autoridad Aplicación' },
  { cat: 'CARNET DE CONDUCTOR', nombre: 'Carnet de conducir vencido' },
  { cat: 'CARNET DE CONDUCTOR', nombre: 'No presenta carnet de conducir (No porta)' },
  { cat: 'CARNET DE CONDUCTOR', nombre: 'Elementos falsos o con errores inexcusables en el carnet de conducir' },
  { cat: 'CARNET DE CONDUCTOR', nombre: 'El carnet de conducir no está en condiciones' },
  // CARROCERIA
  { cat: 'CARROCERIA', nombre: 'Piso en malas condiciones / Deficiencias en la carrocería piso' },
  { cat: 'CARROCERIA', nombre: 'Deficiencias en la carroceria costado y frente' },
  { cat: 'CARROCERIA', nombre: 'Pasamanos y asideros sueltos o en malas condiciones' },
  { cat: 'CARROCERIA', nombre: 'Mamparas en malas condiciones' },
  { cat: 'CARROCERIA', nombre: 'Portaequipajes sueltos o en malas condiciones' },
  { cat: 'CARROCERIA', nombre: 'Elementos desgarrantes o con cantos vivos en los asientos, parantes, revestimiento interior de la carrocería.' },
  { cat: 'CARROCERIA', nombre: 'Deficiencias en la carroceria techo' },
  { cat: 'CARROCERIA', nombre: 'Caja de Velocidad suelta o en mal estado' },
  { cat: 'CARROCERIA', nombre: 'Paneles interiores en mal estado que no afecta a la seguridad.' },
  { cat: 'CARROCERIA', nombre: 'Paneles interiores en mal estado que afecta a la seguridad.' },
  { cat: 'CARROCERIA', nombre: 'No presenta bodega/Bodega en mal estado' },
  { cat: 'CARROCERIA', nombre: 'Tapa de tanque de combustible suelta/rota/en mal estado' },
  { cat: 'CARROCERIA', nombre: 'Fuelle de la palanca de cambio roto/en mal estado' },
  { cat: 'CARROCERIA', nombre: 'Paragolpes delantero roto / en mal estado' },
  { cat: 'CARROCERIA', nombre: 'Paragolpes trasero roto / en mal estado' },
  // CUBIERTAS
  { cat: 'CUBIERTAS', nombre: 'Cubierta delantera lado izquierdo lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta delantera lado derecho lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta trasera lado izquierdo lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta trasera lado derecho lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta trasera dual externa lado izquierdo lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta trasera dual externa lado derecho lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta trasera dual interna lado izquierdo lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta trasera dual interna lado derecho lisa o en mal estado' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta delantera derecha recapada' },
  { cat: 'CUBIERTAS', nombre: 'Cubierta delantera izquierda recapada' },
  // DEFICIENCIAS MECANICAS
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Deficiencias mecánica no hacen a la seguridad' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Deficiencias mecánica hacen a la seguridad' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Llanta de rueda trasera lado derecho con fluido/aceite' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Llanta de rueda trasera lado izquierdo con fluido/aceite' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Problemas con la suspensión / Suspensión en mal estado' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Escapes en mal estado' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Embrague en mal estado' },
  { cat: 'DEFICIENCIAS MECANICAS', nombre: 'Perdida de aceite/combustible' },
  // DESOBEDIENCIA
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Desobediencia a la autoridad de control' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'No permite a la autoridad de control realizar la inspección' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Circulación de los vehículos de transporte con la puerta abierta, o en condiciones antireglamentarias' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Mal trato al inspector' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Abandono por parte del conductor -sin justa causa- de su puesto de conducción, durante la prestación del servicio' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'El personal de la prestataria no se encuentra debidamente identificado (vestimenta)' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Incumplimiento a las restricciones al tráfico - Estacionamiento en zona de circulación' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Desobediencia a la autoridad de aplicación' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Inobservancia por parte del conductor de las normas relativas a las prohibiciones de fumar o de utilizar celulares mientras se maneja' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Permaneció estacionado en plataforma más tiempo del reglamentario' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Ascenso y Descenso de pasajeros fuera de Plataforma' },
  { cat: 'DESOBEDIENCIA A LA AUTORIDAD', nombre: 'Mal trato al pasajero' },
  // DISCAPACIDAD
  { cat: 'DISCAPACIDAD', nombre: 'Incumple a la Ley N°9440, Pase Libre, Único y Universal con el titular del Pase de discapacidad' },
  { cat: 'DISCAPACIDAD', nombre: 'Incumple a la Ley N°9440, Pase Libre, Único y Universal con el acompañante del Pase de discapacidad' },
  { cat: 'DISCAPACIDAD', nombre: 'Incumplimiento de los dos primeros asientos para personas con movilidad reducida' },
  // EQUIPAJE
  { cat: 'EQUIPAJE', nombre: 'No entrega guía o comprobante de equipajes' },
  { cat: 'EQUIPAJE', nombre: 'Perdida de Equipaje (extravío)' },
  // ESPEJOS
  { cat: 'ESPEJOS RETROVISORES', nombre: 'Espejos retrovisores rotos/en mal estado' },
  { cat: 'ESPEJOS RETROVISORES', nombre: 'Espejo retrovisor izquierdo roto/en mal estado' },
  { cat: 'ESPEJOS RETROVISORES', nombre: 'Espejo retrovisor derecho roto/en mal estado' },
  { cat: 'ESPEJOS RETROVISORES', nombre: 'Espejo retrovisor interior roto/en mal estado' },
  // EXTINTOR
  { cat: 'EXTINTOR', nombre: 'Extintor sin carga' },
  { cat: 'EXTINTOR', nombre: 'Extintor con carga vencida' },
  { cat: 'EXTINTOR', nombre: 'Extintor sin certificado/oblea de carga' },
  { cat: 'EXTINTOR', nombre: 'Extintor con manómetro roto' },
  { cat: 'EXTINTOR', nombre: 'Extintor no correspondiente al tipo de unidad' },
  { cat: 'EXTINTOR', nombre: 'No presenta extintor' },
  { cat: 'EXTINTOR', nombre: 'Elementos falsos o con errores inexcusables en el certificado u oblea del extintor' },
  { cat: 'EXTINTOR', nombre: 'No presenta marbete - No cumple con la Norma IRAM 3517-2' },
  { cat: 'EXTINTOR', nombre: 'Marbete no corresponde el color - No cumple con la Norma IRAM 3517-2' },
  { cat: 'EXTINTOR', nombre: 'Extintor suelto' },
  { cat: 'EXTINTOR', nombre: 'Extintor precintado' },
  { cat: 'EXTINTOR', nombre: 'Extintor despresurizado' },
  // HIGIENE
  { cat: 'HIGIENE', nombre: 'Falta de Higiene' },
  { cat: 'HIGIENE', nombre: 'El baño no tiene agua' },
  { cat: 'HIGIENE', nombre: 'Falta higiene en cortinas' },
  { cat: 'HIGIENE', nombre: 'Falta higiene en asientos' },
  // PLANILLA DE DESINEFCCION
  { cat: 'PLANILLA DE DESINFECCION', nombre: 'No presenta planilla de desinfección' },
  { cat: 'PLANILLA DE DESINFECCION', nombre: 'Planilla de desinfección vencida' },
  { cat: 'PLANILLA DE DESINFECCION', nombre: 'Elementos falsos en planilla' },
  // R.T.O.
  { cat: 'R.T.O.', nombre: 'Elementos falsos o con errores inexcusables en el certificado de RTO' },
  { cat: 'R.T.O.', nombre: 'Certificado RTO vencido' },
  { cat: 'R.T.O.', nombre: 'No presenta certificado de RTO' },
  // RECORRIDOS Y PARADAS
  { cat: 'RECORRIDOS Y PARADAS', nombre: 'Presta servicio en tramo no autorizado' },
  { cat: 'RECORRIDOS Y PARADAS', nombre: 'Realiza ascenso/descenso en parada no autorizada' },
  { cat: 'RECORRIDOS Y PARADAS', nombre: 'No ingresa a terminal' },
  { cat: 'RECORRIDOS Y PARADAS', nombre: 'No levanta pasajeros en parada autorizada' },
  // SEGURO
  { cat: 'SEGURO', nombre: 'Cobertura de seguro vencida' },
  { cat: 'SEGURO', nombre: 'No presenta Certificado de cobertura' },
  { cat: 'SEGURO', nombre: 'Elementos falsos en cobertura' },
  // TARIFA
  { cat: 'TARIFA', nombre: 'Violacion al régimen tarifario' },
  // VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA
  { cat: 'VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA', nombre: 'Luneta trasera rota/mal estado' },
  { cat: 'VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA', nombre: 'Salidas de emergencias selladas/en mal estado' },
  { cat: 'VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA', nombre: 'Ventanillas en mal estado/fisuradas' },
  { cat: 'VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA', nombre: 'Puerta con vidrio fisurado/mal estado' },
  { cat: 'VENTANILLAS/PUERTAS/SALIDAS DE EMERGENCIA', nombre: 'Faltan martillos rompe cristales' },
    // PASAJEROS PARADOS/EXCESO DE PASAJEROS
  { cat: 'PASAJEROS PARADOS/EXCESO DE PASAJEROS', nombre: 'Transporta pasajeros de pie (E)' },
  { cat: 'PASAJEROS PARADOS/EXCESO DE PASAJEROS', nombre: 'Transporta exceso de pasajeros ( R )' },
  { cat: 'PASAJEROS PARADOS/EXCESO DE PASAJEROS', nombre: 'Pasajeros sin asientos ( RD )' },
];

// --- 3. MAPEADOR INTELIGENTE (Asignación automática) ---
const getNormativa = (categoria, nombre) => {
  // Primero buscamos coincidencias exactas por nombre (Prioridad a tus citas específicas)
  const key = nombre.trim();
  if (CASOS_ESPECIFICOS[key]) {
    return CASOS_ESPECIFICOS[key];
  }

  // Si no hay coincidencia exacta, vamos por CATEGORÍA (Reglas Generales)
  const c = categoria.toUpperCase();
  const n = nombre ? nombre.toLowerCase() : "";

  if (c.includes("AIRE")) return BIBLIOTECA_GENERAL.AIRE;
  if (c.includes("ALCOHOL")) return BIBLIOTECA_GENERAL.ALCOHOL;
  if (c.includes("ASIENTOS")) return BIBLIOTECA_GENERAL.ASIENTOS_ESTADO;
  if (c.includes("BOLETERIA") || c.includes("PASAJE")) return BIBLIOTECA_GENERAL.BOLETERIA;
  if (c.includes("BOTIQUIN")) return BIBLIOTECA_GENERAL.BOTIQUIN;
  if (c.includes("CARNET") || c.includes("CONDUCTOR")) return BIBLIOTECA_GENERAL.CARNET;
  if (c.includes("CARROCERIA")) return BIBLIOTECA_GENERAL.CARROCERIA;
  if (c.includes("CUBIERTAS")) return BIBLIOTECA_GENERAL.CUBIERTAS;
  if (c.includes("MECANICA") || c.includes("MECANICAS")) return BIBLIOTECA_GENERAL.MECANICA;
  if (c.includes("DESOBEDIENCIA")) return BIBLIOTECA_GENERAL.DESOBEDIENCIA;
  if (c.includes("DISCAPACIDAD")) return BIBLIOTECA_GENERAL.DISCAPACIDAD;
  if (c.includes("EQUIPAJE")) return BIBLIOTECA_GENERAL.EQUIPAJE;
  if (c.includes("ESPEJO")) return BIBLIOTECA_GENERAL.ESPEJOS;
  if (c.includes("EXTINTOR")) return BIBLIOTECA_GENERAL.EXTINTOR;
  if (c.includes("HIGIENE")) return BIBLIOTECA_GENERAL.HIGIENE;
  if (c.includes("HORARIO") || c.includes("FRECUENCIA")) return BIBLIOTECA_GENERAL.HORARIOS;
  if (c.includes("ILUMINACION")) return BIBLIOTECA_GENERAL.ILUMINACION;
  if (c.includes("LETRERO")) return BIBLIOTECA_GENERAL.LETREROS;
  if (c.includes("LIBRETA")) return BIBLIOTECA_GENERAL.LIBRETA;
  if (c.includes("LISTA")) return BIBLIOTECA_GENERAL.LISTA;
  if (c.includes("MODALIDAD")) return BIBLIOTECA_GENERAL.MODALIDAD;
  if (c.includes("TACOGRAFO") || c.includes("REGISTRO")) return BIBLIOTECA_GENERAL.TACOGRAFO;
  if (c.includes("MOP")) return BIBLIOTECA_GENERAL.MOP;
  if (c.includes("OPTICA")) return BIBLIOTECA_GENERAL.OPTICAS;
  if (c.includes("PARABRISAS")) return BIBLIOTECA_GENERAL.PARABRISAS;
  if (c.includes("PASAJEROS PARADOS") || c.includes("EXCESO")) return BIBLIOTECA_GENERAL.PASAJEROS;
  if (c.includes("R.T.O.") || n.includes("rto")) return BIBLIOTECA_GENERAL.RTO;
  if (c.includes("SEGURO")) return BIBLIOTECA_GENERAL.SEGURO;
  if (c.includes("DESINFECCION") || n.includes("desinfeccion")) return BIBLIOTECA_GENERAL.DESINFECCION;
  if (c.includes("RECORRIDO") || c.includes("PARADA")) return BIBLIOTECA_GENERAL.RECORRIDO;
  if (c.includes("TARIFA")) return BIBLIOTECA_GENERAL.TARIFA;
  if (c.includes("EMERGENCIA") || c.includes("VENTANILLA") || n.includes("martillo")) return BIBLIOTECA_GENERAL.EMERGENCIA;
  if (c.includes("DOCUMENTACION")) return BIBLIOTECA_GENERAL.DOCUMENTACION;

  return BIBLIOTECA_GENERAL.DEFAULT;
};

// Generamos la base final
const DB_FINAL = DB_RAW.map(item => ({
  ...item,
  ...getNormativa(item.cat, item.nombre)
}));

const LINKS = {
  drive_normativa: "https://drive.google.com/drive/folders/1kWVzVJLptvLf8U4B_jPmuaygkDhIz5Fg?usp=drive_link", 
  drive_search: "https://drive.google.com/drive/search?q=",
  gmail_base: "https://mail.google.com/mail/u/0/#search/",
  notebook: "https://notebooklm.google.com/notebook/834863cd-fdfa-446d-bfc3-4de9e4abd6da"
};

// --- APP PRINCIPAL CON SEGURIDAD Y NAVEGACIÓN ---
export default function App() {const [fontsLoaded] = useFonts({
  ...Ionicons.font,
});

// if (!fontsLoaded) {
//   return null;
// }
  // Estado de Seguridad
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Estados de la App Principal
  const [activeTab, setActiveTab] = useState('infracciones');
  const [apiKey, setApiKey] = useState('Qd8kEC6ICPCb7erJpGmocpvYNkXfm0mVKA2xOrMK'); // Estado para la API Key
  const [showConfig, setShowConfig] = useState(false);

// --- FUNCIÓN DE LOGIN ---
const handleLogin = () => {
  if (pinInput === ACCESS_PIN) {
    setIsAuthenticated(true);
  } else {
    Alert.alert("Acceso Denegado", "El PIN ingresado es incorrecto.");
    setPinInput('');
  }
};

// --- RENDERIZADO DE PANTALLAS ---
const renderScreen = () => {
  switch (activeTab) {
    case 'infracciones': return <ScreenInfracciones db={DB_FINAL} />;
    case 'herramientas': return <ScreenHerramientas />;
    case 'consultas': return <ScreenAsistente apiKey={apiKey} />;
    default: return <ScreenInfracciones db={DB_FINAL} />;
  }
};

// --- PANTALLA DE BLOQUEO (LOGIN) ---
if (!isAuthenticated) {
        return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
        <View style={styles.loginContent}>
        <Image
            source={require('./assets/icon.png')}
            style={styles.loginLogoImage}
            resizeMode="contain"
          />          <Text style={styles.loginTitle}>APP - Ayudante de Inspección</Text>
          <Text style={styles.loginSubtitle}>Uso exclusivo personal autorizado</Text>
          
        
          <View style={styles.pinBox}>
            <TextInput 
              style={styles.pinInput}
              placeholder="Ingrese PIN"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              value={pinInput}
              onChangeText={setPinInput}
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
            <Text style={styles.btnLoginText}>INGRESAR</Text>
          </TouchableOpacity>
          
          <Text style={styles.loginFooter}>Córdoba - 2025</Text>
          <Text style={styles.loginFooter}>Diseño y Desarrollo: L. Ramallo</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- APP PRINCIPAL (SI ESTÁ LOGUEADO) ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
{/* HEADER CORREGIDO */}
<View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Inspección</Text>
            <Text style={styles.headerSubtitle}>TRANSPORTE</Text>
          </View>
        </View>
      </View>
      
      {/* CONFIGURACIÓN (Desplegable) */}
      {showConfig && (
        <View style={styles.configBox}>
          <Text style={styles.configTitle}>Configuración del Asistente</Text>
          <Text style={styles.label}>API Key (Cohere):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Clave API..." 
            secureTextEntry 
            value={apiKey}
            onChangeText={setApiKey} 
          />
          <TouchableOpacity 
            style={styles.btnConfig}
            onPress={() => { setShowConfig(false); Alert.alert("Guardado", "API Key lista."); }}
          >
            <Text style={styles.btnTextConfig}>GUARDAR Y CERRAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CONTENIDO */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* BARRA DE NAVEGACIÓN: Botones grandes y claros */}
      <View style={styles.navBar}>
        <NavButton active={activeTab === 'infracciones'} onPress={() => setActiveTab('infracciones')} icon="list" label="Infracciones" />
        <NavButton active={activeTab === 'herramientas'} onPress={() => setActiveTab('herramientas')} icon="briefcase" label="Herramientas" />
        <NavButton active={activeTab === 'consultas'} onPress={() => setActiveTab('consultas')} icon="chatbubbles" label="Asistente IA" />
      </View>
    </SafeAreaView>
  );
}

// --- PANTALLA INFRACCIONES ---
function ScreenInfracciones({ db }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  // Filtrado
  const filtered = useMemo(() => {
    if (!db) return [];
    return db.filter(i => 
      (i.nombre && i.nombre.toLowerCase().includes(search.toLowerCase())) || 
      (i.cat && i.cat.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, db]);

  const categories = useMemo(() => [...new Set(filtered.map(i => i.cat))].sort(), [filtered]);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleCategory = (cat) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCat(expandedCat === cat ? null : cat);
  };

  const compartirNorma = async (texto, norma) => {
    try { await Share.share({ message: `${norma}:\n"${texto}"` }); } catch (e) {}
  };

  const isSearching = search.length > 0;

  return (
    <View style={styles.screenContainer}>
      {/* BUSCADOR: Grande, estilo "Input" claro */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
           <Ionicons name="search" size={24} color={COLORS.textLight} />
           <TextInput 
             style={styles.searchInput} 
             placeholder="Buscar infracción..." 
             value={search}
             onChangeText={setSearch}
             placeholderTextColor={COLORS.textLight}
             autoCapitalize="none"
           />
           {search.length > 0 && (
             <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
             </TouchableOpacity>
           )}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {categories.map((cat, catIndex) => {
          const isCatExpanded = isSearching || expandedCat === cat;

          return (
            <View key={catIndex} style={styles.categoryBlock}>
              {/* CABECERA DE CATEGORÍA: Estilo "Bloque" fácil de tocar */}
              <TouchableOpacity 
                onPress={() => toggleCategory(cat)} 
                activeOpacity={0.7}
                disabled={isSearching}
                style={[styles.catHeader, isCatExpanded && styles.catHeaderActive]}
              >
                <Text style={[styles.catTitle, isCatExpanded && styles.catTitleActive]}>{cat}</Text>
                {!isSearching && (
                  <Ionicons 
                    name={isCatExpanded ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color={isCatExpanded ? "white" : COLORS.secondary} 
                  />
                )}
              </TouchableOpacity>
              
              {isCatExpanded && (
                <View style={styles.itemsContainer}>
                  {filtered.filter(i => i.cat === cat).map((item, idx) => {
                    const uniqueId = `${cat}-${idx}`;
                    const isExpanded = expandedId === uniqueId;

                    return (
                      <View key={idx} style={[styles.card, isExpanded && styles.cardActive]}>
                        <TouchableOpacity onPress={() => toggleExpand(uniqueId)} activeOpacity={0.7} style={styles.cardTouchable}>
                          <View style={styles.cardHeader}>
                            <View style={{flex: 1, paddingRight: 10}}>
                              <Text style={styles.cardTitle}>{item.nombre}</Text>
                              {!isExpanded && (
                                <Text style={styles.normaPreview}>{item.norma}</Text>
                              )}
                            </View>
                            <Ionicons 
                                name={isExpanded ? "caret-up" : "caret-down"} 
                                size={20} 
                                color={isExpanded ? COLORS.primary : COLORS.border} 
                            />
                          </View>
                        </TouchableOpacity>
                        
                        {isExpanded && (
                          <View style={styles.cardBody}>
                            <View style={styles.normaBadge}>
                                <Text style={styles.normaBadgeText}>{item.norma}</Text>
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.legalText}>{item.texto}</Text>
                            </View>
                            
                            <TouchableOpacity style={styles.btnAction} onPress={() => compartirNorma(item.texto, item.norma)}>
                              <Ionicons name="copy-outline" size={20} color="white"/>
                              <Text style={styles.btnActionText}>COPIAR / COMPARTIR</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
        <View style={{height: 120}} /> 
      </ScrollView>
    </View>
  );
}

// --- PANTALLA HERRAMIENTAS (MEJORADA CON HISTORIAL) ---
function ScreenHerramientas() {
  const [patente, setPatente] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [listaAntecedentes, setListaAntecedentes] = useState([]);

  // LOGICA RTO
  const consultarRTO = async () => {
    if (!patente) return Alert.alert("Atención", "Ingresá una patente primero.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('dominio', patente);
      formData.append('enviado', 'true');
      formData.append('enviar', 'Consultar');

      const response = await fetch('https://www.cent.utn.edu.ar/rto/', {
        method: 'POST',
        body: formData,
      });

      const html = await response.text();
      setLoading(false);

      if (html.includes('Resultado de la consulta')) {
        const matchEstado = html.match(/Resultado:\s*([^<]+)/);
        let estado = matchEstado ? matchEstado[1].trim() : "Desconocido";

        const matchFecha = html.match(/Fecha Vencimiento:\s*(\d{2}\/\d{2}\/\d{4})/);
        let vencimiento = matchFecha ? matchFecha[1] : "No figura";

        const matchCert = html.match(/Certificado:\s*([^<]+)/);
        let certificado = matchCert ? matchCert[1].trim() : "-";

        Alert.alert(
            "📋 INFORME RTO",
            `Dominio: ${patente.toUpperCase()}\n\n` +
            `🔹 ESTADO: ${estado.toUpperCase()}\n` +
            `📅 VENCIMIENTO: ${vencimiento}\n` +
            `📄 CERTIFICADO: ${certificado}\n\n` +
            `(Fuente: CENT UTN)`
        );
      } else {
        Alert.alert("⚠️ SIN DATOS", "No se encontraron registros de RTO Nacional.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudo conectar con UTN.");
    }
  };

// LOGICA HABILITACION (CON LEASING, RESOLUCION Y PRECARIO)
  const verificarHabilitacion = async () => {
    if (!patente) return Alert.alert("Atención", "Escribí una patente primero.");
    setLoading(true);

    try {
      const SHEET_ID = '1qg0v-XobD3IavyObK4gVBNB56bNm6kPcDqMbpGzhZvM';
      const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

      console.log("Consultando:", SHEET_URL);

      const response = await fetch(SHEET_URL);
      const data = await response.text();

      if (data.includes('<!DOCTYPE html>')) {
        setLoading(false);
        return Alert.alert("Error", "La hoja no está pública. Revisá los permisos.");
      }

      const lineas = data.split('\n');
      const patenteBuscada = patente.toUpperCase().replace(/\s+/g, '').trim();

      const encontrado = lineas.find(linea => {
        const columnas = linea.split(',');
        if (columnas.length < 4) return false; 
        const dominioExcel = columnas[3].toUpperCase().replace(/\s+/g, '').trim();
        return dominioExcel === patenteBuscada;
      });

      setLoading(false);

      if (encontrado) {
        const col = encontrado.split(',');
        
        // --- DATOS GENERALES ---
        const empresa = col[0] || 'Desconocida';
        const modalidad = col[1] || '-';
        const tipoChapa = col[4] || '-'; 
        
        // --- FECHAS Y TIPOS ---
        const fechaResolucion = col[6] ? col[6].trim() : ''; 
        const permisoInicio = col[7] || '';        
        const permisoFin = col[8] || '';           
        
        const fechaVtoContrato = col[9] ? col[9].trim() : ''; // Columna J
        const tipoContrato = col[10] ? col[10].toUpperCase().trim() : ''; // Columna K (LEASING)

        // --- CEREBRO DE DECISIÓN (PRIORIDADES) ---
        let textoVigencia = "";

        // 1. PRIORIDAD: LEASING
        // Si dice "LEASING" en la columna K y tiene fecha en la J
        if (tipoContrato.includes('LEASING') && fechaVtoContrato.length > 5 && !fechaVtoContrato.includes('--')) {
             textoVigencia = `🤝 CONTRATO LEASING\n⏳ Vence: ${fechaVtoContrato}`;
        }
        // 2. PRIORIDAD: RESOLUCIÓN REGULAR
        // Si tiene fecha de resolución y NO es un guión
        else if (fechaResolucion && fechaResolucion.length > 5 && !fechaResolucion.includes('--')) {
             textoVigencia = `📅 Resolución: ${fechaResolucion}`;
        }
        // 3. PRIORIDAD: PRECARIO
        // Si falla todo lo anterior, mostramos fechas de permiso
        else {
             textoVigencia = `⚠️ PERMISO PRECARIO\n▶ Inicio: ${permisoInicio}\n⏹ Vence: ${permisoFin}`;
        }

        Alert.alert(
            "✅ UNIDAD HABILITADA", 
            `🏢 Empresa: ${empresa}\n` +
            `📋 Modalidad: ${modalidad}\n` + 
            `🔢 Tipo Chapa: ${tipoChapa}\n\n` +
            `${textoVigencia}`
        );

      } else {
        Alert.alert("⚠️ NO FIGURA", `El dominio ${patenteBuscada} no se encuentra en el padrón activo.`);
      }

    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudo conectar con la base de datos.");
    }
  };
    
// --- FUNCION ANTECEDENTES (Busca en la lista de infracciones) ---
  const verificarAntecedentes = async () => {
    if (!patente) return Alert.alert("Atención", "Escribí una patente primero.");
    setLoading(true);

    try {
      // ⚠️ REEMPLAZAR ESTO CON EL ID DE TU HOJA DE "ANTECEDENTES"
      const SHEET_ID_ANTECEDENTES = '1KzKUy6gUYSGBf4DNnFokzqIMc2hLWQ63db5Js4S34p0';
      const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID_ANTECEDENTES}/export?format=csv`;

      console.log("Buscando antecedentes en:", SHEET_URL);

      const response = await fetch(SHEET_URL);
      const data = await response.text();

      // Verificamos si Google nos devolvió una web de login en vez de datos
      if (data.includes('<!DOCTYPE html>')) {
        setLoading(false);
        return Alert.alert("Error de Permisos", "La hoja de antecedentes no es pública. Revisá 'Compartir > Publicar en la web'.");
      }

      const lineas = data.split('\n');
      const patenteBuscada = patente.toUpperCase().replace(/\s+/g, '').trim();
      const resultados = [];

      // Recorremos TODAS las líneas (porque puede haber varias multas para una misma patente)
      lineas.forEach((linea, index) => {
        const col = linea.split(',');
        
        // Si la línea está vacía o es muy corta, la saltamos
        if (col.length < 2) return;
        
        // Asumimos Columna A (Indice 0) es el Dominio
        const dominioExcel = col[0].toUpperCase().replace(/\s+/g, '').trim();
        
        if (dominioExcel === patenteBuscada) {
          // Guardamos los datos en un objeto limpio
          resultados.push({
            id: index.toString(), // Un ID único para la lista
            fecha: col[1] || '-',
            acta: col[2] || '-',
            estado: col[3] || 'Desconocido', // SUBSANA, INFRACCIÓN, ETC
            tipo: col[4] || '-',
            lugar: col[5] || '-',
            link: col[6] ? col[6].trim() : '' // El Link al PDF
          });
        }
});

      // --- INICIO CÓDIGO NUEVO: ORDENAR Y CORTAR ---
      
      // 1. Ordenar: Convierte "03/01/2026" a objeto fecha real para comparar bien
      resultados.sort((a, b) => {
        const partsA = a.fecha.split('/'); // separa dia, mes, año
        const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
        
        const partsB = b.fecha.split('/');
        const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
        
        return dateB - dateA; // Orden descendente (más nuevo arriba)
      });

      // 2. Cortar: Nos quedamos solo con las primeras 5
      const resultadosTop5 = resultados.slice(0, 5);
      
      // --- FIN CÓDIGO NUEVO ---

      setLoading(false);

      if (resultadosTop5.length > 0) {
        // ¡Encontramos multas! Guardamos la lista FILTRADA y abrimos la ventana
        setListaAntecedentes(resultadosTop5);
        setModalVisible(true); 
      } else {
        Alert.alert("Sin Antecedentes", `El dominio ${patenteBuscada} no registra actas en esta base.`);
      }

    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "No se pudo leer la base de antecedentes.");
    }
  };

  // LOGICA BIBLIOTECA
  const abrirBiblioteca = () => {
    const linkBiblioteca = 'https://drive.google.com/drive/folders/1kWVzVJLptvLf8U4B_jPmuaygkDhIz5Fg?usp=sharing'; 
    Linking.openURL(linkBiblioteca);
  };

  const usarHistorial = (texto) => setPatente(texto);

  return (
    <ScrollView style={styles.scroll}>
      
      <View style={styles.toolSection}>
        <View style={styles.toolHeader}>
            <Ionicons name="construct" size={28} color={COLORS.primary} />
            <Text style={styles.toolTitle}>Centro de Control</Text>
        </View>
        
        <View style={styles.inputContainerBig}>
            <TextInput 
              style={styles.inputBig} 
              placeholder="AAA123" 
              value={patente}
              onChangeText={text => setPatente(text.toUpperCase())}
              textAlign="center"
              maxLength={9}
              placeholderTextColor="#cbd5e1"
            />
        </View>

        {historial.length > 0 && (
          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10, marginTop: 10}}>
            {historial.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => usarHistorial(item)} style={{backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1', flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="time-outline" size={14} color={COLORS.textLight} style={{marginRight: 4}}/>
                <Text style={{color: COLORS.secondary, fontWeight: 'bold', fontSize: 12}}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={{gap: 15}}>
        
{/* BOTÓN ANTECEDENTES (Estilo Unificado) */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 15, 
            borderRadius: 12, 
            backgroundColor: '#475569', // Gris oscuro azulado (Slate-600)
            elevation: 3,
            marginTop: 10
          }} 
          onPress={verificarAntecedentes}
        >
          {/* Ícono de la izquierda */}
          <View style={{width: 40, alignItems: 'center'}}>
            <Ionicons name="folder-open" size={24} color="white" />
          </View>
          
          {/* Textos */}
          <View style={{flex: 1}}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              VER ANTECEDENTES
            </Text>
            <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 12}}>
              Historial de actas e infracciones
            </Text>
          </View>
          
          {/* Flechita o Spinner de carga */}
          {loading ? (
            <ActivityIndicator color="white"/> 
          ) : (
            <Ionicons name="chevron-forward" size={24} color="white" opacity={0.5} />
          )}
        </TouchableOpacity>

          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, backgroundColor: COLORS.secondary, elevation: 3}} onPress={verificarHabilitacion}>
            <View style={{width: 40, alignItems: 'center'}}><Ionicons name="checkmark-circle" size={24} color="white" /></View>
            <View style={{flex: 1}}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>VERIFICAR HABILITACIÓN</Text>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 12}}>Consulta padrón local</Text>
            </View>
            {loading ? <ActivityIndicator color="white"/> : <Ionicons name="chevron-forward" size={24} color="white" opacity={0.5} />}
          </TouchableOpacity>

          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, backgroundColor: '#0ea5e9', elevation: 3}} onPress={consultarRTO}>
            <View style={{width: 40, alignItems: 'center'}}><Ionicons name="car-sport" size={24} color="white" /></View>
            <View style={{flex: 1}}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>CONSULTAR RTO</Text>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 12}}>Consulta directa a CENT UTN</Text>
            </View>
            {loading ? <ActivityIndicator color="white"/> : <Ionicons name="wifi" size={24} color="white" opacity={0.5} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.toolSection, {marginTop: 20}]}>
        <View style={styles.toolHeader}>
            <Ionicons name="library" size={28} color={COLORS.textDark} />
            <Text style={styles.toolTitle}>Biblioteca Normativa</Text>
        </View>
        
        <TouchableOpacity 
            style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0'
            }}
            onPress={abrirBiblioteca}
        >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <View style={{backgroundColor: 'white', padding: 8, borderRadius: 8}}>
                    <Ionicons name="book" size={20} color={COLORS.textDark} />
                </View>
                <Text style={{fontWeight: 'bold', color: COLORS.textDark, fontSize: 15}}>ACCEDER A BIBLIOTECA</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.creditsBox}>
        <Text style={styles.creditsText}>Diseño y Desarrollo: L. Ramallo</Text>
        <Text style={styles.creditsSub}>Cba - 2025</Text>
      </View>

<View style={{height: 100}} /> 

      {/* --- MODAL (VENTANA EMERGENTE) DE ANTECEDENTES --- */}
      {/* PEGAR ESTO ANTES DE QUE CIERRE EL SCROLLVIEW */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)', // Fondo oscurecido
        }}>
          <View style={{
            width: '90%',
            height: '80%', // Ocupa el 80% de la pantalla
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            elevation: 10,
          }}>
            {/* Encabezado del Modal */}
            <Text style={{fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center'}}>
              📋 Historial de Actas
            </Text>
            <Text style={{fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 15}}>
              Dominio: {patente.toUpperCase()}
            </Text>
            
            {/* Lista de Multas */}
            <FlatList
              data={listaAntecedentes}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={{
                  backgroundColor: '#f8fafc',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  borderLeftWidth: 5,
                  // Color del borde según el estado (Rojo si es infracción, Verde si cumple)
                  borderLeftColor: item.estado.toUpperCase().includes('INFRAC') ? '#ef4444' : '#10b981'
                }}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold', color: '#64748b'}}>📅 {item.fecha}</Text>
                    <Text style={{fontWeight: 'bold', color: '#333'}}>#{item.acta}</Text>
                  </View>
                  
                  <Text style={{fontSize: 15, color: '#334155', marginTop: 5}}>📍 {item.lugar}</Text>
                  <Text style={{fontSize: 14, color: '#64748b'}}>🔧 {item.tipo}</Text>
                  
                  <Text style={{
                    fontWeight: '900', 
                    fontSize: 14, 
                    marginTop: 5, 
                    textTransform: 'uppercase',
                    color: item.estado.toUpperCase().includes('INFRAC') ? '#ef4444' : '#059669'
                  }}>
                    {item.estado}
                  </Text>

                  {/* Botón VER PDF (Solo si hay link) */}
                  {item.link && item.link.includes('http') && (
                    <TouchableOpacity 
                      style={{
                        marginTop: 10,
                        backgroundColor: '#3b82f6', // Azul
                        padding: 8,
                        borderRadius: 5,
                        alignItems: 'center',
                      }}
                      onPress={() => Linking.openURL(item.link)}
                    >
                      <Text style={{color: 'white', fontWeight: 'bold'}}>👁 VER PDF</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            {/* Botón CERRAR */}
            <TouchableOpacity
              style={{
                backgroundColor: '#ef4444',
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 10
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{color: 'white', fontWeight: 'bold'}}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// --- PANTALLA ASISTENTE ---
function ScreenAsistente({ apiKey }) {
  const [actaData, setActaData] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);

{/* SECCIÓN NOTEBOOKLM */}
       <View style={styles.toolSection}>
         <View style={styles.toolHeader}>
            <Ionicons name="book" size={28} color="#7c3aed" />
            <Text style={styles.toolTitle}>Manual Digital</Text>
         </View>
         <TouchableOpacity style={styles.wideBtn} onPress={() => Linking.openURL(LINKS.notebook)}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="logo-google" size={24} color={COLORS.secondary} />
                <Text style={styles.wideBtnText}>HACEME UNA PREGUNTA</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={COLORS.secondary} />
         </TouchableOpacity>
       </View>

  const generarActa = async () => {
    // 1. Validaciones básicas y LIMPIEZA DE CLAVE
    const cleanKey = apiKey.trim(); 
    
    // Instrucción actualizada para Cohere
    if(!cleanKey) return Alert.alert("Falta API Key", "Obtenela gratis en dashboard.cohere.com y pegala en el engranaje.");
    if(!actaData) return Alert.alert("Sin datos", "Escribí los datos de la infracción.");
    
    setLoading(true); 
    setRespuesta(''); 
    
    try {
               // --- PROMPT MEJORADO (INGENIERÍA DE PROMPTS) ---
        // Definimos ROL, TONO, RESTRICCIONES y FORMATO para que parezca un inspector real.
        const prompt = `
        ROL: Sos un Inspector del Ente Regulador de Servicios Publicos de la Provincia de Córdoba (Ersep).
        TAREA: Redactar UNICAMENTE el texto técnico para el campo "OBSERVACIONES" de un Acta de Constatación.
        ESTILO: Lenguaje administrativo, impersonal, punitivo, seco y técnico.
        
        REGLAS DE ORO:
        1. NO cites leyes, artículos ni decretos (eso va en otro campo).
        2. NO saludes, no expliques, no uses introducciones. Ve directo al hecho.
        3. Usá la tercera persona impersonal (Ej: "Se constata", "Se verifica", "Vehículo circula"). NUNCA uses "Yo vi" o "El conductor".
        4. Usá terminología técnica (Ej: "Neumáticos" en vez de "cubiertas", "Unidad" en vez de "colectivo", "Fisura" en vez de "rotura").
        5. NO agregues marcadores como "[COMPLETAR]" ni pidas datos faltantes. Si no se especifica ubicación o eje, redactá de forma general con lo que hay.
    6. LOCALIZACIÓN: Usá vocabulario técnico propio de la administración argentina. Evitá términos de español neutro o de España.
       - BIEN: "Baúl", "Parabrisas", "Estacionado", "Boleto", "Vereda/Banquina".
       - MAL: "Maletero", "Luna", "Aparcado", "Tiquete", "Acera".

        DATOS APORTADOS POR EL INSPECTOR: "${actaData}".

        TEXTO PARA EL ACTA:`;
        

        
        // --- CAMBIO A COHERE (IA ALTERNATIVA) ---
        // Usamos el endpoint de 'chat' de Cohere. 
        // Requiere que la clave vaya en el Header 'Authorization', no en la URL.
        const res = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cleanKey}`, // Clave va aquí
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: prompt,
                model: "command-nightly", // Actualizado a la versión Plus (más estable y vigente)
                temperature: 0.2 // Baja creatividad para ser más formal/técnico
            })
        });

        const data = await res.json();
        
        if (!res.ok) {
            // Manejo de errores específico de Cohere
            console.log("Error API Cohere:", JSON.stringify(data));
            setRespuesta(`Error (${res.status}): ${data.message || 'Verificá tu clave API'}`);
        } else {
            // Éxito: Cohere devuelve el texto en data.text
            const textoGenerado = data.text;
            setRespuesta(textoGenerado || "La IA respondió pero no generó texto.");
        }
        
    } catch(e) { 
        setRespuesta("Error de conexión: Verificá internet."); 
        console.error(e);
    } finally { 
        setLoading(false); 
    }
  };

  return (
    
    <ScrollView style={styles.scroll}>
    {/* SECCIÓN NOTEBOOKLM */}
       <View style={styles.toolSection}>
         <View style={styles.toolHeader}>
            <Ionicons name="book" size={28} color="#7c3aed" />
            <Text style={styles.toolTitle}>Manual Digital</Text>
         </View>
         <TouchableOpacity style={styles.wideBtn} onPress={() => Linking.openURL(LINKS.notebook)}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="logo-google" size={24} color={COLORS.secondary} />
                <Text style={styles.wideBtnText}>HACEME UNA PREGUNTA</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={COLORS.secondary} />
         </TouchableOpacity>
       </View>
       <View style={styles.toolSection}>
         <View style={styles.toolHeader}>
            <Ionicons name="sparkles" size={28} color="#7c3aed" />
            <Text style={styles.toolTitle}>Asistente de Redacción</Text>
         </View>
         <Text style={styles.instructionText}>
            Escribí los datos básicos de la infracción (ej: "Empresa citibus interno 40 cubierta delantera lisa") y la IA redactará el texto formal.
         </Text>

         <TextInput 
            style={styles.textArea} 
            multiline 
            placeholder="Escribí los datos aquí..." 
            value={actaData} 
            onChangeText={setActaData} 
            placeholderTextColor="#94a3b8" 
         />
         
         <TouchableOpacity style={styles.btnPrimary} onPress={generarActa} disabled={loading}>
            {loading ? <Text style={styles.btnTextPrimary}>PROCESANDO...</Text> : <Text style={styles.btnTextPrimary}>GENERAR TEXTO</Text>}
         </TouchableOpacity>

         {respuesta ? (
             <View style={styles.resultContainer}>
                 <Text style={styles.resultLabel}>TEXTO SUGERIDO:</Text>
                 <View style={styles.resultCard}>
                    <Text style={styles.resultText}>{respuesta}</Text>
                 </View>
                 <TouchableOpacity style={styles.btnSecondary} onPress={() => Share.share({message: respuesta})}>
                    <Ionicons name="copy-outline" size={18} color="white" />
                    <Text style={styles.btnTextSecondary}>COPIAR</Text>
                 </TouchableOpacity>
             </View>
         ) : null}
       </View>
       <View style={{height: 100}} /> 
    </ScrollView>
  );
}

// --- COMPONENTES AUXILIARES ---
function NavButton({ active, onPress, icon, label }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navBtn, active && styles.navBtnActive]} activeOpacity={0.6}>
      <Ionicons name={icon} size={28} color={active ? COLORS.primary : '#94a3b8'} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// --- ESTILOS MODERNOS Y ACCESIBLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.primary, elevation: 4 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 36, height: 36, backgroundColor: 'white', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { fontWeight: '900', color: COLORS.primary, fontSize: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: -2 },
  settingsBtn: { padding: 5 },

  // Config Box
  configBox: { backgroundColor: 'white', padding: 20, margin: 10, borderRadius: 12, elevation: 5, zIndex: 99 },
  configTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, fontSize: 16 },
  btnConfig: { backgroundColor: COLORS.secondary, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnTextConfig: { color: 'white', fontWeight: 'bold' },

  // Navegación Inferior (Más grande para dedos adultos)
  navBar: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 12, paddingBottom: 60 },
  navBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  navBtnActive: { borderTopWidth: 3, borderColor: COLORS.primary, paddingTop: 5 },
  navText: { fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: '600' },
  navTextActive: { color: COLORS.primary, fontWeight: 'bold' },

  // Contenido General
  content: { flex: 1 },
  scroll: { padding: 16 },
  screenContainer: { flex: 1 },

 // Buscador
  searchHeader: { 
    marginBottom: 16,
    marginTop: 20,       // Agregamos aire arriba
    marginHorizontal: 16 // Agregamos aire a los costados (lo hace menos ancho)
  },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 18, color: COLORS.secondary },

  // Acordeones y Listas
  categoryBlock: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', elevation: 1 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  catHeaderActive: { backgroundColor: COLORS.secondary },
  catTitle: { fontSize: 16, fontWeight: '800', color: COLORS.secondary, textTransform: 'uppercase' },
  catTitleActive: { color: 'white' },
  itemsContainer: { padding: 10, backgroundColor: '#f8fafc' },
  
  // Tarjetas de Items
  card: { backgroundColor: 'white', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 5, borderLeftColor: COLORS.border },
  cardActive: { borderLeftColor: COLORS.primary, borderColor: COLORS.primary, elevation: 4 },
  cardTouchable: { padding: 16, minHeight: 60, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 16, color: COLORS.secondary, lineHeight: 22 },
  normaPreview: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  
  // Detalle Expandido
  cardBody: { padding: 16, paddingTop: 0, backgroundColor: 'white' },
  normaBadge: { backgroundColor: COLORS.secondary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 12 },
  normaBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  textContainer: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  legalText: { fontSize: 16, color: '#334155', lineHeight: 24, fontStyle: 'italic' }, // Texto más grande para lectura fácil
  btnAction: { marginTop: 16, backgroundColor: COLORS.success, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8 },
  btnActionText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },

  // Herramientas (Botones Gigantes)
  toolSection: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  toolHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  toolTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
  inputContainerBig: { marginBottom: 16 },
  inputBig: { backgroundColor: '#f1f5f9', fontSize: 28, fontWeight: 'bold', textAlign: 'center', padding: 16, borderRadius: 12, letterSpacing: 3, borderWidth: 1, borderColor: COLORS.border, color: COLORS.secondary },
  gridButtons: { flexDirection: 'row', gap: 12 },
  bigBtn: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  bigBtnText: { color: 'white', fontWeight: '900', marginTop: 10, fontSize: 12 },
  bigBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  wideBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  wideBtnText: { fontWeight: '700', color: COLORS.secondary, marginLeft: 10, fontSize: 13 },
  
  // Créditos
  creditsBox: { alignItems: 'center', marginTop: 20, opacity: 0.7 },
  creditsText: { fontSize: 12, fontWeight: 'bold', color: COLORS.secondary, textTransform: 'uppercase' },
  creditsSub: { fontSize: 11, color: '#64748b' },

  // Asistente IA
  instructionText: { fontSize: 15, color: COLORS.textLight, marginBottom: 15, lineHeight: 22 },
  textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 15, height: 120, fontSize: 16, textAlignVertical: 'top', marginBottom: 15, color: COLORS.secondary },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 10, alignItems: 'center', elevation: 2 },
  btnTextPrimary: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { marginTop: 20 },
  resultLabel: { color: COLORS.primary, fontWeight: '900', fontSize: 12, marginBottom: 8 },
  resultCard: { backgroundColor: '#fff1f2', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  resultText: { fontSize: 16, color: '#334155', lineHeight: 26 },
  btnSecondary: { flexDirection: 'row', backgroundColor: COLORS.secondary, padding: 10, borderRadius: 8, alignSelf: 'flex-end', marginTop: 10, alignItems: 'center' },
  btnTextSecondary: { color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },


  // Login Styles
  loginContainer: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  loginContent: { width: '85%', backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 10 },
  loginLogoImage: {
    width: '80%',   // Que ocupe el 80% del ancho de la pantalla
    height: 120,    // Una altura fija para que se vea bien
    marginBottom: 30, // Espacio abajo antes del título
    alignSelf: 'center', // Centrado horizontalmente
  },
  loginTitle: { fontSize: 22, fontWeight: '900', color: COLORS.primary, marginBottom: 5,  textAlign: 'center'  },
  loginSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 30, textAlign: 'center'  },
  pinBox: { width: '100%', marginBottom: 20 },
  pinInput: { backgroundColor: '#f1f5f9', fontSize: 24, textAlign: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, letterSpacing: 5, fontWeight: 'bold' },
  btnLogin: { backgroundColor: COLORS.primary, width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnLoginText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loginFooter: { marginTop: 30, color: COLORS.textLight, fontSize: 12, textAlign: 'center'  },
});

