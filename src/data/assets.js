/* ------------------------------------------------------------------
   Asset manifest — the single source of truth for every image/video.

   These currently point at the reference build's CDN so the clone renders
   pixel-identically out of the box. To use your own art, drop files into
   `public/images/` and `public/video/` and change only the value on the
   right-hand side of each entry — e.g.

     hero: '/images/hero.webp',

   Nothing else in the app hardcodes an image URL.
   ------------------------------------------------------------------ */

const CDN = 'https://cdn.prod.website-files.com'
const SITE = `${CDN}/6687edf28965e189a78dfdfa`
const CMS = `${CDN}/668e77bbe51918445e86446d`

export const assets = {
  /* --- brand -------------------------------------------------------- */
  logo: `${SITE}/66a8bdd7b08a58e8505c708c_logo.svg`,
  ogImage: `${SITE}/66aa2bde1658782563f78564_Open Graph.jpg`,
  favicon: `${SITE}/668e5bffe724029442a2e7d4_256x256.png`,

  /* --- interface icons ---------------------------------------------- */
  icoPlay: `${SITE}/668fdc224fbf52a90800671d_ico_play.svg`,
  icoClose: `${SITE}/668ff0a3d0dfaa02dbb1b7ff_ico_close.svg`,
  icoArrowTop: `${SITE}/668ea8998e00a1736022ca07_ico_arrow-top.svg`,
  icoPlus: `${SITE}/6691501fe6e8ed64c5101842_ico_plus.svg`,

  /* fades the ends of the partner marquee; used as a CSS mask, not an img */
  maskLogo: `${SITE}/66952262a264ad8ec8239173_mask-logo.png`,

  /* --- hero ---------------------------------------------------------- */
  hero: `${SITE}/668fc43b76953a8d44875544_img_intro.webp`,
  horse: `${SITE}/668fb6b9d6ab0723bd8c82f3_horse.svg`,
  videoPoster: `${SITE}/669e47ac86c99098c660167d_GH Aerial Video-poster-00001.jpg`,
  videoMp4: `${SITE}/669e47ac86c99098c660167d_GH Aerial Video-transcode.mp4`,
  videoWebm: `${SITE}/669e47ac86c99098c660167d_GH Aerial Video-transcode.webm`,

  /* --- masterplan map ------------------------------------------------ */
  genplan: `${SITE}/669008f7dae4c0dd08087313_img_genplan.webp`,
  genplanBorder: `${SITE}/66914eb9f8d6f55878b377dc_Border.svg`,
  genplanLabels: {
    townCentre: `${SITE}/66a3fe1211a30f606e838100_town center.svg`,
    highStreet: `${SITE}/66a3fe12681e1fa6ee585b1e_high street.svg`,
    racing: `${SITE}/66a3fe12e09fadaf25966514_Racing.svg`,
    commercial: `${SITE}/66a3fe129e7bbc8b74853cfd_Commercial.svg`,
    openSpace: `${SITE}/66a8ab2ceeb21086a23ddbf9_Open Space.svg`,
    education: `${SITE}/66a3fe12adfbd57b82f78b14_Education.svg`,
    activityCentre: `${SITE}/66a3fe12469341f5f9469152_Activity Center.svg`,
  },
  areasRender: `${SITE}/669f9ad1f943b75a15fac39f_img_areas-1.webp`,

  /* --- partner logos (marquee) --------------------------------------- */
  partners: [
    { name: 'Murray Bridge Racing Club', src: `${CMS}/669796acc0cece339875328d_murray-racing-club-2.png` },
    { name: 'Murray Bridge Council', src: `${CMS}/66979b7a4f94cf1628729080_murray bridge-white.png` },
    { name: 'E-kistics', src: `${CMS}/668fd41d02347bae3902f6fa_E-kistics.svg` },
    { name: 'Ethos Urban', src: `${CMS}/668fd4078b967c674e94cfad_Ethos Urban.svg` },
    { name: 'Hatch', src: `${CMS}/668fd2befca09aca02b56f13_Hatch.svg` },
    { name: 'Costa Property Group', src: `${CMS}/668fd2a070f4cd1ad13c3f7f_Costa Property Group.svg` },
    { name: 'Spiire', src: `${CMS}/668fd22dfca09aca02b51d53_Spiire.svg` },
    { name: 'Grange', src: `${CMS}/668fd21dd48bdb151b6d26da_Grange.svg` },
  ],

  /* --- infrastructure cards ------------------------------------------ */
  infrastructure: {
    foodDrink: `${CMS}/6690f9da9c624586894c683e_img_infra-01.webp`,
    botanical: `${CMS}/6690f9e23b0b81ae742e3d49_img_infra-02.webp`,
    education: `${CMS}/6690f9ee5ac1db6c8c46cd37_img_infra-03.webp`,
    racingPolo: `${CMS}/66a741c058d1c1cfa2de091c_Racing & Polo.jpg`,
    diversity: `${CMS}/66a0d71c5661cc6169acf3fd_img_infra-05.jpg`,
    technology: `${CMS}/66a0d71276e433b2572887b7_img_infra-06.jpg`,
    employment: `${CMS}/66a0d70803d31ce4dc0ee25d_img_infra-07.jpg`,
  },

  /* --- benefit cards -------------------------------------------------- */
  benefits: {
    lifestyle: `${CMS}/66a39b13a54eb711a9e58625_Lifestyle.png`,
    affordability: `${CMS}/66a39affa54eb711a9e56ac8_Affordability.png`,
    health: `${CMS}/66a39ae51fdabff6571a954d_haley-phelps-S-llxYh3GzI-unsplash.jpg`,
    community: `${CMS}/66a39a4b48070d193e2d9bee_Community.png`,
    innovation: `${CMS}/66a7423898d042bbe5785ffc_Innovation.jpg`,
    entertainment: `${CMS}/66a39a0ee2673996476daad5_Entertainment.png`,
    sustainability: `${CMS}/66a39981ff6f2589c64561ad_Sustainability.png`,
  },

  /* --- footer --------------------------------------------------------- */
  footer: `${SITE}/669fbea0f56b049fe5f7c17f_img_footer.jpg`,

  /* --- legal documents ------------------------------------------------ */
  masterplanPdf: `${SITE}/66a40b3eda83522bcfe296fb_Masterplan.pdf`,
  termsPdf: `${SITE}/669e54b8e30b0b2b49bae743_Terms and Conditions.pdf`,
  privacyPdf: `${SITE}/669e54b813073608a4b6d8a4_Privacy Policy.pdf`,

  /* --- embedded film --------------------------------------------------- */
  heroFilmId: 'DQ0SMWfjTO4',
}

export default assets
