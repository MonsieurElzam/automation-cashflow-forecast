## À quoi ça sert

Une entreprise rentable peut manquer de liquidités : le client paie dans trois mois, le loyer tombe demain. Ce script projette votre trésorerie mois par mois à partir de vos encaissements et dépenses (ponctuels ou récurrents), vous montre le **premier mois négatif** et estime votre **autonomie**.

## Avant de commencer

- Un CSV : `date`, `label`, `amount` (positif = entrée, négatif = dépense), `recurrence` (`none`, `weekly`, `monthly`, `yearly`), `end` (facultatif).
- Votre solde actuel.

## Pas à pas

1. Listez vos flux connus : loyers, salaires, abonnements, factures attendues.
2. Lancez la projection sur 6 mois :
   ```bash
   node src/cashflow-forecast.mjs samples/tresorerie.csv --balance 300000 --months 6
   ```
3. Testez des hypothèses : repoussez un encaissement dans le CSV, relancez, comparez.

## Lire le résultat

Un tableau : entrées, sorties, net et solde de fin de mois, avec `⚠` quand le solde passe sous zéro. L'autonomie = solde de départ ÷ déficit mensuel moyen (somme des déficits des mois négatifs, divisée par le nombre de mois de la projection). Un flux « mensuel » placé le 31 retombe sur le dernier jour des mois plus courts.

## L'automatiser

Mettez à jour le CSV chaque semaine et relancez ; le code de sortie vaut 2 si le solde devient négatif, ce qui permet une alerte.

## Pièges à éviter

- C'est une projection de **ce que vous y mettez** : sans les flux imprévus, elle est optimiste.
- Prévoyez les paiements qui arrivent en retard : décalez vos encaissements de 30 jours pour voir le scénario prudent.
