# Maramia UAE · five-minute demo

Start `npm run preview` from an already built checkout and open the printed loopback URL on the presentation laptop. Use a fresh browser profile for a clean run. Prepare two tabs on the same origin and keep this guide open. The recorded orders, bookings, membership, and dashboard data belong to that browser profile. All contact values below are samples.

Before the timer, use `/loyalty` to choose **Join Rewards** so your first completed order earns points. Return to `/`. Keep the dashboard’s **Dataset** on **Local interactions**. Use **Synthetic sample** only when explicitly showing the separate set of illustrative results.

## 0:00–0:45 · Brand

1. Open `/` in Arabic and show the right-to-left navigation. Select **English** in the header and point out the same navigation in English.
2. Select **Our Story** (`/about`) or scroll to the story on the homepage. Describe the Palestinian food and hospitality at the heart of the UAE concept. The Ramallah reference belongs to the brand story. UAE operation details are awaiting approval.

## 0:45–1:55 · Customer order

1. Open `/offers/welcome-to-maramia?utm_source=instagram&utm_medium=social&utm_campaign=maramia_launch` to start an attributed session. In the same tab, open `/menu?dish=chicken-musakhan` to open **Chicken Musakhan** directly. Show ingredients, set quantity to **1**, enter a sample instruction such as `Extra sumac, please`, and choose **Add to Cart**.
2. Choose **Continue Shopping** to close the dish, then **Open Cart** and **Proceed to Checkout**. Select **Pickup**, then **Earliest demo slot** (20–30 minutes). Apply `MARAMIA10` for a 10% discount. A single AED 72 Chicken Musakhan totals **AED 64.80** for demo pickup with that code. `WELCOME20` is a separate example for orders of AED 100 or more.
3. Enter **Demo Guest**, **+971 50 123 4567**, and **demo@example.test** as needed. Choose cash and **Place Demo Order**. Show the saved reference, then **Track Order**. Click **Advance Demo Status** until the stage reads **Completed**. Keep the order tab open for the points summary.

## 1:55–2:55 · Restaurant and reservation

1. Open `/uae#virtual-tour`. In the tour, choose **Outdoor Terrace**, open a hotspot, then select **Reserve This Experience**.
2. Pick **tomorrow**, **2 guests**, and **12:00** Dubai time if available. Choose **Continue**, select **Table 13** on the interactive floor plan, and choose **Continue** again. If the table is occupied in this profile, use another available terrace table.
3. Use the same sample contact values. Continue to the review and choose **Confirm Demo Reservation**. Point to the saved reference and **Manage Reservation**. For a short run, pause at the tour and the selected table on the plan.

## 2:55–4:15 · Campaign and creative tools

1. Return to the Welcome campaign (`/offers/welcome-to-maramia`). Open **Discover Your Palestinian Table** (`/offers/table-quiz`) and choose **Start the Quiz**. Show at least one preference. To show results, complete five answers and choose **Show My Table**.
2. Open `/marketing`. In **Local interactions**, show the Welcome campaign’s attributed visit, the demo order, and conversion metrics. Toggle **Synthetic sample** only if you want to show a fuller set of charts. Return to **Local interactions** before continuing.
3. In **Marketing Tools**, open **Social Media Content Studio**. Choose **Palestinian Food Experience**, **Instagram Story**, and **Arabic** for the graphic. Use **Download PNG**.
4. Open **Campaign Link Builder**. Choose **Specific Menu Item** → **Chicken Musakhan**, **Taste of Palestine**, and **TikTok**. Set the medium to **Organic Social** and the tracking name to `Palestinian Table Launch`. Choose **Generate Campaign Link**, then **Generate QR Code**. In the QR workspace, choose **Generate QR Code** again to render the printable card. Use **Download PNG** or show **Print QR Card**. A phone can decode an image containing a localhost URL, but cannot reach the presentation laptop’s localhost address.

## 4:15–5:00 · Retention

1. Open `/loyalty` and show **Membership Tiers** (Sage, Olive, Golden Olive) and **Points History**. A new Sage member starts with **50 welcome points** and earns **64** points when the AED 64.80 demo order reaches Completed, for **114** total if this was the only activity.
2. Reopen `/menu?dish=chicken-musakhan`, add one more serving and return to `/order`. Choose **AED 5 Dining Credit** under **Reward for This Order**. Show the AED 67 pickup total for this basket. The credit costs **100 points** on an eligible subtotal of at least **AED 50**. If time allows, place the pickup order with sample details and return to `/marketing` → **Customer Retention** to show the redemption. It is also possible to show the dashboard’s sample retention report and identify it as synthetic.

## Offline fallback

Keep the production server running on the laptop with dependencies installed and `dist/` already built. The fonts, images, calculators, downloads, and demo records work on the local server without internet. Use one browser profile and the same address throughout. If a phone cannot open a QR link during the demo, show the encoded URL and open it on the laptop. Keep an exported story and QR PNG handy. Use the dashboard’s labelled synthetic dataset if the browser has no prepared interactions.
