// ─── Données du taux LEP ──────────────────────────────────────────────────────
// Fallback si l'API CDC échoue ou est trop ancienne.
// Mettre à jour à chaque arrêté ministériel (1er fév. / 1er août).
const LEP_RATE_DATA = {
    rate: 2.5,
    changeDate: '01 FÉVRIER 2026'
};
// Alias pour compatibilité avec inflation.js / chart.js / main.js / calculator.js
const RATE_DATA = LEP_RATE_DATA;

// ─── Historique LEP ───────────────────────────────────────────────────────────
const LEP_HISTORY = [
    { date: '2016-01-01', rate: 1.25, label: 'Janv. 2016' },
    { date: '2020-02-01', rate: 1.00, label: 'Fév. 2020'  },
    { date: '2022-02-01', rate: 2.20, label: 'Fév. 2022'  },
    { date: '2022-08-01', rate: 4.60, label: 'Août 2022'  },
    { date: '2023-02-01', rate: 6.10, label: 'Fév. 2023'  },
    { date: '2023-08-01', rate: 6.00, label: 'Août 2023'  },
    { date: '2024-02-01', rate: 5.00, label: 'Fév. 2024'  },
    { date: '2024-08-01', rate: 4.00, label: 'Août 2024'  },
    { date: '2025-02-01', rate: 3.50, label: 'Fév. 2025'  },
    { date: '2025-08-01', rate: 2.70, label: 'Août 2025'  },
    { date: '2026-02-01', rate: 2.50, label: 'Fév. 2026'  },
];
const HISTORY = LEP_HISTORY;

// ─── €STR (taux interbancaire BCE) ────────────────────────────────────────────
const ESTR_RATE = {
    rate: 2.09,
    period: 'H1 2026 (estimation)',
    source: 'BCE / €STR'
};

// ─── Sources officielles LEP ──────────────────────────────────────────────────
const SOURCES = [
    {
        num: '01',
        name: 'Banque de France',
        url: 'https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-reglementes',
        desc: '→ Page officielle des taux réglementés incluant le LEP'
    },
    {
        num: '02',
        name: 'Service-Public.fr',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F2367',
        desc: '→ Fiche pratique LEP — conditions de ressources, plafond, taux'
    },
    {
        num: '03',
        name: 'Ministère de l\'Économie',
        url: 'https://www.economie.gouv.fr/particuliers/livret-epargne-populaire-lep',
        desc: '→ Arrêtés et communiqués officiels sur le LEP'
    },
    {
        num: '04',
        name: 'Caisse des Dépôts',
        url: 'https://www.caissedesdepots.fr/gestion-des-fonds-depargne/le-lep',
        desc: '→ Gestionnaire central, données de collecte et taux LEP'
    },
    {
        num: '05',
        name: 'Légifrance (Journal Officiel)',
        url: 'https://www.legifrance.gouv.fr/search/jorf?tab_selection=jorf&query=livret+epargne+populaire+taux',
        desc: '→ Texte de l\'arrêté ministériel, source primaire'
    },
    {
        num: '06',
        name: 'La Finance pour Tous',
        url: 'https://www.lafinancepourtous.com/pratique/placements/livret-epargne-populaire-lep/',
        desc: '→ Synthèse pédagogique, historique complet des taux LEP'
    }
];
