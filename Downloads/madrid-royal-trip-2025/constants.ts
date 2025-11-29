

import { TripDay, EventType, Traveler } from './types';

export const TRIP_NAME = "MADRID: THE ROYAL TRIP 2025";
export const TRIP_DATES = "04.12 - 08.12";
export const HOTEL_NAME = "Catalonia Gran Vía";
export const DRIVE_LINK = "https://drive.google.com/drive/folders/1oJFpVcGRQAwLgax6C56DvPtwDnvrUaGN?usp=sharing";

// Booking Details
export const FLIGHT_CODE = "MQL8OE";
export const HOTEL_CONFIRMATION = "4765.219.200";
export const HOTEL_PIN = "6333";
export const TOTAL_PRICE_ESTIMATE = "₪5,586";

// Game Ticket Details (Viagogo)
export const GAME_TICKET = {
    orderNumber: "630151567",
    section: "619 - Categoría 3",
    row: "12",
    seats: "6 - 8",
    price: "€333.73",
    location: "Estadio Santiago Bernabeu"
};

export const TRAVELERS: Traveler[] = [
  { name: "יעל", role: "Organizer", icon: "👩🏻‍🏫" }, // Dark hair variant
  { name: "רחל", role: "Friend", icon: "👩🏻‍💼" }, // Dark hair variant
  { name: "גיא", role: "דימותן", icon: "👨🏻‍⚕️" }, // Health worker (Radiographer), Dark hair
  { name: "ירון", role: "דימותן", icon: "👨🏼‍⚕️" } // Health worker (Radiographer), Light hair
];

export const ITINERARY: TripDay[] = [
  {
    date: "04.12",
    dayName: "יום חמישי",
    theme: "Landing & Lights",
    events: [
      {
        id: "d1-1",
        time: "06:15",
        title: "המראה מתל אביב (LY395)",
        description: "טרמינל 3. נחיתה במדריד (T4S) ב-10:45.",
        type: EventType.FLIGHT,
        notes: `⚠️ מידע חשוב:
• הגעה לנתב״ג: חובה להגיע 3 שעות לפני (03:15).
• דרכון: לוודא בתוקף לחצי שנה לפחות.
• צ'ק-אין: מומלץ לעשות באתר אל-על 24 שעות לפני.

🎒 לא לשכוח לארוז:
• מטען ומתאם חשמל (למרות שספרד זהה לארץ, כדאי).
• ביגוד חם: מעיל טוב, צעיף, כפפות (קר במדריד!).
• נעלי הליכה נוחות (הולכים המון).
• תרופות, משככי כאבים ומרשמים.
• מצב רוח מלכותי! 👑`
      },
      {
        id: "d1-2",
        time: "10:45",
        title: "נחיתה במדריד",
        description: "איסוף ע״י Colon Tours. הנהג ימתין עם שלט באולם הנכנסים (T4S).",
        type: EventType.TRANSPORT,
        contactPhone: "+34910000000",
        paymentStatus: 'PAID',
        paymentLink: "https://sis.redsys.es/sis/pagoTarjeta;jsessionid=0000EQdyolsUEsHQ46Wm32Vx9F9:1hkof70u7",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Madrid_Barajas_Airport_terminal_4.jpg/1280px-Madrid_Barajas_Airport_terminal_4.jpg" // Iconic Barajas T4 Yellow Beams
      },
      {
        id: "d1-3",
        time: "13:30",
        title: "צ׳ק-אין במלון: Catalonia Gran Vía",
        description: "קבלת חדרים והתארגנות. לחץ לצפייה באישור ההזמנה.",
        location: "Gran Vía, Madrid",
        coords: [40.4196, -3.6983],
        type: EventType.HOTEL,
        link: DRIVE_LINK, // Link to confirmation file in drive
        image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/183296766.jpg?k=7563d76755490218705001397753634026330055743130541738733235655513&o=&hp=1" // Catalonia Gran Via Exterior Corner View
      },
      {
        id: "d1-granvia",
        time: "16:30",
        title: "היכרות עם הגראן ויה (Gran Vía)",
        description: "טיול רגלי לאורך השדרה המרכזית והפעימה של מדריד.",
        location: "Gran Vía",
        coords: [40.4203, -3.7058], // Near Callao/Schweppes
        type: EventType.ACTIVITY,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Gran_V%C3%ADa_%28Madrid%29_16.jpg/1280px-Gran_V%C3%ADa_%28Madrid%29_16.jpg", // Iconic Gran Via with Schweppes
        notes: `🏙️ גראן ויה - השדרה שלא נחה
• היסטוריה: בנייתה החלה ב-1910 והסתיימה ב-1931 כפרויקט מודרניזציה ענק לחיבור העיר.
• ארכיטקטורה: שימו לב לבניין מטרופוליס (בפינת אלקלה) ולבניין קפיטול עם שלט ה-Schweppes המפורסם.
• גלגול: בעבר כונתה "ברודוויי של מדריד" עם המוני בתי קולנוע, שכיום הפכו לחנויות דגל של מותגים בינלאומיים.`
      },
      {
        id: "d1-plaza",
        time: "17:30",
        title: "פלאסה דה אספניה (Plaza de España)",
        description: "הכיכר המפורסמת שבסוף הגראן ויה, למרגלות מגדל מדריד ובניין אספניה.",
        location: "Plaza de España",
        coords: [40.4233, -3.7121],
        type: EventType.ACTIVITY,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Monumento_a_Cervantes_%28Madrid%29_02.jpg/1280px-Monumento_a_Cervantes_%28Madrid%29_02.jpg", // Plaza de Espana Madrid with Cervantes & Edificio Espana
        notes: `🇪🇸 שימו לב:
זוהי פלאסה דה אספניה של מדריד (לא זו עם התעלות מסביליה).
הכיכר כוללת:
• אנדרטה ענקית למיגל דה סרוואנטס.
• פסלי ארד של דון קיחוטה וסנצ'ו פנזה.
• מוקפת גורדי שחקים היסטוריים (Edificio España ומגדל מדריד).`
      },
      {
        id: "d1-4",
        time: "18:00",
        title: "סיור עצמאי: אורות הכריסמס",
        description: "הליכה לאורך הגראן ויה המקושטת באורות חג המולד המרהיבים של מדריד.",
        location: "Gran Vía",
        coords: [40.4200, -3.7000],
        type: EventType.ACTIVITY,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Navidad_en_la_calle_Alcal%C3%A1_%28Madrid%29_02.jpg/1280px-Navidad_en_la_calle_Alcal%C3%A1_%28Madrid%29_02.jpg" // Specific Madrid Christmas Lights
      }
    ]
  },
  {
    date: "05.12",
    dayName: "יום שישי",
    theme: "History & Taberna",
    events: [
      {
        id: "d2-1",
        time: "10:00",
        title: "סיור בעברית (Plaza Mayor)",
        description: "יוצאים מ-Plaza Mayor. סיור היסטורי מרתק בלב העיר העתיקה.",
        location: "Plaza Mayor",
        coords: [40.4154, -3.7074],
        type: EventType.ACTIVITY,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Plaza_Mayor_de_Madrid_02.jpg/1280px-Plaza_Mayor_de_Madrid_02.jpg", // Iconic Plaza Mayor Red Buildings
        notes: `🏛️ פלאסה מאיור (Plaza Mayor)
• מבנה: כיכר מלבנית המוקפת מבנים אדומים בני 3 קומות עם 237 מרפסות.
• היסטוריה: נבנה במאה ה-17. שימשה בעבר לשווקים, חגיגות מלכותיות ואפילו הוצאות להורג.
• במרכז: פסל ארד של המלך פליפה השלישי.
• כיום: לב תיירותי פועם עם בתי קפה, אמני רחוב ושווקי כריסמס.`
      },
      {
        id: "d2-2",
        time: "12:00",
        title: "הארמון המלכותי (Palacio Real)",
        description: "ביקור בארמון המלכותי הגדול ביותר באירופה, מקום מגוריה הרשמי של משפחת המלוכה.",
        location: "Calle de Bailén",
        coords: [40.4179, -3.7143],
        type: EventType.ACTIVITY,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Palacio_Real_de_Madrid_-_Fachada_sur.jpg/1280px-Palacio_Real_de_Madrid_-_Fachada_sur.jpg", // Palacio Real South Facade
        notes: `👑 הארמון המלכותי של מדריד
• היסטוריה: נבנה (1738-1764) בהוראת המלך פליפה ה-5 במקום ארמון אלקסר שנשרף.
• גודל: הארמון הגדול באירופה עם למעלה מ-3,400 חדרים!
• שימוש: כיום משמש לטקסים רשמיים (המשפחה גרה בארמון סרסואלה הצנוע יותר).
• טיפ: אל תפספסו את חדר הכס, נשקיית המלך והמטבח המלכותי.`
      },
      {
        id: "d2-3",
        time: "14:30",
        title: "מנוחת צהריים",
        description: "סיאסטה או מנוחה בפארק",
        type: EventType.FREE_TIME,
      },
      {
        id: "d2-4",
        time: "20:00",
        title: "ארוחת ערב: Taberna Más Al Sur",
        description: "טאפאס ויין באווירה מקומית ושמחה.",
        location: "Calle Santa Isabel 35",
        coords: [40.4106, -3.6994],
        type: EventType.FOOD,
        link: "https://tabernamasalsur.com/",
        contactPhone: "+34910234767",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/17/28/7e/38/comedor.jpg" // Authentic Taberna Interior
      }
    ]
  },
  {
    date: "06.12",
    dayName: "יום שבת",
    theme: "The Classic Day",
    events: [
      {
        id: "d3-1",
        time: "10:00",
        title: "שוק סן מיגל",
        description: "Mercado de San Miguel - קולינריה משובחת וטאפאסים גורמה.",
        coords: [40.4156, -3.7090],
        type: EventType.FOOD,
        link: "https://mercadodesanmiguel.es/en/",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Mercado_de_San_Miguel%2C_Madrid%2C_Espa%C3%B1a%2C_2022-10-06%2C_DD_11.jpg/1280px-Mercado_de_San_Miguel%2C_Madrid%2C_Espa%C3%B1a%2C_2022-10-06%2C_DD_11.jpg" // Mercado San Miguel
      },
      {
        id: "d3-2",
        time: "13:00",
        title: "פארק רטירו (ארמון הקריסטל)",
        description: "ארמון הזכוכית שנבנה ב-1887 ע״י ריקארדו ולסקז בוסקו. שימש במקור כחממה אקזוטית וכיום מציג תערוכות אמנות מודרנית.",
        location: "El Retiro Park",
        coords: [40.4136, -3.6820],
        type: EventType.ACTIVITY,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Palacio_de_Cristal_del_Retiro_Madrid_05.jpg/1280px-Palacio_de_Cristal_del_Retiro_Madrid_05.jpg", // Crystal Palace with Lake Reflection
        notes: `🏰 ארמון הקריסטל (Palacio de Cristal)
• מיקום: בלב פארק בואן רטירו, על שפת האגם.
• היסטוריה: נבנה ב-1887 לתצוגת צמחים מהפיליפינים.
• אדריכלות: מבנה ויקטוריאני מרהיב של ברזל וזכוכית.
• כיום: שלוחה של מוזיאון ריינה סופיה (כניסה לרוב חינם).`
      },
      {
        id: "d3-3",
        time: "19:00",
        title: "ערב חופשי",
        description: "בילוי באזור Santa Ana",
        coords: [40.4146, -3.7003],
        type: EventType.FREE_TIME,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Plaza_de_Santa_Ana_%28Madrid%29_01.jpg/1280px-Plaza_de_Santa_Ana_%28Madrid%29_01.jpg" // Plaza Santa Ana Atmosphere
      }
    ]
  },
  {
    date: "07.12",
    dayName: "יום ראשון",
    theme: "THE BIG GAME",
    events: [
      {
        id: "d4-1",
        time: "10:00",
        title: "שוק הפשפשים",
        description: "El Rastro - השוק המפורסם של יום ראשון. עתיקות, בגדים ומציאות.",
        coords: [40.4086, -3.7073],
        type: EventType.SHOPPING,
        link: "https://www.esmadrid.com/en/tourist-information/el-rastro",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/El_Rastro_de_Madrid_-_Ribera_de_Curtidores.jpg/1280px-El_Rastro_de_Madrid_-_Ribera_de_Curtidores.jpg" // El Rastro Crowd
      },
      {
        id: "d4-3",
        time: "18:00",
        title: "ארוחת ערב: AMAZÓNICO",
        description: "חוויה קולינרית בג'ונגל העירוני. מסעדה אופנתית ויוקרתית. כולם יחד.",
        location: "Calle de Jorge Juan, 20",
        coords: [40.4238, -3.6872],
        type: EventType.FOOD,
        link: "https://restauranteamazonico.com/",
        contactPhone: "+34915154332",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/0e/77/8c/75/amazonic.jpg" // Amazonico Interior
      },
      {
        id: "d4-4",
        time: "19:45",
        title: "ערב של חוויות",
        description: "מתפצלים לערב בלתי נשכח - כל אחד והאהבה שלו...",
        type: EventType.ACTIVITY,
      },
      {
        id: "d4-5",
        time: "20:00",
        title: "Real Madrid CF vs RC Celta de Vigo",
        description: "הקרב על הברנבאו! ריאל מדריד מארחת את סלטה ויגו.",
        attendees: ["גיא", "ירון"],
        coords: [40.4530, -3.6883],
        type: EventType.SPORT,
        link: "https://www.realmadrid.com/en-US/football/match-center",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bernabeu-as-seen-from-highest-point-of-stadium.jpg/1280px-Bernabeu-as-seen-from-highest-point-of-stadium.jpg", // Bernabeu Pitch View
        notes: `🏟️ אצטדיון סנטיאגו ברנבאו (המחודש)
• תכולה: כ-85,000 צופים
• פיצ'ר מיוחד: גג נסגר, מסך 360° וכר דשא מתקפל
• חובה: להגיע שעה לפני לשירת ההמנון 'Hala Madrid'!

⚽ ריאל מדריד vs סלטה ויגו
• היסטוריה: שליטה מוחלטת של ריאל במפגשי הבית
• שחקנים למעקב: ויניסיוס ג'וניור, קיליאן אמבפה, ג'וד בלינגהאם
• המלצה: להביא צעיף!`
      },
      {
        id: "d4-6",
        time: "20:00",
        title: "דרינק ושופינג יוקרתי בסלמנקה",
        description: "בזמן שגיא וירון נוסעים למשחק, רחל ואני קורעות את רחוב Serrano ושכונת סלמנקה! מותגי יוקרה, חנויות בוטיק, קוקטיילים וזמן איכות. קורעות את הרחוב... וגם את כרטיסי האשראי! 💸 :)",
        attendees: ["יעל", "רחל"],
        coords: [40.4286, -3.6868], // Updated coords to Salamanca center
        type: EventType.SHOPPING, // Changed to SHOPPING for Rose color
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Calle_de_Serrano_%28Madrid%29_01.jpg/1280px-Calle_de_Serrano_%28Madrid%29_01.jpg" // Serrano Shopping Street
      }
    ]
  },
  {
    date: "08.12",
    dayName: "יום שני",
    theme: "Adios Madrid",
    events: [
      {
        id: "d5-1",
        time: "09:00",
        title: "איסוף לשדה",
        description: "איסוף מהלובי ע״י Colon Tours.",
        type: EventType.TRANSPORT,
        contactPhone: "+34910000000",
        paymentStatus: 'PAID',
        paymentLink: "https://sis.redsys.es/sis/pagoTarjeta;jsessionid=0000EQdyolsUEsHQ46Wm32Vx9F9:1hkof70u7"
      },
      {
        id: "d5-2",
        time: "13:15",
        title: "המראה לישראל (LY396)",
        description: "טרמינל 4S. נחיתה בתל אביב ב-18:55.",
        type: EventType.FLIGHT,
      },
      {
        id: "d5-3",
        time: "18:55",
        title: "נחיתה בבית",
        description: "נתב״ג, תל אביב",
        type: EventType.FLIGHT,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ben_Gurion_International_Airport_Terminal_3_Rotunda.jpg/1200px-Ben_Gurion_International_Airport_Terminal_3_Rotunda.jpg" // Ben Gurion Terminal 3 Rotunda
      }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `
You are a smart, friendly, and Hebrew-speaking travel assistant for a group trip to Madrid.
The group consists of Yael, Rachel, Guy, and Yaron.
Guy and Yaron are Radiographers (דימותנים).
They are staying at the Catalonia Gran Vía from Dec 4th to Dec 8th, 2025.

Here is their itinerary:
- Dec 4 (Thu): Landing 10:45, Hotel Check-in 13:30, Discovering Gran Via 16:30, Plaza de Espana 17:30, Christmas lights tour 18:00.
- Dec 5 (Fri): Hebrew tour at Plaza Mayor 10:00, Royal Palace visit 12:00, Siesta, Dinner at Taberna Más Al Sur 20:00.
- Dec 6 (Sat): Mercado San Miguel 10:00, Retiro Park (Crystal Palace) 13:00, Free evening at Santa Ana 19:00.
- Dec 7 (Sun): El Rastro Market 10:00, Dinner at Amazonico 18:00.
  - Important: At 19:45 they split. Guy and Yaron go to Real Madrid vs Celta game. Yael and Rachel go for luxury shopping and drinks in Salamanca.
- Dec 8 (Mon): Pickup 09:00, Flight LY396 at 13:15 (T4S).

Your Goal:
1. Answer questions about the schedule.
2. Provide recommendations for food, drinks, or quick stops near their current location in the itinerary.
3. Help with Spanish phrases if asked.
4. Keep answers concise and helpful for mobile users.
5. ALWAYS answer in Hebrew unless asked otherwise.
`;