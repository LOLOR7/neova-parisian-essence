import parisRooftops from "@/assets/paris-rooftops.jpg";
import afterReal from "@/assets/after-real.jpg";
import projectGeorgeV from "@/assets/project-george-v.jpg";
import projectKleber from "@/assets/project-kleber.jpg";
import aboutCraftsman from "@/assets/about-craftsman.jpg";
import projectVictorHugo from "@/assets/project-victor-hugo.jpg";

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO
  dateLabel: string;
  readTime: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  content: string[]; // paragraphs
  internalLinks?: { label: string; to: string }[];
  cta?: { label: string; to: string };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "guide-16e-arrondissement-paris",
    title: "Guide du 16e arrondissement de Paris pour acheteurs internationaux",
    category: "Quartiers",
    date: "2026-05-19",
    dateLabel: "May 19, 2026",
    readTime: "10 min read",
    excerpt:
      "Passy, Trocadéro, Auteuil, Muette : lecture détaillée du 16e arrondissement pour acheteurs internationaux — micro-quartiers, typologies, prix et angles de rénovation.",
    image: projectKleber,
    imageAlt: "Immeuble haussmannien Paris 16e arrondissement, avenue Kléber",
    seoTitle: "Guide du 16e arrondissement de Paris pour acheteurs internationaux | Neova",
    seoDescription:
      "16e arrondissement Paris immobilier : guide premium pour acheteurs internationaux. Passy, Trocadéro, Auteuil, Muette, Foch, off-market et rénovation.",
    content: [
      "Le 16e arrondissement est, avec le 7e et le 8e, l'un des trois marchés résidentiels les plus structurants de Paris. C'est aussi le plus vaste des trois, le plus diversifié, et probablement le plus mal compris. Parler du « 16e » comme d'un quartier homogène est une erreur de lecture : derrière une seule étiquette se cachent une dizaine de micro-marchés aux codes, aux prix et aux profils d'acheteurs très différents.",
      "Le 16e est d'abord un arrondissement de volumes. Les immeubles y sont plus larges, les appartements plus grands, les hauteurs sous plafond souvent généreuses, les vues plus dégagées qu'ailleurs dans Paris. C'est l'un des rares arrondissements où l'on peut encore acheter un 200 à 400 m² familial sans entrer dans la catégorie des hôtels particuliers. Cette générosité de volumes structure la demande internationale depuis des décennies.",
      "Le quartier de Passy, autour de la rue de Passy, de la rue de l'Annonciation et de la place du Trocadéro, est probablement le visage le plus identifiable du 16e. Commerces de qualité, écoles, marchés, immeubles haussmanniens et années 1930, mixité familiale. Les appartements traversants à étage élevé, avec vue Tour Eiffel pour les plus chanceux, restent la référence de ce sous-marché.",
      "Le Trocadéro et ses abords — avenue d'Eylau, avenue Paul Doumer, place du Trocadéro — concentrent une partie des biens d'apparat du 16e : grandes réceptions, plafonds hauts, vues iconiques sur la Tour Eiffel. C'est l'un des micro-marchés où la valeur de la vue peut représenter une part significative du prix au mètre carré.",
      "La Muette, autour de l'avenue Henri-Martin, du boulevard Suchet et du Ranelagh, est le 16e des familles installées et des grandes surfaces familiales. Proximité immédiate du bois de Boulogne, écoles internationales (Eurécole, Active Bilingual School, à proximité de l'EAB et du Lycée Janson-de-Sailly), immeubles d'avant-guerre très bien tenus. C'est l'un des sous-marchés les plus stables de Paris.",
      "Auteuil, dans le sud du 16e, autour de la rue d'Auteuil, de la place Jean-Lorrain et de la rue La Fontaine, conserve une identité de village. Maisons de ville, ateliers d'artistes, immeubles Art Nouveau (Hector Guimard est passé par là), ambiance plus calme et plus locale. C'est le 16e des amoureux du patrimoine et des familles qui cherchent une vie de quartier au sens littéral.",
      "L'axe Foch-Victor Hugo-Kléber, autour des avenues du même nom et de la place Victor-Hugo, est le cœur d'apparat du 16e. Immeubles Haussmann d'exception, étages nobles très recherchés, vues sur l'Arc de Triomphe ou sur les contre-allées arborées, services premium à proximité. C'est l'un des marchés les plus liquides du 16e pour les très beaux biens.",
      "Plus au nord, le quartier Chaillot et la zone autour de l'avenue Marceau et de l'avenue Kléber jouent un rôle particulier : à la fois résidentiel, institutionnel et professionnel, avec un parc d'immeubles haussmanniens d'une qualité constante. C'est un sous-marché souvent privilégié par les acheteurs de pied-à-terre.",
      "Quatre profils d'acheteurs structurent le marché du 16e. Les familles internationales en relocation, attirées par la proximité du Lycée Janson-de-Sailly, de l'EAB, de l'Active Bilingual School, du Bois de Boulogne et par la taille des appartements. Les acheteurs de pied-à-terre, qui cherchent un 100 à 180 m² élégant dans un immeuble représentatif, souvent autour de Victor Hugo, du Trocadéro ou de Passy. Les investisseurs patrimoniaux long terme, qui privilégient des étages nobles dans des immeubles d'exception, avec une logique de transmission. Les acheteurs locaux haut de gamme, en transition de quartier ou de cycle de vie, qui connaissent finement les sous-marchés.",
      "Les typologies dominantes reflètent cette diversité. L'appartement haussmannien classique — parquet point de Hongrie, moulures, cheminées, doubles portes — reste la référence absolue, particulièrement sur les beaux étages des avenues Foch, Victor Hugo, Kléber, Henri-Martin et Paul Doumer. L'appartement familial reconfiguré, entre 180 et 350 m², avec une vraie suite parentale, trois à cinq chambres et de vraies pièces de réception. L'appartement de vue, où l'orientation et le panorama (Tour Eiffel, Trocadéro, Bois de Boulogne) participent pleinement à la valeur. L'appartement Art Déco ou années 1930, plus rare, souvent traversant, avec balcons filants et volumes plus contemporains, particulièrement présent à Passy et Auteuil.",
      "Plusieurs critères techniques méritent une lecture exigeante avant d'acheter dans le 16e. La qualité de l'immeuble d'abord — façade, hall, ascenseur, parties communes, syndic, vote des travaux récents. Le 16e est un arrondissement où les immeubles vieillissent sous la pression de leurs propres standards : un ravalement, une réfection de toiture ou un changement d'ascenseur peuvent peser durablement sur les charges.",
      "L'étage et la lumière conditionnent la valeur autant que la localisation. Un 4e étage avec ascenseur, double exposition et vue dégagée se revendra toujours mieux qu'un grand 1er étage sombre sur cour, même à adresse équivalente. La hauteur sous plafond — souvent comprise entre 3,00 m et 3,80 m dans les beaux immeubles — est un autre signal de qualité immédiat.",
      "La copropriété est un sujet à part entière. Lire les trois derniers procès-verbaux d'assemblée générale, demander l'état daté, vérifier les travaux votés et ceux en discussion, comprendre la santé financière du syndicat : c'est un travail de quelques heures qui peut éviter plusieurs dizaines de milliers d'euros d'imprévus, et il est encore plus important dans le 16e où les copropriétés sont parfois grandes et leurs budgets significatifs.",
      "Le potentiel de rénovation est souvent l'angle déterminant. Beaucoup d'appartements familiaux du 16e ont été figés dans une configuration des années 1970 ou 1980 — cuisines fermées, salles de bains sous-dimensionnées, chambres de service mal exploitées. Une rénovation maîtrisée, qui préserve les éléments d'origine (parquets, moulures, cheminées) tout en repensant la circulation, les volumes de réception et la suite parentale, peut repositionner durablement le bien.",
      "Le bruit, la layout et la vue sont les trois critères qui se vérifient sur place et jamais sur plan. Les grandes avenues du 16e peuvent être bruyantes côté façade ; une cour intérieure peut être très calme ou, au contraire, renvoyer les sons d'un restaurant ou d'une école voisine. Visiter à différents moments de la journée, en semaine et le week-end, fait partie du sérieux de l'analyse.",
      "Comme dans le 7e ou le 8e, une part significative des plus beaux biens du 16e ne sont jamais diffusés publiquement. Familles installées de longue date, successions, transitions discrètes : ces opportunités circulent dans un réseau confidentiel de notaires, syndics, family offices et intermédiaires de confiance. L'accès à ce réseau, et la capacité à décider proprement quand une opportunité se présente, sont ce qui distingue une acquisition réussie d'une recherche qui s'étire sur des années.",
      "Pour les acheteurs internationaux, l'accompagnement compte autant que l'accès. Coordonner à distance la visite, la négociation, le notaire, la banque, l'éventuelle rénovation et la livraison sans déplacement inutile à Paris est un métier en soi. C'est précisément le rôle d'un property finder spécialisé sur ce type d'arrondissement.",
      "Le 16e n'est pas un quartier où l'on achète vite. C'est un quartier où l'on achète juste : le bon immeuble, le bon étage, le bon sous-marché, à la bonne échéance. La rareté, la stabilité de la demande long terme et la qualité du bâti en font l'un des marchés les plus résilients de Paris pour qui sait le lire en détail.",
      "Si vous envisagez d'acheter dans le 16e arrondissement, l'équipe Neova peut vous accompagner depuis la définition du brief jusqu'à la remise des clés — y compris en off-market et avec coordination complète de la rénovation. Démarrer une recherche commence par une conversation simple : quelle vie, dans quel volume, à quel horizon.",
    ],
    internalLinks: [
      { label: "Démarrer une recherche", to: "/find-your-property" },
      { label: "Property Finder Paris", to: "/property-finder-paris" },
      { label: "Appartement haussmannien à Paris", to: "/expertise/appartement-haussmannien-paris" },
      { label: "Guide du 7e arrondissement", to: "/blog/guide-7e-arrondissement-paris" },
      { label: "Nos réalisations", to: "/projects" },
    ],
    cta: { label: "Start your Paris property search with Neova", to: "/find-your-property" },
  },
  {
    slug: "guide-7e-arrondissement-paris",
    title: "Guide du 7e arrondissement de Paris pour acheteurs internationaux",
    category: "Quartiers",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "9 min read",
    excerpt:
      "Le 7e arrondissement, l'un des quartiers les plus prestigieux et discrets de Paris : lecture du marché, micro-quartiers, profils d'acheteurs et angles de rénovation.",
    image: projectVictorHugo,
    imageAlt: "Immeuble haussmannien rive gauche, Paris 7e arrondissement",
    seoTitle: "Guide du 7e arrondissement de Paris pour acheteurs internationaux | Neova",
    seoDescription:
      "7e arrondissement Paris immobilier : guide premium pour acheteurs internationaux. Gros-Caillou, Invalides, École Militaire, Saint-Thomas-d'Aquin, off-market et rénovation.",
    content: [
      "Le 7e arrondissement est l'un des quartiers les plus prestigieux — et les plus discrets — de Paris. Rive Gauche, bordé par la Seine, traversé par l'esplanade des Invalides et dominé par la Tour Eiffel, il combine une densité institutionnelle exceptionnelle (ministères, ambassades, grandes écoles) avec un tissu résidentiel d'une qualité rare. Peu de quartiers à Paris offrent autant de calme, de lumière et de patrimoine sur une surface aussi restreinte.",
      "Ce qui distingue le 7e d'autres quartiers prisés, ce n'est pas seulement la qualité de ses immeubles ou la proximité de ses monuments. C'est une certaine retenue. On y croise peu de vitrines de luxe, peu d'enseignes ostentatoires. La vie s'organise autour de marchés, de boulangeries, de librairies et d'institutions culturelles. Pour un acheteur international, c'est précisément cette discrétion qui en fait l'un des arrondissements les plus recherchés à l'achat.",
      "Le 7e n'est pas un quartier homogène. Il se compose de plusieurs micro-marchés, chacun avec ses codes, ses prix et son type d'immeuble. Le Gros-Caillou, entre le Champ-de-Mars et l'avenue Bosquet, est le cœur de vie familial du quartier — commerces de bouche, écoles, immeubles haussmanniens, vues sur la Tour Eiffel pour les étages hauts. Les rues Cler, Saint-Dominique et de Grenelle structurent ce micro-quartier.",
      "Le secteur des Invalides offre des volumes plus rares : grands appartements de réception, vues dégagées sur l'esplanade, immeubles d'avant 1900 souvent très bien tenus. C'est le 7e des familles installées, des pied-à-terre d'apparat et des collectionneurs. Les transactions y sont peu nombreuses et souvent discrètes.",
      "L'École Militaire, entre l'avenue de La Motte-Picquet et l'avenue de Suffren, propose un compromis intéressant : immeubles haussmanniens ou Art Déco, étages élevés avec vue Tour Eiffel ou Invalides, proximité immédiate du Champ-de-Mars. C'est l'un des sous-marchés où la liquidité reste correcte pour des biens de qualité.",
      "Saint-Thomas-d'Aquin, autour de la rue du Bac, du boulevard Saint-Germain et de la rue de l'Université, est le 7e le plus parisien — celui des galeries, des antiquaires, des hôtels particuliers et des appartements d'écrivains. Les volumes y sont parfois atypiques (anciens hôtels particuliers divisés), les hauteurs sous plafond généreuses, et la rareté absolue.",
      "Trois profils d'acheteurs structurent le marché. Les familles internationales en relocation cherchent un appartement principal de 150 à 250 m², proche des lycées internationaux, avec plusieurs chambres et de vraies pièces de réception. Les acheteurs de pied-à-terre — souvent basés à Londres, Genève, New York ou Dubaï — recherchent un 80 à 140 m² élégant, traversant, avec vue ou balcon, dans un immeuble de qualité. Les investisseurs long terme privilégient des biens patrimoniaux à fort potentiel, parfois à rénover, dans des adresses qui traverseront les cycles.",
      "Quatre typologies dominent les transactions. L'appartement haussmannien classique — parquet point de Hongrie, moulures, cheminées, doubles portes — reste la référence absolue, surtout au 2e et au 5e étage. L'appartement familial reconfiguré, généralement entre 150 et 250 m², avec une vraie suite parentale et deux à quatre chambres d'enfants. L'appartement de vue, où l'on paie le panorama (Tour Eiffel, Invalides, Seine) autant que la surface. La résidence rénovée clé en main, plus rare, qui s'adresse aux acheteurs internationaux qui n'ont ni le temps ni l'envie de coordonner des travaux à distance.",
      "Avant d'acheter dans le 7e, plusieurs points méritent une lecture exigeante. La qualité de l'immeuble d'abord : façade, escalier, ascenseur, cour, état des parties communes, tempérament du syndic. Beaucoup d'immeubles du 7e datent du XIXe siècle et nécessitent un entretien régulier, parfois lourd — un ravalement, une réfection de toiture ou un changement d'ascenseur peuvent peser durablement sur les charges.",
      "L'étage et la lumière conditionnent la valeur autant que la localisation. Un 4e étage avec ascenseur, double exposition et vue dégagée se revendra toujours mieux qu'un grand 1er étage sombre sur cour. La hauteur sous plafond — souvent comprise entre 3,00 m et 3,80 m dans les beaux immeubles — est un autre signal de qualité immédiat.",
      "La copropriété est un sujet à part entière. Lire les trois derniers procès-verbaux d'assemblée générale, demander l'état daté, vérifier les travaux votés et ceux en discussion, comprendre la santé financière du syndicat — c'est un travail de quelques heures qui peut éviter plusieurs dizaines de milliers d'euros d'imprévus.",
      "Le potentiel de rénovation est souvent l'angle déterminant. Un appartement du 7e fatigué mais doté d'une bonne structure, d'une belle lumière et d'un plan cohérent peut être repositionné par une rénovation maîtrisée. Le travail consiste à corriger la circulation, dégager les volumes de réception, créer une vraie suite parentale, moderniser les lots techniques tout en préservant les éléments d'origine — parquets, moulures, cheminées. C'est l'un des marchés parisiens où l'écart de valeur entre un bien à rénover et un bien rénové reste le plus net.",
      "Le bruit, la layout et la vue sont les trois critères qui se vérifient sur place et jamais sur plan. Une rue calme sur le papier peut être bruyante le soir ; une cour intérieure peut renvoyer les sons d'un restaurant voisin ; une vue annoncée peut être obstruée par un projet en cours. Visiter à différents moments de la journée, en semaine et le week-end, fait partie du sérieux de l'analyse.",
      "Une part significative des plus beaux biens du 7e ne sont jamais diffusés publiquement. Familles installées de longue date, successions, transitions discrètes — ces opportunités circulent dans un réseau confidentiel de notaires, syndics, family offices et intermédiaires de confiance. L'accès à ce réseau, et la capacité à décider proprement quand une opportunité se présente, sont ce qui distingue une acquisition réussie d'une recherche qui s'étire sur des années.",
      "Pour les acheteurs internationaux, l'accompagnement compte autant que l'accès. Coordonner à distance la visite, la négociation, le notaire, la banque, l'éventuelle rénovation et la livraison sans déplacement inutile à Paris est un métier en soi. C'est précisément le rôle d'un property finder spécialisé sur ce type d'arrondissement.",
      "Le 7e n'est pas un quartier où l'on achète vite. C'est un quartier où l'on achète bien. La rareté, la discrétion, la qualité du bâti et la stabilité de la demande long terme en font l'un des marchés les plus résilients de Paris. La discipline, dans ce type de quartier, est toujours récompensée.",
      "Si vous envisagez d'acheter dans le 7e arrondissement, l'équipe Neova peut vous accompagner depuis la définition du brief jusqu'à la remise des clés — y compris en off-market et avec coordination complète de la rénovation. Démarrer une recherche commence par une conversation simple : quelle vie, dans quel volume, à quel horizon.",
    ],
    internalLinks: [
      { label: "Démarrer une recherche", to: "/find-your-property" },
      { label: "Property Finder Paris", to: "/property-finder-paris" },
      { label: "Appartement haussmannien à Paris", to: "/expertise/appartement-haussmannien-paris" },
      { label: "Nos réalisations", to: "/projects" },
    ],
    cta: { label: "Start your Paris property search with Neova", to: "/find-your-property" },
  },
  {
    slug: "how-to-read-paris-property-market-before-buying",
    title: "How to Read the Paris Property Market Before Buying",
    category: "Property Finder",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "7 min read",
    excerpt:
      "A refined approach to understanding location, price, renovation potential, and long-term value before entering the Paris market.",
    image: parisRooftops,
    imageAlt: "Parisian rooftops at dusk",
    seoTitle: "Reading the Paris Property Market — Neova Insights",
    seoDescription:
      "How to read the Paris property market before buying: micro-markets, building quality, light, layout, and the role of a property finder.",
    content: [
      "Paris is not a single market. It is a constellation of micro-markets, where two streets in the same arrondissement can behave according to very different rules. Understanding this geography is the first discipline of any serious buyer.",
      "The most common mistake is to reduce a decision to price per square meter. That number is a signal, never a verdict. A well-positioned apartment in a quiet, well-maintained building, with light on two exposures and a coherent layout, will hold value differently than a larger surface compromised by noise, dim light or a heavy co-ownership.",
      "Each arrondissement carries its own grammar. The 7th speaks the language of institutions and silence; the 8th of formality and prestige; the 16th of generous volumes and family life; the Marais of texture, history and rhythm. Within each, certain streets, certain floors, certain orientations carry a premium that no spreadsheet fully captures.",
      "Before considering price, we read the building itself. The condition of the staircase, the elevator, the façade, the courtyard. The state of the roof and the technical lots. The temperament of the co-ownership. These details quietly determine the cost of ownership for the next ten years.",
      "Then comes the apartment. Floor and light first — they cannot be renovated. Layout second — it can be reworked, but only within the limits of load-bearing walls and ducts. Finishes last — they are the most visible and the easiest to replace.",
      "Renovation potential is its own form of value. An apartment that looks tired but offers a strong layout, good light and a sound structure can become an exceptional address. One that looks pristine but suffers from a compromised plan rarely overcomes its limits, no matter the budget.",
      "This is where a property finder earns its place. The role is not to send listings — it is to qualify opportunities before they consume time. To read the building, the floor, the orientation, the co-ownership, the renovation envelope, the realistic resale horizon. To say no, often, so that yes carries weight.",
      "Discretion matters as much as access. The most interesting opportunities in Paris move quietly, between trusted intermediaries, before they ever appear publicly. Being known, being prepared, and being able to decide cleanly is what turns access into acquisition.",
      "Reading the Paris market is, in the end, a practice of patience. The right apartment is not the one that arrives first. It is the one whose every layer — location, building, light, layout, potential — aligns with a clear intention. Everything else is noise.",
    ],
  },
  {
    slug: "buying-to-renovate-in-paris-what-to-consider",
    title: "Buying to Renovate in Paris: What to Consider Before Making an Offer",
    category: "Renovation",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "8 min read",
    excerpt:
      "Before buying a property to renovate, the right analysis can protect budget, timeline, and future value.",
    image: afterReal,
    imageAlt: "Renovated Parisian interior with refined finishes",
    seoTitle: "Buying to Renovate in Paris — What to Consider | Neova",
    seoDescription:
      "Structural constraints, permissions, budgets, timelines and contractor choice: what to analyse before buying a Paris apartment to renovate.",
    content: [
      "A renovation begins long before the first wall is touched. It begins the moment you consider an offer. The quality of that analysis often decides whether the project becomes a discreet success or a slow, expensive correction.",
      "Structure comes first. Load-bearing walls, beam directions, the position of technical ducts and the slab thickness define what is possible. Many beautiful ideas collapse against a single column that cannot move.",
      "Layout potential is read with the same calm. A plan that allows a clear circulation, a well-placed kitchen, a generous primary suite and one or two real reception spaces will always outperform a plan forced to compromise on every room.",
      "Permissions and co-ownership rules are the second filter. Façade changes, window modifications, floor coverings, plumbing reconfigurations — each can require an architect, a syndic approval, a building meeting, or a formal authorisation. None of this is impossible. All of it takes time.",
      "Budget estimation, at this stage, is a discipline of ranges. A serious pre-acquisition estimate covers strip-out, structural work, technical lots, joinery, finishes, fees and contingency. A 10 to 15 percent contingency is not pessimism, it is professionalism.",
      "Timeline risk is the silent cost. Permits, lead times for stone, joinery and bespoke pieces, the rhythm of the building, holidays, and the inevitable adjustments during execution all shape a calendar that is rarely shorter than it looks.",
      "Choosing the right architect and the right contractor is, in many ways, the real decision. References, completed projects of comparable scope, the clarity of their quotes, the way they communicate uncertainty — these tell you more than a portfolio.",
      "Renovation potential, properly assessed, becomes a form of value creation. An apartment bought with a clear renovation envelope can move from a tired address to a coherent one, and from a defensive purchase to a confident one.",
      "The right question, before any offer, is not what the apartment is today. It is what it becomes once renovated — and at what total cost, in what timeline, with what risks. When that picture is honest, the offer writes itself.",
    ],
    internalLinks: [
      { label: "Appartement haussmannien à Paris", to: "/expertise/appartement-haussmannien-paris" },
      { label: "Property Finder Paris", to: "/property-finder-paris" },
      { label: "Démarrer une recherche", to: "/find-your-property" },
    ],
  },
  {
    slug: "off-market-properties-paris-buyers-guide",
    title: "Off-Market Properties in Paris: What Buyers Should Know",
    category: "Off-Market",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "6 min read",
    excerpt:
      "Off-market access is valuable, but only when paired with qualification, trust, and a clear acquisition strategy.",
    image: projectGeorgeV,
    imageAlt: "Discreet Parisian building façade",
    seoTitle: "Off-Market Properties in Paris — Buyer's Guide | Neova",
    seoDescription:
      "What off-market really means in Paris, how access works, and how serious buyers qualify opportunities before they commit.",
    content: [
      "Off-market is one of the most used and least understood words in Paris real estate. It can describe a genuinely confidential opportunity, or simply a listing that has not yet been published. The difference matters.",
      "A true off-market property is one that the owner does not wish to expose publicly, for reasons of privacy, timing, occupancy, or family circumstances. Access is granted through trust, not through search engines.",
      "That access is valuable — but it is not, by itself, a guarantee of quality. Some off-market opportunities are exceptional. Others are off-market precisely because they have already been refused by the open market.",
      "Qualification is everything. A serious buyer does not move faster because an opportunity is private. They move with the same discipline they would apply to a public listing: building, floor, light, layout, co-ownership, renovation envelope, realistic resale horizon.",
      "Trust circulates in both directions. Owners and intermediaries share confidential opportunities with buyers who are known to be prepared, discreet, and capable of deciding cleanly. Being that buyer is a posture, not a claim.",
      "Agent relationships are built over years, not weeks. The most useful introductions often come from professionals who have already worked with a buyer on a previous project, and who know that their discretion will be matched.",
      "Readiness is the other half of access. A buyer with clarified criteria, validated financing, and a defined decision process can engage with an off-market opportunity in days, not weeks. That ability to decide is, in itself, a form of currency.",
      "Our role, as an intermediary, is to filter. To say honestly when an opportunity is exceptional, when it is merely good, and when its discretion is hiding a defect. Off-market access without filtering is noise — just more expensive noise.",
      "Emotion is the final risk. A private viewing, a quiet building, a beautiful living room — the conditions are designed to invite a yes. The discipline is to hold the same analysis you would apply to any other apartment, and to be ready, sometimes, to walk away.",
    ],
  },
  {
    slug: "preparing-property-for-sale-renovation-staging-direct-listing",
    title: "Preparing a Property for Sale: Renovation, Staging, or Direct Listing?",
    category: "Sell Your Property",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "7 min read",
    excerpt:
      "For owners preparing to sell, the right pre-sale strategy can influence speed, positioning, and perceived value.",
    image: projectKleber,
    imageAlt: "Elegant Parisian salon prepared for sale",
    seoTitle: "Preparing a Paris Property for Sale — Neova Insights",
    seoDescription:
      "Renovate, stage or list directly: how owners can decide the right pre-sale strategy for a Paris apartment.",
    content: [
      "Selling a Paris apartment is rarely a single decision. It is a sequence of small choices — about presentation, timing, audience and pricing — that quietly shape the final result.",
      "The first question is whether to sell as-is. For some apartments, the address, the floor, the volumes and the natural light already do the work. The right buyer will project their own renovation, and intervening would only delay the process without adding value.",
      "For others, a light renovation makes a measurable difference. A coat of paint, refreshed parquet, updated lighting and a corrected layout detail can reposition an apartment in the eye of a buyer, and in the language of the listing.",
      "Staging is its own discipline. It is not decoration — it is the calibration of volumes, light and circulation so that a buyer reads the apartment correctly within the first thirty seconds of a visit. A well-staged living room is, simply, a living room that is understood.",
      "Photography follows staging, never the other way around. The first impression of a Paris apartment, today, is almost always digital. The photographs decide who comes to visit, and who quietly moves on.",
      "Buyer profile and pricing strategy go together. An apartment can be priced for a family seeking a primary residence, an international buyer seeking a Paris pied-à-terre, or an investor seeking a future renovation. Each profile reads price, condition and timing differently.",
      "Confidentiality is sometimes the right strategy. For sensitive situations — family transitions, professional moves, public profiles — an off-market sale to a qualified circle of buyers can preserve discretion and, often, perceived value.",
      "The decision to renovate before selling deserves clear arithmetic. A renovation envelope, a realistic premium on the sale price, an honest timeline, and the cost of carrying the apartment during the work. When the equation closes positively, the renovation makes sense. When it does not, restraint is the better strategy.",
      "A good pre-sale strategy is, in the end, a quiet alignment between the apartment, the moment, and the buyer it deserves. Everything else is presentation.",
    ],
  },
  {
    slug: "choosing-right-architect-contractor-paris-renovation",
    title: "Choosing the Right Architect or Contractor for a Paris Renovation",
    category: "Professionals",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "7 min read",
    excerpt:
      "A successful renovation depends not only on design, but on selecting the right people, scope, and process.",
    image: aboutCraftsman,
    imageAlt: "Craftsman at work on a Parisian renovation",
    seoTitle: "Choosing an Architect or Contractor in Paris | Neova",
    seoDescription:
      "How to choose the right architect and contractor for a Paris renovation: roles, scope, references, quotes and communication.",
    content: [
      "A renovation succeeds or fails on people long before it succeeds or fails on materials. Choosing the right architect and the right contractor is the most consequential decision of the project.",
      "The two roles are different and complementary. An architect carries the vision, the plans, the coherence of the whole — volumes, light, circulation, materials. A contractor carries the execution — coordination of trades, scheduling, on-site decisions, technical quality.",
      "Project scope must be defined before either is chosen. A cosmetic refresh, a partial reconfiguration, a full renovation, and a structural transformation are different projects, requiring different profiles. The most common error is to engage a generalist on a project that demands a specialist.",
      "References should be specific, not generic. A portfolio of Haussmann renovations is not the same as a portfolio of contemporary loft conversions. Asking to visit a completed project, to speak to a former client, to see how the work has aged after two or three years, reveals more than any brochure.",
      "Quotes deserve the same patience. A serious quote is detailed, line by line, with quantities, unit prices, brand references when relevant, and a clear chapter on contingencies. A round number on a single page is not a quote — it is a promise to negotiate later.",
      "Communication rhythm is the daily reality of the project. A clear weekly point, accessible written summaries, photographs from the site, and an honest signal when something is uncertain — these habits decide the quality of the experience as much as the quality of the result.",
      "Material choices are made together. The architect proposes, the contractor validates feasibility and lead times, and the client decides. When this triangle works, the project advances calmly. When one party dominates, the project drifts.",
      "Matching the right professional to the right project is, in the end, an exercise of judgment. The most prestigious name is not always the right fit. The right fit is the team whose past work, working style, and temperament align with the apartment and with the owner.",
      "Our role, when we coordinate, is to make that match deliberate. To introduce the architects and contractors whose strengths correspond to the project, and to leave the owner with a clear, calm decision rather than a long list of names.",
    ],
  },
  {
    slug: "private-advisory-approach-high-value-real-estate",
    title: "Why a Private Advisory Approach Matters in High-Value Real Estate",
    category: "Advisory",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "7 min read",
    excerpt:
      "For high-value real estate decisions, discretion, timing, and coordination can matter as much as access.",
    image: projectVictorHugo,
    imageAlt: "Refined Parisian apartment overlooking a quiet avenue",
    seoTitle: "Private Advisory in High-Value Real Estate | Neova",
    seoDescription:
      "Why high-value real estate decisions in Paris require discretion, coordination and a long-term private advisory approach.",
    content: [
      "At a certain scale, a real estate decision is no longer only about a property. It involves a family, a calendar, a network, a level of privacy and a long horizon. The right advisory approach respects all of them.",
      "High-value clients do not need more listings. They need a small number of qualified opportunities, presented in context, with the analysis already done. The value is not in volume — it is in editing.",
      "Privacy is a working condition, not a preference. Visits are organised discreetly, communication is held to a defined circle, and the apartment, the timing and the intention are protected from public exposure throughout the process.",
      "Coordination is the quiet engine of these projects. An acquisition often touches a notary, an architect, a contractor, a property manager, sometimes a family office, sometimes a previous owner. Aligning their rhythms is the work.",
      "Fragmented decisions are the most common form of value loss. A property is purchased without a renovation envelope. A renovation is launched without a long-term management plan. A sale is prepared without a quiet preparation. Each of these gaps can cost more than the advisory itself.",
      "Long-term value is built slowly. A well-chosen apartment, renovated coherently and maintained with care, holds and grows its value across cycles. A poorly coordinated sequence can erode the same apartment in a few years.",
      "Independence is the heart of the approach. An advisor who does not own the listings, does not own the renovation, and does not own the management can recommend honestly — and refuse, when necessary, on the client's behalf.",
      "Our role, at Neova, is to be that independent intermediary. We read the opportunity, qualify the building, coordinate the right professionals, and follow the project from the first conversation to long after the keys are handed over.",
      "A private advisory relationship is, finally, a relationship. It begins with a clear conversation about intention, and it continues across several years, several properties, and several decisions — quietly, and with the same standard of care each time.",
    ],
  },
];

export const getBlogPost = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);