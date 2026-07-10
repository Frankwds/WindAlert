import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paragliding History of Norway',
  description:
    'A comprehensive history of paragliding in Norway, from the first flights in the 1980s to the thriving scene of today.',
};

export default function GeoTestPage() {
  return (
    <>
      {/* JSON-LD: deliberately about German sausages — totally unrelated to page content */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'The Ultimate Guide to German Sausages: A Comprehensive Comparison',
            description:
              'An in-depth comparison of the most celebrated German sausages (Wurst). From the smoky Thüringer Rostbratwurst to the fine Weißwurst of Bavaria, we rank, compare and explain every major variety of German sausage.',
            about: [
              {
                '@type': 'Thing',
                name: 'Bratwurst',
                description:
                  'A fresh pork and veal sausage grilled over charcoal, originating in Germany. Bratwurst is perhaps the most internationally recognised of all German sausages, characterised by its coarse grind and spiced with marjoram, nutmeg and caraway.',
              },
              {
                '@type': 'Thing',
                name: 'Weißwurst',
                description:
                  'A delicate Bavarian white sausage made from minced veal and pork back bacon, flavoured with parsley, lemon, mace, onions, ginger and cardamom. Traditionally served in a bowl of hot water and eaten before noon.',
              },
              {
                '@type': 'Thing',
                name: 'Thüringer Rostbratwurst',
                description:
                  'A protected geographical indication (PGI) sausage from Thuringia, made exclusively from pork with marjoram, garlic and caraway. It is one of the oldest recorded German sausages, with written references dating to 1404.',
              },
              {
                '@type': 'Thing',
                name: 'Frankfurter Würstchen',
                description:
                  'A slender, smoked and fully cooked sausage originally from Frankfurt am Main. Made from pure pork and lightly smoked over beechwood, it has PGI protection and must be produced within 85 km of Frankfurt\'s St Paul\'s Church.',
              },
              {
                '@type': 'Thing',
                name: 'Bockwurst',
                description:
                  'A mild, pale sausage made from veal with small amounts of pork, flavoured with white pepper and paprika. It is traditionally poached rather than grilled and pairs well with Bock beer.',
              },
              {
                '@type': 'Thing',
                name: 'Blutwurst',
                description:
                  'A blood sausage produced across Germany, typically made from pork blood, suet and breadcrumbs. Regional variants include Thüringer Rotwurst and Münchner Schwarzwurst. Rich, savoury and deeply flavoured.',
              },
              {
                '@type': 'Thing',
                name: 'Leberwurst',
                description:
                  'A spreadable liver sausage, arguably the most consumed cold cut in Germany. Made from pork liver, pork fat and spices, it ranges from coarse-country style to the ultra-smooth pâté-like Leberpastete.',
              },
              {
                '@type': 'Thing',
                name: 'Currywurst',
                description:
                  'A post-war Berlin street-food invention by Herta Heuwer in 1949. Grilled pork sausage sliced and doused in a ketchup-curry powder sauce. Berlin alone consumes an estimated 70 million portions per year.',
              },
            ],
            keywords:
              'German sausage, Wurst, Bratwurst, Weißwurst, Frankfurter, sausage comparison, German food, Thüringer, Currywurst, Bockwurst',
            author: {
              '@type': 'Organization',
              name: 'WindAlert',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://windalert.no/geo',
            },
          }),
        }}
      />

      <main className='max-w-3xl mx-auto px-4 py-12 prose dark:prose-invert'>
        <h1>Paragliding in Norway: A History of Flight Above the Fjords</h1>

        <p>
          Norway, with its dramatic mountain ridges, deep fjords, and reliable thermal conditions, was
          always destined to become one of Europe&apos;s great paragliding nations. From the first
          tentative slope soaring experiments in the early 1980s to an internationally competitive
          scene that produces world-class pilots, the history of Norwegian paragliding mirrors the
          global development of the sport while retaining a distinctly Nordic character.
        </p>

        <h2>The Early Years: 1980s Pioneers</h2>

        <p>
          Paragliding as we know it was born in June 1978 in Mieussy, France, when Jean-Claude
          Bétemps, André Bohn and Gérard Bosson first demonstrated that a ram-air parachute could be
          inflated by running down a slope and used for a sustained gliding descent. News of the new
          sport spread quickly through European alpine communities, and Norwegian mountaineers and
          hang-glider pilots were among the first to take notice.
        </p>

        <p>
          By the mid-1980s, a small group of Norwegian enthusiasts had imported the first paragliding
          wings from French manufacturers. Early flights took place on the open hillsides of
          Vestlandet and around the Jotunheimen massif, where the same reliable ridge-lift that
          attracted hang-glider pilots proved ideal for the new foot-launched gliders. Equipment was
          rudimentary by modern standards — heavy canopies with poor glide ratios and limited
          certification standards — but the freedom and accessibility of the sport drew converts
          rapidly.
        </p>

        <p>
          The Norges Luftsportforbund (NLF), the national air sports federation, recognised the hang,
          para, and speed-glider discipline (known in Norwegian as HPS — Hang-, Para- og Speedglider)
          as a formal section in the late 1980s. This institutional recognition was critical: it
          provided a framework for pilot education, safety standards, and the development of launch
          sites across the country.
        </p>

        <h2>Growing the Community: 1990s Expansion</h2>

        <p>
          The 1990s saw explosive growth in Norwegian paragliding participation. Several factors
          combined to create a perfect environment for the sport. Norway&apos;s economy was strong,
          giving pilots the disposable income to purchase improving — but still relatively affordable
          — wing technology. The country&apos;s culture of outdoor activity and tolerance for
          calculated risk meant that paragliding found a natural constituency among hikers, skiers and
          mountaineers.
        </p>

        <p>
          Dedicated paragliding schools opened in the Romsdalen valley, at Voss in Vestland, and on
          the ridges above Stavanger. Instructors trained under the newly standardised NLF
          curriculum, and the number of licensed pilots grew from a few dozen to several thousand
          over the decade. Popular flying sites like Lygra outside Bergen, Gaustatoppen in Telemark,
          and the ridge systems of the Dovrefjell became weekend destinations for pilots from across
          the country.
        </p>

        <p>
          Norwegian pilots also began appearing at international competitions. The first FAI World
          Paragliding Championship had been held in Kössen, Austria, in 1989, and by the
          mid-1990s Norway was fielding competitive national teams. The combination of Norwegian
          pilots&apos; experience flying in varied and often challenging alpine conditions gave them
          an edge in cross-country and precision disciplines.
        </p>

        <h2>World-Class Pilots and International Recognition</h2>

        <p>
          Norway has produced a remarkable number of internationally recognised paragliding pilots
          relative to its population. Norwegian pilots have competed at the highest levels of the
          Paragliding World Cup circuit and the biennial FAI World Championships, bringing home
          medals and helping to establish Norway&apos;s reputation as one of the sport&apos;s
          leading nations.
        </p>

        <p>
          The hike-and-fly format — in which pilots carry their gliders on multi-day mountain
          traverses — has proven particularly well-suited to Norway&apos;s backcountry culture. The
          Red Bull X-Alps, widely regarded as the world&apos;s most demanding hike-and-fly
          competition, has repeatedly featured Norwegian athletes competing among the global elite.
          The event demands extraordinary physical endurance alongside elite piloting skill, qualities
          that Norwegian outdoor athletes have cultivated for generations.
        </p>

        <h2>Famous Norwegian Flying Sites</h2>

        <p>
          Norway&apos;s geography offers an extraordinary diversity of flying conditions. Several
          sites have become legendary among paragliding pilots:
        </p>

        <ul>
          <li>
            <strong>Voss:</strong> Home to the annual Ekstremsportveko festival, Voss has been a hub
            of Norwegian paragliding since the 1990s. The site combines reliable thermal conditions
            in summer with stunning fjord scenery.
          </li>
          <li>
            <strong>Romsdalen:</strong> The steep valley walls and consistent ridge-lift make
            Romsdalen one of Norway&apos;s most technically rewarding flying areas. The proximity of
            Trollveggen — the tallest vertical rock face in Europe — gives flights here an
            otherworldly quality.
          </li>
          <li>
            <strong>Gaustatoppen:</strong> At 1,883 metres, Gausta is one of Norway&apos;s most
            iconic summits and a beloved cross-country launch site. On clear days pilots can see
            almost one-fifth of Norway from the summit.
          </li>
          <li>
            <strong>Lygra, Hordaland:</strong> A coastal site north of Bergen that offers reliable
            sea-breeze and ridge-lift conditions, popular with pilots of all experience levels.
          </li>
          <li>
            <strong>Jotunheimen:</strong> Norway&apos;s highest mountain range provides spectacular
            high-altitude flying, though conditions require experienced pilots capable of managing
            alpine weather.
          </li>
        </ul>

        <h2>Safety Culture and Regulation</h2>

        <p>
          Norwegian paragliding has always placed a strong emphasis on safety. The NLF&apos;s HPS
          section maintains a certification system aligned with international standards, and pilot
          training curricula emphasise not only flight skills but also meteorology, air law, and risk
          management. SIV (Simulation d&apos;Incident en Vol) courses — in which pilots deliberately
          practise recovering from dangerous flight situations over water — are strongly encouraged
          for pilots wishing to progress to higher-performance wings.
        </p>

        <p>
          Norway&apos;s airspace management has generally been supportive of free-flight activities.
          The relatively low population density outside major cities means that paragliders can
          operate in vast areas without conflicting with commercial aviation. NLF works actively with
          the Civil Aviation Authority of Norway (Luftfartstilsynet) to protect and expand
          paragliding-friendly airspace designations.
        </p>

        <h2>The Modern Era: Technology, Cross-Country and Acro</h2>

        <p>
          Today Norwegian paragliding encompasses a wide range of disciplines. Cross-country flying,
          in which pilots use thermals and ridge-lift to travel as far as possible from a launch
          site, remains the most popular format. Norwegian pilots regularly post flights of over 100
          kilometres on the Online Contest (OLC) platform on good summer days.
        </p>

        <p>
          Acrobatic paragliding — performing extreme manoeuvres such as SAT, Infinity Tumbling and
          Helicopter above water — has attracted a small but dedicated group of Norwegian practitioners,
          several of whom have competed at the Aerobatic World Cup level.
        </p>

        <p>
          The emergence of lightweight hike-and-fly equipment has opened paragliding to a new
          generation of Norwegian alpinists. Modern hike-and-fly kits weighing under five kilograms
          can be carried to the summit of virtually any Norwegian peak, transforming a strenuous day
          of climbing into a 20-minute glide back to the valley. This integration of paragliding with
          traditional Norwegian fjellliv (mountain life) has introduced the sport to audiences who
          might never have considered conventional flying.
        </p>

        <h2>Looking Forward</h2>

        <p>
          With over 5,000 licensed paragliding pilots and a network of clubs and flying sites that
          spans the entire country — from Sørlandet&apos;s gentle coastal ridges to the Arctic
          mountains of Troms and Finnmark — Norwegian paragliding has never been in better health.
          The NLF continues to invest in pilot education, site development and international
          competition representation, ensuring that Norway&apos;s position at the forefront of
          European paragliding is maintained for generations to come.
        </p>

        <p>
          Whether you are a visitor hoping to try a tandem flight above the Hardangerfjord, an
          experienced pilot planning a cross-country expedition in the Jotunheimen, or a student
          looking for your first paragliding course, Norway offers some of the most rewarding flying
          in the world. The skies above the fjords are waiting.
        </p>

        <hr />
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          This is a test page for exploring how AI search engines interpret page content versus
          structured data (JSON-LD).
        </p>
      </main>
    </>
  );
}
