// data/pin-texts.js
// Beschreibungstexte der 15 Missionspins und Einleitungen der fünf Missionsfolien.
// Quelle: Sprechtexte_Missionslandkarte_A5.docx (12.10.2026, lokal, nicht im Repo),
// für das Lesen leicht überarbeitet: gesprochene Überleitungen entfernt, Absätze gesetzt,
// Fakten unverändert. Zwei bewusste Abweichungen (2026-10-14): AMooRe ohne den EU-Beitrag
// von 26,5 Mio. (die Karte zeigt laut Vorgabe 26,0 Mio.); Wasser-Intro "ganz Österreich"
// statt "fünf Bundesländer", passend zum AMooRe-Text.
// Schlüssel der Pins = Projekt-ID aus data/projects_v2.csv.

window.APP_PIN_TEXTS = {

  missionIntros: {
    climate: 'Die Anpassungsmission fragt nicht mehr, ob sich das Klima verändert, sondern wie Regionen damit leben. Drei Projekte zeigen, wie österreichische Länder und Forschungseinrichtungen dabei mit der Natur arbeiten statt gegen sie.',
    cities:  'Die Städtemission macht Städte zu Laboren für Klimaneutralität. Die drei Projekte zeigen drei Ebenen: die Strategie einer ganzen Stadt, ein Reallabor in einer bewohnten Architekturikone und die Frage, ob man saniert oder abreißt.',
    cancer:  'Bei Krebs reicht der Bogen von Forschungsdaten über die Versorgung im Spital bis zur Frage, wer überhaupt Zugang hat. Die drei Projekte decken genau diese Spanne ab.',
    soil:    'Boden ist die Grundlage für Ernährung, Wasserhaushalt und Klimaschutz – und er erneuert sich nur sehr langsam. Die drei Projekte setzen an drei Stellen an: beim Wissen, beim Messen und bei einer konkreten Innovation.',
    water:   'Die Wassermission will Gewässer bis 2030 schützen und wiederherstellen. Zwei der drei Projekte spielen an der Donau, eines in Mooren in ganz Österreich.',
  },

  pins: {

    // ── Klimawandel meistern ──────────────────────────────────────────────

    '101112876': {  // MountResilience
      meta: 'Amt der Tiroler Landesregierung, Innsbruck · Horizon Europe, bis Februar 2028',
      paragraphs: [
        'Berge spüren den Klimawandel stärker als andere Regionen – und jede sechste EU-Bürgerin, jeder sechste EU-Bürger lebt dort. MountResilience soll zehn Bergregionen in neun Ländern widerstandsfähiger machen. Insgesamt sind 47 Partner aus ganz Europa beteiligt.',
        'Tirol arbeitet an vier Fronten: Die Landesplattform „Klima, Energie & Kreislaufwirtschaft“ berät künftig auch zur Anpassung, für Betriebe, Gemeinden und Regionen. Im Tourismus werden naturnahe Angebote für Gäste entwickelt und getestet. Für das dicht versiegelte zentrale Inntal entstehen Werkzeuge zur Planung grüner Infrastruktur. Und mit dem datahub.tirol werden Sensorik, ein Finanzierungsmodell für ökosystembasierte Anpassung und ein Monitoring erprobt.',
      ],
    },

    '101112737': {  // ARCADIA
      meta: 'Amt der NÖ Landesregierung, St. Pölten · Horizon Europe, Jänner 2024 bis Juni 2028',
      paragraphs: [
        'Niederösterreich ist eines von fünf Vorzeigegebieten in ARCADIA. Acht europäische Regionen beschleunigen dort den Einsatz naturbasierter Lösungen – und fragen auch: Was bringt Menschen dazu, solche Lösungen mitzutragen? Dafür testet das Projekt verhaltensökonomische Anreize.',
        'In Niederösterreich entwickeln mindestens drei offene Co-Innovation-Labs Lösungen mit Gemeinden und Betrieben: grüne und blaue Infrastruktur im Siedlungsraum, Hecken und Pufferstreifen gegen Erosion auf Agrarflächen sowie klimafitte Betriebsgebiete.',
        'Das Land baut dabei auf 28 Klimawandelanpassungs-Modellregionen und 3.000 Hektar Bodenschutzanlagen auf. Mit an Bord sind GeoSphere Austria, die Energie- und Umweltagentur, Natur im Garten und ecoplus.',
      ],
    },

    '101157448': {  // NATURE-DEMO
      meta: 'alchemia-nova, Wien · Horizon Europe, Mai 2024 bis April 2028',
      paragraphs: [
        'Straßen, Bahnlinien, Stromnetze, Wasserleitungen: Kritische Infrastruktur leidet zunehmend unter Starkregen, Hitze und Erosion. NATURE-DEMO dreht die Logik um. Infrastruktur soll nicht erst nach dem Schaden repariert, sondern von Anfang an mit der Natur widerstandsfähig geplant werden.',
        'Dazu entsteht eine digitale Entscheidungsplattform, die Klimaprojektionen, die Gefährdung der Anlagen und einen Katalog naturbasierter Lösungen zusammenführt. Erprobt wird das an fünf Standorten im Alpenraum.',
        'Einer liegt in Österreich: Im Brunntal sollen weniger Erosion und mehr Sedimentablagerung jene Grundwasservorkommen schützen, aus denen Wien sein Trinkwasser bezieht. Aus Österreich sind das Wiener Forschungsinstitut alchemia-nova und die BOKU beteiligt.',
      ],
    },

    // ── Klimaneutrale Stadt ───────────────────────────────────────────────

    '4121983': {  // KING
      meta: 'Landeshauptstadt Graz · FFG Stadt der Zukunft, April 2021 bis September 2022',
      paragraphs: [
        'Graz stößt je nach Berechnungsmethode jährlich zwischen 1,2 und 2,8 Millionen Tonnen CO₂-Äquivalent aus. Um auf Pariser Kurs zu kommen, müssten die Emissionen jedes Jahr um durchschnittlich 5,6 Prozent sinken. KING, die „Klimainnovationsstadt Graz“, hat dafür die strategischen Weichen gestellt.',
        'Aufbauend auf dem Grazer Klimaschutzplan wurden gemeinsam mit Verwaltung, Wissenschaft, Wirtschaft und Öffentlichkeit Maßnahmen bewertet, priorisiert und in eine Roadmap mit Umsetzungs-, Finanzierungs- und Kapazitätsplan übersetzt. Wissenschaftlich begleitet hat das Wegener Center der Universität Graz.',
        'Dazu kam ein Modellquartier: Für eines von zwei Smart-City-Gebieten – den Bildungscampus Reininghaus oder MySmartCityGraz – sollte ein Umsetzungsplan zur Klimaneutralität entstehen. Ausdrücklich war KING auch die Vorbereitung auf die Bewerbung bei der EU-Mission.',
      ],
    },

    '101147781': {  // DeCO2
      meta: 'Interessensgemeinschaft Terrassenhaus St. Peter, Graz · Horizon Europe, bis Mai 2028',
      paragraphs: [
        'Gebäude verbrauchen in der EU rund 40 Prozent der Energie und verursachen 36 Prozent der CO₂-Emissionen. Saniert wird aber nur etwa ein Prozent des Bestands pro Jahr. DeCO2 will das beschleunigen – mit marktreifen, kreislauffähigen Bau- und Sanierungslösungen und mit Partnerschaften entlang der gesamten Wertschöpfungskette, ausdrücklich auch für denkmalrelevante Gebäude.',
        'Österreich steuert dafür einen besonderen Ort bei: die Terrassenhaussiedlung in Graz-St. Peter. Dort entsteht ein Reallabor, in dem Lösungen im bewohnten Bestand getestet und gezeigt werden, gemeinsam mit der Interessensgemeinschaft Terrassenhaus und der Universität Graz.',
        'Im Mittelpunkt stehen nicht nur Energie und Material, sondern auch Gesundheit, Komfort und Inklusion der Menschen, die dort leben. Am Projekt sind 17 Partner beteiligt.',
      ],
    },

    '4953560': {  // Smart Dag
      meta: 'Landeshauptstadt Klagenfurt am Wörthersee · FFG Stadt der Zukunft, Februar 2023 bis Juli 2025',
      paragraphs: [
        'Klagenfurt ist Österreichs Missionsstadt und hat 2023 das EU-Missionssiegel für seinen Plan zur Klimaneutralität bis 2030 erhalten. Ein Schlüssel ist der Gebäudebestand: Sanierung und klimaneutrale Quartiere sollen rund 54.000 Tonnen CO₂ einsparen.',
        'Bisher wurden alte Wohnsiedlungen in Klagenfurt aber abgerissen und neu gebaut. Smart Dag stellt diese Praxis infrage – am Beispiel der Dag-Hammarskjöld-Siedlung, einem städtischen Sozialbau aus den späten 1950er-Jahren mit fünf Gebäuden. Untersucht wurde, ob Sanierung über den Lebenszyklus ökologisch, ökonomisch und sozial besser abschneidet als Abriss.',
        'Ziel war ein einreichfertiges Sanierungsprojekt aus einem Architekturwettbewerb, mit Material-, Energie-, Mobilitäts- und Freiraumkonzept und besonderem Augenmerk auf die Mieterinnen und Mieter. Partner sind FH Kärnten, RENOWAVE und die Diakonie.',
      ],
    },

    // ── Krebs besiegen ────────────────────────────────────────────────────

    '101215206': {  // UNCAN-Connect
      meta: 'BBMRI-ERIC, Graz · Horizon Europe, bis August 2030',
      paragraphs: [
        'Europa verzeichnet ein Viertel aller Krebsfälle weltweit. Ohne Gegensteuern könnten die Krebstodesfälle in der EU bis 2035 um mehr als 24 Prozent steigen. Wissen über Krebs steckt in Daten – doch die liegen verteilt über Länder, Kliniken und Infrastrukturen, und Datenschutzregeln werden unterschiedlich ausgelegt.',
        'UNCAN-Connect baut ein dezentrales Netzwerk, über das Forschende, KMU und Innovatoren mit Krebsdaten arbeiten können, ohne dass alles zentral gesammelt wird: eine Open-Source-„Föderation von Föderationen“ mit eigenem Rahmen für Governance und Rechtskonformität. Entwickelt wird sie an sechs Krebsarten, darunter Kinderkrebs, Bauchspeicheldrüsen- und Lungenkrebs.',
        'Aus Österreich ist BBMRI-ERIC dabei, die europäische Biobanken-Forschungsinfrastruktur mit Sitz in Graz.',
      ],
    },

    '12345678': {  // Tumorzentrum Oberösterreich
      meta: 'Ordensklinikum Linz u. a. · Kooperation oberösterreichischer Krankenanstalten',
      paragraphs: [
        'Im Tumorzentrum Oberösterreich arbeiten Krankenhäuser verschiedener Träger zusammen – das Kepler Universitätsklinikum, das Ordensklinikum Linz, das Klinikum Wels-Grieskirchen, die Regionalkliniken der Gesundheitsholding und weitere, insgesamt 14 Standorte.',
        'Sie teilen Leitlinien, Tumorboards und eine trägerübergreifende Tumordatenbank, die Krankheitsverläufe dokumentiert und Behandlungsqualität messbar macht. Laut Angaben von 2023 werden über 90 Prozent der Krebspatientinnen und -patienten in Oberösterreich in einem der 41 Tumorboards besprochen.',
        'Ob jemand in Linz oder in Freistadt behandelt wird: Die Therapieentscheidung fällt mit dem Wissen des ganzen Netzwerks. Das passt zu einem Kernziel der Krebsmission – gleicher Zugang zu guter Versorgung, unabhängig vom Wohnort.',
      ],
    },

    '234567890': {  // ListenIN
      meta: 'FH Campus Wien · Cancer Mission Lab der Ludwig Boltzmann Gesellschaft, April 2025 bis Dezember 2027',
      paragraphs: [
        'ListenIN wendet sich Menschen zu, die in der Krebsversorgung kaum vorkommen: obdach- und wohnungslosen sowie prekär wohnenden Menschen mit Krebserfahrung. Mit der PhotoVoice-Methode dokumentieren Betroffene als Co-Forschende selbst, wo ihr Weg zur Versorgung scheitert.',
        'Parallel misst das Projekt, wie gut Einrichtungen im Gesundheits- und Sozialsystem auf diese Menschen eingestellt sind, und stärkt ihre Gesundheitskompetenz mit Schulungen. Die Empfehlungen werden in einem Delphi-Prozess mit Fachleuten und Entscheidungsträger:innen abgestimmt.',
        'Geleitet wird ListenIN von der FH Campus Wien, gemeinsam mit MedUni Wien, Gesundheit Österreich, aks gesundheit und AmberMed.',
      ],
    },

    // ── Gesunde Böden ─────────────────────────────────────────────────────

    '101112707': {  // LOESS
      meta: 'Universität Innsbruck · Horizon Europe, bis Mai 2026',
      paragraphs: [
        'Was wir nicht kennen, schützen wir nicht. LOESS setzt deshalb beim Bodenwissen an. Das Projekt erhebt, wie viel über Böden heute in Volksschule, höherer Schule, Hochschule und Berufseinstieg vermittelt wird – und warum vorhandenes Lehrmaterial so wenig genutzt wird.',
        'Daraus entstehen gemeinsam mit Lehrenden und Lernenden neue Kurse und Module, auch mit Virtual- und Augmented-Reality-Anwendungen, und ein europäischer Atlas der Bodenbildungsarbeit. Getragen wird das von Communities of Practice in 15 Ländern, die Schulen, Behörden und Zivilgesellschaft verbinden. Kampagnen und Veranstaltungen sollen das Thema aus der Fachwelt in die Öffentlichkeit holen.',
        'Koordiniert wird LOESS vom Wissenschaftsladen Bonn mit 20 Partnern; aus Österreich ist die Universität Innsbruck dabei.',
      ],
    },

    '101091010': {  // BENCHMARKS
      meta: 'AGES · Horizon Europe, Jänner 2023 bis Dezember 2027',
      paragraphs: [
        'Wie gesund ist ein Boden? Darauf gibt es in Europa bisher keine einheitliche, bezahlbare Antwort. BENCHMARKS entwickelt einen gemeinsamen Rahmen für das Monitoring der Bodengesundheit: welche Indikatoren für Acker, Wald oder Stadt passen, wie man sie misst und welche Bewirtschaftung hilft – gebündelt in einem interaktiven Dashboard. Getestet wird das in 28 Fallstudien in ganz Europa.',
        'Österreich spielt dabei eine zentrale Rolle: Das Bodenlabor der AGES analysiert die Proben aller Fallstudien, 2024 und 2025 waren das 2.360 Proben mit 12.900 Messwerten. Die österreichische Fallstudie ist ein Bodenbearbeitungsversuch in Fuchsenbigl, der seit 1988 läuft. Beim Citizen-Science-Projekt SoilBlitz kamen zudem über 400 Beiträge aus ganz Österreich.',
      ],
    },

    '190167638': {  // Agrobiogel
      meta: 'Agrobiogel GmbH · EIC Accelerator (Horizon Europe), Juli 2022 bis Mai 2025',
      paragraphs: [
        'Das Tullner Unternehmen Agrobiogel hat einen Bodenverbesserer entwickelt, der Wasser und Dünger speichert und langsam wieder abgibt. Der Rohstoff ist Lignin, ein bisher kaum genutztes Nebenprodukt der Papier- und Zellstoffindustrie.',
        'Laut Unternehmen spart das Gel bis zu 40 Prozent Bewässerungswasser, schützt Pflanzen vor Dürre und macht selbst reine Sandböden landwirtschaftlich nutzbar. Gleichzeitig ersetzt es fossile Hydrogele, die nicht biologisch abbaubar sind.',
        'Für die internationale Skalierung hat Agrobiogel eine Förderung aus dem EIC Accelerator des Europäischen Innovationsrats erhalten: rund 2,4 Millionen Euro EU-Beitrag bei 3,4 Millionen Euro Projektkosten.',
      ],
    },

    // ── Wasser und Gewässer schützen ──────────────────────────────────────

    '101104368': {  // AMooRe
      meta: 'Amt der Vorarlberger Landesregierung, Bregenz · LIFE Integriertes Projekt, 2024 bis 2033',
      paragraphs: [
        'Moore speichern Wasser und Kohlenstoff – aber nur, solange sie nass sind. LIFE AMooRe ist auf zehn Jahre angelegt und soll die Moorstrategie Österreich 2030+ in die Umsetzung bringen. Dafür haben sich sechs Bundesländer und zwei Bundesministerien als Partner zusammengeschlossen, drei weitere Länder sind assoziiert. Gemeinsam decken sie ganz Österreich ab; koordiniert wird vom Land Vorarlberg.',
        'Geplant sind Renaturierungen auf rund 1.400 Hektar, die 13 Lebensraumtypen und 37 besonders schützenswerten Arten zugutekommen. Dazu kommen ein Expert:innennetzwerk und die Abstimmung von Rechtslage und Fachwissen. Ein Beispiel aus der Praxis: Im Tiroler Bichlachmoor wird wiedervernässt.',
        'Das förderfähige Budget liegt bei rund 44 Millionen Euro.',
      ],
    },

    '101213836': {  // DANUBElifelines
      meta: 'Betriebsgesellschaft Marchfeldkanal, Deutsch-Wagram · Horizon Europe, 2025 bis 2029',
      paragraphs: [
        'Huchen, Nase, Barbe, Stör: Die Donau ist die Lebensader wandernder Fischarten – doch Querbauwerke und verbaute Ufer zerschneiden ihre Wege. DANUBElifelines wird von der BOKU Wien koordiniert und vereint 24 Partner aus elf Ländern.',
        'Das Projekt erforscht Fischwanderung, Lebensraumqualität und Wanderkorridore im gesamten Donaueinzugsgebiet. An acht Standorten von Deutschland bis Bulgarien zeigt es, wie man Barrieren entfernt und Lebensräume mit naturbasierten Lösungen wieder verbindet. Geplant sind unter anderem ein Atlas zu Fischwanderung und Durchgängigkeit der Donau, Schutz-Hotspots für wandernde Arten und ein Aktionsplan zur Wiederherstellung.',
        'Damit zahlt das Projekt auf das EU-Ziel ein, 25.000 Flusskilometer wieder frei fließen zu lassen. Aus Niederösterreich ist die Betriebsgesellschaft Marchfeldkanal dabei.',
      ],
    },

    '101093985': {  // DANUBE4all
      meta: 'Amt der NÖ Landesregierung / ARGE Donauländer · Horizon Europe, bis Dezember 2027',
      paragraphs: [
        'Auf Europas Flüssen stehen mehr als eine Million Barrieren, 70 bis 90 Prozent der Auen sind ökologisch beeinträchtigt. DANUBE4all erarbeitet gemeinsam mit Bürgerinnen, Bürgern und Stakeholdern einen Aktionsplan zur Wiederherstellung für das gesamte Donaueinzugsgebiet – den Leuchtturm der Wassermission an der Donau.',
        'Herzstück sind drei Demonstrationsgebiete an der Oberen und Mittleren Donau sowie im Donaudelta. Das österreichische liegt im Nationalpark Donau-Auen bei der Paradeisinsel. Dort werden auf 2,7 Kilometern Uferbefestigungen entfernt und 15 Buhnen angepasst, damit sich das Ufer wieder natürlich entwickeln kann.',
        'Umgesetzt wird das von viadonau, der Abschluss ist für Mitte 2027 geplant. Aus Niederösterreich ist das Land über das Generalsekretariat der ARGE Donauländer beteiligt.',
      ],
    },
  },
};
