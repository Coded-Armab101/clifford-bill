/* ------------------------------------------------------------------
   Site content — Clifford Bill

   All copy carried over from the reference build and rebranded
   Gifford Hill → Clifford Bill. Placeholder artefacts in the original
   have been corrected: the "Join the Future" heading rendered a broken
   glyph where the mark belongs, the form legal line credited the
   template vendor rather than the brand, the lot-size field was
   misspelled "loz", and the footer read "All Right Reserved".
   ------------------------------------------------------------------ */

export const brand = {
  name: 'Clifford Bill',
  tagline: 'Joy Lives Here',
  /** plural demonym, used sparingly in the body copy */
  residents: 'Clifford Billians',
  email: 'hello@cliffordbill.com',
  phone: '+61 1300 283 772',
  phoneHref: 'tel:+611300283772',
  mapsUrl:
    'https://www.google.com/maps/place/Gifford+Hill+SA+5253,+Australia/@-35.1696937,139.2069145,14z/data=!4m6!3m5!1s0x6ab7749bd9ce9dc1:0x5033654628eff30!8m2!3d-35.1668748!4d139.2230655!16s%2Fg%2F11fy_qmjz_?entry=ttu',
  address: ['Clifford Bill', 'South Australia 5253,', 'Australia'],
  street: 'Usher Road, Clifford Bill, South Australia, 5253',
  development: ['Bill & Co', 'Property Group'],
  commencement: { quarter: 'q4', year: '2025' },
}

export const seo = {
  title: 'Clifford Bill, Joy Lives Here.',
  description:
    "Welcome to Clifford Bill – Adelaide's Second City, brought to life around the pillars of community, culture, innovation, prosperity and joy.",
}

/* --- intro ------------------------------------------------------------ */
export const intro = {
  heading: brand.tagline,
  summary:
    "Welcome to Clifford Bill – Adelaide's Second City, brought to life around the pillars of community, culture, innovation, prosperity and joy.",
  filmLabel: 'Clifford Bill, Joy Lives Here.',
}

/* --- scroll-driven "a new beginning" slides --------------------------- */
export const aboutSlides = [
  {
    headline: "Clifford Bill is South Australia's largest and most ambitious master-planned community in history",
    body: "Transforming 1,860 hectares into a vibrant home for ~44,000 future residents over the next four decades. This $7.5 billion precinct brings together the ability to live, work, and play and will transform the Murray Bridge region into South Australia's second city.",
  },
  {
    headline: 'Clifford Bill is set to become an economic powerhouse',
    body: "Creating 7,210 direct jobs and 5,100 indirect jobs. This visionary precinct will add $7.58 billion in economic value to South Australia over its construction and contribute $1.67 billion to the state's GDP annually. Strategically positioned in the golden triangle of employment growth, it will drive strong local economic activity and generate $750 million in annual retail spending.",
  },
  {
    headline: 'Sustainability at Its Core',
    body: "Clifford Bill is dedicated to pioneering sustainable living through the use of mass timber construction, carbon capture, biophilic design principles, and innovative water management systems. Our commitment to environmental regeneration and rewilding in green space will create a model eco-conscious community that dovetails with the natural beauty of Murray Bridge and Adelaide Hills regions.",
  },
  {
    headline: 'World-Class Amenities and Infrastructure',
    body: 'Clifford Bill is designed to provide world-class amenities, including a state-of-the-art sports and entertainment precinct, advanced digital infrastructure, and extensive educational offerings. Residents will enjoy a high-quality lifestyle with access to top-tier facilities and services, making Clifford Bill a benchmark for future developments in South Australia.',
  },
  {
    headline: 'Fusion of Tradition and Innovation',
    body: 'Clifford Bill celebrates its rich equine heritage while embracing modernity. The integrated racecourse, bridle trails, and top-tier horse and polo facilities alongside cutting-edge digital infrastructure and vibrant town centres offer residents a unique blend of tradition and contemporary amenity, promoting a dynamic and hybrid lifestyle.',
  },
]

export const aboutEyebrow = 'A new beginning'

/* --- town centre amenity figures -------------------------------------- */
export const townCentre = {
  title: 'Town Centre Amenity',
  stats: [
    { label: 'Total Net Leasable Area', value: '97,000 m²' },
    { label: 'Total Land Area', value: '10 HA' },
    { label: 'Future Full-Time Employees', value: '3,400' },
  ],
}

/* --- two-column description ------------------------------------------- */
export const description = [
  "Situated just 5 minutes from Murray Bridge, less than 30 minutes from the Adelaide Hills, and under an hour from the Adelaide CBD, Clifford Bill offers the perfect blend of rural tranquility, urban convenience, and cultural diversity.\n\nOver the 30-40 year construction period, the development will bring $9.15 billion in construction investment, injecting $7.58 billion into the region's GDP. This will create 51,280 job years or 12,450 FTE jobs, including onsite full-time positions and indirect employment in the construction and adjacent sectors of Murray Bridge, Mount Barker, Alexandrina, and beyond.",
  'Post-construction, the development will support 12,450 ongoing positions across various sectors, including retail, education, community services, and medical infrastructure. These are estimated to contribute $1.67 billion annually to the economy once fully developed. The Clifford Bill Precinct alone will deliver $750 million in annual retail spending to the local economy upon completion.\n\nPlanned for today and built for the future, Clifford Bill embodies forward-thinking principles in urban design, technology, and sustainability. Celebrating the natural beauty of Murray Bridge and the cultural richness of the Adelaide Hills, this community will invite over 44,000 Clifford Billians to live, work, and play in a place where joy thrives.',
]

/* --- headline stat row ------------------------------------------------- */
export const metrics = [
  { label: 'Annual Retail Spending', value: '$750 million' },
  { label: 'Economic impact', value: '$7.58 billion' },
  { label: 'Jobs created', value: '12,450' },
  { label: 'Residents', value: '44,000+' },
]

/* --- masterplan -------------------------------------------------------- */
export const masterplan = {
  /** shown twice in the reference, as a split headline */
  titleTop: 'Connection',
  titleBottom: 'to Nature',
  openSpace: '998 Acres or 21% of the Precinct has been dedicated to Active and Passive Open Space',
  boundary: '1,860 Hectares',
  cta: ['View Master Plan', 'See on map'],
  pins: [
    {
      id: 'is-01',
      label: 'town centre',
      image: 'townCentre',
      title: 'Clifford Bill Town Centre',
      body: 'The Clifford Bill Commercial Precinct is the commercial and economic heart of the precinct, delivering 97,000m² of prime commercial space where businesses can thrive.',
    },
    {
      id: 'is-02',
      label: 'high street',
      image: 'highStreet',
      title: 'Clifford Bill High Street',
      body: "The entertainment precinct's high street, bookended by the $110 million racing club and mass timber town centre, offers diverse eateries, shops and markets for all Clifford Billians to enjoy.",
    },
    {
      id: 'is-03',
      label: 'racing',
      image: 'racing',
      title: 'Clifford Bill Racing Precinct',
      body: 'A $110 million premier equine hub with state-of-the-art racing facilities, entertainment venues and future polo grounds celebrating the rich equine racing culture and legacy of South Australia.',
    },
    {
      id: 'is-04',
      label: 'commercial',
      image: 'commercial',
      title: 'Clifford Bill Commercial Precinct',
      body: 'The Clifford Bill Commercial Precinct accommodates large format retailers, serving the needs of the Clifford Bill community and its growing population.',
    },
    {
      id: 'is-05',
      label: 'open space',
      image: 'openSpace',
      title: 'Clifford Bill Open Space',
      body: 'The Green and Blue Network offers 998 acres of passive and active open space within the Clifford Bill precinct. This area features advanced water-sensitive urban design and extensive trails and habitat, creating a community that harmoniously balances urbanisation with the environment and nature like no other.',
    },
    {
      id: 'is-06',
      label: 'education',
      image: 'education',
      title: 'Clifford Bill Education',
      body: "Accessible along the green spines, Clifford Bill's schools, planned university campus, libraries and cultural centres ensure equality and inclusive education for all residents, fostering lifelong learning and community engagement.",
    },
    {
      id: 'is-07',
      label: 'activity centre',
      image: 'activityCentre',
      title: 'Neighbourhood Activity Centres',
      body: 'Neighbourhood Activity Centres (NACs) within Clifford Bill provide convenient and accessible amenities to the local neighbourhoods, all within walking distance. These centres ensure that everyday needs are met while also offering opportunities for local businesses to thrive and creating gathering spaces for the community.',
    },
  ],
}

/* --- infrastructure (horizontal-scroll cards) -------------------------- */
export const infrastructure = [
  {
    key: 'foodDrink',
    title: 'Food & Drink',
    body: "Explore the culinary adventure that awaits you at Clifford Bill. Nestled in the heart of South Australia, Clifford Bill offers the freshest produce sourced from the region's fertile grounds. This community is a crossroads between the rich culinary diversity of Murray Bridge and the artisanal craftsmanship of Adelaide Hills. Here, food is a unifying element, bringing people from different cultures, backgrounds, and walks of life together. From the local farmers' markets to the boutique cafe, the hole-in-the-wall eatery to the fine dining restaurant – there's something for everyone, celebrating the spirit and joy that lives here in Clifford Bill.",
  },
  {
    key: 'botanical',
    title: 'Botanical',
    body: "Whether you're passing by or living in Clifford Bill, there is an opportunity to connect with nature at every turn. Expansive local and district parks, walking, bicycle and bridle trails, and varied botanical gardens are dotted throughout the communities, inviting everyone to breathe and soak in the surroundings. Twenty-one percent of the whole precinct of Clifford Bill is dedicated to nature, providing spaces for the community to engage with, balancing the urban form and serving as a home for a vast array of flora and fauna. Advanced Water Sensitive Urban Design (WSUD), rewilding, green spines and floating wetlands ensure that the city supports not just a diverse resident population but also a rich plant and animal ecosystem.",
  },
  {
    key: 'education',
    title: 'Education',
    body: 'Accessible along the green spines of the precinct – schools, a future university campus, libraries, cultural and recreational centres form the cornerstone of quality and inclusive education at Clifford Bill. Ensuring sustainable development and economic growth begins with nurturing minds. From building confidence in the classroom to flourishing in the freedom of the workplace. It is with this that advanced technology is invited into curriculums, joy is prioritised beyond the classrooms and educational inclusivity is promised for all.',
  },
  {
    key: 'racingPolo',
    title: 'Racing and Polo',
    body: 'Clifford Bill provides an exceptional equine experience for those passionate about horses, sports, and entertainment. With over $110 million invested in equine infrastructure in the form of a state-of-the-art racing track and entertainment venue, planned polo grounds, unparalleled racing infrastructure and aquatics – the community nurtures and celebrates the racing DNA of the precinct, racing culture, and the legacy quintessential to the region and the country as a whole.',
  },
  {
    key: 'diversity',
    title: 'Diversity',
    body: "Today, people from every corner of the world and all walks of life piece together the vibrant mosaic of South Australia. A quarter of our residents, born overseas, proudly call this state home. With net migration fuelling the region's growth, Clifford Bill embraces the Welcoming Cities philosophy, championed by the Scanlon Foundation and demonstrated by Murray Bridge. As Clifford Bill extends its embrace toward Adelaide, it commits to creating an environment that celebrates diversity and fosters inclusivity.",
  },
  {
    key: 'technology',
    title: 'Technology',
    body: "Clifford Bill is committed to investing in world-class digital infrastructure, deploying a fibre optic loop across the precinct. This initiative will enable real-time STEM based research and tools to be delivered in schools and universities, leverage big data and artificial intelligence, and provide high-definition streaming for the sports and entertainment precinct. High-bandwidth internet access to homes will connect and promote and enable the Live, Work, Play ethos of Clifford Bill. Technology will be seamlessly integrated into every aspect of life, transforming Clifford Bill into a tech-enabled precinct and an innovation hub for the future.",
  },
  {
    key: 'employment',
    title: 'Employment',
    body: "As the largest development in South Australia's history, Clifford Bill is set to add $7.5 billion to the state's GDP, creating over 12,450 jobs. Underpinning this growth are robust pillars of technology, healthcare, entertainment and education – a foundation that provides the ultimate environment for all to thrive.",
  },
]

/* --- Live, Work, Play -------------------------------------------------- */
export const benefits = [
  {
    key: 'lifestyle',
    title: 'Lifestyle',
    body: `"Joy Lives Here" isn't just a slogan - it's a guiding philosophy integrated into the fabric of our Community. Life here is an intentional balance of physical vitality, mental clarity, meaningful relationships, personal fulfilment, and abundant opportunities - all of which serve as fundamental pillars of a quality life - a right for every resident at Clifford Bill.`,
  },
  {
    key: 'affordability',
    title: 'Affordability',
    body: "With housing prices in South Australia becoming increasingly inaccessible, outpacing those in neighbouring Australian cities, Clifford Bill is committed and focused on providing diverse and affordable housing options so that everyone has the chance to call this community home.",
  },
  {
    key: 'health',
    title: 'Health and Wellness',
    body: "At Clifford Bill, physical wellness is pursued along our picturesque trails and within the expansive open spaces, with more than 20% of the precinct dedicated to active and passive open spaces. Mental peace is encouraged amidst our lush green spaces, offering tranquillity and respite from daily stresses. Friendship and a sense of belonging are built at the nearby sports club or café, fostering relationships and a strong community spirit. Passions and personal fulfillment thrive at local community facilities, where activities and programs encourage lifelong learning and growth. Wellness is the foundation of life at Clifford Bill, where we build not only for the future but for the people who shape it.",
  },
  {
    key: 'community',
    title: 'Community',
    body: 'Clifford Bill fosters a warm and welcoming atmosphere where everyone can find their place. Our inclusive environment ensures that all residents feel connected, valued and supported. With a strong sense of community spirit at the heart of everything we do, Clifford Bill is a true home for all. We celebrate diversity and prioritise inclusivity, creating a harmonious living environment where cooperation and camaraderie thrive. Here, everyone has the opportunity to build meaningful relationships, grow, and flourish, making Clifford Bill a wonderful place to call home.',
  },
  {
    key: 'innovation',
    title: 'Innovation',
    body: 'We understand that the future of real-time research, entertainment, and the Internet of Things (IoT) will rely heavily on world-class digital infrastructure for households, universities, businesses and sports. From day one, we are committed to delivering this by integrating high-bandwidth, low-latency digital infrastructure alongside the construction of roads, walkways, power, sewer and water systems throughout the precinct. Unlike other growth areas that have omitted this critical infrastructure, Clifford Bill will attract unique, high-value STEM-based businesses and research opportunities that other regions simply cannot provide. Additionally, for those working or studying from home, there will be no limitations, ensuring seamless connectivity and productivity.',
  },
  {
    key: 'entertainment',
    title: 'Entertainment',
    body: "The beating heart of Clifford Bill is the entertainment precinct, with the jewel in the crown being the high street. Bookended by the existing $110 million racing club on one end and the mass timber Town Centre on the other, the high street offers a diverse range of eateries, retail shops, and restaurants. Whether you're out on a Thursday evening with friends, having Friday night drinks after work, or enjoying Sunday morning roaming around the farmers' markets and coffee shops, there's always something for everyone to enjoy.",
  },
  {
    key: 'sustainability',
    title: 'Sustainability',
    body: 'The science is clear: the planet is warming. Clifford Bill has the unique advantage of being elevated and connected to one of the greatest water systems in the country – the Murray River. Designed for sustainability and resilience from day one, we are taking practical and meaningful steps from inception to lower our carbon footprint, reduce future urban heat and incorporate systems that preserve and enhance water. This takes many forms. From street trees that provide canopy cover to rewilding open and green spaces to create microclimates and cooling. From water-sensitive urban designs that distribute water through living streams to mass timber urban development that sequesters carbon and offers biophilic benefits. Clifford Bill is a city planned for the future, delivered today.',
  },
]

/* --- register interest form -------------------------------------------- */
export const registerInterest = {
  eyebrow: 'Join the Future',
  submit: 'Submit',
  fields: [
    { name: 'fullName', label: 'Full name*', type: 'text', required: true, autoComplete: 'name' },
    { name: 'phone', label: 'Phone*', type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'email', label: 'Email*', type: 'email', required: true, autoComplete: 'email' },
    {
      name: 'buyerProfile',
      label: 'What best describes you?',
      type: 'select',
      placeholder: 'Select...',
      options: [
        "I'm upsizing",
        'Buying my first home',
        "I'm downsizing",
        'Buying my first investment',
        'Buying another investment',
      ],
    },
    {
      name: 'lotSize',
      label: 'What lot size best describes your needs?',
      type: 'select',
      placeholder: 'Select...',
      options: ['300m² to 500m²', '500m² to 700m²', '700m² to 900m²', '900m² or larger'],
    },
    {
      name: 'homeSize',
      label: 'What home size best suits you?',
      type: 'select',
      placeholder: 'Select...',
      options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms'],
    },
    {
      name: 'referral',
      label: 'How did you hear about us?',
      type: 'select',
      placeholder: 'Select...',
      options: [
        'Radio',
        'TV',
        'Online News',
        'Print News',
        'Social Media',
        'realestate.com.au',
        'Site Signage',
        'Other',
      ],
    },
    { name: 'message', label: 'Send us a message (and we will read them :)', type: 'textarea' },
  ],
}
