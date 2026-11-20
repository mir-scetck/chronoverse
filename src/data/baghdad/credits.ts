import type { MediaCredit } from '../../types';

export const BAGHDAD_MEDIA_CREDITS: Record<string, MediaCredit> = {
  'round-city-overview': {
    id: 'round-city-overview',
    imageSrc: '/src/assets/images/baghdad_round_city_overview_1795208338186.jpg',
    title: {
      en: 'Aerial Reconstruction of the Round City of Baghdad (c. 800 CE)',
      ar: 'تصور جوي للمدينة المدورة في بغداد (نحو ٨٠٠ م)',
    },
    creatorOrCollection: 'CHRONOVERSE Historical Illustration Studio (after al-Ya’qubi & Le Strange)',
    yearOrEra: 'Evocation of 762–800 CE',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Round_city_of_Baghdad',
    recommendedFilename: 'baghdad-round-city-plan.jpg',
    notes: {
      en: 'Composite visualization of the four-gated Round City centered on the Mosque and Palace of the Golden Gate.',
      ar: 'تصور تركيبي للمدينة المدورة ذات الأبواب الأربعة وفي قلبها المسجد الجامع وقصر الباب الذهبي.',
    },
  },
  'courtyard-fountain': {
    id: 'courtyard-fountain',
    imageSrc: '/src/assets/images/baghdad_courtyard_fountain_1795208338331.jpg',
    title: {
      en: 'Abbasid Colonnaded Courtyard and Octagonal Marble Fountain',
      ar: 'الصحن العباسي ذو الأروقة والنافورة الرخامية المثمنة',
    },
    creatorOrCollection: 'CHRONOVERSE Architectural Reconstruction (after Creswell & Samarra stucco motifs)',
    yearOrEra: 'c. 800 CE',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Abbasid_architecture',
    recommendedFilename: 'baghdad-palace-courtyard.jpg',
    notes: {
      en: 'Composite palace courtyard fed by Tigris and Nahr Isa canal conduits.',
      ar: 'تصور لصحن القصر المروي بقنوات دجلة ونهر عيسى لتلطيف الهواء.',
    },
  },
  'scholars-astrolabe': {
    id: 'scholars-astrolabe',
    imageSrc: '/src/assets/images/abbasid_scholars_astrolabe_1795208339969.jpg',
    title: {
      en: 'Abbasid Scholar Desk: Planispheric Astrolabe, Rag Paper, and Reed Pens',
      ar: 'منضدة العلماء العباسيين: الأسطرلاب والورق وأقلام القصب',
    },
    creatorOrCollection: 'CHRONOVERSE Museum Study Plate (after Khalili & British Museum Abbasid holdings)',
    yearOrEra: 'Late 8th – Early 9th Century CE',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Islamic_astrolabes',
    recommendedFilename: 'abbasid-astrolabe-manuscript.jpg',
  },
  'karkh-spice-market': {
    id: 'karkh-spice-market',
    imageSrc: '/src/assets/images/karkh_spice_market_1795208339920.jpg',
    title: {
      en: 'Karkh Bazaar Outside the Round City Walls',
      ar: 'سوق الكرخ خارج أسوار المدينة المدورة',
    },
    creatorOrCollection: 'CHRONOVERSE Historical Scene Study (after al-Ya’qubi Kitab al-Buldan)',
    yearOrEra: 'c. 800 CE',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Baghdad_in_the_Abbasid_Caliphate',
    recommendedFilename: 'karkh-market-bazaar.jpg',
  },
  'water-clock-brass': {
    id: 'water-clock-brass',
    imageSrc: '/src/assets/images/abbasid_water_clock_brass_1795208339767.jpg',
    title: {
      en: 'Brass Clepsydra (Water Clock) and Epigraphic Abbasid Gold Dinar',
      ar: 'الساعة المائية النحاسية والدينار العباسي المنقوش',
    },
    creatorOrCollection: 'CHRONOVERSE Numismatic & Horology Plate (after Donald R. Hill & Ashmolean dinar)',
    yearOrEra: 'c. 790–807 CE',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Abbasid_gold_dinars',
    recommendedFilename: 'abbasid-water-clock-dinar.jpg',
  },
};

export const CREDIT_LIST: MediaCredit[] = Object.values(BAGHDAD_MEDIA_CREDITS);
