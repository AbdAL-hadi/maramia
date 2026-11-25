# Maramia UAE

Maramia UAE is a bilingual restaurant website for a hackathon. Arabic is the default, and the language switch remembers the visitor’s choice. The homepage presents Palestinian dining for a UAE audience. The offers, newsletter, ordering and reservation flows use browser-local demo data.

[Five-minute demonstration](DEMO.md) · [Marketing team handover](MARKETING_GUIDE.md)

## Stack and architecture

React, TypeScript and React Router run in Vite. The shared customer layout handles navigation, focus and the cart. The workspace routes have a separate presentation layout. The menu, checkout, booking, editorial and marketing routes load on demand. Styles use Tailwind’s base and utility layers with local CSS. Motion handles transitions, and Lucide supplies icons. Canvas and a local QR encoder generate exports in the browser. The app serves fonts and images from the build and has no backend.

| Routes | Features |
| --- | --- |
| `/`, `/about`, `/uae` | Bilingual homepage, Palestinian brand story, dining collections, photo gallery and virtual tour. |
| `/menu`, `/menu?dish=chicken-musakhan` | 49-item menu, search, filters, and shareable details and selections. |
| `/order`, `/order/:orderId`, `/order/:orderId/track` | Cart, UAE demo checkout, confirmation and tracking. |
| `/reservation`, `/reservation/manage`, `/reservation/:reference`, `/reservation/:reference/edit` | 20-table floor plan, Dubai-time availability, saved bookings, calendar export and management. |
| `/offers`, `/offers/:campaignSlug`, `/offers/table-quiz` | Six campaigns, referrals, sharing and the preference quiz. Campaigns are `welcome-to-maramia`, `palestinian-family-table`, `business-lunch`, `maramia-mezze-night`, `taste-of-palestine` and `celebrations-at-maramia`. |
| `/loyalty`, `/gift-cards` | Three rewards tiers, points and redemption, and downloadable demo gift cards. |
| `/contact`, `/faq`, `/feedback` | Local contact validation, searchable help, and anonymous structured ratings. |
| `/marketing`, `/marketing/studio`, `/marketing/links`, `/marketing/qr` | Anonymous analytics, retention and feedback reports, CSV, Canvas graphics, campaign links and printable QR cards. |
| Other extensionless paths | Branded bilingual recovery page with links to the menu and homepage. |

## Run locally

Use Node.js 22.12+ on the 22.x line or a newer supported LTS release. Use the checked-in npm lockfile.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Run `npm run build` for production output in `dist/`, then use `npm run preview` to inspect that build. Serve `index.html` for client-side routes when deploying to static hosting.

## Test

```sh
npx playwright install chromium
npm test
```

Playwright starts and stops a local Vite server. The suite covers the customer journeys, browser-local data, bilingual graphics and PNG exports, independent QR decoding, tracking, analytics, and route recovery. Arabic and English layouts are tested at 320, 375, 768, 1024 and 1440 px. Set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome browser.

To test the built output on Windows PowerShell:

```powershell
npm.cmd run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_PREVIEW = '1'
npm.cmd test
Remove-Item Env:PLAYWRIGHT_PREVIEW
```

Use `PLAYWRIGHT_PREVIEW=1 npm test` on POSIX shells after building. Use an empty `VITE_PUBLIC_SITE_URL` for the standard local regression suite. Several scenarios deliberately open the URL produced by the builder, so a configured public origin would take them away from the test server.

### Phase Nine performance measurements

Production builds were measured on the same laptop using a mobile Lighthouse 13.0.1 run and five cold-cache Chrome runs on an emulated Pixel 7 with 4× CPU throttling, 50 ms latency and 4 Mb/s download. Gzip figures come from the initial HTML-linked assets. The measurements describe the local test setup.

| Homepage measurement | Before | After |
| --- | ---: | ---: |
| Initial JavaScript, gzip | 189.74 kB | 168.70 kB |
| Initial CSS, gzip | 16.62 kB | 13.67 kB |
| Mobile hero WebP | 332.90 kB | 97.26 kB |
| Font payload during Chrome sample window | 92.53 kB | 92.53 kB |
| Mobile Lighthouse performance | 73 | 79 |
| Mobile Lighthouse Largest Contentful Paint | 6.47 s | 4.56 s |
| Mobile Lighthouse First Contentful Paint | 2.72 s | 2.76 s |
| Chrome median Largest Contentful Paint | 1.40 s | 1.62 s |
| Chrome median homepage to menu heading | 81 ms | 88 ms |
| Chrome median homepage to reservation heading | 73 ms | 69 ms |

Lighthouse reported 100 for accessibility and best practices in both runs. The SEO score moved from 92 to 66 because the demo now explicitly blocks indexing. The separate Chrome median showed a slightly later paint. The measurements capture lab behavior, and the SPA still ships its catalogue and translation tables on first load. The existing menu layout test now waits for the lazy-loaded category controls before measuring them. Its viewport, modal, and image assertions are unchanged.

## Deployment preparation

`vercel.json` uses the Vite preset, `npm ci`, `npm run build`, and `dist`. The SPA rewrite serves deep links and refreshes while static files are served at their own URLs. A missing static asset returns a host 404. Unknown client-side routes display the branded 404 within the SPA, which can still return HTTP 200 from a static host. The app stays unindexed by default through `index.html`’s robots meta tag. `robots.txt` permits crawlers to read that directive. Marketing, order, and reservation-management routes also carry a Vercel `X-Robots-Tag`. There is no sitemap for the demo. [Vercel Vite guide](https://vercel.com/docs/frameworks/frontend/vite) · [Google robots meta guidance](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)

1. After approval, connect only the approved GitHub repository. From the prepared local repository, inspect the Git status, then run the commands below. Replace `APPROVED_GITHUB_REPOSITORY_URL` with the repository’s actual clone URL. If `origin` already exists, verify it points to the approved repository before proceeding. If the remote has history, fetch and reconcile it before a normal push.

   ```sh
   git status --short --branch
   git remote -v
   git add .
   git diff --cached --stat
   git commit -m "Prepare Maramia UAE hackathon handover"
   git remote add origin APPROVED_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```

2. In Vercel, import the approved repository as a Vite project. Use the root of the checkout and select Node.js 22.x or another compatible LTS version. Configure preview access in the chosen Vercel project before sharing any deployment link. Keep crawler blocking enabled for the hackathon.
3. Copy `.env.example` to `.env.local` for local work, or add `VITE_PUBLIC_SITE_URL` in Vercel’s environment settings. Use the approved HTTP(S) origin only. Rebuild after changing it. With the variable unset or invalid, generated links and QR destinations use the current browser origin. Localhost links typically cannot be reached from another device. A configured origin also makes the static social card image URL absolute. Vite exposes `VITE_` variables to the browser. [Vite environment configuration](https://vite.dev/guide/env-and-mode)
4. Verify the protected preview with direct visits and refreshes on `/menu?dish=chicken-musakhan`, `/reservation`, `/offers/welcome-to-maramia`, and `/marketing/qr`. Scan an exported QR from a second device, check the destination, and verify social sharing markup with the approved origin. Promote to production and share the link only after approval.

After official approval for indexing, review route metadata and operational details, remove the global `noindex, nofollow` tag in `index.html`, retain the private-route `X-Robots-Tag` rules, and publish a sitemap containing only approved public URLs. Social crawlers that read HTML without executing JavaScript receive the shared bilingual site card. The SPA updates titles and descriptions per route once it runs.

## Data, privacy, and launch limitations

- Browser storage is scoped to the site origin. Versioned records keep the language preference, cart, order summaries, bookings, points, aggregate inputs and saved campaign settings. Records are validated when read. Checkout details and reservation contact details are excluded from saved confirmations. Free-text dish instructions can remain with an active cart until it is cleared or checked out. Use sample information everywhere in the demo.
- Contact messages are validated locally and cleared. Gift-card greetings and references stay on the page and are included only in the graphic a visitor chooses to export. Payment choices are labels for simulated payment methods. The site collects no card number or payment credential.
- The app records allowlisted local analytics fields and numeric feedback. Synthetic reports are separate. Analytics reset leaves the cart, orders, bookings, points and campaign link settings available.
- Orders, availability and reservations, loyalty balances, gift cards and analytics are simulations. They provide no shared availability, payment processing or secure administration. The marketing workspace is open. Changing devices, browser profiles or origins changes which browser-local records are available.
- Brand assets, imagery, UAE AED prices, promotional terms, location, contact information, opening hours, delivery coverage, and loyalty rules require Marketing Team approval. The existing illustrative images and temporary mark are listed under **Assets and restaurant details** below.

## Menu and UAE pricing

The catalogue imports 49 food and non-alcoholic beverage entries from the London restaurant’s published à la carte menu. The cold drinks count includes the explicitly non-alcoholic Taybeh entry. The reference supplies names, categories, listed ingredients and preparation details, vegetarian labels, and portion or flavour choices. Descriptions are rewritten and translated for Maramia UAE. The London source is treated as a food reference for a distinct business. [Maramia London menu](https://www.maramia.com/menus/)

| Category | Entries |
| --- | ---: |
| Cold Mezze | 6 |
| Hot Mezze | 10 |
| Charcoal Grill | 8 |
| Traditional Palestinian Dishes | 5 |
| Side Dishes | 5 |
| Desserts | 3 |
| Cold Beverages | 10 |
| Hot Beverages | 2 |

The 19 vegetarian indicators reflect the source’s explicit `(V)` labels. Packaged beverages and other entries with limited specifications show only the ingredient information the reference gives. Ordering supports charcoal chicken half and whole portions, both water sizes, and two herbal tea choices.

Prices are provisional AED estimates for premium casual dining, chosen by category and portion and subject to marketing approval. Shared mezze are AED 28–39, traditional mains AED 57–76, grills AED 65–110, and desserts AED 27–39. The lowest available portion price determines list sorting when prices vary. The detail panel shows the chosen portion price and quantity total.

## Demonstrate ordering

1. Open `/menu` and select the whole charcoal-grilled chicken. Set a quantity or add special instructions, then choose **Add to Cart**. Browse another dish or open the bag in the site header. The cart combines identical selections and keeps different portions or instructions on separate lines.
2. Edit a line in the cart and choose **Proceed to Checkout**. For delivery, select Dubai and use sample district and building values. For pickup, select a demo time for the proposed Maramia UAE location.
3. Use sample contact details such as **Demo Guest**, **+971 50 123 4567**, and **demo@example.test**. The form accepts UAE local and international phone formats, including Arabic digits. [TDRA numbering definitions](https://tdra.gov.ae/en/pages/ict-dictionary)
4. Apply **MARAMIA10** or **WELCOME20**. Select cash, demo card, or demo Apple Pay, then choose **Place Demo Order**. The confirmation shows the order reference, items, total and simulated fulfillment window. The cart clears once the order summary saves.
5. Choose **Track Order** and advance the five stages with **Advance Demo Status**. Delivery and pickup use different fourth-stage labels. Refreshing keeps the current stage. The latest order is also reachable from the empty checkout page.

### Simulated prices and services

- `MARAMIA10` takes 10% off the merchandise subtotal. `WELCOME20` takes AED 20 off when the merchandise subtotal reaches AED 100. Only one code applies per order. `TABLE15` is inactive for testing.
- Delivery fees range from AED 12 to 20, and minimum merchandise subtotals range from AED 60 to 80 across the seven sample emirate settings. The free-delivery demo applies at a merchandise subtotal of AED 180, before discounts. Pickup has zero delivery fee and uses a selectable 20–30, 45–55 or 60–70 minute window measured from order creation.
- Service areas, estimates, fees, minimums, discounts and curated menu pairings are illustrative and configurable in `src/data/ordering.ts`. Prices and promotions require marketing approval. Pickup uses a proposed location. All payment choices and order status updates are simulations.

### Ordering data

The cart uses menu IDs and current catalogue prices. Totals, percentages and fees are calculated in integer fils. The versioned LocalStorage record `maramia.ordering.v1` persists cart contents and up to 25 demo order summaries. Checkout saves the order and clears the cart in one storage write. Saved orders contain items, chosen portions, quantities, totals, payment method label, simulated time window and tracking stage. Contact details, full addresses, checkout notes and instructions are excluded from order history. The cart retains dish instructions while it is active.

Routes are `/order`, `/order/:orderId`, and `/order/:orderId/track`. Confirmation and tracking are available in the browser that saved the order.

## Demonstrate table reservations

1. Select **Reserve a Table** in the header or open `/reservation`. Choose tomorrow, four guests, and an available lunch time. The visit calendar, slot labels, and past-time checks use Dubai time. Choose an alternative when a demo slot is fully booked.
2. Explore the four proposed seating areas. Choose a table directly on the interactive floor plan or use the **Available Table List**. On a phone, swipe the plan horizontally or select from the list. The table summary shows its capacity, seating area, and availability for the chosen date and time.
3. Choose **Birthday** or another occasion and try the optional experience requests. With **Any Seating Area** selected, a celebration can suggest an available private table. Review the reason and select the suggestion if it suits the group. The dish suggestions open existing menu entries.
4. Enter sample details such as **Demo Guest**, **+971 50 123 4567**, and **demo@example.test**. Use **Back** to revisit a step. Review the visit, selected table, requests, and AED 0 additional charges before confirming.
5. On confirmation, copy the reservation reference or use **Add to Calendar** to download the local `.ics` file. Use **View Menu** to browse dishes or **Manage Reservation** to open the saved record.
6. Edit the guest count, date, time, or table and save. The same reference is retained, and availability is rechecked. Then cancel the future booking and start another request for its former time and table to see it release in the demo.

### Reservation settings and limitations

- `src/data/reservations.ts` defines 20 tables for parties of 1–12 in Main Dining, Family Seating, Outdoor Terrace, and Private Dining. Table capacities are 2, 4, 6, 8 and 12. Seating imagery and the floor plan depict the proposed space.
- The demo accepts dates up to 60 days ahead in `Asia/Dubai`. Lunch runs 12:00–15:00 and dinner 18:00–22:30 in the sample schedule, with 30-minute slot increments and 90-minute visits. The last start in each session leaves time for the full visit. Recurring table holds create predictable unavailable periods. Session hours, duration, and holds are configurable.
- The availability engine checks party size and overlapping intervals. Edits exclude the original reservation from the overlap check until the change saves. Cancellations preserve history and release the table. Recommendations rank available tables by preferred area, occasion, party size, and spare capacity. The recommendations and menus are curated rules.
- The versioned `maramia.reservations.v1` LocalStorage key stores the reference, date, time, duration, party size, table, occasion, selected experience preferences, and status. Contact details and special requests stay in memory during booking. A browser lock serializes updates across same-origin tabs where supported. Availability is browser-local and cannot guarantee real multi-user availability.
- Experience requests carry AED 0 in the demo and depend on availability. Reservations and calendar events represent a concept demonstration. The site uses sample operating hours and needs a verified UAE location, approved service policy, and a shared reservation system for real bookings.

Reservation routes are `/reservation`, `/reservation/manage`, `/reservation/:reference`, and `/reservation/:reference/edit`.

## Demonstrate the restaurant experience

1. Start on the homepage in Arabic. Use the language switch to give the same demo in English. Choose **Our Story** to open `/about`. Read the Ramallah roots, proposed values, and sage story. Open the Chicken Musakhan story to see its existing menu detail and ordering options.
2. Choose **Discover Our Restaurant** to open `/uae`. Start the tour or open `/uae#virtual-tour` directly. Use the arrows or thumbnails to visit the entrance and reception, main dining, family seating, outdoor terrace, private dining, and Palestinian table. Each scene has two hotspots. Activate one to read the detail and press Escape to close it.
3. In **Outdoor Terrace**, choose **Reserve This Experience**. The original booking wizard opens with Outdoor Terrace preferred. Choose tomorrow, four guests, and an available time. Continue to the floor plan or table list and select a table. The seating preference can be changed during booking.
4. Return to **Our Restaurant** and explore the four dining collections. Open an individual dish or use **Explore Menu**. Reserve **Palestinian Family Table** to preselect Family Seating and Family Gathering. Use the anniversary link in the occasions section to preselect Private Dining and Anniversary.
5. Open a gallery photo. Use the previous and next controls or the arrow keys to browse the seven photos and their localized captions. Press Escape to close the gallery and return focus to the selected photo's trigger.
6. Finish with the existing reservation or order demo. A reservation can be reviewed, confirmed, and managed with sample details. To demonstrate ordering, add an item from the menu, choose **Order Online**, and complete the simulated checkout and tracking steps above.

The booking links use validated query parameters such as `/reservation?seating=terrace&occasion=casual` and `/reservation?seating=family&occasion=gathering`. Unknown or missing values use Any Seating Area and Casual Dining, respectively. The wizard still checks party size, time, and table availability. Opening a saved reservation for editing loads its saved table and occasion.

### Brand research and concept assets

- La Casa Mall lists Maramia as a cafe and restaurant serving Arabic food in Ramallah. The official social profiles could not be verified directly during this phase. The story uses the mall listing for its brand reference and does not assign a founding date, company milestones, or official values. The London Maramia reference continues to inform the food catalogue. [La Casa Mall listing](https://lacasamall.ps/ar/dining/maramia/) · [Palestine Instagram](https://www.instagram.com/maramia.palestine/) · [Palestine Facebook](https://www.facebook.com/MaramiaCafeAndRestaurants) · [London food menu](https://www.maramia.com/menus/)
- The olive oil and musakhan story draws on Palestinian Ministry of Culture material. The sage and hospitality story draws on the Birzeit guide. Sage is a motif for this concept. The origin of the Maramia name remains unverified. [Palestinian Ministry of Culture inventory](https://ich.unesco.org/doc/src/40345.pdf?v=1528728535) · [Study in Palestine guide](https://www.birzeit.edu/sites/default/files/upload/why_study_in_palestine_guide.pdf)
- The values, dining collections, and celebration ideas are proposed marketing content. They have no fixed package prices or guaranteed services. Visuals depict a proposed venue. One new entrance and reception concept image was generated and compressed locally to WebP. The rest of the tour, gallery, and story reuse the existing restaurant, dining-area, hospitality, and catalogue images.

## Demonstrate campaigns and marketing

1. Open `/marketing`. **Local interactions** starts with the events recorded in this browser. Use **Synthetic sample** to preview the charts. Switch back to local interactions for the walkthrough. You can start with **Reset Analytics** if you want an empty marketing report.
2. Under **Hackathon Walkthrough**, open the simulated Instagram referral. The destination is `/offers/welcome-to-maramia?utm_source=instagram&utm_medium=influencer&utm_campaign=maramia_launch&ref=MIRA10`. Open a recommended dish such as **Hummus**, add it to the existing cart, then choose **Order Online**.
3. Checkout automatically applies **MIRA10** if eligible. Choose **Pickup** and a demo time. Use sample details such as **Demo Guest**, **+971 50 123 4567**, and **demo@example.test**. Select cash and place the demo order. An AED 28 hummus order by itself totals AED 25.20 after the 10% discount.
4. Open `/offers/palestinian-family-table` in the same tab. Select **Reserve a Table**, choose tomorrow, a time, and an available table. Verify **Family Seating** and **Family Gathering**. Confirm with sample contact details. You can also use **Celebrations at Maramia** to test the birthday, anniversary, and private gathering links.
5. Return to `/marketing`. The welcome order appears under the welcome campaign and **Influencer referral**. The reservation appears under **Palestinian Family Table** and **Direct**. Check the funnel, the campaign and source filters, and **Export Aggregate CSV**. Cancel the booking from the reservation manager to see it drop out of the reservation KPIs.
6. On `/offers`, choose **Discover Your Palestinian Table**. Answer the five questions, review the suggested dishes and estimated subtotal, and add only the dishes you select. Explore the menu or book the suggested area and occasion. Complete the consented preference form on a campaign page to demonstrate anonymous customer-interest capture.
7. On a campaign landing page, try **Share Campaign** or **Copy Campaign Link**. If the browser blocks clipboard access, the page selects a readable link for manual copying. **Share on WhatsApp** opens the visitor’s own share interface. **Print Campaign Card** uses the browser print dialog and can save the branded card to PDF.

### Campaign settings

The six entries in `src/data/campaigns.ts` configure copy, imagery, audiences, channels, dishes, actions, seating and occasions. The public routes are `/offers`, `/offers/:campaignSlug`, and `/offers/table-quiz`. Set `VITE_PUBLIC_SITE_URL` to the approved absolute HTTP(S) site origin at build time. When it is empty, campaign sharing uses the browser’s current origin.

| Campaign | Landing path segment | Main action |
| --- | --- | --- |
| Welcome to Maramia | `welcome-to-maramia` | Order with WELCOME20 |
| Palestinian Family Table | `palestinian-family-table` | Reserve Family Seating |
| Business Lunch | `business-lunch` | Order or reserve Main Dining |
| Maramia Mezze Night | `maramia-mezze-night` | Reserve Outdoor Terrace |
| Taste of Palestine | `taste-of-palestine` | Explore the menu and food stories |
| Celebrations at Maramia | `celebrations-at-maramia` | Reserve by occasion |

- Campaign date boundaries are inclusive Dubai calendar dates. Mezze Night is scheduled for November 1, 2026 through February 28, 2027. Its checkout code is unavailable before and after that range. The other five example campaigns have open dates. Archived and scheduled pages display their status.
- The existing MARAMIA10 and WELCOME20 terms still apply. MIRA10 is a 10% welcome referral, SALIM10 is a 10% seasonal referral, and UAEWELCOME offers AED 20 off a qualifying AED 100 subtotal. WELCOME20 remains eligible whenever its existing minimum is met. New visitors are its intended audience. The referral names and codes are illustrative. Every campaign requires approval before use.
- The quiz uses occasion, party size, food, atmosphere, and spending selections. It suggests a seating area with sufficient capacity in the model and quantities based on the existing menu and a provisional per-guest budget. Checkout retains its normal price, fee, and availability rules.

### Attribution, privacy, and dashboard calculations

- Each tab keeps an anonymous session ID in SessionStorage. The latest recognized active campaign landing, matching referral, or configured tag sets attribution. Ordinary navigation retains it. A different active campaign replaces it, and a direct landing for the same campaign retains any recognized referral. Known Instagram tags report as Instagram. Valid influencer codes report as Influencer referral, other recognized referrals and tagged sources report under Other sources, and untagged visits default to Direct. The checkout applies at most one eligible code; changing a code manually records its redemption without rewriting how the visit was acquired.
- `maramia.analytics.v1` retains up to 1,500 anonymous events from the browser, including menu engagement, campaign and referral activity, cart and checkout activity, demo completions, quiz choices, newsletter preferences, and share actions. A landing-page reload counts as a visit. Referrals count once per code and session, and successful order and reservation completions are deduplicated by demo reference. The log contains known IDs, timestamps, selected anonymous preferences, counts, and demo amounts. It collects no contact fields, free text, addresses, or payment details. The earlier demo signup contact lists are retired on customer routes. No newsletter is sent.
- Date filters use Dubai calendar days and default to the latest 30 calendar days including today. Order and reservation conversion divide distinct sessions with a qualifying completion by all distinct sessions in the filtered event set. Quiz completion divides distinct quiz starters who also finished by distinct quiz starters. Campaign conversion uses visitors to that campaign as its denominator and counts attributed completions after a campaign visit. The funnel counts unique sessions progressing in order through the five stages inside the filtered window. Charts group acquisition by sessions with a recorded visit, rank dishes by views or ordered units, and retain the latest quiz result per session for preference summaries.
- Simulated revenue is the sum of completed demo order totals after discounts and fees. Average order value divides that sum by the order count. Promo redemptions count orders with an applied eligible code. Cancelled bookings are excluded from completion KPIs. Available order states in this prototype represent completion and fulfillment stages.
- The dashboard is an open hackathon presentation route. Local interactions and the synthetic sample are separate datasets. CSV exports contain aggregate results only. Reset clears the analytics log and the current tab’s marketing session while preserving the cart and saved orders and reservations. Metrics depend on what the same browser and origin have recorded, and the bounded history is approximate.

## Demonstrate Maramia Rewards

1. Open `/loyalty`, choose **Join Rewards**, and inspect the Sage membership card. It begins with 50 available points and zero qualifying points. Try **Print Membership Card** or save the card as a PDF from the print dialog.
2. Add two portions of **Hummus** from the menu. At checkout choose **Pickup**, a demo time, and sample contact details such as **Demo Guest**, **+971 50 123 4567**, and **demo@example.test**. The AED 56 food subtotal estimates 56 Sage points. Place the demo order, open **Track Order**, and select **Advance Demo Status** four times. The 56 points appear at **Completed**, bringing the balance to 106.
3. Add two more portions of Hummus to the cart. Choose **AED 5 Dining Credit** at checkout, or select it from the reward catalogue. The reward costs 100 points and reduces the pickup total to AED 51. Try removing it, switching to a promo code, or leaving checkout before saving to show how the draft selection is released. Select it again and place the order.
4. Open `/loyalty` after order creation. The credit redemption appears once and the balance is 6. Advance the second order to **Completed**. The net AED 51 earns 51 more points. The ledger now shows 57 available points and 107 lifetime qualifying points. Open **Reorder Your Favourites** to review current dishes and prices before adding items again.
5. Open `/marketing` and scroll to **Customer Retention**. In a fresh browser with just these two orders, the default period shows two eligible loyalty completions, 50% repeat completed order rate, AED 53.50 average eligible order value, AED 51 repeat revenue and one 100-point redemption. Use the campaign and source filters or export the aggregate CSV. Resetting analytics clears the filtered interaction metrics while the lifetime ledger remains available.
6. Under **Presenter Demo Controls** on `/loyalty`, switch between Sage, Olive, and Golden Olive. Use **Simulate a Completed Past Visit in Sample** to show a visit award immediately, then **Exit Sample Scenario** to return to the actual browser membership. To record a real demo booking visit, open its confirmation and choose **Complete Demo Visit** after its scheduled Dubai time arrives.

### Points, tiers, and checkout

| Tier | Lifetime qualifying points | Order multiplier |
| --- | ---: | ---: |
| Sage | 0–499 | 1.0× |
| Olive | 500–1,499 | 1.25× |
| Golden Olive | 1,500+ | 1.5× |

- The tier at order completion applies to that order. Points are rounded down once after multiplying the discounted food and drinks subtotal in fils by the tier factor and converting to AED. Delivery fees are excluded. An order qualifies when a member advances its tracking status to **Completed**. Completion awards use the order reference, and reviewing a historical completion never issues points.
- A member can use the presenter action for an uncancelled reservation at or after its scheduled start in Asia/Dubai. Each eligible visit earns 50 flat qualifying points once per reservation reference. Welcome points and explicitly labeled demo adjustments contribute to available balance only. Spending points leaves lifetime qualifying points intact.
- The six rewards and their thresholds live in `src/data/loyalty.ts`. They include three fixed dining credits, one serving of Palestinian Coffee or Nabulsi Knafeh, and a Golden Olive dining credit. The cart must meet the displayed food subtotal, membership tier, balance, and item requirements. These are illustrative benefits requiring approval.
- Checkout previews one active reward in the current checkout draft. A reward and a promotional code are mutually exclusive, and the customer can switch between them. Removing the reward or leaving checkout releases the draft selection. The final eligibility check uses the current cart and ledger inside the browser storage lock. One write commits the order, cart update and debit. A failed save leaves the cart and balance available for retry.
- The versioned loyalty record sits alongside the cart and orders in `maramia.ordering.v1`, allowing atomic updates and keeping it separate from the analytics log. Its signed ledger derives the balance and tiers. Duplicate records, invalid references, and debits that would make the balance negative are ignored on read. A stored reversal can restore a corresponding debit once. The current demo order flow has no refund or order-cancellation operation.

### Retention, recommendations, and limits

- Repeat completed order rate is the number of eligible loyalty completions that follow an earlier eligible completion divided by all eligible loyalty completions in the selected filters. The earlier order may be outside the window. AOV and repeat revenue use paid demo totals after discounts and fees. Redemptions count successfully saved orders with rewards. Checkout attribution follows the original order to completion. The dashboard displays a lifetime membership snapshot separately from filtered interaction metrics.
- Recommendations combine current menu availability, past completed dishes and categories, and the latest local table quiz. Saved dining preferences take precedence for food and atmosphere. Reorder reviews apply current menu prices and portions. Data created before variant IDs were added falls back to matching the saved variant label.
- The loyalty view’s synthetic memberships and the dashboard’s synthetic analytics are separate presentation datasets. Membership preferences are selected from fixed options, and no contact details or membership number are added to analytics. Loyalty, reward fulfillment, and payments are browser-local simulations. Browser developer tools can edit demo data. Production loyalty or financial use requires a server-authoritative ledger and approved rewards. Cross-tab transactions use Web Locks on supported origins.

## Demonstrate Phase Eight

1. Run `npm run dev` and open `/marketing`. The **Marketing Tools** section links to the studio, link builder, QR workspace, and customer feedback analytics.
2. In **Social Media Content Studio** (`/marketing/studio`), choose **Signature Dish**, **Special Offer**, **Family Dining**, **Business Lunch**, **Palestinian Food Experience**, or **Maramia Rewards**. Change the photo, color, campaign, text, or promotional code. Switch the graphic language to Arabic and select **Instagram Story**. Download the PNG and try copying the caption, hashtags, and campaign link. The graphic language is independent of the workspace interface.
3. In **Campaign Link Builder** (`/marketing/links`), choose **Specific Menu Item**, **Chicken Musakhan**, **Taste of Palestine**, and **TikTok**. Enter a tracking name such as **Palestinian Table Launch**. Generate and save the link, then open it to see the dish detail and register a campaign visit. Return to the dashboard and filter by source or campaign.
4. From the generated link, choose **Generate QR Code** to open `/marketing/qr` with the URL prefilled. Edit the card title and language, generate the card, and download the branded PNG or print it. The standalone tool also supports the homepage, menu, menu items, reservations, campaign pages, rewards, and custom tracking URLs. Scan the exported image to inspect its destination.
5. Open `/gift-cards`. Pick AED 50, 100, 200, or 500, select a design and an occasion, and add a sample greeting. Preview and generate the card to display its demo reference. Download or print it. The demo designation and lack of redemption value appear on the card itself.
6. Open `/feedback`, optionally rate any combination of the six experience questions and the separate recommendation question, then submit. Open **Customer Feedback Analytics** on `/marketing` to review response counts and scores. Toggle **Synthetic sample** to demonstrate the separate dataset, then return to **Local interactions**.
7. Open `/contact` and try submitting an empty form. Fill the required fields with sample details to see the local validation confirmation. Open `/faq`, search for an ordering, reservation, reward, or gift card question, and expand an answer with Enter or Space.

### Graphics, QR, and campaign settings

- The studio exports 1080 × 1080 posts, 1080 × 1920 stories, and 1920 × 1080 banners. Gift cards export at 1440 × 900, and QR cards at 920 × 1080. Canvas uses the same local photographs and bundled fonts for preview and export. Arabic layouts use Cairo and right-to-left text alignment and shaping. Gift greetings and demo references live in the current page and are included only in the graphic a visitor chooses to export.
- Use `VITE_PUBLIC_SITE_URL` with an approved HTTP(S) origin to generate links for a public site. With no configured origin, links use the current browser origin. A localhost link can be encoded and scanned, but other devices normally cannot reach it. Custom QR URLs accept HTTP(S) links and origin-relative site paths. QR generation runs locally with the pinned encoder, and Playwright decodes the exported PNG using a separate decoder. [QR Code Generator](https://github.com/kazuhikoarase/qrcode-generator) · [jsQR](https://github.com/cozmo/jsQR)
- Generated tracking links use `utm_source`, `utm_medium`, and a normalized `utm_campaign` label. Selecting an existing campaign adds its stable `utm_id`. Tagged visits to the menu, a dish, or other supported pages use that identifier for reporting. Existing `utm_campaign` tags and referral URLs remain valid. Referral selectors use neutral display labels, and the analytics log keeps only recognized source, campaign, and referral values. Saved link configurations use the separate, bounded LocalStorage key `maramia.campaign-links.v1`.
- The studio and engagement dashboard count successful graphics exports, generated links and QR cards, gift previews and generated demo cards, and valid feedback submissions as demo activity. Order and revenue totals continue to come from the order flow. Analytics reset clears the analytics log, including feedback, while saved link settings and the existing loyalty, cart, order and reservation records remain available.

### Feedback and contact

- A response can omit any question. Experience questions accept 1–5 and the recommendation question accepts 0–10, including zero. Each mean uses that question’s own answers. Net Promoter Score is the percentage of 9–10 answers minus the percentage of 0–6 answers, rounded to the nearest whole point. Scores of 7–8 remain in the denominator. The dashboard and CSV use dashes or empty values when a metric has no answers. The synthetic sample is separate. [Bain Net Promoter Score guidance](https://prod.netpromotersystem.com/about/measuring-your-net-promoter-score/)
- The contact page reads the UAE details in `src/data/restaurant.ts`. Fields awaiting approval show **Pending confirmation**. The page links to the [La Casa Mall listing](https://lacasamall.ps/dining/maramia/) and the Maramia Palestine Facebook page listed there. The contact form validates locally and clears its fields after success. It sends no message and stores no entry. FAQ answers draw on the existing menu, booking, checkout, campaign, and loyalty settings.
- The workspace is an open presentation route for the hackathon. Demo cards, tools, ratings, and exports run in the browser. Gift cards have no monetary or redemption value.

## Assets and restaurant details

- The menu banner and 48 dish images are generated editorial illustrations, stored as compressed WebP in `src/assets/`. Packaged beverages are illustrated as served in unbranded glassware. The Taybeh drink uses a cold-beverage category illustration. The London site supplied no photography.
- The homepage retains the Phase One palette, type, and illustrative photography. La Casa Mall identifies Maramia in Ramallah, and the e-Aswaq gallery shows its leaf mark, planted wall, amber lighting and shared dishes. The site uses a temporary original mark. [La Casa Mall listing](https://lacasamall.ps/ar/dining/maramia/) · [Ramallah directory gallery](https://www.e-aswaq.com/Details.aspx?id=22140)
- `src/data/restaurant.ts` holds configurable UAE contact details. Fields for street address, hours, phone, email and social channels are empty pending approval. Links for Maramia Palestine are kept with the roots story. The footer identifies the UAE site as a concept demo.

## Main project files

- `src/data/menu.ts` and `src/types/menu.ts` define the catalogue and selection model shared by the homepage and menu.
- `src/pages/MenuPage.tsx`, `src/components/menu/`, `src/data/menuFilters.ts` and `src/styles/menu.css` implement menu browsing and shareable dish details.
- `src/context/OrderingContext.tsx`, `src/data/orderingStorage.ts`, `src/data/ordering.ts` and `src/data/orderMath.ts` manage cart state, order persistence, promotions and fulfillment.
- `src/pages/OrderPage.tsx`, `src/pages/OrderStatusPage.tsx`, `src/components/order/` and `src/styles/ordering.css` implement the drawer, checkout, confirmation and tracking.
- `src/pages/ReservationPage.tsx`, `src/pages/ReservationRecordsPage.tsx`, `src/components/reservation/` and `src/styles/reservation.css` implement booking, the SVG floor plan, confirmation and management.
- `src/context/ReservationContext.tsx` and `src/data/reservation*.ts` hold the configuration, Dubai clock, overlap rules, demo storage and calendar export.
- `src/pages/AboutPage.tsx`, `src/pages/RestaurantPage.tsx`, `src/components/experience/` and `src/styles/hospitality.css` implement the editorial pages, interactive tour, dining collections and photo gallery.
- `src/data/brandExperience.ts`, `src/data/reservationLinks.ts` and `src/i18n/hospitality.ts` define the editorial content, booking preferences and translations. `tests/hospitality.spec.js` covers the Phase Five flows.
- `src/pages/OffersPage.tsx`, `src/pages/CampaignPage.tsx`, `src/pages/TableQuizPage.tsx` and `src/pages/MarketingPage.tsx` provide the campaign hub, landings, quiz, and dashboard. `src/components/marketing/`, `src/i18n/marketing.ts`, and `src/styles/marketing.css` hold campaign presentation and reporting.
- `src/data/campaigns.ts`, `src/data/marketingAnalytics.ts`, `src/data/marketingPreferences.ts`, `src/data/tableRecommendations.ts`, `src/data/marketingMetrics.ts` and `src/data/marketingExport.ts` hold campaign configuration, anonymous event storage, recommendations, KPI calculations, and aggregate export. `tests/marketing.spec.js` exercises Phase Six.
- `src/pages/LoyaltyPage.tsx`, `src/components/loyalty/`, `src/sections/HomeRewards.tsx`, `src/i18n/loyalty.ts`, and `src/styles/loyalty.css` provide membership, rewards, retention reports and contextual messaging. `src/data/loyalty*.ts` holds rules, ledger parsing, recommendations and samples. `src/context/OrderingContext.tsx` commits checkout, order completion, and ledger changes. `tests/loyalty.spec.js` exercises Phase Seven.
- The Phase Eight route pages are `ContentStudioPage.tsx`, `CampaignLinksPage.tsx`, `QrStudioPage.tsx`, `GiftCardsPage.tsx`, `FeedbackPage.tsx`, `ContactPage.tsx`, and `FaqPage.tsx`. Shared workspace components, Canvas drawing modules, feedback calculations, bilingual copy, and styling are under `src/components/marketing/`, `src/data/`, `src/i18n/tools.ts`, and `src/styles/tools.css`. `tests/tools.spec.js` covers the new flows.
- `src/i18n/`, `src/data/navigation.ts`, and `src/sections/` hold bilingual copy, navigation and homepage content.
- `tests/` and `playwright.config.js` hold the regression suite and test setup.

### Phase Nine file map

- Deployment and sharing use `vercel.json`, `.env.example`, `.gitignore`, `index.html`, `vite.config.ts`, `public/robots.txt`, `public/maramia-share.jpg`, `src/components/PageMetadata.tsx`, `src/data/publicOrigin.ts`, and `src/data/restaurant.ts`.
- Route loading, focus, and recovery use `src/main.tsx`, `src/layouts/SiteLayout.tsx`, `src/components/RouteLoading.tsx`, `src/pages/NotFoundPage.tsx`, `src/pages/ReservationRoutes.tsx`, and shared bilingual copy in `src/i18n/copy.ts`. The restaurant, offers, loyalty and marketing pages use the shared routing and metadata logic.
- Presentation changes include `src/components/LanguageSwitch.tsx`, the shared Motion component imports, `src/sections/Hero.tsx`, `src/assets/hero-mobile.webp`, and the shared dishes styles in `src/styles/dishes.css`. Menu, workspace, FAQ, feedback, gift card and dashboard entries load feature styles when needed.
- QA changes are in `tests/global-setup.js`, `tests/menu.spec.js` and `tests/presentation.spec.js`. Handover documents are `README.md`, `DEMO.md`, and `MARKETING_GUIDE.md`.
