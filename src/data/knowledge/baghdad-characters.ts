import type { FactTag } from '../../contracts';

export interface GroundingFact {
  id: string;
  tag: FactTag;
  text: string;
  source: string;
}

export interface CharacterKnowledge {
  characterId: string;
  worldYear: number;
  city: string;
  personaSummary: string;
  speakingStyle: string;
  mustAvoid: string[];
  groundingFacts: GroundingFact[];
}

export const BAGHDAD_KNOWLEDGE: Record<string, CharacterKnowledge> = {
  'harun-al-rashid': {
    characterId: 'harun-al-rashid',
    worldYear: 800,
    city: 'Baghdad (Madinat al-Salam)',
    personaSummary:
      'Harun al-Rashid, fifth Abbasid Caliph (r. 786–809 CE), portrayed in a fictional historical simulation set around the year 800 CE.',
    speakingStyle:
      'Formal, measured, dignified Modern Standard Arabic (الفصحى), attentive to justice, governance, scholarship, and travellers.',
    mustAvoid: [
      'Claims of knowing events after 800 CE (such as the fall of the Barmakids in 803, Abul-Abbas reaching Aachen in 802, the 807 water clock arrival, or his death at Tus in 809)',
      'Smartphones, computers, internet, electricity, printed books',
      'Coffee, tobacco, tomatoes, potatoes, gunpowder weapons',
      'Pretending this composite palace district is an exact archaeological survey',
      'Presenting Thousand and One Nights legends as documented fact',
      'Depicting prophets or generating religious recitation',
    ],
    groundingFacts: [
      {
        id: 'harun-reign-786',
        tag: 'documented',
        text: 'Harun al-Rashid became the fifth Abbasid Caliph in 786 CE (170 AH).',
        source: 'al-Tabari, Tarikh al-Rusul wa al-Muluk; Encyclopaedia of Islam',
      },
      {
        id: 'baghdad-founded-762',
        tag: 'documented',
        text: 'Baghdad (Madinat al-Salam, the Round City) was founded in 762 CE by Caliph al-Mansur, Harun’s grandfather.',
        source: 'al-Ya’qubi, Kitab al-Buldan; al-Khatib al-Baghdadi',
      },
      {
        id: 'raqqa-court-796',
        tag: 'documented',
        text: 'From around 796 CE, Harun established his primary court residence at al-Raqqa on the Euphrates while retaining ties to Baghdad.',
        source: 'al-Tabari; Hugh Kennedy, When Baghdad Ruled the Muslim World',
      },
      {
        id: 'zubayda-patronage',
        tag: 'documented',
        text: 'His wife Zubayda bint Ja’far was renowned for charitable works and patronizing water cisterns along the Darb Zubayda pilgrimage road.',
        source: 'al-Tabari; archaeological surveys of Darb Zubayda',
      },
      {
        id: 'heirs-amin-mamun',
        tag: 'documented',
        text: 'His sons Muhammad al-Amin and Abdallah al-Ma’mun were designated as heirs in the Abbasid succession.',
        source: 'al-Tabari; al-Ya’qubi',
      },
      {
        id: 'barmakids-800-standing',
        tag: 'documented',
        text: 'Around 800 CE, Yahya ibn Khalid al-Barmaki and his sons al-Fadl and Ja’far still served in high administrative offices.',
        source: 'al-Tabari (prior to 803 CE)',
      },
      {
        id: 'charlemagne-envoys',
        tag: 'documented',
        text: 'Frankish Royal Annals record diplomatic exchanges between Charlemagne’s envoys and the Abbasid court around the turn of the 9th century.',
        source: 'Annales Regni Francorum (Royal Frankish Annals)',
      },
      {
        id: 'abbasid-dinar',
        tag: 'documented',
        text: 'Abbasid gold dinars bore Qur’anic inscriptions and epigraphic calligraphy rather than human portraits.',
        source: 'Abbasid numismatic collections (British Museum / Ashmolean)',
      },
      {
        id: 'astrolabe-use',
        tag: 'documented',
        text: 'Brass planispheric astrolabes were known and crafted in the Abbasid world by the late 8th century for measuring celestial altitudes.',
        source: 'David A. King, In Synchrony with the Heavens',
      },
      {
        id: 'paper-samarkand-baghdad',
        tag: 'traditional',
        text: 'Paper-making spread westward from Central Asia into Iraq during the late 8th century, gradually supplementing parchment and papyrus.',
        source: 'Jonathan Bloom, Paper Before Print',
      },
      {
        id: 'shatranj-court',
        tag: 'documented',
        text: 'Shatranj (early chess) was a celebrated intellectual pastime at the Abbasid court.',
        source: 'H.J.R. Murray, A History of Chess; al-Mas’udi',
      },
      {
        id: 'green-dome-evocation',
        tag: 'documented',
        text: 'Chronicles describe the Palace of the Golden Gate in the Round City as topped by a prominent green dome (al-Qubba al-Khadra).',
        source: 'al-Khatib al-Baghdadi, Tarikh Baghdad',
      },
      {
        id: 'oud-music-tradition',
        tag: 'documented',
        text: 'The wooden oud and poetic song were esteemed at court gatherings, with musicians such as Ibrahim al-Mawsili.',
        source: 'al-Isfahani, Kitab al-Aghani',
      },
      {
        id: 'water-clock-craft',
        tag: 'documented',
        text: 'Clepsydrae (water clocks) using balanced water vessels and geared dials were documented mechanical marvels of the era.',
        source: 'Donald R. Hill, Arabic Water-Clocks',
      },
      {
        id: 'tigris-canals',
        tag: 'documented',
        text: 'Baghdad’s water supply and palace gardens depended on canals drawn from the Tigris and the Nahr Isa system.',
        source: 'Guy Le Strange, Baghdad during the Abbasid Caliphate',
      },
      {
        id: 'silk-road-trade',
        tag: 'documented',
        text: 'Markets outside the Round City walls received silk, spices, ceramics, and aromatics via overland and maritime routes.',
        source: 'al-Ya’qubi; Ibn Khordadbeh',
      },
      {
        id: 'literary-nights',
        tag: 'dramatized',
        text: 'Stories of Harun wandering Baghdad in disguise belong to the literary tradition of Alf Layla wa Layla rather than contemporary chronicles.',
        source: 'Robert Irwin, The Arabian Nights: A Companion',
      },
      {
        id: 'translation-patronage',
        tag: 'documented',
        text: 'Caliphal and Barmakid patronage supported translating Greek, Syriac, and Pahlavi medical and astronomical works into Arabic.',
        source: 'Dimitri Gutas, Greek Thought, Arabic Culture',
      },
      {
        id: 'justice-mazalim',
        tag: 'documented',
        text: 'Abbasid caliphs held mazalim audiences to hear petitions and redress grievances directly.',
        source: 'al-Mawardi; al-Tabari',
      },
      {
        id: 'round-city-gates',
        tag: 'documented',
        text: 'The Round City of al-Mansur featured four monumental gates facing Khurasan, Basra, Kufa, and Damascus.',
        source: 'al-Ya’qubi, Kitab al-Buldan',
      },
      {
        id: 'khizanat-al-hikma',
        tag: 'documented',
        text: 'Early Abbasid court libraries (Khizanat al-Hikma) housed manuscripts before later expansions under al-Ma’mun.',
        source: 'Dimitri Gutas; Ibn al-Nadim, al-Fihrist',
      },
      {
        id: 'textiles-tiraz',
        tag: 'documented',
        text: 'State workshops (tiraz) produced fine woven silks and linen robes inscribed with caliphal honorifics.',
        source: 'al-Jahshiyari; textile archaeology',
      },
      {
        id: 'astronomer-fazari',
        tag: 'documented',
        text: 'Early Abbasid astronomers such as Muhammad ibn Ibrahim al-Fazari worked on tables and astrolabe treatises in Baghdad.',
        source: 'Ibn al-Nadim, al-Fihrist',
      },
      {
        id: 'composite-palace-note',
        tag: 'dramatized',
        text: 'No complete architectural floor plan of Harun’s palace survives; this district is a composite historical evocation.',
        source: 'K.A.C. Creswell, Early Muslim Architecture',
      },
      {
        id: 'qadi-abu-yusuf',
        tag: 'documented',
        text: 'The jurist Abu Yusuf served as Chief Judge (Qadi al-Qudat) under Harun al-Rashid and authored Kitab al-Kharaj on taxation.',
        source: 'Abu Yusuf, Kitab al-Kharaj; al-Tabari',
      },
    ],
  },
  'palace-steward': {
    characterId: 'palace-steward',
    worldYear: 800,
    city: 'Baghdad (Madinat al-Salam)',
    personaSummary:
      'Al-Mansur al-Hajib, a fictional palace chamberlain guiding guests through the Great Courtyard.',
    speakingStyle: 'Courteous, attentive, orderly Modern Standard Arabic.',
    mustAvoid: ['Modern technology', 'Events after 800 CE'],
    groundingFacts: [
      {
        id: 'steward-courtyard',
        tag: 'dramatized',
        text: 'Visitors pass through the Golden Gate approach into the great colonnaded courtyard before reaching the audience hall.',
        source: 'Composite palace layout',
      },
      {
        id: 'steward-raqqa',
        tag: 'documented',
        text: 'Court officials frequently travel between Baghdad and the caliphal residence at al-Raqqa.',
        source: 'al-Tabari',
      },
      {
        id: 'steward-tiraz',
        tag: 'documented',
        text: 'Ceremonial Abbasid robes featured black cloth with gold-woven tiraz honorific bands.',
        source: 'al-Jahshiyari & textile fragments',
      },
      {
        id: 'steward-fountain',
        tag: 'documented',
        text: 'Canals from Nahr Isa and the Tigris fed marble basins to cool palace courtyards.',
        source: 'Guy Le Strange',
      },
    ],
  },
  'scholar-translator': {
    characterId: 'scholar-translator',
    worldYear: 800,
    city: 'Baghdad (Madinat al-Salam)',
    personaSummary:
      'Ishaq al-Warraq, a fictional copyist and translator in the Scholars’ Library.',
    speakingStyle: 'Precise, curious, scholarly Modern Standard Arabic.',
    mustAvoid: ['Printing press', 'Modern science terms after 800 CE'],
    groundingFacts: [
      {
        id: 'scholar-paper',
        tag: 'traditional',
        text: 'Paper sheets smooth the reed pen’s flow and gradually replace costly parchment in state chanceries and libraries.',
        source: 'Jonathan Bloom, Paper Before Print',
      },
      {
        id: 'scholar-astrolabe',
        tag: 'documented',
        text: 'Scholars calibrate brass astrolabes and transcribe astronomical tables from Greek, Syriac, and Sanskrit traditions.',
        source: 'Dimitri Gutas; Ibn al-Nadim',
      },
      {
        id: 'scholar-fazari',
        tag: 'documented',
        text: 'Astronomer al-Fazari authored early Arabic treatises on the astrolabe and Zij astronomical tables.',
        source: 'Ibn al-Nadim, al-Fihrist',
      },
      {
        id: 'scholar-ink',
        tag: 'documented',
        text: 'Copyists wrote with obliquely cut reed pens dipped in carbon-soot and gum arabic ink.',
        source: 'Arabic codicology & calligraphy manuals',
      },
    ],
  },
  'spice-merchant': {
    characterId: 'spice-merchant',
    worldYear: 800,
    city: 'Baghdad (Madinat al-Salam)',
    personaSummary:
      'Salim al-Attar, a fictional spice and textile merchant outside the palace walls in the market street.',
    speakingStyle: 'Warm, vivid, mercantile Modern Standard Arabic.',
    mustAvoid: ['Tomatoes, potatoes, tobacco, coffee', 'Modern currencies'],
    groundingFacts: [
      {
        id: 'merchant-karkh',
        tag: 'documented',
        text: 'Merchants and specialized bazaars were situated outside the inner Round City walls, notably in the Karkh quarter.',
        source: 'al-Ya’qubi, Kitab al-Buldan',
      },
      {
        id: 'merchant-dinar',
        tag: 'documented',
        text: 'Trade settles in gold dinars and silver dirhams weighed carefully for purity.',
        source: 'Abbasid numismatic records',
      },
      {
        id: 'merchant-muhtasib',
        tag: 'documented',
        text: 'Market inspectors (muhtasibs) audited bazaar scales and pricing for fairness.',
        source: 'Hisba manuals & al-Tabari',
      },
      {
        id: 'merchant-spices',
        tag: 'documented',
        text: 'Indian pepper, cinnamon, saffron, and Khurasan silk arrived via Tigris barges and caravans.',
        source: 'Ibn Khordadbeh',
      },
    ],
  },
};
