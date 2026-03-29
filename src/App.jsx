/**
 * Named export `familyData` for archive / narrative tree UIs (e.g. TreeNode).
 * Default export is delegated to App.tsx so `import App from './App'` keeps working.
 */
export { default } from './App.tsx';

export const familyData = {
  id: 'root',
  name: 'Family archive',
  children: [
    {
      id: 'alperovitz_branch',
      name: "משפחת אלפרוביץ' / קסטרל",
      children: [
        {
          id: 'I_CASTRO_1',
          name: 'Miguel Castro',
          note:
            "אבי השושלת המשפחתית. אנוס שברח מספרד והתיישב בדרום צרפת. צאצאיו נדדו לאזור וילנה והשלטונות הרוסיים שינו את השם לקסטרל/קסטרול. מאוחר יותר, כדי להתחמק מ-12 שנות גיוס לצבא הצאר, פוצלו שמות המשפחה לאלפרוביץ' וגורביץ'.",
        },
        {
          id: 'I_ANDERS_1',
          name: 'Edward Anders (Alperovitz)',
          birth: '1926',
          birthPlace: 'Liepaja',
          note:
            '🕊️ ניצול שואה. שרד לאחר שאמו אריקה התחזתה לארית. היגר לארה"ב ב-1949 והפך לפרופסור בעל שם עולמי לכימיה באוניברסיטת שיקגו (חקר מטאוריטים עבור נאס"א).',
          isSurvivor: true,
        },
        {
          id: 'I_PARTISAN_1',
          name: 'Leizer Alperovitz',
          birth: '1939',
          note:
            "🎖️🌲 ניצול שואה גיבור. בהיותו בן 4 חמק ליער נארוץ' כאשר הוריו נתפסו ונרצחו. חבר לפרטיזנים ושרד את המלחמה.",
          isSurvivor: true,
          isHero: true,
        },
        {
          id: 'boris_sonia_alperovitz',
          name: "ד\"ר בוריס וסוניה אלפרוביץ'",
          birthPlace: 'Krakes, Lithuania',
          note:
            '🕯️✡️ סוניה (לבית קוטליאר) הייתה מורה ובוריס היה רופא. נספו בקרקס (ליטא) ב-1941 יחד עם ילדיהם הקטנים דוד (10) ומקס (6).',
          isVictim: true,
        },
        {
          id: 'valeria_halperova',
          name: 'ולריה הלפרובה (רבקה)',
          birth: '1920',
          birthPlace: 'Kosice, Czechoslovakia',
          note:
            '🎗️🕊️ ניצולת שואה. שרדה את גטו קושיצה ואת מחנות אושוויץ, שטוטהוף וריגה. שוחררה על ידי צבא ארה"ב.',
          isSurvivor: true,
        },
        {
          id: 'yosef_binyamin_hannah_alperovich',
          name: "יוסף בנימין וחנה אלפרוביץ'",
          birth: '1845',
          birthPlace: 'Dolhinov',
          note:
            "אבות 'הענף האמריקאי'. ילדיהם (כמו סמואל ואיזידור) היגרו לארה\"ב והתיישבו בסיילם, מסצ'וסטס.",
        },
        {
          id: 'moshe_beila_alperovitz',
          name: "משה וביילה אלפרוביץ'",
          note: 'משה היה סבה של מירה. אשתו הייתה ביילה לבית זיידל.',
          children: [
            {
              id: 'mira',
              name: "מירה אלפרוביץ'",
              birthPlace: 'Israel',
              note:
                "נכדתו של משה אלפרוביץ'. טרגדיה משפחתית: טבעה בילדותה בבריכה של קיבוץ עין שמר.",
            },
          ],
        },
        {
          id: 'nechama_alperovich_engl',
          name: "נחמה אלפרוביץ' (אנגל)",
          birth: '1883',
          birthPlace: 'Dunilovichi',
          note:
            'בתם של שניאור זלמן אלפרוביץ\' ורבקה פלדמן. נישאה לאיזידור מאיר אנגל (חיו באנטוורפן). חלק מאחיה היגרו לפילדלפיה.',
        },
        {
          id: 'jehoshua_costrell',
          name: 'יהושע קסטרל (Jehoshua Costrell)',
          birth: '1905 (approx)',
          note:
            'חיבר את המכתב ההיסטורי ב-1983 על מקור המשפחה (מיגל קסטרו). אביו נולד בקורניץ ב-1876. משפחתו הקרובה נספתה בשואה.',
        },
      ],
    },
  ],
};
