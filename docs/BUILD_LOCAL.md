# בנייה מקומית

הקבצים `data/canonical.csv` ו־`data/curated.csv` **לא** נכללים בריפו (פרטיות). להעתיק אותם ממקור פרטי לתיקיית `data/` לפי `data/data_dictionary.md`.

```bash
npm ci
npm run build   # מריץ prebuild (build-graph) ואז vite build
```

בלי שני קבצי ה־CSV, `npm run build` ייכשל ב־`ENOENT` על `canonical.csv`.
