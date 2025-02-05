<script>
  import { Card } from "$lib/components";
</script>

<svelte:head>
  <title>Formula 11 - Rules</title>
</svelte:head>

<div class="grid grid-cols-1 gap-2 xl:grid-cols-4">
  <Card>
    <h1 class="text-lg font-bold">Format</h1>

    <p>
      Das Tippspiel wird dieses Jahr in zwei Teile aufgespalten: Renntips (für jedes Rennen) und
      Bonustipps (für die ganze Saison). Renntipps müssen bis Rennstart, Bonustipps bis 1. März
      abgegeben werden. Tipps können entweder selbst eingetragen werden, oder in die Gruppe
      geschrieben werden, um gültig zu sein.
    </p>
  </Card>

  <Card>
    <h1 class="text-lg font-bold">Renntipps</h1>

    <p>
      Jedes Rennen besteht aus zwei Tipps. Einem Platzierungstipp (PX-Tipp) und einem Tipp welcher
      Fahrer als Erstes das Rennen abbricht (DNF-Tipp). Anders als beim P10-Tipp letztes Jahr wird
      dieses Mal jedes Rennen eine andere Platzierung getippt. Die zu tippende Platzierung wird auf
      der Tabellen-Übersichtsseite und im Fahrer-Auswahlmenü angezeigt. DNS/DSQ zählt hierbei nicht
      als DNF, außerdem besteht die Möglichkeit zu tippen, dass kein Fahrer DNF't oder das Rennen
      auf PX beendet.
    </p>
  </Card>

  <Card>
    <h1 class="text-lg font-bold">Punkte</h1>

    <p>
      Für einen korrekten Tipp werden 10 Punkte vergeben. Beim PX-Tipp werden 6 Punkte für einen
      Platz Abweichung, 3 Punkte für zwei plätze Abweichung und 1 Punkt für 3 Plätze Abweichung
      vergeben. Beim DNF-Tipp werden keine Abweichungspunkte vergeben, ebensowenig wie bei der
      Auswahl "Keiner" für den PX-Tipp.
    </p>
  </Card>

  <Card>
    <h1 class="text-lg font-bold">Bonustipps</h1>

    <p>
      Zusätzlich gibt es dieses Jahr auch Tipps, die sich auf die ganze Saison beziehen und
      verschieden bepunktet werden.
    </p>
    <ul class="ml-6 list-disc">
      <li>
        Welches Team wird P2 in der constructors championship? (10 Punkte für die richtige Antwort /
        0 Punkte für eine falsche Antwort)
      </li>
      <li>
        Welcher Fahrer verbessert am meisten seine Platzierung in der drivers championship im
        Vergleich zum Vorjahr? (10/0)
      </li>
      <li>
        Welcher Fahrer verschlechtert am meisten seine Platzierung in der drivers championship im
        Vergleich zum Vorjahr? (10/0)
      </li>
      <li>Welcher Fahrer hat die meisten DNFs? (10/0)</li>
      <li>Welcher Fahrer hat die meisten Überholungen? (10/0)</li>
      <li>
        Nenne alle Fahrer, die mindestens einmal auf dem Podium stehen werden. (3/-2, nicht-gegebene
        Antworten zählen als falsch)
      </li>
      <li>Nenne für alle Teams den Sieger des teaminternen Duells. (3/-3)</li>
      <li>Nenne einen hot-take für die Saison (10/0, "hotness" wird vorher abgesegnet)</li>
    </ul>
  </Card>
</div>
