# בנייה מקומית

הקבצים `data/canonical.csv` ו־`data/curated.csv` **לא** נכללים בריפו (פרטיות). להעתיק אותם ממקור פרטי לתיקיית `data/` לפי `data/data_dictionary.md`.

```bash
npm ci
npm run build   # מריץ prebuild (build-graph) ואז vite build
```

בלי `data/canonical.csv`, הסקריפט ינסה לטעון נתוני דוגמה מ־`data/sample/canonical.sample.csv`. אם גם קובץ זה חסר, ייכתב גרף ריק ל־`public/family-graph.json` כדי שהבנייה לא תיכשל (האפליקציה תיטען אך תציג עץ ריק).
