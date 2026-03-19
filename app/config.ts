export const config = {
  problemOptions: [
    {
      value: "hypertension",
      label: "Hypertensie",
      description: "Onvoldoende gecontroleerde bloeddruk / hoog cardiovasculair risico"
    },
    {
      value: "vkf",
      label: "Voorkamerfibrillatie (VKF)",
      description: "Recente start van VKF in stress-context"
    },
    {
      value: "pad",
      label: "Perifeer arterieel vaatlijden",
      description: "Symptomatisch PAD"
    },
    {
      value: "bleeding_disorder",
      label: "Bloedingsziekte",
      description: "Hemofilie, VWD, ROW, andere"
    },
    {
      value: "vwd",
      label: "Von Willebrandziekte",
      description: "Bevestigde of vermoede VWD"
    },
    {
      value: "dyslipidemia",
      label: "Dyslipidemie / hypercholesterolemie",
      description: "Patiënt op of richting intensieve lipidenverlagende therapie"
    }
  ],

  questions: [
    // --- ZENITH ---
    { id: "uncontrolled_hypertension", label: "Onvoldoende gecontroleerde hypertensie?" },
    { id: "on_two_or_more_antihypertensives", label: "≥2 antihypertensiva?" },
    { id: "has_thiazide_or_loop_diuretic", label: "Thiazide/thiazide-like of lisdiureticum aanwezig?" },
    { id: "recent_antihypertensive_change_30d", label: "Therapie gewijzigd <30 dagen?" },
    { id: "established_cvd", label: "Gekend cardiovasculair lijden / vroeger CV event?" },

    { id: "zenith_age_established_cvd_18plus", label: "Leeftijd ≥18 jaar?" },
    { id: "zenith_age_highrisk_55plus", label: "Leeftijd ≥55 jaar?" },
    { id: "zenith_risk_age_70plus", label: "Leeftijd ≥70 jaar?" },
    { id: "zenith_risk_egfr_lt60", label: "eGFR <60?" },
    { id: "zenith_risk_current_smoker", label: "Actieve roker?" },
    { id: "zenith_risk_af", label: "Voorkamerfibrillatie (VKF)?" },
    { id: "zenith_risk_ntprobnp_gt125", label: "NT-proBNP >125?" },
    { id: "zenith_risk_diabetes_or_obesity", label: "Diabetes en/of obesitas?" },

    { id: "zenith_exclusion_egfr_lt30", label: "eGFR <30?" },

    // --- ASPIRE ---
    { id: "recent_af_start_35d", label: "Recente start van VKF (<35 dagen)?" },
    { id: "afots_after_noncardiac_surgery", label: "Na niet-cardiale heelkunde?" },
    { id: "afots_after_acute_medical_illness", label: "Na acute medische ziekte?" },
    { id: "sinus_rhythm_now", label: "Nu sinusritme?" },

    // --- PAD ---
{ id: "pad_symptomatic_current", label: "Symptomatisch PAD (claudicatio, rustpijn of ischemische wonden)?" },
{ id: "pad_revascularization_or_amputation", label: "Eerdere revascularisatie of amputatie wegens PAD?" },
    { id: "egfr_lt30", label: "eGFR <30?" },

    // --- BLOEDING ---
    { id: "known_inherited_bleeding_disorder", label: "Gekende congenitale bloedingsziekte?" },
    { id: "known_vwd", label: "Von Willebrandziekte?" },

    // --- TRICONOS (NIEUW) ---
    { id: "triconos_secondary_prevention", label: "Gekend cardiovasculair lijden / vroeger event?" },
    { id: "triconos_high_risk_primary", label: "Hoog/zeer hoog cardiovasculair risico (primaire preventie)?" },

    { id: "triconos_bempedoic_started_or_planned", label: "Recente start of plan tot starten bempedoic acid?" },
    { id: "triconos_bempedoic_within_4w", label: "Binnen 4 weken van start bempedoic acid?" },

    { id: "triconos_statin", label: "Gebruik of geplande start van statine?" },
    { id: "triconos_ezetimibe", label: "Gebruik of geplande start van ezetimibe?" },

    { id: "received_pcsk9_mab_last_3m", label: "PCSK9-mAb laatste 3 maanden?" },
    { id: "ever_received_inclisiran", label: "Ooit inclisiran gekregen?" }
  ],

  studies: [
    {
      id: "zenith",
      title: "ZENITH",
      subtitle: "Hypertensie + CV risico",
      problemTags: ["hypertension"],
      requires_all: [
        "uncontrolled_hypertension",
        "on_two_or_more_antihypertensives",
        "has_thiazide_or_loop_diuretic"
      ],
      requires_any: ["established_cvd", "zenith_high_risk_bucket"],
      hard_exclusions: [
        "recent_antihypertensive_change_30d",
        "zenith_exclusion_egfr_lt30"
      ],
      synopsis: "Hypertensie + verhoogd cardiovasculair risico",
      pitch: "Studie voor patiënten met moeilijk controleerbare hypertensie.",
      contact: "vte@uzleuven.be | DECT 42057 (Kristine) | DECT 45320 (Katrien)"
    },

    {
      id: "aspire",
      title: "ASPIRE-AF",
      subtitle: "Recente VKF",
      problemTags: ["vkf"],
      requires_all: ["recent_af_start_35d", "sinus_rhythm_now"],
      requires_any: [
        "afots_after_noncardiac_surgery",
        "afots_after_acute_medical_illness"
      ],
      hard_exclusions: [],
      synopsis: "Recente VKF na acute trigger",
      pitch: "Studie voor recente VKF.",
      contact: "vte@uzleuven.be | DECT 42057 (Kristine)"
    },

 {
  id: "pad",
  title: "LEADER-PAD",
  subtitle: "Symptomatisch perifeer arterieel vaatlijden",
  problemTags: ["pad"],
  requires_all: [],
  requires_any: [
    "pad_symptomatic_current",
    "pad_revascularization_or_amputation"
  ],
  hard_exclusions: ["egfr_lt30"],
  synopsis: "Studie voor patiënten met symptomatisch perifeer arterieel vaatlijden of met eerdere revascularisatie/amputatie wegens PAD.",
  pitch: "Er loopt een studie voor patiënten met perifeer vaatlijden, ook als zij eerder al een revascularisatie of amputatie wegens PAD ondergingen.",
  contact: "vte@uzleuven.be | DECT 42057 (Kristine) | DECT 45320 (Katrien)"
},

    {
      id: "caribou",
      title: "CARIBou",
      subtitle: "Bloedingsziekten",
      problemTags: ["bleeding_disorder"],
      requires_all: ["known_inherited_bleeding_disorder"],
      requires_any: [],
      hard_exclusions: [],
      synopsis: "CV risico bij bloedingsziekten",
      pitch: "Observationele studie.",
      contact: "vte@uzleuven.be"
    },

    {
      id: "bwill",
      title: "B-WILL",
      subtitle: "Von Willebrand",
      problemTags: ["vwd"],
      requires_all: ["known_vwd"],
      requires_any: [],
      hard_exclusions: [],
      synopsis: "VWD studie",
      pitch: "Registratie studie",
      contact: "vte@uzleuven.be"
    },

    {
      id: "triconos",
      title: "TRICONOS",
      subtitle: "Triple lipidentherapie met bempedoic acid",
      problemTags: ["dyslipidemia"],
      requires_all: [
        "triconos_bempedoic_started_or_planned",
        "triconos_statin",
        "triconos_ezetimibe"
      ],
      requires_any: [
        "triconos_secondary_prevention",
        "triconos_high_risk_primary"
      ],
      hard_exclusions: [
        "received_pcsk9_mab_last_3m",
        "ever_received_inclisiran"
      ],
      synopsis: "Triple lipidenverlagende therapie met bempedoic acid",
      pitch: "Studie voor patiënten die starten of gepland staan voor bempedoic acid.",
      contact: "vte@uzleuven.be | DECT 42057 (Kristine) | DECT 45320 (Katrien)"
    }
  ]
};