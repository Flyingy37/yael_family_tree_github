

import type { Practice } from '../types';

export const practices: Practice[] = [
  {
    id: 'reading-comprehension-zubbles',
    title: 'הבנת הנקרא: הסיפור של בועות צבעוניות',
    skill: 'comprehension',
    difficulty: 'hard',
    readingText: `In the world of toys, where new ideas lose their charm alarmingly quickly, a small bottle containing soapy liquid used to blow bubbles has been a constant favorite since the 1940s. According to one current industry estimate, 200 million bottles of bubble liquid are sold annually. Tim Kehoe, a toy inventor from St. Paul, Minnesota, dreamed of taking the classic, transparent bubble one step further. He devoted eleven years of his life to creating colored bubbles – bubbles of a single vibrant hue, be it green, blue, or pink.

The realization of Kehoe's dream proved to be no simple undertaking. In the process, he stained his car, several bathtubs, and a few dozen children. He ruined kitchen countertops and corporate conference tables, and caused a chemical fire or two. Eventually, he succeeded in making colored bubbles with a dye that could be washed off skin and clothing, but market research showed that the product was still not ready. Even temporary stains horrified parents. Unfortunately for Kehoe, in the history of organic chemistry no one had ever created a a water-soluble dye that faded spontaneously.

Kehoe called in Dr. Ram Sabnis, one of a handful of experts on dye chemistry in the world. Sabnis, who eventually solved the problem, says the project was the most difficult he had ever worked on. "Nobody has made this chemistry before. We have synthesized a whole new class of dyes." Zubbles, the product of Sabnis and Kehoe's collaboration, appeared on the market in 2009 – to the delight of bubble lovers big and small.`,
    sections: [
      {
        title: 'חלק ג׳: הבנת הנקרא (Reading Comprehension)',
        timeLimitSeconds: 900, // 15 minutes
        questions: [
          {
            id: 'rc-zubbles-1',
            text: 'An appropriate title for this text would be -',
            options: [
              'The Hazards of Inventing Toys',
              'Zubbles: A Classic Toy Reinvented',
              'How Kehoe and Sabnis Revolutionized the Toy Market',
              'Spontaneous Fading: Water-Soluble Dyes',
            ],
            correctAnswerIndex: 1,
            explanation: 'הטקסט כולו מתמקד בהמצאת ה-Zubbles, שלוקחת את משחק הבועות הקלאסי והופכת אותו לצבעוני. כותרת זו מסכמת את הנושא המרכזי בצורה הטובה ביותר.',
            hint: 'חשבי על הרעיון המרכזי של כל הטקסט. האם הוא עוסק בסכנות באופן כללי, בשוק הצעצועים, בכימיה של צבעים, או בסיפור של מוצר ספציפי?',
          },
          {
            id: 'rc-zubbles-2',
            text: "Why was Kehoe's initial version of colored bubbles not ready for the market?",
            options: [
              "The colors were not vibrant enough.",
              "It was too expensive to produce.",
              "Parents were worried about stains, even temporary ones.",
              "The bubbles didn't last long enough.",
            ],
            correctAnswerIndex: 2,
            explanation: 'הטקסט מציין במפורש: "Even temporary stains horrified parents", מה שהוביל למסקנה שהמוצר עדיין לא מוכן לשוק.',
            hint: 'הפסקה השנייה מסבירה את הבעיה עם הגרסה הראשונה של הבועות הצבעוניות. מה הייתה התגובה של ההורים?',
          },
          {
            id: 'rc-zubbles-3',
            text: 'What was the main chemical challenge in creating the final version of Zubbles?',
            options: [
              'Finding a dye that was bright enough.',
              'Creating a non-toxic soapy liquid.',
              'Developing a dye that was affordable.',
              'Making a water-soluble dye that faded on its own.',
            ],
            correctAnswerIndex: 3,
            explanation: 'הטקסט מדגיש כי "in the history of organic chemistry no one had ever created a water-soluble dye that faded spontaneously." זו הייתה הבעיה המרכזית שדרשה מומחה.',
            hint: 'בסוף הפסקה השנייה, הטקסט מציין בעיה כימית ספציפית שאיש לא פתר לפני כן. מהי?',
          },
          {
            id: 'rc-zubbles-4',
            text: "According to the text, what was Dr. Ram Sabnis's role in the project?",
            options: [
              'He funded the project.',
              'He marketed the product to toy companies.',
              'He solved the complex dye chemistry problem.',
              'He invented the original idea for colored bubbles.',
            ],
            correctAnswerIndex: 2,
            explanation: 'הטקסט מציג את ד"ר סבניס כמומחה לכימיה של צבעים ש-Kehoe פנה אליו, ושהוא "eventually solved the problem".',
            hint: 'הפסקה השלישית מסבירה מדוע Kehoe פנה לד"ר סבניס ומה הייתה תרומתו.',
          },
          {
            id: 'rc-zubbles-5',
            text: 'The word "undertaking" in the second paragraph most nearly means:',
            options: ['a promise', 'a project', 'a surprise', 'a company'],
            correctAnswerIndex: 1,
            explanation: 'בהקשר זה, "undertaking" מתייחס למשימה או לפרויקט הגדול של יצירת בועות צבעוניות, שהתברר כלא פשוט.',
            hint: 'קראי את המשפט: "The realization of Kehoe\'s dream proved to be no simple undertaking." המילה מתארת את מימוש החלום. איזו מהאפשרויות מתאימה ביותר לתיאור "מימוש חלום" כמשימה?',
          },
        ],
      },
    ],
  },
  {
    id: 'restatements-tech-impact',
    title: 'תרגול ניסוח מחדש: השפעת הטכנולוגיה',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק ה׳: ניסוח מחדש (Restatements)',
        timeLimitSeconds: 360, // 6 minutes
        questions: [
          {
            id: 'rs-tech-1',
            text: 'Original: "Despite its benefits, the proliferation of social media has been linked to a rise in anxiety among teenagers."',
            options: [
              'The rise in anxiety among teenagers is solely caused by the benefits of social media.',
              'Social media has spread among teenagers, and this is associated with increased anxiety, even though it has advantages.',
              'Teenagers with anxiety are using social media more, despite its lack of benefits.',
              'The benefits of social media are the main reason for its proliferation among anxious teenagers.',
            ],
            correctAnswerIndex: 1,
            explanation: 'משפט זה שומר על כל חלקי המידע: היתרונות (advantages/benefits), ההתפשטות (proliferation/spread), והקשר לעלייה בחרדה (linked to a rise in anxiety/associated with increased anxiety).',
            hint: 'פרקי את המשפט המקורי: 1. למדיה חברתית יש יתרונות. 2. היא נפוצה מאוד. 3. יש קשר בינה לבין עלייה בחרדה. איזו תשובה מכילה את כל שלושת החלקים?',
          },
          {
            id: 'rs-tech-2',
            text: 'Original: "The advent of artificial intelligence is poised to revolutionize numerous industries, from healthcare to transportation."',
            options: [
              'Artificial intelligence has already revolutionized the healthcare and transportation industries.',
              'Many industries, such as healthcare and transportation, are expected to be dramatically changed by the arrival of artificial intelligence.',
              'Only the healthcare and transportation industries will be changed by artificial intelligence.',
              'Artificial intelligence is a revolution that started in the healthcare and transportation industries.',
            ],
            correctAnswerIndex: 1,
            explanation: '"Poised to" פירושו "עומד ל-" או "צפוי ל-", ומתורגם היטב כ-"are expected to". "Revolutionize" מתורגם כ-"dramatically changed". "Advent" מתורגם כ-"arrival". המשפט שומר על המשמעות של שינוי עתידי ודרמטי.',
            hint: 'שימי לב לזמן הפועל. "is poised to" מתייחס לעתיד. חפשי תשובה שגם היא מדברת על ציפייה לשינוי, ולא על שינוי שכבר קרה.',
          },
          {
            id: 'rs-tech-3',
            text: 'Original: "While streaming services offer unprecedented convenience, they have also contributed to the decline of traditional movie theaters."',
            options: [
              'Streaming services are convenient because traditional movie theaters are in decline.',
              'Traditional movie theaters have declined, but streaming services offer a convenient alternative.',
              'The unparalleled ease of use of streaming services has played a part in the downturn of conventional cinemas.',
              'If streaming services were less convenient, traditional movie theaters would not be in decline.',
            ],
            correctAnswerIndex: 2,
            explanation: '"Unprecedented convenience" מנוסח מחדש כ-"unparalleled ease of use". "Contributed to" מנוסח כ-"played a part in". "Decline" מנוסח כ-"downturn", ו-"traditional movie theaters" כ-"conventional cinemas". המשמעות נשמרת במדויק.',
            hint: 'המשפט המקורי מציג שני צדדים: נוחות של סטרימינג (צד חיובי) וירידה בקולנוע (צד שלילי). חפשי תשובה שמציגה את הקשר הסיבתי הזה (הנוחות תרמה לירידה).',
          },
        ],
      },
    ],
  },
  {
    id: 'sentence-completion-mixed-1',
    title: 'Advanced Vocabulary: Mixed Topics',
    skill: 'vocabulary',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 420, // 7 questions * 60 seconds
        questions: [
          {
            id: 'sc-mix1-1',
            text: 'The culinary term chiffonade refers to vegetables that have been shredded or __________ into strips.',
            options: ['sliced', 'sipped', 'stored', 'switched'],
            correctAnswerIndex: 0,
            explanation: 'Chiffonade is a slicing technique in which leafy green vegetables are cut into long, thin strips. "Sliced" is the correct verb.',
            hint: 'Think about how you prepare vegetables for a salad. Which word describes cutting them into thin pieces?',
          },
          {
            id: 'sc-mix1-2',
            text: '__________ of smallpox, a highly contagious disease, killed 300 million people in the 20th century alone.',
            options: ['Adversaries', 'Diversions', 'Epidemics', 'Proclamations'],
            correctAnswerIndex: 2,
            explanation: 'An epidemic is a widespread occurrence of an infectious disease in a community at a particular time. This fits the context of smallpox killing millions.',
            hint: 'The sentence describes a widespread, deadly disease. Which word describes such an event?',
          },
          {
            id: 'sc-mix1-3',
            text: 'Machinery must be well maintained or it will eventually fall into ________.',
            options: ['disinterest', 'disrepair', 'distaste', 'discomfort'],
            correctAnswerIndex: 1,
            explanation: 'Disrepair is a state of being broken or in poor condition. If machinery is not maintained, it will fall into disrepair.',
            hint: 'What is the state of something that is broken and needs fixing?',
          },
          {
            id: 'sc-mix1-4',
            text: 'The Brazilian Coffee House, which opened in New York City in 1919, encouraged customers to __________ at their tables and take the time to enjoy their coffee.',
            options: ['linger', 'sparkle', 'shudder', 'contend'],
            correctAnswerIndex: 0,
            explanation: 'To linger means to stay in a place longer than necessary. This fits the context of taking time to enjoy coffee.',
            hint: 'The coffee house wanted people to relax and not rush. Which verb means to stay for a while?',
          },
          {
            id: 'sc-mix1-5',
            text: "The most direct means of reducing a country's budget deficit, and the only one that has an immediate __________ , is to restrict imports.",
            options: ['inquiry', 'concern', 'revision', 'impact'],
            correctAnswerIndex: 3,
            explanation: 'An impact is a marked effect or influence. Restricting imports would have an immediate effect on the budget deficit.',
            hint: 'The sentence talks about a direct and immediate effect. Which word means "effect"?',
          },
          {
            id: 'sc-mix1-6',
            text: 'The Lesotho Highlands Water Project has been __________ as an outstanding example of water sharing between countries.',
            options: ['praised', 'guarded', 'traced', 'joined'],
            correctAnswerIndex: 0,
            explanation: 'To praise something is to express warm approval or admiration. The project is described as an "outstanding example," so it would be praised.',
            hint: 'How would you describe something that is an "outstanding example"? You would express approval.',
          },
          {
            id: 'sc-mix1-7',
            text: 'Fifteenth-century French artist Jean Fouquet painted realistic rather than __________ portraits of people.',
            options: ['integrated', 'idealized', 'neglected', 'negotiated'],
            correctAnswerIndex: 1,
            explanation: 'Idealized means represented as perfect or better than in reality. This is the opposite of "realistic," which fits the "rather than" structure.',
            hint: 'The sentence contrasts "realistic" with another style. What is the opposite of showing something as it truly is?',
          },
        ],
      },
    ],
  },
  {
    id: 'reading-comprehension-coffee',
    title: 'הבנת הנקרא: המסע של הקפה',
    skill: 'comprehension',
    difficulty: 'hard',
    readingText: `The story of coffee is a rich and fascinating journey that spans centuries and continents. According to a popular legend, the energizing effects of coffee were first discovered in the 9th century by an Ethiopian goat herder named Kaldi. He noticed that his goats became so spirited after eating berries from a particular tree that they did not want to sleep at night. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him alert through the long hours of evening prayer. The abbot shared his discovery with the other monks, and knowledge of the energizing berries began to spread.

As word moved east and coffee reached the Arabian Peninsula, it began a journey that would bring it to the rest of the world. The Arabs were the first to cultivate coffee and begin its trade. By the 15th century, coffee was being grown in Yemen, and by the 16th century, it was known in Persia, Egypt, Syria, and Turkey. Coffee was not only enjoyed in homes but also in the many public coffee houses — called “qahveh khaneh” — which began to appear in cities across the Near East. These coffee houses became important social hubs, where people could gather to drink coffee, listen to music, play chess, and engage in lively conversation.

European travelers to the Near East brought back stories of an unusual dark black beverage. By the 17th century, coffee had made its way to Europe and was becoming popular across the continent. Some people reacted to this new beverage with suspicion or fear, calling it the “bitter invention of Satan.” Despite the controversy, coffee houses were quickly becoming centers of social activity and communication in the major cities of England, Austria, France, Germany, and Holland. In London, these establishments were known as “penny universities” because, for the price of a penny, a person could purchase a cup of coffee and engage in stimulating conversation with the city’s greatest minds.

Today, coffee is a global commodity. The plant is cultivated in over 70 countries, primarily in the equatorial regions of the Americas, Southeast Asia, India, and Africa. Brazil is the world's largest producer of coffee. The beverage has become a mainstay of the modern diet, and the coffee house remains a powerful force for social connection and intellectual exchange, just as it was centuries ago in the bustling cities of the Near East.`,
    sections: [
      {
        title: 'חלק ג׳: הבנת הנקרא (Reading Comprehension)',
        timeLimitSeconds: 900, // 15 minutes
        questions: [
          {
            id: 'rc-coffee-1',
            text: 'What is the main purpose of this text?',
            options: [
              'To argue that coffee is the most important global commodity.',
              'To describe the history and spread of coffee from its origins to the present day.',
              'To explain the chemical process that gives coffee its energizing effects.',
              'To compare the coffee cultures of the Near East and Europe.',
            ],
            correctAnswerIndex: 1,
            explanation: 'הטקסט עוקב אחר מסלולו של הקפה באופן כרונולוגי, החל מהאגדה על גילויו באתיופיה, דרך התפשטותו בעולם הערבי, הגעתו לאירופה, וכלה במעמדו כיום. המטרה העיקרית היא לספר את הסיפור ההיסטורי הזה.',
            hint: 'שימי לב למבנה הטקסט. איך הוא מאורגן? האם הוא מתמקד בנושא אחד או עוקב אחר התפתחות לאורך זמן?',
          },
          {
            id: 'rc-coffee-2',
            text: 'According to the legend mentioned in the first paragraph, who first discovered the effects of coffee?',
            options: [
              'An abbot in a monastery.',
              'A group of monks.',
              'A goat herder named Kaldi.',
              'European travelers.',
            ],
            correctAnswerIndex: 2,
            explanation: 'הפסקה הראשונה מספרת במפורש את האגדה על רועה העיזים האתיופי, קלדי, שהבחין בהשפעת פולי הקפה על העיזים שלו.',
            hint: 'התשובה לשאלה זו נמצאת ישירות בפסקה הראשונה. חפשי את הסיפור על גילוי הקפה.',
          },
          {
            id: 'rc-coffee-3',
            text: 'Why were coffee houses in London known as “penny universities”?',
            options: [
              'Because they were the first official universities in London.',
              'Because you could buy a university degree there for a penny.',
              'Because they were places where students gathered to drink coffee before exams.',
              'Because for a small price, one could access stimulating intellectual conversations.',
            ],
            correctAnswerIndex: 3,
            explanation: 'הפסקה השלישית מסבירה שבמחיר של פני אחד (מחיר כוס קפה), אנשים יכלו להשתתף בשיחות אינטלקטואליות מעוררות, ובכך לקבל סוג של "השכלה" או ידע.',
            hint: 'חשבי על המשמעות של כל מילה בכינוי: "פני" ו"אוניברסיטאות". מה הקשר בין מחיר זול לבין מוסד להשכלה גבוהה בהקשר של בית קפה?',
          },
          {
            id: 'rc-coffee-4',
            text: 'In the second paragraph, the term "social hubs" most nearly means:',
            options: [
              'Private clubs for wealthy merchants.',
              'Markets for trading coffee beans.',
              'Central points of activity and gathering.',
              'Quiet places for religious worship.',
            ],
            correctAnswerIndex: 2,
            explanation: 'המילה "hub" מתארת מרכז של פעילות. בהקשר של בתי הקפה, הם היו מרכזים חברתיים שבהם אנשים נפגשו לפעילויות שונות כמו שיחה, מוזיקה ומשחקים.',
            hint: 'קראי את המשפט שבו מופיע המונח. אילו פעילויות התרחשו בבתי הקפה? האם הן מרמזות על מקום מרכזי ומלא פעילות או על מקום שקט ומבודד?',
          },
          {
            id: 'rc-coffee-5',
            text: 'What can be inferred from the text about the initial reaction to coffee in Europe?',
            options: [
              'It was universally accepted as a healthy drink.',
              'It was met with some resistance and suspicion.',
              'It was only consumed by the clergy and monks.',
              'It was immediately popular among all social classes.',
            ],
            correctAnswerIndex: 1,
            explanation: 'הפסקה השלישית מציינת שחלק מהאנשים הגיבו בחשדנות ופחד, ואף כינו את הקפה "ההמצאה המרה של השטן". מכאן ניתן להסיק שהייתה התנגדות ראשונית.',
            hint: 'חפשי בפסקה השלישית תיאורים של האופן שבו האירופאים קיבלו את פני המשקה החדש. האם כולם קיבלו אותו בברכה?',
          },
        ],
      },
    ],
  },
  {
    id: 'restatements-koalas',
    title: 'תרגול ניסוח מחדש: קואלות',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: ניסוח מחדש (Restatements)',
        timeLimitSeconds: 360, // 3 questions * 120 seconds
        questions: [
          {
            id: 'rs-k-1',
            text: 'Original: "Like other marsupials, a koala mother carries its baby in a pouch."',
            options: [
              'A koala mother carries its young in a pouch, similarly to other marsupials.',
              'Koalas are different from other marsupials as a koala mother carries its baby in a pouch.',
              'The only marsupials that carry their young in a pouch are koala mothers.',
              'Like all marsupials, koala mothers carry their babies in a pouch.',
            ],
            correctAnswerIndex: 3,
            explanation: '"Like other marsupials" מציין תכונה שמשותפת לקואלות וליונוקי כיס אחרים. התשובה הנכונה מנסחת זאת מחדש בצורה הדומה ביותר במשמעותה.',
            hint: "חפשי את המשפט ששומר על המשמעות המקורית של דמיון בין קואלות ליונקי כיס אחרים.",
          },
          {
            id: 'rs-k-2',
            text: 'Original: "The koala is an arboreal herbivorous marsupial native to Australia."',
            options: [
              'Koalas from Australia are carnivores that live in trees.',
              'Native to Australia, the koala is a plant-eating marsupial that lives in trees.',
              'Koalas are the only marsupials native to Australia.',
              'All animals native to Australia are herbivorous marsupials.',
            ],
            correctAnswerIndex: 1,
            explanation: '"arboreal" פירושו "שוכן עצים", ו-"herbivorous" פירושו "צמחוני". תשובה זו מסדרת מחדש את המשפט תוך שמירה על כל המידע המקורי.',
            hint: 'פרקי את תיאורי הקואלה במשפט המקורי: היכן היא חיה? מה היא אוכלת? מאיפה היא?',
          },
          {
            id: 'rs-k-3',
            text: 'Original: "Koalas typically inhabit open eucalypt woodlands, and the leaves of these trees make up most of their diet."',
            options: [
              "The diet of koalas, who live in eucalypt woodlands, consists mainly of eucalyptus leaves.",
              "Koalas eat wood from eucalyptus trees because it is their only habitat.",
              "Open woodlands are the only place to find eucalyptus leaves for the koalas' diet.",
              "Koalas live in various woodlands but prefer to eat eucalyptus leaves.",
            ],
            correctAnswerIndex: 0,
            explanation: '"make up most of their diet" מנוסח מחדש כ-"consists mainly of". "inhabit open eucalypt woodlands" מנוסח מחדש כ-"who live in eucalypt woodlands".',
            hint: 'איזה משפט משלב בצורה נכונה את מקום המגורים של הקואלה ואת המרכיב העיקרי בתזונה שלה?',
          },
        ],
      },
    ],
  },
  {
    id: 'rust-removal-1',
    title: 'The Change in Hamilton High School',
    skill: 'comprehension',
    difficulty: 'hard',
    readingText: `by Ron Sinclair
Hamilton is a very small American town. Five years ago, the town had a problem. There were only 50 students in Hamilton High School. So the mayor decided to close the school and send the students to a school in another town.

However, the principal of Hamilton High School, David Clark, wanted the students to stay in Hamilton. He thought of a project that could help him solve the problem and get more students for his school. He knew that students from many countries around the world want to study in America. So he decided to invite them to study in his school and live with families in the town.

David Clark's project has been very successful. Hamilton High School stayed open, and during the last five years, 60 students from different countries have come to the town. They study in Hamilton school for one year and most of them enjoy their stay.

However, for some students, like Vanessa Simon from France, the first two months were not easy. "When I arrived in Hamilton, I found out there was no cellphone service and no shopping mall. I was very unhappy," she said. "But now I am glad I came. I get lots of help with my studies and I have many friends from all over the world". Today, Hamilton High School has 100 students. David Clark is sure that the school will have more students next year.`,
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 240, // 4 questions * 60 seconds
        questions: [
          {
            id: 'sc1',
            text: 'Because there were only 50 students, the mayor decided to ______ the school.',
            options: ['open', 'close', 'arrive', 'solve'],
            correctAnswerIndex: 1,
            explanation: 'המשפט הראשון מסביר שהיו רק 50 תלמידים, ולכן (So) ראש העיר החליט לסגור את בית הספר.',
            hint: 'מה ההיגיון אומר שיקרה לבית ספר עם מעט מאוד תלמידים?',
          },
          {
            id: 'sc2',
            text: 'The principal, David Clark, thought of a ______ that could help him solve the problem.',
            options: ['country', 'family', 'project', 'school'],
            correctAnswerIndex: 2,
            explanation: 'המנהל חשב על פרויקט כדי לפתור את הבעיה.',
            hint: 'איזו מילה מתארת תוכנית פעולה מאורגנת כדי להשיג מטרה?',
          },
          {
            id: 'sc3',
            text: 'David Clark is ______ that the school will have more students next year.',
            options: ['sure', 'unhappy', 'easy', 'open'],
            correctAnswerIndex: 0,
            explanation: 'המשפט האחרון בטקסט אומר: "David Clark is sure that the school will have more students...".',
          },
          {
            id: 'sc4',
            text: 'For Vanessa, the first two months were not ______ because there was no cellphone service.',
            options: ['successful', 'different', 'open', 'easy'],
            correctAnswerIndex: 3,
            explanation: 'הטקסט מציין שהחודשיים הראשונים "were not easy" ומסביר מדוע (בלי קליטה ובלי קניון).',
          },
        ],
      },
      {
        title: 'חלק ב׳: ניסוח מחדש (Restatements)',
        timeLimitSeconds: 360, // 3 questions * 120 seconds
        questions: [
          {
            id: 'rs1',
            text: 'Original: "He knew that students from many countries around the world want to study in America."',
            options: [
              "He wanted to know if students study in America.",
              "He was aware of the global interest in studying in the U.S.",
              "He studied with students from many countries in America.",
              "He wants students to know about his country, America."
            ],
            correctAnswerIndex: 1,
            explanation: 'He knew = He was aware; students from many countries... want to study = the global interest in studying.',
            hint: "חפשי מילים נרדפות ל-'knew' ול-'want to study from many countries'.",
          },
          {
            id: 'rs2',
            text: 'Original: "However, for some students, like Vanessa Simon from France, the first two months were not easy."',
            options: [
              "Vanessa Simon found the first two months difficult, and she was not the only one.",
              "All students from France found the first two months easy.",
              "Vanessa Simon was the only student who found the first two months difficult.",
              "After two months, Vanessa Simon found her studies were not easy."
            ],
            correctAnswerIndex: 0,
            explanation: 'for some students (עבור כמה תלמידים) + like Vanessa (כמו ונסה) = אומר שהיא דוגמה לקבוצה, ולכן היא לא היחידה. not easy = difficult.',
            hint: "שימי לב למילים 'for some students, like Vanessa'. מה זה אומר על ונסה ביחס לשאר התלמידים?",
          },
          {
            id: 'rs3',
            text: 'Original: "Today, Hamilton High School has 100 students."',
            options: [
              "The school had 100 students in the past.",
              "The school wants to have 100 students.",
              "The school currently has 100 students.",
              "The school will have 100 students in the future."
            ],
            correctAnswerIndex: 2,
            explanation: 'Today = currently (כיום, נכון לעכשיו).',
          },
        ],
      },
      {
        title: 'חלק ג׳: הבנת הנקרא (Reading Comprehension)',
        timeLimitSeconds: 900, // 15 minutes for the whole section
        questions: [
          {
            id: 'rc1',
            text: 'What is the main purpose of this text?',
            options: [
              "To describe Vanessa Simon's difficult time in America.",
              "To explain how a principal's project saved a small-town school.",
              "To complain about the lack of cellphone service in Hamilton.",
              "To compare high schools in France and America."
            ],
            correctAnswerIndex: 1,
            explanation: 'זו הרעיון המרכזי. הטקסט מציג בעיה (סגירה) ופתרון (הפרויקט) שהציל את בית הספר. שאר האפשרויות הן פרטים קטנים או לא נכונים.',
            hint: 'הטקסט מתחיל בבעיה (סגירת בית הספר) וממשיך בפתרון. מהי המטרה העיקרית של טקסט כזה?',
          },
          {
            id: 'rc2',
            text: 'Why did the mayor decide to close the school?',
            options: [
              "Because David Clark invited foreign students.",
              "Because the principal, David Clark, wanted to leave.",
              "Because the town was too small for a school.",
              "Because there were very few students attending it."
            ],
            correctAnswerIndex: 3,
            explanation: 'הטקסט אומר במפורש שהיו "only 50 students" (רק 50 תלמידים).',
            hint: 'התשובה נמצאת במפורש בפסקה הראשונה. מהי הסיבה שצוינה שם?',
          },
          {
            id: 'rc3',
            text: "What was David Clark's project?",
            options: [
              "To build a shopping mall and get cellphone service.",
              "To send Hamilton's students to study in other countries.",
              "To bring international students to study in Hamilton.",
              "To open a new school in a different town."
            ],
            correctAnswerIndex: 2,
            explanation: 'הפסקה השנייה מסבירה שהוא החליט "invite them (students from many countries) to study in his school".',
          },
          {
            id: 'rc4',
            text: 'Why was Vanessa Simon unhappy when she first arrived?',
            options: [
              "She did not have any friends from all over the world.",
              "The school was too small and had only 50 students.",
              "She missed her family in France.",
              "The town did not have a mall or cellphone service."
            ],
            correctAnswerIndex: 3,
            explanation: 'ונסה אמרה במפורש: "...I found out there was no cellphone service and no shopping mall. I was very unhappy".',
          },
          {
            id: 'rc5',
            text: 'How does Vanessa feel today?',
            options: [
              "She is glad she came because she gets help and has friends.",
              "She is still unhappy and wants to go back to France.",
              "She is happy because Hamilton now has a shopping mall.",
              "She is worried the school will close next year."
            ],
            correctAnswerIndex: 0,
            explanation: 'בסוף דבריה היא אומרת: "But now I am glad I came. I get lots of help... and I have many friends".',
          },
        ],
      },
    ],
  },
  {
    id: 'confusing-words-1',
    title: 'Confusing Words: Inventor, Investigator, Investor',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 240,
        questions: [
          {
            id: 'cw1-1',
            text: 'The police ______ is looking for clues at the crime scene.',
            options: ['inventor', 'investigator', 'investor', 'interviewer'],
            correctAnswerIndex: 1,
            explanation: 'Investigator הוא אדם שחוקר, כמו בלש משטרה שמחפש רמזים.',
          },
          {
            id: 'cw1-2',
            text: 'The ______ is looking for partners to fund his new company.',
            options: ['inventor', 'investigator', 'investor', 'involvement'],
            correctAnswerIndex: 2,
            explanation: 'Investor הוא אדם שמשקיע כסף בעסק כדי להרוויח.',
          },
          {
            id: 'cw1-3',
            text: 'Thomas Edison was a famous ______ who created the light bulb.',
            options: ['inventor', 'investigator', 'investor', 'interval'],
            correctAnswerIndex: 0,
            explanation: 'Inventor הוא אדם שממציא משהו חדש, כמו נורה.',
          },
          {
            id: 'cw1-4',
            text: 'She decided to ______ her savings in the stock market.',
            options: ['investigate', 'involve', 'invent', 'invest'],
            correctAnswerIndex: 3,
            explanation: 'הפועל invest פירושו להשקיע כסף במשהו כדי להרוויח.',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-1',
    title: 'Word Families: Municipal & Migrate',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 240,
        questions: [
          {
            id: 'wf1-1',
            text: 'A city or town that has its own local government is called a ______.',
            options: ['municipal', 'municipality', 'mission', 'migration'],
            correctAnswerIndex: 1,
            explanation: 'Municipality היא שם עצם המתאר עיר או יישוב עם ממשל מקומי.',
          },
          {
            id: 'wf1-2',
            text: 'The government is giving extra funds to ______ libraries.',
            options: ['municipal', 'municipality', 'minor', 'modern'],
            correctAnswerIndex: 0,
            explanation: 'Municipal הוא שם תואר המשמש לתיאור משהו שקשור לעיר, כמו "ספריות עירוניות".',
          },
          {
            id: 'wf1-3',
            text: 'Many birds ______ to warmer countries in the winter.',
            options: ['migrate', 'migration', 'mineral', 'mission'],
            correctAnswerIndex: 0,
            explanation: 'Migrate הוא פועל שפירושו לעבור מאזור אחד לאחר.',
          },
          {
            id: 'wf1-4',
            text: 'The annual ______ of geese is a spectacular sight.',
            options: ['migrate', 'migration', 'nationwide', 'naval'],
            correctAnswerIndex: 1,
            explanation: 'Migration היא שם עצם שפירושו פעולת הנדידה.',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-2',
    title: 'Word Families: Philosophy & Possible',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'wf2-1',
            text: 'Socrates was a famous Greek ______ who asked many questions.',
            options: ['philosophy', 'philosopher', 'philosophic', 'performer'],
            correctAnswerIndex: 1,
            explanation: 'Philosopher הוא אדם שעוסק בפילוסופיה. כאן אנחנו צריכים את האיש.',
          },
          {
            id: 'wf2-2',
            text: 'The class discussed the ______ of ethics.',
            options: ['philosophy', 'philosopher', 'philosophic', 'platform'],
            correctAnswerIndex: 0,
            explanation: 'Philosophy הוא שם העצם של תחום הלימוד.',
          },
          {
            id: 'wf2-3',
            text: 'He approached the problem with a calm, ______ attitude.',
            options: ['philosophy', 'philosopher', 'philosophic', 'positive'],
            correctAnswerIndex: 2,
            explanation: 'Philosophic הוא שם תואר שמתאר את הגישה (attitude).',
          },
          {
            id: 'wf2-4',
            text: 'Is it ______ to finish this work by tomorrow?',
            options: ['possible', 'possibility', 'potential', 'predator'],
            correctAnswerIndex: 0,
            explanation: 'Possible הוא שם תואר שפירושו שמשהו ניתן לביצוע.',
          },
          {
            id: 'wf2-5',
            text: 'There is a strong ______ that it will rain later.',
            options: ['possible', 'possibility', 'platform', 'performer'],
            correctAnswerIndex: 1,
            explanation: 'Possibility היא שם עצם שפירושה סיכוי שמשהו יקרה.',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-3',
    title: 'Word Families: Hazard, Hope, Hide',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 240,
        questions: [
          {
            id: 'wf3-1',
            text: 'Smoking is a serious health ______.',
            options: ['hazard', 'hazardous', 'harmony', 'handle'],
            correctAnswerIndex: 0,
            explanation: 'Hazard היא שם עצם שפירושו "סכנה". המשפט דורש שם עצם.',
          },
          {
            id: 'wf3-2',
            text: 'Smoking is ______ to your health.',
            options: ['hazard', 'hazardous', 'hopeful', 'hidden'],
            correctAnswerIndex: 1,
            explanation: 'Hazardous הוא שם תואר שפירושו "מסוכן". המשפט דורש שם תואר כדי לתאר את העישון.',
          },
          {
            id: 'wf3-3',
            text: 'Despite the difficulties, she remained ______ about the future.',
            options: ['hope', 'hopeful', 'hunger', 'harmonize'],
            correctAnswerIndex: 1,
            explanation: 'Hopeful הוא שם תואר שפירושו "מלאת תקווה". המשפט דורש תיאור למצבה.',
          },
          {
            id: 'wf3-4',
            text: 'The pirates buried the ______ treasure on the island.',
            options: ['hide', 'hidden', 'hope', 'hazard'],
            correctAnswerIndex: 1,
            explanation: 'Hidden הוא שם תואר שפירושו "מוסתר" או "נסתר". הוא מתאר את האוצר.',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-4',
    title: 'Word Families: Exhaust & Example',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 240,
        questions: [
          {
            id: 'wf4-1',
            text: 'After running the marathon, the runner was completely ______.',
            options: ['exhaust', 'exhausted', 'exhaustion'],
            correctAnswerIndex: 1,
            explanation: 'Exhausted הוא שם תואר (adjective) המתאר את מצבו של הרץ ("תשוש").',
          },
          {
            id: 'wf4-2',
            text: 'The runner was suffering from heat ______.',
            options: ['exhaust', 'exhausted', 'exhaustion'],
            correctAnswerIndex: 2,
            explanation: 'Exhaustion הוא שם עצם (noun) המתאר את התופעה ממנה סבל הרץ ("תשישות").',
          },
          {
            id: 'wf4-3',
            text: 'The ______ of the plan was flawless.',
            options: ['execution', 'executive', 'exemplify'],
            correctAnswerIndex: 0,
            explanation: 'Execution היא שם עצם שפירושו "ביצוע". המשפט מדבר על ביצוע התכנית.',
          },
          {
            id: 'wf4-4',
            text: "The company's chief ______ officer decided to approve the budget.",
            options: ['execution', 'executive', 'example'],
            correctAnswerIndex: 1,
            explanation: 'Executive הוא שם תואר או שם עצם המתאר מנהל או בכיר. כאן הוא מתאר את ה-officer.',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-5',
    title: 'Word Families: Devastate & Dictate',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'wf5-1',
            text: 'A ______ is a ruler who has complete power over a country.',
            options: ['dictate', 'dictator', 'dictatorship', 'disability'],
            correctAnswerIndex: 1,
            explanation: 'Dictator הוא שם עצם המתאר את האיש השליט.',
          },
          {
            id: 'wf5-2',
            text: 'North Korea is a ______. The people have no freedom.',
            options: ['dictate', 'dictator', 'dictatorship', 'destiny'],
            correctAnswerIndex: 2,
            explanation: 'Dictatorship הוא שם עצם המתאר את שיטת המשטר.',
          },
          {
            id: 'wf5-3',
            text: 'The winners of the war ______ the terms of the surrender.',
            options: ['dictate', 'dictator', 'dictatorship', 'detail'],
            correctAnswerIndex: 0,
            explanation: 'Dictate הוא פועל שפירושו להכתיב תנאים.',
          },
          {
            id: 'wf5-4',
            text: 'The news of the earthquake was ______.',
            options: ['devastate', 'devastating', 'devastation', 'destined'],
            correctAnswerIndex: 1,
            explanation: 'Devastating הוא שם תואר (adjective) שמתאר את החדשות כ"הרסניות".',
          },
          {
            id: 'wf5-5',
            text: 'The storm left a trail of ______ across the state.',
            options: ['devastate', 'devastating', 'devastation', 'disability'],
            correctAnswerIndex: 2,
            explanation: 'Devastation הוא שם עצם (noun) שפירושו "הרס".',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-7',
    title: 'Nuances: Conceive & Concern',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'wf7-1',
            text: 'Forgiveness is an important ______ in many religions.',
            options: ['concept', 'conception', 'compromise', 'concentration'],
            correctAnswerIndex: 0,
            explanation: 'Concept פירושו "מושג" או רעיון כללי. סלחנות היא מושג חשוב.',
          },
          {
            id: 'wf7-2',
            text: 'Women still often must fight the ______ that they are weaker.',
            options: ['concept', 'conception', 'concern', 'concede'],
            correctAnswerIndex: 1,
            explanation: 'Conception פירושו "תפיסה" או דעה. המשפט מדבר על התפיסה (השגויה) שנשים חלשות יותר.',
          },
          {
            id: 'wf7-3',
            text: "Timmy's teacher raised some ______ about his performance in class.",
            options: ['concerns', 'concepts', 'conceptions', 'compromises'],
            correctAnswerIndex: 0,
            explanation: 'Concern כאן פירושו "דאגה". המורה הביעה דאגה לגבי תפקודו.',
          },
          {
            id: 'wf7-4',
            text: 'My personal life is none of your ______. ',
            options: ['conception', 'concern', 'concept', 'compromise'],
            correctAnswerIndex: 1,
            explanation: 'Concern כאן פירושו "עניין" או "עסק". "החיים האישיים שלי הם לא עניינך".',
          },
          {
            id: 'wf7-5',
            text: 'Samsung is a big South Korean ______, based in Seoul.',
            options: ['concept', 'conception', 'concern', 'concession'],
            correctAnswerIndex: 2,
            explanation: 'Concern כאן פירושו "קונצרן" או "תשלובת", כלומר חברה גדולה.',
          },
        ],
      },
    ],
  },
  {
    id: 'word-families-8',
    title: 'Complex Meanings: Contract & Convene',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 360,
        questions: [
          {
            id: 'wf8-1',
            text: 'Before starting a new job, it is best to sign a ______ that specifies all the terms.',
            options: ['contraction', 'contractor', 'contract', 'convention'],
            correctAnswerIndex: 2,
            explanation: 'Contract כאן הוא שם עצם שפירושו "חוזה".',
          },
          {
            id: 'wf8-2',
            text: 'Some muscles in our bodies tend to ______ when it is cold.',
            options: ['contract', 'convene', 'contextualize', 'conceptualize'],
            correctAnswerIndex: 0,
            explanation: 'Contract כאן הוא פועל שפירושו "להתכווץ".',
          },
          {
            id: 'wf8-3',
            text: 'He was worried he might ______ the flu while traveling.',
            options: ['convene', 'contract', 'conceptualize', 'contextualize'],
            correctAnswerIndex: 1,
            explanation: 'Contract כאן הוא פועל שפירושו "להידבק במחלה".',
          },
          {
            id: 'wf8-4',
            text: 'Working from home is very ______, as you do not have to drive to work.',
            options: ['convenient', 'conventional', 'convention', 'conversation'],
            correctAnswerIndex: 0,
            explanation: 'Convenient הוא שם תואר שפירושו "נוח".',
          },
          {
            id: 'wf8-5',
            text: 'According to the ______ of the genre, romantic comedies must have happy endings.',
            options: ['convenient', 'conventional', 'convention', 'conversation'],
            correctAnswerIndex: 2,
            explanation: 'Convention כאן הוא שם עצם שפירושו "מוסכמה" או נוהג מקובל.',
          },
          {
            id: 'wf8-6',
            text: "The ______ approach to medicine does not always take into consideration the patient's mental state.",
            options: ['convenient', 'conventional', 'convention', 'conversation'],
            correctAnswerIndex: 1,
            explanation: 'Conventional הוא שם תואר שפירושו "מקובל" או "שגרתי".',
          },
        ],
      },
    ],
  },
  {
    id: 'phrasal-verbs-1',
    title: 'Phrasal Verbs: From Spoken to Formal',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'pv1-1',
            text: 'In the sentence "I am counting on you to make dinner," which word can replace "counting on"?',
            options: ['rely on', 'explode', 'relax', 'understand'],
            correctAnswerIndex: 0,
            explanation: 'To "count on" someone is a common phrasal verb that means to "rely on" them.',
          },
          {
            id: 'pv1-2',
            text: 'In the sentence "I need to understand how to solve this puzzle," which phrasal verb can replace "understand"?',
            options: ['calm down', 'figure out', 'come apart', 'blow up'],
            correctAnswerIndex: 1,
            explanation: 'To "figure out" something is a common phrasal verb that means to "understand" or find the answer.',
          },
          {
            id: 'pv1-3',
            text: 'The racing car ______ after it crashed into the fence.',
            options: ['blew up', 'calmed down', 'came apart', 'ended up'],
            correctAnswerIndex: 0,
            explanation: '"Blew up" is a phrasal verb meaning "to explode".',
          },
          {
            id: 'pv1-4',
            text: 'My nephew ______ with chicken pox this weekend.',
            options: ['came down', 'counted on', 'figured out', 'ended up'],
            correctAnswerIndex: 0,
            explanation: 'To "come down with" an illness is a phrasal verb for getting sick.',
          },
          {
            id: 'pv1-5',
            text: 'Please ______ the form with your name and address.',
            options: ['fill out', 'blow up', 'come apart', 'count on'],
            correctAnswerIndex: 0,
            explanation: '"Fill out" and "fill in" are phrasal verbs that mean to complete a form.',
          },
        ],
      },
    ],
  },
  {
    id: 'required-words-6',
    title: 'Quick Recall: Required Words - Lesson 6',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'rw6-1',
            text: 'Prices are lower when there is ______ among the stores.',
            options: ['competition', 'composer', 'campaign', 'article'],
            correctAnswerIndex: 0,
            explanation: 'Competition among stores leads to lower prices for consumers.',
          },
          {
            id: 'rw6-2',
            text: "The house's wiring is very ______.",
            options: ['complex', 'completed', 'continued', 'attention'],
            correctAnswerIndex: 0,
            explanation: 'Complex means complicated or intricate, which often describes house wiring.',
          },
          {
            id: 'rw6-3',
            text: 'She prefers Mozart and Beethoven to modern ______.',
            options: ['composers', 'armies', 'appliances', 'articles'],
            correctAnswerIndex: 0,
            explanation: 'A composer is a person who writes music. Mozart and Beethoven were famous composers.',
          },
          {
            id: 'rw6-4',
            text: 'All household ______ are now on sale.',
            options: ['appliances', 'articles', 'armies', 'competitions'],
            correctAnswerIndex: 0,
            explanation: 'Appliances are devices or pieces of equipment designed to perform a specific task, typically a domestic one.',
          },
          {
            id: 'rw6-5',
            text: 'After running a successful ______, Obama won the election.',
            options: ['campaign', 'competition', 'composer', 'article'],
            correctAnswerIndex: 0,
            explanation: 'A campaign is an organized course of action to achieve a goal, such as winning an election.',
          },
        ],
      },
    ],
  },
  {
    id: 'comparative-structures-1',
    title: 'Comparative Structures: Logic & Syntax',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'cs1-1',
            text: 'Catherine is as tall ______ her mother.',
            options: ['than', 'as', 'from', 'like'],
            correctAnswerIndex: 1,
            explanation: 'The correct structure for equality is "as...as".',
          },
          {
            id: 'cs1-2',
            text: 'Jack is taller ______ his father.',
            options: ['as', 'from', 'than', 'more'],
            correctAnswerIndex: 2,
            explanation: 'The correct structure for "greater than" with "-er" adjectives is "...-er than".',
          },
          {
            id: 'cs1-3',
            text: 'My brother and I are very different ______ each other.',
            options: ['than', 'from', 'as', 'like'],
            correctAnswerIndex: 1,
            explanation: 'The correct structure for difference is "different from".',
          },
          {
            id: 'cs1-4',
            text: 'Chimpanzees are ______ intelligent than birds.',
            options: ['as', 'less', 'more', 'like'],
            correctAnswerIndex: 2,
            explanation: 'The correct structure for "greater than" with long adjectives is "more...than".',
          },
          {
            id: 'cs1-5',
            text: 'Sandy looks just ______ her sister.',
            options: ['as', 'than', 'from', 'like'],
            correctAnswerIndex: 3,
            explanation: '"Like" is used to show similarity or equality.',
          },
        ],
      },
    ],
  },
  {
    id: 'cause-and-effect-1',
    title: 'Cause & Effect: Logical Direction',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'ce1-1',
            text: 'Aggression is often the ______ of fear and frustration. In this sentence, fear and frustration are the cause.',
            options: ['result', 'cause', 'root', 'influence'],
            correctAnswerIndex: 0,
            explanation: 'The word "result" presents the effect (aggression) which comes from the cause (fear and frustration).',
          },
          {
            id: 'ce1-2',
            text: 'Many people believe that using marijuana ______ to using other drugs. Here, marijuana is the cause.',
            options: ['stems', 'derives', 'leads', 'results'],
            correctAnswerIndex: 2,
            explanation: 'The phrase "leads to" presents the cause (marijuana) which brings about the effect (other drugs).',
          },
          {
            id: 'ce1-3',
            text: 'Stress may ______ to poor health.',
            options: ['derive from', 'contribute', 'stem from', 'result from'],
            correctAnswerIndex: 1,
            explanation: '"Contribute to" shows that the cause (stress) leads to the effect (poor health).',
          },
          {
            id: 'ce1-4',
            text: "Amy's problems with men ______ from her bad relationship with her father.",
            options: ['lead to', 'cause', 'stem', 'affect'],
            correctAnswerIndex: 2,
            explanation: '"Stem from" shows that the effect (problems with men) comes from the cause (bad relationship).',
          },
          {
            id: 'ce1-5',
            text: 'The Indian Ocean earthquake in 2004 ______ a huge tsunami.',
            options: ['caused', 'derived', 'stemmed', 'resulted'],
            correctAnswerIndex: 0,
            explanation: '"Caused" shows that the cause (earthquake) leads to the effect (tsunami).',
          },
        ],
      },
    ],
  },
  {
    id: 'time-expressions-1',
    title: 'Time Expressions: Chronology',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'te1-1',
            text: 'World War I occurred ______ World War II.',
            options: ['after', 'before', 'during', 'since'],
            correctAnswerIndex: 1,
            explanation: 'WWI (1914-1918) happened before WWII (1939-1945).',
          },
          {
            id: 'te1-2',
            text: "I've been waiting ______ years to hear those words.",
            options: ['ago', 'since', 'for', 'once'],
            correctAnswerIndex: 2,
            explanation: '"For" is used to indicate a duration of time.',
          },
          {
            id: 'te1-3',
            text: '______ the veterinarian arrived, the horse had already died.',
            options: ['By the time', 'As soon as', 'After', 'While'],
            correctAnswerIndex: 0,
            explanation: '"By the time" emphasizes that one action was completed before another one happened.',
          },
          {
            id: 'te1-4',
            text: '______, we visited Jerusalem. Then, we visited Tel Aviv. Finally, we flew back to Eilat.',
            options: ['Finally', 'Secondly', 'Firstly', 'Ago'],
            correctAnswerIndex: 2,
            explanation: '"Firstly" or "First" is used to start a sequence of events.',
          },
          {
            id: 'te1-5',
            text: 'It is best to leave ______ the storm begins.',
            options: ['during', 'ago', 'before', 'after'],
            correctAnswerIndex: 2,
            explanation: 'The sentence advises leaving prior to the storm starting.',
          },
        ],
      },
    ],
  },
  {
    id: 'extreme-words-1',
    title: 'Extreme Words: Absolute Claims',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 300,
        questions: [
          {
            id: 'ew1-1',
            text: "Martha is ______ late to meetings; she has never been on time.",
            options: ['always', 'sometimes', 'rarely', 'never'],
            correctAnswerIndex: 0,
            explanation: '"Always" is an absolute word that means 100% of the time, which fits the context "she has never been on time".',
          },
          {
            id: 'ew1-2',
            text: '______ people have to eat, drink and sleep. There are no exceptions.',
            options: ['Some', 'Most', 'All', 'Few'],
            correctAnswerIndex: 2,
            explanation: '"All" is an absolute word meaning 100% of a group, without exception.',
          },
          {
            id: 'ew1-3',
            text: '______ problem has some kind of solution.',
            options: ['Every', 'Some', 'No', 'One'],
            correctAnswerIndex: 0,
            explanation: '"Every" is an absolute word that means each one in a group, without exception.',
          },
          {
            id: 'ew1-4',
            text: 'It is a good movie, but by ______ means is it the best movie I have ever seen.',
            options: ['all', 'some', 'no', 'any'],
            correctAnswerIndex: 2,
            explanation: '"By no means" is an absolute phrase that means "not at all" or "in no way".',
          },
          {
            id: 'ew1-5',
            text: "Nick's ______ lies keep getting him into trouble.",
            options: ['occasional', 'ceaseless', 'rare', 'frequent'],
            correctAnswerIndex: 1,
            explanation: '"Ceaseless" means constant and endless, an absolute term fitting the context of getting into trouble.',
          },
        ],
      },
    ],
  },
  {
    id: 'restatements-mixed-1',
    title: 'תרגול ניסוח מחדש: נושאים כלליים 1',
    skill: 'logic',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק ד׳: ניסוח מחדש (Restatements)',
        timeLimitSeconds: 360, // 6 minutes
        questions: [
          {
            id: 'rs-mix1-1',
            text: 'Bermuda, a group of islands in the Atlantic Ocean, is a popular resort.',
            options: [
              'Bermuda is one of several islands in the Atlantic Ocean visited by tourists.',
              'Bermuda is the most popular of all Atlantic island resorts.',
              'The islands of Bermuda offer a wide variety of attractions.',
              'Many people like to vacation on the islands of Bermuda.',
            ],
            correctAnswerIndex: 3,
            explanation: '"Popular resort" פירושו שמקום פופולרי לחופשה, כלומר הרבה אנשים אוהבים לנפוש שם. תשובה זו היא הניסוח הקרוב ביותר למשמעות זו.',
            hint: 'מה המשמעות של "popular resort"? חפשי את התשובה שמתארת את הרעיון הזה במילים אחרות.',
          },
          {
            id: 'rs-mix1-2',
            text: 'Bjarne Andresen, a professor at the University of Copenhagen, claims that the term "global temperature", often referred to in discussions on global warming, is thermodynamically and mathematically untenable.',
            options: [
              'Andresen claims that measuring "global temperature" using thermodynamic and mathematical principles is the least accurate method of estimating the rate of global warming.',
              'An expert in thermodynamics and mathematics, Andresen supports the widely held assumption that a direct correlation exists between global warming and what is referred to as "global temperature".',
              'Andresen has argued that the notion of a "global temperature", often mentioned in reference to global warming, is unsound in both mathematical and thermodynamic terms.',
              'In his research on global warming, Andresen questions the widely accepted claim that "global temperature" can be predicted using thermodynamic and mathematical tools.',
            ],
            correctAnswerIndex: 2,
            explanation: 'המילה "untenable" פירושה "לא ניתן להגנה" או "חסר בסיס". המילה "unsound" היא מילה נרדפת מצוינת. המשפט שומר על כל חלקי המשמעות המקורית: הטענה של אנדרסן, המושג "טמפרטורה גלובלית", והבעייתיות שלו במונחים תרמודינמיים ומתמטיים.',
            hint: 'התמקדי במילה "untenable". איזו מהאפשרויות מציעה מילה נרדפת שמשמרת את טענתו של הפרופסור?',
          },
          {
            id: 'rs-mix1-3',
            text: 'The old quarter of Dinan, France, is a labyrinth of streets where time appears to have stood still.',
            options: [
              'One can wander for hours along the winding streets of Dinan\'s old quarter.',
              'The passage of time has not dulled the charm of the streets in Dinan\'s old quarter.',
              'The cobbled streets of Dinan\'s old quarter are worth taking time to explore.',
              'The maze of streets in Dinan\'s old quarter look much as they did long ago.',
            ],
            correctAnswerIndex: 3,
            explanation: 'הביטוי "time appears to have stood still" משמעו שהמקום נראה כאילו לא השתנה במשך שנים רבות. "labyrinth" מתורגם היטב למילה "maze". תשובה זו לוכדת את שתי המשמעויות.',
            hint: 'מהי המשמעות של הביטוי "time appears to have stood still"? חפשי תשובה שמתארת מראה שלא השתנה.',
          },
        ],
      },
    ],
  },
  {
    id: 'restatements-mixed-2',
    title: 'תרגול ניסוח מחדש: נושאים כלליים 2',
    skill: 'logic',
    difficulty: 'hard',
    sections: [
      {
        title: 'חלק ה׳: ניסוח מחדש (Restatements)',
        timeLimitSeconds: 360, // 6 minutes
        questions: [
          {
            id: 'rs-mix2-1',
            text: 'A person who is deficient in a particular nutrient may crave certain foods.',
            options: [
              'A strong desire for certain foods can be caused by the lack of a specific nutrient.',
              'Consuming an adequate amount of nutrients can promote good health.',
              'Cravings can lead to the excessive consumption of food.',
              'People tend to consume foods that have little nutritional value.',
            ],
            correctAnswerIndex: 0,
            explanation: 'המשפט המקורי מציג קשר סיבתי: חוסר ("deficient") ברכיב תזונתי עלול לגרום לתשוקה ("crave"). התשובה הנכונה הופכת את הסדר אך שומרת על אותו קשר: תשוקה ("strong desire") יכולה להיגרם מחוסר ("lack of").',
            hint: 'זהי את הסיבה ואת התוצאה במשפט המקורי. חפשי תשובה ששומרת על הקשר הלוגי ביניהן.',
          },
          {
            id: 'rs-mix2-2',
            text: 'In the first part of the twentieth century, sugar exports to the U.S. dominated the Cuban economy.',
            options: [
              'In the first part of the twentieth century, Cuba exported more sugar to the U.S. than to any other country.',
              'In the first part of the twentieth century, Cuba\'s chief export to the U.S. was sugar.',
              'In the first part of the twentieth century, the Cuban economy depended primarily on sugar exports to the U.S.',
              'In the first part of the twentieth century, sugar exports to the U.S. stimulated economic growth in Cuba.',
            ],
            correctAnswerIndex: 2,
            explanation: 'הפועל "to dominate" בהקשר כלכלי פירושו להיות הגורם המרכזי והמשפיע ביותר. לכן, המשמעות היא שהכלכלה הייתה תלויה בעיקר ("depended primarily") ביצוא הסוכר.',
            hint: 'מה המשמעות של "dominated the Cuban economy"? האם זה קשור לכמות היצוא למדינות אחרות, או לחשיבות היצוא הזה לכלכלת קובה עצמה?',
          },
          {
            id: 'rs-mix2-3',
            text: 'Most ancient scribes had at their disposal only perishable writing materials such as papyrus and bamboo scrolls; Sumerian scribes, on the other hand, wrote on durable clay tablets.',
            options: [
              'While most ancient scribes refused to write on any material other than papyrus and bamboo scrolls, Sumerian scribes preferred to use clay tablets, which they considered to be superior in quality.',
              'While Sumerian scribes originally wrote on clay tablets, they later came to favor the papyrus and bamboo scrolls used by scribes in other ancient civilizations.',
              'In some ancient civilizations, scribes had at their disposal light, flexible writing materials made of papyrus and bamboo, but Sumerian scribes had only clay tablets to write on.',
              'Sumerian scribes wrote on long-lasting clay tablets, while other ancient scribes were limited to scrolls made of papyrus, bamboo, and other materials that deteriorated over the course of time.',
            ],
            correctAnswerIndex: 3,
            explanation: 'המשפט המקורי מציג ניגוד בין חומרים "perishable" (מתכלים, שמתקלקלים עם הזמן) לבין חומרים "durable" (עמידים). התשובה הנכונה משתמשת במילים נרדפות כדי לשמור על הניגוד: "long-lasting" במקום "durable", ו-"deteriorated over the course of time" במקום "perishable".',
            hint: 'התמקדי בניגוד בין חומרי הכתיבה. מהי התכונה המרכזית המבדילה ביניהם?',
          },
        ],
      },
    ],
  },
  {
    id: 'sentence-completion-mixed-2',
    title: 'תרגול השלמת משפטים: נושאים כלליים 2',
    skill: 'vocabulary',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 240, // 4 minutes
        questions: [
          {
            id: 'sc-mix2-1',
            text: 'Author Hans Christian Andersen turned to writing only because he was unable to __________ his ambition of becoming an actor.',
            options: ['forbid', 'fulfill', 'fasten', 'flatter'],
            correctAnswerIndex: 1,
            explanation: 'הביטוי "to fulfill an ambition" פירושו "להגשים שאיפה". זהו הביטוי הנכון בהקשר של רצונו להיות שחקן.',
            hint: 'איזו מילה מתארת הגשמה של חלום או שאיפה?',
          },
          {
            id: 'sc-mix2-2',
            text: 'Tourists wishing to visit __________ areas in India require special permits.',
            options: ['edited', 'convicted', 'restricted', 'distracted'],
            correctAnswerIndex: 2,
            explanation: '"Restricted areas" הם אזורים מוגבלי כניסה, מה שמתאים להקשר של צורך באישור מיוחד כדי לבקר בהם.',
            hint: 'אם צריך אישור מיוחד כדי להיכנס למקום, איזה סוג של מקום הוא?',
          },
          {
            id: 'sc-mix2-3',
            text: 'A Zulu hut resembles a beehive in shape and is sometimes __________ for one from a distance.',
            options: ['mistaken', 'forgiven', 'worn', 'undone'],
            correctAnswerIndex: 0,
            explanation: 'הביטוי "to be mistaken for something" פירושו שמישהו חושב בטעות שזה משהו אחר. זה מתאים להקשר של דמיון בצורה.',
            hint: 'כאשר שני דברים דומים, קל לעשות ביניהם...?',
          },
          {
            id: 'sc-mix2-4',
            text: 'The Hawaiian Renaissance of the 1970s was inspired in part by movements dedicated to the __________ of Native American culture.',
            options: ['recitation', 'revival', 'resentment', 'refund'],
            correctAnswerIndex: 1,
            explanation: '"Revival" פירושו "תחייה" או "התעוררות מחדש". זה מתאים להקשר של רנסנס תרבותי.',
            hint: 'רנסנס הוא סוג של התעוררות או...?',
          },
        ],
      },
    ],
  },
  {
    id: 'grammar-in-context-1',
    title: 'Grammar: Active vs. Passive Voice',
    skill: 'logic',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק ח׳: דקדוק בהקשר (Grammar in Context)',
        timeLimitSeconds: 60,
        questions: [
          {
            id: 'gic1-1',
            text: 'Tennis champion Serena Williams ___________________________ one of the greatest athletes of all time.',
            options: [
              'was considerable',
              'for consideration',
              'is considered',
              'in considering'
            ],
            correctAnswerIndex: 2,
            explanation: 'המשפט דורש שימוש בסביל ("is considered") כדי להראות שאנשים אחרים רואים בה את אחת הגדולות. המשפט "Serena Williams is considered..." הוא דרך אחרת להגיד "People consider Serena Williams...".',
            hint: 'חשבי מי עושה את הפעולה. האם אנחנו אומרים מה סרינה וויליאמס עושה, או מה אנשים חושבים עליה? זה עשוי לדרוש צורת סביל.'
          }
        ]
      }
    ]
  },
  {
    id: 'sentence-completion-psychology-1',
    title: 'השלמת משפטים: פסיכולוגיה ואימוץ',
    skill: 'vocabulary',
    difficulty: 'easy',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 60,
        questions: [
          {
            id: 'sc-psych-1',
            text: 'Most psychologists today believe that adopted children should be permitted and even _____ to learn about their biological parents.',
            options: [
              'encouraged',
              'endured',
              'enriched',
              'enclosed'
            ],
            correctAnswerIndex: 0,
            explanation: 'המילה "encouraged" (מעודדים) היא המתאימה ביותר להקשר. המשפט אומר שפסיכולוגים מאמינים שילדים מאומצים צריכים לקבל רשות ואף עידוד ללמוד על הוריהם הביולוגיים. שאר האפשרויות אינן מתאימות למשמעות המשפט.',
            hint: 'המילה "even" (אפילו) מרמזת על הגברה או חיזוק של הרעיון של "permitted" (מורשים). איזו מילה מהווה חיזוק חיובי למתן רשות?'
          }
        ]
      }
    ]
  },
  {
    id: 'reading-comprehension-salt-black-beauty',
    title: 'הבנת הנקרא: מלח ו-Black Beauty',
    skill: 'comprehension',
    difficulty: 'hard',
    readingText: `Text I

Like herbs and spices, salt can be used as a seasoning – to add flavor to food. But while herbs and spices, such as oregano and cinnamon, come from plants, salt is a mineral.

Salt is found both in bodies of water and underground. Much of the salt we use comes from the salt water of oceans and seas. To remove the salt, shallow holes are dug near the edge of the sea or ocean. Water flows into these holes and stays there. Over a period of several weeks, the sun dries up the water, leaving behind crystals of salt. Salt is also found under the ground in the form of huge rocks. To remove this salt from the ground, it is necessary to dig it out, just as coal and other minerals are mined.

Salt is used not only as a seasoning, but also to preserve food so that it can be kept without refrigeration for long periods of time. Among the foods that can be preserved using salt are meat, fish, and vegetables. Adding salt to food has an additional purpose. Our bodies need salt in order to function. When we sweat, our bodies lose salt, which must be replaced. People who live in hot countries must be especially careful to get enough salt in their diet.

But salt can be very expensive in some of the places where it is most needed. In northeastern Ethiopia, for example, blocks of salt must be cut from the surface of the dried-up Lake Assale. Merchants buy the salt blocks, then use camels to carry them across the desert to salt markets. At the salt markets, people buy salt for thirty times the price the merchants paid for it.

Text II

Like other famous nineteenth-century novels, Black Beauty – the adventures of a horse by that name – is often published today in abridged editions that omit portions of the narrative and simplify the language. As a result, the work is generally considered to be just another children's story about animals.

Yet Black Beauty was not originally intended for juvenile audiences. Its author, Anna Sewell, wrote the novel as both an impassioned plea and a reasoned argument for the humane treatment of horses. This was an issue of no little significance in post-Industrial Revolution England, where horse-drawn vehicles were the principal means of transportation but the animals that drew them were often perceived as hardly different from the steam engines that pulled trains. Overworking, whipping, and otherwise mistreating horses were common and accepted practices. In addition, it was fashionable in many circles to harness driving horses with a "bearing rein,” which forced the horses to hold their necks high – creating a supposedly elegant look at the expense of the animals' comfort and health.

Appalled by what she saw around her, Sewell conveyed her message in a manner that left no doubt about her opinions. Indeed, today she would likely be accused of excessive preaching. However, in an era when pamphlets on moral issues were commonly circulated and even novelists frequently lectured their readers directly, Sewell was relatively subtle in her approach. She employed the innovative literary device of telling the story from the perspective of a horse. Black Beauty is not only the main character but also the narrator of the novel, which is subtitled The Autobiography of a Horse.

Since its first publication in 1877, over 30 million copies of Black Beauty have been printed – a number unmatched by any other work of fiction. Shortly after it appeared, George Ansell, the founder of an American animal welfare organization, arranged for the printing of 100,000 copies, which were distributed to people who worked with horses. In the years that followed, the use of bearing reins was abandoned and the treatment of horses improved significantly.`,
    sections: [
      {
        title: 'חלק ג׳: הבנת הנקרא (Reading Comprehension)',
        timeLimitSeconds: 1200, // 20 minutes
        questions: [
          {
            id: 'rc-salt-1',
            text: 'It can be understood from the first paragraph that a seasoning is something that -',
            options: ['makes food taste better', 'tastes like salt', 'is a mineral', 'comes from a plant'],
            correctAnswerIndex: 0,
            explanation: 'הפסקה הראשונה מציינת שמלח משמש כתיבול - "to add flavor to food" (להוסיף טעם לאוכל). לכן, תיבול הוא משהו שמשפר את טעם האוכל.',
          },
          {
            id: 'rc-salt-2',
            text: 'The main purpose of the second paragraph is to -',
            options: ['explain where the salt we use comes from', 'explain why salt is considered a mineral', 'compare salt from mines to salt from the sea', 'compare salt mining and coal mining'],
            correctAnswerIndex: 0,
            explanation: 'הפסקה השנייה מתארת את שני המקורות העיקריים למלח: גופי מים (אוקיינוסים וימים) ותת-קרקעי (סלעי מלח). לכן, מטרתה להסביר מהיכן מגיע המלח.',
          },
          {
            id: 'rc-salt-3',
            text: 'The main purpose of the third paragraph is to -',
            options: ['discuss two uses for salt', 'discuss how salt is used to preserve food', 'explain why the body needs salt', 'explain why people in hot countries need salt'],
            correctAnswerIndex: 0,
            explanation: 'הפסקה השלישית דנה בשני שימושים של מלח בנוסף לתיבול: שימור מזון ("to preserve food") והצורך של הגוף במלח כדי לתפקד ("Our bodies need salt"). שאר האפשרויות מציינות רק אחד מהשימושים הללו.',
          },
          {
            id: 'rc-salt-4',
            text: 'According to the third paragraph, vegetables -',
            options: ['do not need to be refrigerated', 'taste better with salt', 'can be preserved using salt', 'contain a lot of salt'],
            correctAnswerIndex: 2,
            explanation: 'הטקסט מציין במפורש: "Among the foods that can be preserved using salt are meat, fish, and vegetables" (בין המאכלים שניתן לשמר באמצעות מלח נמצאים בשר, דגים וירקות).',
          },
          {
            id: 'rc-salt-5',
            text: 'A good title for this text would be -',
            options: ['Salt: A Seasoning or a Mineral?', 'The History of Salt', 'From Ocean to Market: How We Get Salt From the Sea', 'Where Salt Comes From and How We Use It'],
            correctAnswerIndex: 3,
            explanation: 'כותרת זו מסכמת בצורה הטובה ביותר את תוכן הטקסט כולו, שעוסק גם במקורות המלח (היכן הוא נמצא ואיך מפיקים אותו) וגם בשימושיו השונים (תיבול, שימור, צורך גופני).',
          },
          {
            id: 'rc-bb-1',
            text: 'It can be inferred from the first paragraph that many readers of Black Beauty today -',
            options: ['do not believe that it is appropriate for children', 'find it exciting and full of adventure', 'do not read the complete, original edition of the book', 'prefer other children\'s stories about animals'],
            correctAnswerIndex: 2,
            explanation: 'הפסקה מציינת שהספר "is often published today in abridged editions that omit portions of the narrative" (יוצא לאור כיום לעיתים קרובות במהדורות מקוצרות שמשמיטות חלקים מהסיפור). מכך ניתן להסיק שקוראים רבים אינם קוראים את הגרסה המלאה והמקורית.',
          },
          {
            id: 'rc-bb-2',
            text: '"Yet" is used in line 5 to indicate that -',
            options: ['the view of Black Beauty as simply a children\'s book is inaccurate', 'today\'s editions of Black Beauty are very different from past editions', 'Black Beauty was not originally considered a great novel', 'most children do not actually understand Black Beauty'],
            correctAnswerIndex: 0,
            explanation: 'המילה "Yet" (אך, ועם זאת) משמשת להצגת ניגוד. המשפט שלפניה אומר שהספר נחשב לסיפור ילדים. השימוש ב-"Yet" מסמן שהתפיסה הזו אינה מדויקת או אינה התמונה המלאה.',
          },
          {
            id: 'rc-bb-3',
            text: "According to the second paragraph, in Sewell's time, the treatment of horses -",
            options: ['was an important issue because horses were widely used for transportation', 'was a greater problem in England than in other countries', 'had become the subject of much impassioned argument', 'received little attention because steam engines were becoming more common'],
            correctAnswerIndex: 0,
            explanation: 'הטקסט אומר שהנושא היה "an issue of no little significance" (נושא בעל חשיבות לא מבוטלת) וכי "horse-drawn vehicles were the principal means of transportation" (כלי רכב רתומים לסוסים היו אמצעי התחבורה העיקרי).',
          },
          {
            id: 'rc-bb-4',
            text: 'The main purpose of the third paragraph is to -',
            options: ['discuss Sewell\'s method of conveying her message', 'compare Black Beauty with the novels of today', 'explain why Sewell chose to lecture her readers directly', 'show why Black Beauty is subtitled The Autobiography of a Horse'],
            correctAnswerIndex: 0,
            explanation: 'הפסקה מתארת את גישתה של סואל - "relatively subtle in her approach" (מעודנת יחסית בגישתה) ואת השימוש ב-"innovative literary device" (תחבולה ספרותית חדשנית) של סיפור מנקודת מבטו של סוס. כלומר, הפסקה דנה בשיטה שלה להעברת המסר.',
          },
          {
            id: 'rc-bb-5',
            text: 'It can be inferred from the last paragraph that Black Beauty -',
            options: ['was read mostly by people who loved animals', 'was first published by George Ansell', 'accomplished what Sewell hoped it would', 'encouraged people to join animal welfare organizations'],
            correctAnswerIndex: 2,
            explanation: 'מטרתה של סואל הייתה "the humane treatment of horses" (יחס אנושי לסוסים). הפסקה האחרונה מציינת שלאחר הפצת הספר, "the use of bearing reins was abandoned and the treatment of horses improved significantly" (השימוש במושכות לחץ הופסק והיחס לסוסים השתפר משמעותית). מכך ניתן להסיק שהספר השיג את מטרתו.',
          },
        ],
      },
    ],
  },
  {
    id: 'sentence-completion-mixed-3',
    title: 'תרגול השלמת משפטים: נושאים כלליים 3',
    skill: 'vocabulary',
    difficulty: 'hard',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 480, // 8 minutes
        questions: [
          {
            id: 'sc-mix3-1',
            text: 'According to Inuit tradition, any decision that might affect the community must be made __________ rather than by individuals.',
            options: ['conditionally', 'collectively', 'comfortably', 'continuously'],
            correctAnswerIndex: 1,
            explanation: 'המילה "collectively" (באופן קולקטיבי, יחד) עומדת בניגוד ל-"by individuals" (על ידי יחידים), ומתאימה למבנה הניגוד "rather than".',
          },
          {
            id: 'sc-mix3-2',
            text: "Because so many people in Iceland have exactly the same name, telephone directories list people's occupations __________ their names and addresses.",
            options: ['in answer to', 'in addition to', 'in spite of', 'in favor of'],
            correctAnswerIndex: 1,
            explanation: 'הביטוי "in addition to" (בנוסף ל-) מתאים כאן, מכיוון שספרי הטלפונים מוסיפים את פרט המידע של המקצוע לשמות והכתובות הרגילים.',
          },
          {
            id: 'sc-mix3-3',
            text: "The portolano, or sailor's chart, was developed in the 1300s as an aid to __________ in the Mediterranean Sea.",
            options: ['navigation', 'residence', 'solitude', 'deprivation'],
            correctAnswerIndex: 0,
            explanation: 'מפת ימאים ("sailor\'s chart") היא כלי עזר לניווט ("navigation").',
          },
          {
            id: 'sc-mix3-4',
            text: 'The Königsberg, a German warship, sank several hours after its engines began to __________.',
            options: ['accumulate', 'converse', 'malfunction', 'interject'],
            correctAnswerIndex: 2,
            explanation: 'תקלה ("malfunction") במנועים יכולה לגרום לספינה לשקוע.',
          },
          {
            id: 'sc-mix3-5',
            text: 'From the 9th to the 11th century, coastal villages in Europe were constantly __________ by Viking warriors who terrorized the local inhabitants.',
            options: ['raided', 'equalized', 'promoted', 'resented'],
            correctAnswerIndex: 0,
            explanation: 'פשיטה ("raided") היא הפעולה המתאימה לתיאור לוחמים ויקינגים המטילים אימה על כפרים.',
          },
          {
            id: 'sc-mix3-6',
            text: "An anti-government riot as well as a mass exodus of refugees from Cuba in 1993 exposed the __________ popularity of Fidel Castro, the country's Communist leader.",
            options: ['predictable', 'courageous', 'declining', 'explosive'],
            correctAnswerIndex: 2,
            explanation: 'מהומות ויציאה המונית של פליטים מעידות על ירידה ("declining") בפופולריות של המנהיג.',
          },
          {
            id: 'sc-mix3-7',
            text: "In an attempt to limit its spending, the Spanish government has eliminated all __________ to the country's shipyards.",
            options: ['subsidies', 'exhibits', 'outlines', 'policies'],
            correctAnswerIndex: 0,
            explanation: 'סובסידיות ("subsidies") הן תמיכה כספית ממשלתית. ביטולן הוא דרך להגביל הוצאות.',
          },
          {
            id: 'sc-mix3-8',
            text: 'The computer does not __________ human thought; rather, it reaches the same ends by different means.',
            options: ['defer', 'mimic', 'endure', 'adorn'],
            correctAnswerIndex: 1,
            explanation: 'המילה "mimic" (לחקות) מתאימה להקשר. המשפט אומר שהמחשב לא מחקה את החשיבה האנושית, אלא מגיע לאותן תוצאות בדרכים שונות.',
          },
        ],
      },
    ],
  },
  {
    id: 'restatements-mixed-3',
    title: 'תרגול ניסוח מחדש: נושאים כלליים 3',
    skill: 'logic',
    difficulty: 'hard',
    sections: [
      {
        title: 'חלק ד׳: ניסוח מחדש (Restatements)',
        timeLimitSeconds: 480, // 8 minutes
        questions: [
          {
            id: 'rs-mix3-1',
            text: "Businesspeople in Kaliningrad on the Baltic Sea hope to benefit from the region's special tariff-free status and proximity to Western Europe.",
            options: [
              'Many businesspeople have moved to Kaliningrad, located on the Baltic Sea, and have become wealthy by trading with countries in Western Europe.',
              "Kaliningrad's location on the Baltic Sea and special status have encouraged many businesspeople from Western Europe to invest money there.",
              "Kaliningrad's businesspeople hope to gain financially from the fact that there are no tariffs imposed on goods there and from the region's closeness to Western Europe.",
              'Businesspeople in both Kaliningrad and Western Europe hope to reach an agreement concerning tariff-free trade between them so that they can increase their profits.',
            ],
            correctAnswerIndex: 2,
            explanation: 'זוהי הפרפרזה המדויקת ביותר: "to benefit" = "to gain financially", "tariff-free status" = "no tariffs imposed", "proximity" = "closeness".',
          },
          {
            id: 'rs-mix3-2',
            text: 'The political situation in Hong Kong changed abruptly in April 1992 with the appointment of Chris Patten, who succeeded David Wilson as governor of Hong Kong.',
            options: [
              'Conditions in Hong Kong improved dramatically after April 1992, when David Wilson was replaced by Chris Patten – a more successful governor.',
              'David Wilson, who was governor of Hong Kong until Chris Patten was appointed to the position in April 1992, made many drastic changes.',
              'Due to the rapidly changing situation in Hong Kong, Chris Patten became governor in April 1992 instead of David Wilson.',
              'When Chris Patten replaced David Wilson as governor in April 1992, the political situation in Hong Kong suddenly changed.',
            ],
            correctAnswerIndex: 3,
            explanation: '"succeeded" = "replaced", "changed abruptly" = "suddenly changed". המשפט שומר על קשר הסיבה והתוצאה המדויק.',
          },
          {
            id: 'rs-mix3-3',
            text: "Descartes and Galileo – two of the seventeenth century's most prominent thinkers – made a sharp distinction between the physical reality observed by scientists and the subjective reality of the soul, which they considered to be outside the scope of scientific research.",
            options: [
              'Descartes and Galileo thought that the subjective reality of the soul could not be researched scientifically, and they believed it was completely different from the physical reality which scientists observe.',
              'The view held by Descartes and Galileo – that physical reality and scientific observation are of greater importance than the subjective reality of the soul – was not very popular in the seventeenth century.',
              'Because they could not research the subjective reality of the soul scientifically, Descartes and Galileo preferred to concentrate on the distinctions made by scientists when observing physical reality.',
              'What distinguished Descartes and Galileo from other seventeenth-century scientists was their insistence that scientific methods be used in studying everything from physical reality to the subjective reality of the soul.',
            ],
            correctAnswerIndex: 0,
            explanation: 'המשפט המקורי מציג שתי נקודות: 1. הבחנה חדה ("sharp distinction" -> "completely different") בין המציאות הפיזית והנפשית. 2. הנפש היא מחוץ לתחום המחקר המדעי ("outside the scope of scientific research" -> "could not be researched scientifically"). תשובה זו מכסה את שתי הנקודות במדויק.',
          },
          {
            id: 'rs-mix3-4',
            text: 'In Zimbabwe, domesticated cattle have grazed side by side with wild animal herds for centuries, to the apparent detriment of neither.',
            options: [
              'In Zimbabwe, unlike other countries, domesticated cattle and wild animal herds have grazed on the same lands for many centuries.',
              "After living side by side for hundreds of years, Zimbabwe's domesticated cattle and wild animals have begun to fight over grazing land.",
              "Zimbabwe's domesticated cattle and wild animal herds no longer share the same grazing lands, as they apparently did for hundreds of years.",
              "Centuries of grazing together do not seem to have been harmful either to Zimbabwe's domesticated cattle or to its wild animals.",
            ],
            correctAnswerIndex: 3,
            explanation: 'הביטוי "to the apparent detriment of neither" פירושו "לכאורה, ללא נזק לאף אחד מהצדדים". המשפט הנכון מנסח זאת מחדש כ-"do not seem to have been harmful".',
          },
        ],
      },
    ],
  },
  {
    id: 'vocabulary-idioms-1',
    title: 'תרגול אוצר מילים: ניבים אקדמיים',
    skill: 'vocabulary',
    difficulty: 'medium',
    sections: [
      {
        title: 'חלק א׳: השלמת משפטים (Sentence Completion)',
        timeLimitSeconds: 360, // 6 minutes
        questions: [
          {
            id: 'idiom-1',
            text: 'Before we proceed with the project, let\'s have a quick meeting to make sure we are all __________.',
            options: ['on the same page', 'out of the blue', 'in the same boat', 'over the moon'],
            correctAnswerIndex: 0,
            explanation: 'הביטוי "on the same page" פירושו להיות בעלי הבנה משותפת או הסכמה. זה מתאים להקשר של פגישת תיאום לפני פרויקט.',
            hint: 'איזה ביטוי מתאר מצב שבו כולם מבינים את המצב באותה צורה?',
          },
          {
            id: 'idiom-2',
            text: 'As a general __________, you should cite any source you use in your research paper to avoid plagiarism.',
            options: ['shot in the dark', 'rule of thumb', 'piece of cake', 'blessing in disguise'],
            correctAnswerIndex: 1,
            explanation: 'הביטוי "rule of thumb" פירושו כלל אצבע, הנחיה כללית שמבוססת על ניסיון. זה מתאים להקשר של הנחיה כללית לכתיבה אקדמית.',
            hint: 'המשפט נותן עצה כללית ושימושית. איזה ביטוי מתאר כלל כזה?',
          },
          {
            id: 'idiom-3',
            text: 'We have a lot to discuss in this study group, so let\'s __________ by reviewing the first chapter.',
            options: ['get the ball rolling', 'call it a day', 'cut to the chase', 'jump the gun'],
            correctAnswerIndex: 0,
            explanation: 'הביטוי "to get the ball rolling" פירושו להתחיל משהו, במיוחד תהליך או פעילות. זה מתאים באופן מושלם להתחלת מפגש לימוד.',
            hint: 'הדובר רוצה להתחיל את הפגישה. איזה ביטוי מתאר התחלה של פעולה?',
          },
          {
            id: 'idiom-4',
            text: 'The professor warned us not to __________ on the final research project, as quality and thoroughness were the most important criteria.',
            options: ['add insult to injury', 'cut corners', 'beat around the bush', 'hit the books'],
            correctAnswerIndex: 1,
            explanation: 'הביטוי "to cut corners" פירושו לעשות משהו בדרך הקלה, הזולה או המהירה ביותר, לעתים קרובות על חשבון האיכות. הפרופסור מזהיר בדיוק מפני זה.',
            hint: 'האזהרה היא לגבי פגיעה באיכות העבודה. איזה ביטוי מתאר עבודה חפיפניקית?',
          },
          {
            id: 'idiom-5',
            text: 'The theory is quite complex, but __________, it suggests that economic incentives are the primary driver of human behavior.',
            options: ['in a nutshell', 'in hot water', 'at the drop of a hat', 'on cloud nine'],
            correctAnswerIndex: 0,
            explanation: 'הביטוי "in a nutshell" פירושו "בקצרה" או "בתמצית". הוא משמש להצגת סיכום של נושא מורכב.',
            hint: 'הדובר מציג סיכום של תיאוריה מורכבת. איזה ביטוי משמש למטרה זו?',
          },
          {
            id: 'idiom-6',
            text: 'Getting the research grant with so many applicants is __________, but the potential discovery is so important that we have to try.',
            options: ['a piece of cake', 'a long shot', 'a silver lining', 'a perfect storm'],
            correctAnswerIndex: 1,
            explanation: 'הביטוי "a long shot" פירושו משהו בעל סיכוי נמוך להצליח, אבל ששווה לנסות. זה מתאים להקשר של תחרות קשה על מענק מחקר.',
            hint: 'הסיכויים נמוכים, אבל הדובר עדיין רוצה לנסות. איזה ביטוי מתאר סיכוי נמוך?',
          },
        ],
      },
    ],
  }
];