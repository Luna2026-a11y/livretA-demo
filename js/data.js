// ─── Données du taux ─────────────────────────────────────────────────────────
// Mettre à jour à chaque arrêté ministériel (1er fév. / 1er août).
const RATE_DATA = {
    rate: 1.5,
    changeDate: '01 FÉVRIER 2026'
};

// ─── Historique ──────────────────────────────────────────────────────────────
const HISTORY = [
    { date: '2016-01-01', rate: 0.75, label: 'Janv. 2016' },
    { date: '2020-02-01', rate: 0.50, label: 'Fév. 2020'  },
    { date: '2022-02-01', rate: 1.00, label: 'Fév. 2022'  },
    { date: '2022-08-01', rate: 2.00, label: 'Août 2022'  },
    { date: '2023-02-01', rate: 3.00, label: 'Fév. 2023'  },
    { date: '2025-02-01', rate: 2.40, label: 'Fév. 2025'  },
    { date: '2025-08-01', rate: 1.70, label: 'Août 2025'  },
    { date: '2026-02-01', rate: 1.50, label: 'Fév. 2026'  },
];

// ─── €STR (taux interbancaire BCE) ────────────────────────────────────────────
// Mettre à jour avec la moyenne semestrielle avant chaque révision.
// Source : https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_short-term_rate
const ESTR_RATE = {
    rate: 2.09,
    period: 'H1 2026 (estimation)',
    source: 'BCE / €STR'
};

// ─── Sources officielles ──────────────────────────────────────────────────────
const SOURCES = [
    {
        num: '01',
        name: 'Banque de France',
        url: 'https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-reglementes',
        desc: '→ Page officielle des taux réglementés, mise à jour à chaque arrêté'
    },
    {
        num: '02',
        name: 'Service-Public.fr',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F2365',
        desc: '→ Fiche pratique gouvernementale, actualisation en temps réel'
    },
    {
        num: '03',
        name: 'Ministère de l\'Économie',
        url: 'https://www.economie.gouv.fr/particuliers/livret-a',
        desc: '→ Arrêtés et communiqués officiels, liens vers le Journal Officiel'
    },
    {
        num: '04',
        name: 'Caisse des Dépôts',
        url: 'https://www.caissedesdepots.fr/gestion-des-fonds-depargne/le-livret-a-et-le-ldds',
        desc: '→ Gestionnaire central du Livret A, données de collecte et taux'
    },
    {
        num: '05',
        name: 'Légifrance (Journal Officiel)',
        url: 'https://www.legifrance.gouv.fr/search/jorf?tab_selection=jorf&query=livret+A+taux',
        desc: '→ Texte de l\'arrêté ministériel faisant foi, source primaire'
    },
    {
        num: '06',
        name: 'La Finance pour Tous',
        url: 'https://www.lafinancepourtous.com/pratique/placements/livret-a/',
        desc: '→ Synthèse pédagogique, historique complet des taux depuis 1818'
    }
];
