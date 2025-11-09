import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;

const resources = {
  fr: {
    translation: {
      common: { search: 'Rechercher' },
      common: {
        search: 'Rechercher',
        loading: 'Chargement…',
        users: 'Utilisateurs',
        alerts: 'Alertes',
        status: 'Statut',
        date: 'Date',
        role: 'Rôle',
        title: 'Titre',
      },
      authorities: {
        title: 'Espace Autorités'
      },
      report: {
        pageTitle: 'Signalement Citoyen',
        pageSubtitle: "Aidez-nous à surveiller les inondations en signalant les incidents",
        newReport: 'Nouveau Signalement',
        type: "Type d'incident",
        selectType: 'Sélectionnez un type',
        location: 'Localisation',
        useMyLocation: 'Utiliser ma position',
        severity: 'Niveau de gravité',
        description: 'Description',
        photos: 'Photos (optionnel)',
        dragHere: 'Glissez vos photos ici ou cliquez pour sélectionner',
        chooseFiles: 'Choisir des fichiers',
        selectedCount: '{{count}} photo(s) sélectionnée(s)',
        formatsHint: "PNG, JPG jusqu'à 10MB - Maximum 5 photos",
        firstName: 'Prénom (optionnel)',
        lastName: 'Nom (optionnel)',
        phone: 'Téléphone (optionnel)',
        send: 'Envoyer le signalement',
        sending: 'Envoi en cours...',
        sent: 'Signalement envoyé !',
        sendFailed: "Échec de l'envoi du signalement. Veuillez réessayer.",
        geolocUnsupported: "La géolocalisation n'est pas supportée par votre navigateur.",
        before: 'Avant envoi',
        after: 'Photos envoyées'
      },
      damages: {
        nav: 'Dégâts',
        title: 'Déclarer des dégâts',
        subtitle: "Décrivez les conséquences de l’inondation pour faciliter l’aide",
        propertyType: 'Type de bien endommagé',
        propertyExamples: 'Maison, véhicule, commerce…',
        loss: 'Estimation des pertes',
        lossHint: 'Montant en FCFA ou description',
        people: 'Nombre de personnes touchées',
        remarks: 'Autres remarques',
        proofs: 'Preuves visuelles (photos/documents)',
        submit: 'Déclarer les dégâts',
        sent: 'Déclaration enregistrée !',
        failed: 'Échec de la déclaration. Réessayez.',
        before: 'Aperçu',
        after: 'Pièces envoyées'
      },
      nav: {
        dashboard: 'Tableau de Bord', map: 'Carte Interactive', alerts: 'Alertes', report: 'Signaler', guide: "Guide d'Urgence", history: 'Historique', stats: 'Statistiques', account: 'Compte', authorities: 'Autorités', assistance: 'Assistance'
      },
      auth: {
        login: 'Se connecter', register: 'Créer un compte', loginTitle: 'Se connecter', registerTitle: 'Créer un compte', createNew: 'Créer un nouveau compte', usernameOrEmail: 'Email ou nom d’utilisateur', password: 'Mot de passe', showPassword: 'Afficher mon mot de passe', forgotPassword: 'Mot de passe oublié ?', orWith: 'Ou avec', loginBtn: 'Se connecter', registerBtn: "S’inscrire"
      },
      assistance: {
        nav: 'Assistance',
        title: "Demande d’assistance",
        subtitle: "Aidez-nous à vous aider en cas d’urgence",
        location: 'Localisation précise',
        helpType: 'Type d’aide demandée',
        helpOptions: {
          rescue: 'Secours', lodging: 'Hébergement', food: 'Nourriture', transport: 'Transport', medical: 'Évacuation médicale', other: 'Autre'
        },
        people: 'Nombre de personnes à assister',
        phone: 'Numéro de téléphone',
        availability: 'Disponibilité / urgence',
        details: 'Précisions',
        submit: 'Demander de l’aide',
        sent: 'Demande envoyée !',
        failed: 'Échec de la demande. Réessayez.'
      },
      dashboard: { title: 'Système de Surveillance des Inondations', subtitle: "Surveillance en temps réel des risques d'inondation à Dakar", recentAlerts: 'Alertes Récentes', trend30: 'Tendance 30 jours' },
      map: { title: 'Carte Interactive des Risques', subtitle: "Visualisation en temps réel des zones à risque d'inondation", layers: 'Couches', filters: 'Filtres', fullscreen: 'Plein écran', exitFullscreen: 'Quitter plein écran', zones: 'Zones Surveillées', searchZone: 'Rechercher une zone', levelFilters: 'Filtres par niveau', locate: 'Localiser' },
      alerts: { title: "Centre d'Alertes" },
      stats: { title: 'Tableau de Bord Statistiques' },
      history: {
        myTitle: 'Historique de mon compte',
        yours: 'Vos signalements récents',
        totalMine: 'Total de mes signalements',
        loading: 'Chargement…',
        none: 'Aucun signalement pour le moment.',
        tabs: { signalements: 'Signalements', degats: 'Dégâts', assistance: 'Assistance' },
        noneDegats: 'Aucun dégât déclaré.',
        noneAssistance: 'Aucune demande d’assistance.'
      }
    }
  },
  wo: {
    translation: {
      common: {
        search: 'Seetu',
        loading: 'Ci yoon la…',
        users: 'Jëfandikukat yi',
        alerts: 'Alàrt yi',
        status: 'Nekkin',
        date: 'Bes',
        role: 'Sarum',
        title: 'Tekki',
      },
      authorities: {
        title: 'Boroom njariñ'
      },
      report: {
        pageTitle: 'Jàngal kër gi',
        pageSubtitle: 'Jàppalenu ci seetaan inondasion yi',
        newReport: 'Jàngal bu bees',
        type: 'Giiru lu am',
        selectType: 'Tannal giiru lu am',
        location: 'Fenn fi nekk',
        useMyLocation: 'Jëfandikoo sama berab',
        severity: 'Tollu lu am',
        description: 'Nettali',
        photos: 'Foto yi (ndax ndigal)',
        dragHere: 'Dagalal foto yi fii walla cuqal ngir fal',
        chooseFiles: 'Fal dencukaay yi',
        selectedCount: '{{count}} foto falew nañu',
        formatsHint: 'PNG, JPG ba 10MB - Diggante 5 foto',
        firstName: 'Tur bu jigeen (ndax ndigal)',
        lastName: 'Saa yu góor (ndax ndigal)',
        phone: 'Telefon (ndax ndigal)',
        send: 'Yónnee jàngal bi',
        sending: 'Mi ngi yónnee…',
        sent: 'Jàngal bi yónn na!',
        sendFailed: 'Yónnee bi lajj na. Jéemaatal.',
        geolocUnsupported: 'Sa joowkat du ndiggal berab bi.',
        before: 'Kanam yónnee',
        after: 'Foto yi yónnee nañu'
      },
      damages: {
        nav: 'Yàq yi',
        title: 'Jàngal yàq yi',
        subtitle: 'Nettalil li inondasion bi indi ngir ñu xàmle ndimbal',
        propertyType: 'Giiru lu ñu yàq',
        propertyExamples: 'Kër, oto, jaaykat…',
        loss: 'Doxalin yàq yi',
        lossHint: 'Wert yi ci FCFA walla nettali',
        people: 'Ñi ko yàq',
        remarks: 'Leneen it',
        proofs: 'Foto/dokimaan yi',
        submit: 'Yónnee yàq yi',
        sent: 'Jàngalekat gi ñàkk na !',
        failed: 'Lajj na. Jéemaatal.',
        before: 'Aperçu',
        after: 'Dokimaan yi yónnee nañu'
      },
      nav: {
        dashboard: 'Tablo bu mag', map: 'Kàrtu jàmmu', alerts: 'Alàrt', report: 'Jàngal', guide: 'Jàppale bu gaaw', history: 'Jaar jaar', stats: 'Statistik', account: 'Konte', authorities: 'Boroom njariñ', assistance: 'Ndimbal'
      },
      auth: {
        login: 'Duggu', register: 'Sos konte', loginTitle: 'Duggu', registerTitle: 'Sos konte', createNew: 'Sos konto bu bees', usernameOrEmail: 'Imeel walla turu jëfandikukat', password: 'Baatu jàll', showPassword: 'Wone sama baatu jàll', forgotPassword: 'Danga fàtte baatu jàll?', orWith: 'Wallaa ak', loginBtn: 'Duggu', registerBtn: 'Bindu'
      },
      assistance: {
        nav: 'Ndimbal',
        title: 'Laajte ndimbal',
        subtitle: 'Ndimbal ci jamono bu yagg',
        location: 'Berab bu dëgg',
        helpType: 'Giiru ndimbal bi',
        helpOptions: {
          rescue: 'Askanu ndimbal', lodging: 'Doxantu', food: 'Lekkal', transport: 'Yóbbu', medical: 'Yóbbu jàmmu', other: 'Beneen'
        },
        people: 'Ñi di soxla ndimbal',
        phone: 'Telefon',
        availability: 'Fiir / ñemeek',
        details: 'Leeral',
        submit: 'Laajte ndimbal',
        sent: 'Ndimbal bi ñu ko jël na !',
        failed: 'Lajj na. Jéemaatal.'
      },
      dashboard: { title: 'Sistëem wi di seetaan xoox', subtitle: 'Seetaan ci jamono ji wërin yu inondasion yi ci Dakar', recentAlerts: 'Alàrt yu bees', trend30: 'Jàmm ci fan 30 yi' },
      map: { title: 'Kàrtu risk yi', subtitle: 'Seetaan ci jamono ji wërin yoon yi di ame xoox', layers: 'Tann yi', filters: 'Sëf', fullscreen: 'Yambalaŋ bu yomb', exitFullscreen: 'Génn yambalaŋ', zones: 'Kër yu ñuy seetaan', searchZone: 'Wut njëlu', levelFilters: 'Sëf ci tollu', locate: 'Wone fi nekk' },
      alerts: { title: 'Kàral alàrt yi' },
      stats: { title: 'Tablo statistik' },
      history: {
        myTitle: 'Jaar jaaru sama konte',
        yours: 'Say jàngal yi',
        totalMine: 'Yoonu sama jàngal yépp',
        loading: 'Ci yoon la…',
        none: 'Amul benn jàngal leegi.',
        tabs: { signalements: 'Jàngal yi', degats: 'Yàq yi', assistance: 'Ndimbal' },
        noneDegats: 'Amul benn yàq yàngalekat.',
        noneAssistance: 'Amul benn laajte ndimbal.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: saved || 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

export default i18n;


