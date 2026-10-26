# automation-cashflow-forecast

**Cash-flow forecast.** Projects cash month by month (one-off or recurring flows), spots the first negative month and estimates runway.

Node.js 18+, **no dependencies**, **MIT** licence. No data is sent anywhere. The scripts print their messages in French.

## Usage

```bash
node src/cashflow-forecast.mjs flux.csv --balance 300000 --months 6
```

Sample files are provided in `samples/`.

Run it with `--help` for the built-in options (the scripts print in French).

## Step-by-step guide

- [Guide in English](docs/guide.en.md)
- [Guide en français](docs/guide.fr.md) (French translation)

## Tests

```bash
npm test
```

## Limits

- The files in `samples/` are fictional: adapt the column headers to your own exports.
- Try it on a copy of your data first.
- Provided as is, without warranty (see `LICENSE`).

## The series

This script is part of a series of **free automation scripts** (audience: entrepreneurs, among others): [overview, guides and full archive](https://monsieurelzam.com/en/scripts) · [all repositories](https://github.com/MonsieurElzam?tab=repositories&q=automation-).

---

By [Elzam MAMAH](https://monsieurelzam.com/en), business analyst and process-optimization expert. MIT licence.
