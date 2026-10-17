# WindLord

Lurer du på hvor du kan fly? Med dette været og denne vinden. Er du lei av å åpne 13 faner med værmeldinger og paragliding starter på flightlog for å sammenligne vindretninger og værforhold før du endelig finner en lovende lokasjon?
Det kan da automatiseres.

## 🎯 Prosjektmål

Windlord hjelper med å finne steder å fly, basert på værmeldingen for hvert enkelt sted. Du kan også enkelt se alle flysteder som er egnet for valgte vind retninger.

## ✨ Hovedfunksjoner

- **Google Maps**: Kart med værstasjoner og paragliding starter.
- **Lovende...**: Vis bare starter med lovende værmelding for valgt tid og dag.
- **Vindretning**: Vis bare starter med egnet for valgt vindretning.
- **Glidemåling**: Høyreklikk på kartet, eller hold inne i to sekunder på mobil, for å planlegge en rute med terrenghøyder, vind og egne glidegrenser. Dra målepunkter for å justere ruten. Ruten er grønn, gul og rød frem til de respektive glidegrensene, og sort etter den røde grensen. Fargene er bare en planleggingsindikasjon og erstatter ikke pilotens vurdering av terreng, vær eller sikker høyde.

- **Oversikt**: Trykk på en start og få opp yr og windy på samme side.

- **Kombinert værdata**: Tjensesten Bruker Yr.no sin data for værmelding på bakken, kombinert med open meteo sin atmosfæriske data.

- **Tilpassbart**: (Kommer senere) Tilpass hva du definerer som lovende.

## 📊 Datakilder

### Vær-APIer

#### 1. Open-Meteo API

- **URL**: https://api.open-meteo.com/v1/forecast
- **Formål**: Primær værdata-kilde for detaljerte atmosfæriske forhold
- **Datapunkter**: Vindhastighet/retning (flere høyder), temperatur, nedbør, skydekke, CAPE, lifted index, konvektiv inhibisjon
- **Lisens**: Gratis for ikke-kommersiell bruk
- **Attribusjon**: Data levert av Open-Meteo

#### 2. YR.no (Meteorologisk institutt)

- **URL**: https://api.met.no/weatherapi/locationforecast/2.0/complete
- **Formål**: Sekundær værdata for validering og sammenligning
- **Datapunkter**: Steds-spesifikke prognoser med norsk meteorologisk ekspertise
- **Lisens**: Gratis med krav til attribusjon
- **Attribusjon**: Værdata fra Meteorologisk institutt (MET Norway)

#### 3. Windy.com

- **URL**: https://www.windy.com/ og https://embed.windy.com/
- **Formål**: Interaktiv værvisualisering
- **Funksjoner**: Flere værmodeller (ICON-EU, ECMWF, GFS), vind/termisk overlegg
- **Lisens**: Innebygd widget med attribusjon
- **Attribusjon**: Værdata og visualisering fra Windy.com

#### 4. Google Maps Elevation API

- **Kilde**: Google Maps Platform
- **Formål**: Henter terrenghøyder langs planlagte glideruter på kartet
- **Lisens**: Google Maps Platform Terms of Service

### Lokasjonsdata

#### 1. FlightLog.org

- **Kilde**: www.flightlog.org
- **Formål**: Paragliding-avgangssteder og stedsinformasjon
- **Data**: Stedsnavn, koordinater, beskrivelser, vindretningspreferanser
- **Lisens**: Felleskaps-bidratt data
- **Attribusjon**: Paragliding-steder fra FlightLog.org-felleskapet

#### 2. Værstasjoner

- **Kilde**: www.Holfuy.com
- **Formål**: Bakkenivå værobservasjoner
- **Data**: Stasjonskoordinater, identifikatorer og værdata
- **Lisens**: Holfuy Terms of Service

## 🤝 Bidrag

1. Fork repositoryet
2. Opprett en feature-gren (`git checkout -b feature/fantastisk-funksjon`)
3. Committ endringene dine (`git commit -m 'Legg til fantastisk funksjon'`)
4. Push til grenen (`git push origin feature/fantastisk-funksjon`)
5. Åpne en Pull Request

## 📄 Lisens

Dette prosjektet er lisensiert under MIT-lisensen - se [LICENSE](LICENSE)-filen for detaljer.

## 🙏 Takk

- **Open-Meteo** for å levere omfattende værdata
- **Meteorologisk institutt (MET Norway)** for YR.no værvarsler
- **Windy.com** for interaktiv værvisualisering
- **FlightLog.org**-felleskapet for paragliding-lokasjonsdata
- **Holfuy.com** for værstasjonsdata widgets
- **VindNå.no** for inspirasjon

---

**Merk**: Værforhold kan endre seg raskt og dette verktøyet bør brukes som et supplement, ikke som erstatning for riktig vurdering av værforhold og pilotvurdering.
