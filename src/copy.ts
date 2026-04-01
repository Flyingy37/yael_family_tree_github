export const copy = {

  // ── צ'אט (עברית) ─────────────────────────────────────────────────────────
  chat: {
    title: "שאל/י על המשפחה",
    subtitle: "חקור/י את עץ המשפחה ליבנת-זיידמן דרך שאלות",
    placeholder: "שאל/י שאלה על המשפחה…",
    submit: "שאל/י",
    loading: "מחפש ברשומות המשפחה…",
    close: "סגירה",
    clearChat: "נקה שיחה",
    basedOn: "מבוסס על",

    // תשובות ומצבים
    noMatch:
      "לא נמצאה התאמה ברורה בגרף המשפחה. נסה/י לנסח מחדש, או בחר/י אחת מהדוגמאות למעלה.",
    error:
      "אירעה שגיאה בעת החיפוש. אנא נסה/י שוב.",

    // שאלות לדוגמה מקוטלגות
    categories: [
      {
        label: "🧬 שושלת וקשרים",
        questions: [
          "מי ההורים של יעל?",
          "מי הסבים והסבתות של יעל?",
          "כמה ילדים יש ליעל?",
          "מה ידוע על המשפחה המורחבת?",
        ],
      },
      {
        label: "📊 נתונים וסטטיסטיקות",
        questions: [
          "כמה אנשים יש בעץ?",
          "כמה דורות יש בעץ?",
          "מי האדם המבוגר ביותר?",
          "אילו ממצאי DNA קיימים?",
        ],
      },
      {
        label: "🗺️ גאוגרפיה והיסטוריה",
        questions: [
          "מאיפה הגיעה המשפחה?",
          "אילו מדינות מיוצגות בעץ?",
          "מה ידוע על עלייה לארץ?",
          "מהן מדינות מוצא השושלת?",
        ],
      },
    ],

    // תוויות מקורות
    sources: {
      graph: "רשומות גרף המשפחה",
      dna: "סיכום ראיות DNA",
      faq: "סיכום ומסמכי משפחה",
    },
  },

  // ── Chat (English) ────────────────────────────────────────────────────────
  chatEn: {
    title: "Ask about the Family",
    subtitle: "Explore the Livnat-Zaidman family tree through questions",
    placeholder: "Ask a question about the family…",
    submit: "Ask",
    loading: "Searching family records…",
    close: "Close",
    clearChat: "Clear chat",
    basedOn: "Based on",

    noMatch:
      "No clear match found in the family graph. Try rephrasing, or choose one of the examples above.",
    error:
      "An error occurred while searching. Please try again.",

    categories: [
      {
        label: "🧬 Lineage & Relations",
        questions: [
          "Who are Yael's parents?",
          "Who are Yael's grandparents?",
          "How many children does Yael have?",
          "What is known about the extended family?",
        ],
      },
      {
        label: "📊 Data & Analytics",
        questions: [
          "How many people are in the tree?",
          "How many generations does the tree span?",
          "Who is the oldest person in the tree?",
          "What DNA matches exist?",
        ],
      },
      {
        label: "🗺️ Geography & History",
        questions: [
          "Where did the family come from?",
          "Which countries are represented in the tree?",
          "What is known about immigration to Israel?",
          "What are the family's countries of origin?",
        ],
      },
    ],

    sources: {
      graph: "Family graph records",
      dna: "DNA evidence summary",
      faq: "Family summaries & documents",
    },
  },

  // ── עץ המשפחה הכללי ───────────────────────────────────────────────────────
  tree: {
    // מצב ריק
    emptyTitle: "עוד לא נוסף אף אחד",
    emptyDescription:
      "הוסף/י את האדם הראשון והתחל/י לבנות את עץ המשפחה ליבנת-זיידמן.",
    emptyStateCTA: "הוסף אדם ראשון",

    // כפתורי פעולה
    addPerson: "הוסף אדם",
    edit: "עריכה",
    remove: "הסרה",
    save: "שמירה",
    cancel: "ביטול",
    viewProfile: "צפייה בפרופיל",
  },

  // ── דיאלוג מחיקה ─────────────────────────────────────────────────────────
  deleteDialog: {
    // השתמש/י ב-{name} לשם האדם
    title: (name: string) => `להסיר את ${name}?`,
    description:
      "הפעולה תסיר אותו/ה לצמיתות מעץ המשפחה. לא ניתן לבטל.",
    confirm: "הסר/י",
    cancel: "השאר/י",
  },

  // ── קבלת פנים / אונבורדינג ───────────────────────────────────────────────
  welcome: {
    title: "ברוכ/ה הבא/ה לעץ משפחת ליבנת-זיידמן",
    description:
      "גלה/י קשרים, עיין/י בהיסטוריה המשפחתית, ועכשיו — שאל/י שאלות על המשפחה במילים שלך.",
    cta: "בואו נתחיל",
  },
};
