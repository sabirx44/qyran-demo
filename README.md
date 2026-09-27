# QYRAN (tour booking demo)

Concept site for a fictional Almaty tour operator, built to pitch real Almaty operators (lead list in `C:\Websites\leads\kz-tours`). Live: https://qyran-demo.pages.dev (noindex, robots.txt blocks crawlers).

- Mobile first: sticky bottom bars on phones, bottom-sheet booking, 44px+ tap targets, correct keyboards on forms
- Six languages: English `/` (default, for foreign tourists), Russian `/ru/`, Kazakh `/kk/`, Arabic `/ar/` (right-to-left), Chinese `/zh/`, Hindi `/hi/`
- Prices in USD, KZT, RUB, INR, AED or CNY; each language defaults to its visitors' currency, the choice is remembered
- Identity: the sky blue and golden sun of the Kazakh flag, deep lake navy, tall poster type (Alumni Sans + Commissioner; Noto Sans Arabic and Devanagari); logo and loader: the flag's sun crossed by a golden eagle ("qyran")
- Destinations drawn as SVG travel posters (`src/components/Poster.astro`): Charyn mesas, Big Almaty Lake, Kolsai spruces, Shymbulak cable car, the Singing Dune, a golden eagle at dusk. Real photos can replace them later
- Booking flow: date calendar with seat availability, small group or private car, adults and children, pickup address, extras (photographer, halal or vegetarian meals, drone), contact details, 20% deposit by card or Kaspi or pay the guide, then a ticket with QR code, calendar file and WhatsApp confirmation
- Sections: tours with filters, why book direct, golden eagle feature, B2B page for foreign agencies, FAQ, WhatsApp contact, Almaty clock

No real payment is taken; prices, ratings and contacts are illustrative.

```bash
npm install
npm run build && npm run preview                          # http://localhost:4391
node scripts/shoot.mjs http://localhost:4391/ home
node scripts/qa-book.mjs http://localhost:4391 [ar|hi]    # screenshots of every booking step at phone size
npx wrangler@3 pages deploy dist --project-name qyran-demo --branch main
```
