"use client";

import { useMemo, useState } from "react";
import { config } from "./config";

type AnswerValue = "yes" | "no" | "unknown";
type Step = 1 | 2 | 3;
type ProblemValue =
  | "hypertension"
  | "vkf"
  | "pad"
  | "bleeding_disorder"
  | "vwd"
  | "dyslipidemia";

const COLORS = {
  primary: "#37C5F3",
  primaryDark: "#0EA5E9",
  primarySoft: "#E6F7FD",
  text: "#0F172A",
  textSoft: "#475569",
  border: "#D7E3EA",
  surface: "#FFFFFF",
  surfaceSoft: "#F8FBFD",
  yes: "#16A34A",
  no: "#DC2626",
  unknown: "#D97706",
  black: "#111111",
  gray: "#94A3B8"
};

const answerOptions: { value: AnswerValue; label: string; bg: string }[] = [
  { value: "yes", label: "Ja", bg: COLORS.yes },
  { value: "no", label: "Nee", bg: COLORS.no },
  { value: "unknown", label: "Onbekend", bg: COLORS.unknown }
];

const questionIdsByProblem = (
  problems: ProblemValue[],
  answers: Record<string, AnswerValue>
): string[] => {
  const ids = new Set<string>();

  if (problems.includes("hypertension")) {
    ids.add("uncontrolled_hypertension");
    ids.add("on_two_or_more_antihypertensives");
    ids.add("has_thiazide_or_loop_diuretic");
    ids.add("recent_antihypertensive_change_30d");
    ids.add("established_cvd");
    ids.add("zenith_exclusion_egfr_lt30");

    if (answers["established_cvd"] !== "yes") {
      ids.add("zenith_age_highrisk_55plus");
      ids.add("zenith_risk_age_70plus");
      ids.add("zenith_risk_egfr_lt60");
      ids.add("zenith_risk_uacr_gt300");
      ids.add("zenith_risk_current_smoker");
      ids.add("zenith_risk_af");
      ids.add("zenith_risk_cac_gt100");
      ids.add("zenith_risk_ntprobnp_gt125");
      ids.add("zenith_risk_diabetes_or_obesity");
    } else {
      ids.add("zenith_age_established_cvd_18plus");
    }
  }

  if (problems.includes("vkf")) {
    ids.add("recent_af_start_35d");
    ids.add("afots_after_noncardiac_surgery");
    ids.add("afots_after_acute_medical_illness");
    ids.add("sinus_rhythm_now");
  }

  if (problems.includes("pad")) {
    ids.add("symptomatic_pad");
    ids.add("egfr_lt30");
  }

  if (problems.includes("bleeding_disorder")) {
    ids.add("known_inherited_bleeding_disorder");
  }

  if (problems.includes("vwd")) {
    ids.add("known_vwd");
  }

if (problems.includes("dyslipidemia")) {
  ids.add("triconos_secondary_prevention");
  ids.add("triconos_high_risk_primary");

  ids.add("triconos_bempedoic_started_or_planned");
  ids.add("triconos_bempedoic_within_4w");

  ids.add("triconos_statin");
  ids.add("triconos_ezetimibe");

  ids.add("received_pcsk9_mab_last_3m");
  ids.add("ever_received_inclisiran");
}

  return Array.from(ids);
};

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [problems, setProblems] = useState<ProblemValue[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const toggleProblem = (value: ProblemValue) => {
    setProblems((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  };

  const visibleQuestions = useMemo(() => {
    const ids = questionIdsByProblem(problems, answers);
    return config.questions.filter((q) => ids.includes(q.id));
  }, [problems, answers]);

  const visibleStudies = useMemo(() => {
    return config.studies.filter((study) =>
      study.problemTags.some((tag: string) => problems.includes(tag as ProblemValue))
    );
  }, [problems]);

  const setAnswer = (id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const resetAll = () => {
    setStep(1);
    setProblems([]);
    setAnswers({});
  };

  const getZenithHighRiskStatus = () => {
    const factors = [
      "zenith_risk_age_70plus",
      "zenith_risk_egfr_lt60",
      "zenith_risk_uacr_gt300",
      "zenith_risk_current_smoker",
      "zenith_risk_af",
      "zenith_risk_cac_gt100",
      "zenith_risk_ntprobnp_gt125",
      "zenith_risk_diabetes_or_obesity"
    ];

    const yesCount = factors.filter((q) => answers[q] === "yes").length;
    const anyUnknown = factors.some((q) => answers[q] === "unknown" || !answers[q]);
    const allNo = factors.every((q) => answers[q] === "no");

    return { yesCount, anyUnknown, allNo };
  };

  const evaluate = (study: any) => {
    for (const ex of study.hard_exclusions || []) {
      if (answers[ex] === "yes") {
        return {
          symbol: "❌",
          label: "Waarschijnlijk niet passend",
          reason: "Harde exclusie aanwezig",
          tone: "red"
        };
      }
    }

    let missing = false;

    for (const req of study.requires_all || []) {
      if (answers[req] === "no") {
        return {
          symbol: "❌",
          label: "Waarschijnlijk niet passend",
          reason: "Essentieel criterium niet aanwezig",
          tone: "red"
        };
      }
      if (!answers[req] || answers[req] === "unknown") {
        missing = true;
      }
    }

    if (study.id === "zenith") {
      const establishedCvd = answers["established_cvd"];

      if (establishedCvd === "yes") {
        if (answers["zenith_age_established_cvd_18plus"] === "no") {
          return {
            symbol: "❌",
            label: "Waarschijnlijk niet passend",
            reason: "Leeftijd voldoet niet voor established CVD-arm",
            tone: "red"
          };
        }
        if (
          !answers["zenith_age_established_cvd_18plus"] ||
          answers["zenith_age_established_cvd_18plus"] === "unknown"
        ) {
          missing = true;
        }
      } else {
        if (answers["zenith_age_highrisk_55plus"] === "no") {
          return {
            symbol: "❌",
            label: "Waarschijnlijk niet passend",
            reason: "Leeftijd voldoet niet voor high-risk arm",
            tone: "red"
          };
        }

        if (
          !answers["zenith_age_highrisk_55plus"] ||
          answers["zenith_age_highrisk_55plus"] === "unknown"
        ) {
          missing = true;
        }

        const risk = getZenithHighRiskStatus();

        if (risk.yesCount >= 2) {
        } else if (risk.anyUnknown) {
          missing = true;
        } else {
          return {
            symbol: "❌",
            label: "Waarschijnlijk niet passend",
            reason: "Geen established CVD en onvoldoende high-risk criteria",
            tone: "red"
          };
        }
      }
    }

    if (missing) {
      return {
        symbol: "⚠️",
        label: "Mogelijke match",
        reason: "Nog te verifiëren criteria",
        tone: "orange"
      };
    }

    return {
      symbol: "✅",
      label: "Sterke match",
      reason: "Kerncriteria aanwezig, geen harde exclusie gevonden",
      tone: "green"
    };
  };

  const toneStyles = (tone: string) => {
    if (tone === "green") {
      return {
        border: "1px solid #BBF7D0",
        bg: "#F0FDF4",
        badgeBg: "#16A34A"
      };
    }
    if (tone === "orange") {
      return {
        border: "1px solid #FED7AA",
        bg: "#FFF7ED",
        badgeBg: "#D97706"
      };
    }
    return {
      border: "1px solid #FECACA",
      bg: "#FEF2F2",
      badgeBg: "#DC2626"
    };
  };

  const canGoFromStep1 = problems.length > 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f5fbfe 0%, #f8fafc 100%)",
        padding: "24px 16px",
        fontFamily: "Arial, sans-serif",
        color: COLORS.text
      }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          background: COLORS.surface,
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 35px rgba(15, 23, 42, 0.08)",
          border: `1px solid ${COLORS.border}`
        }}
      >
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${COLORS.primarySoft} 0%, white 100%)`,
            border: `1px solid ${COLORS.border}`
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.textSoft, marginBottom: 8, fontWeight: 700 }}>
            UZ Leuven – interne pre-screening tool
          </div>
          <h1 style={{ margin: 0, fontSize: 30 }}>
            Study Pre-Screener V2
          </h1>
          <div style={{ marginTop: 10, color: COLORS.textSoft, fontSize: 16 }}>
            Snelle pre-screening met focus op hoge sensitiviteit
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                padding: "9px 14px",
                borderRadius: 999,
                background: step === s ? COLORS.primary : "#E2E8F0",
                color: step === s ? "white" : "#334155",
                fontWeight: 700,
                fontSize: 14
              }}
            >
              Stap {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <section>
            <h2 style={{ marginBottom: 8 }}>1. Wat zijn de hoofddiagnose(s) of kernproblemen?</h2>
            <p style={{ color: COLORS.textSoft, marginTop: 0 }}>
              Je kan één of meerdere opties aanduiden.
            </p>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              {config.problemOptions.map((opt) => {
                const selected = problems.includes(opt.value as ProblemValue);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleProblem(opt.value as ProblemValue)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "18px 20px",
                      borderRadius: 18,
                      border: selected ? `2px solid ${COLORS.primaryDark}` : `1px solid ${COLORS.border}`,
                      background: selected ? COLORS.primarySoft : "white",
                      color: COLORS.text,
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <div>{selected ? "✓ " : ""}{opt.label}</div>
                    <div style={{ marginTop: 6, fontSize: 14, color: COLORS.textSoft, fontWeight: 500 }}>
                      {opt.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 style={{ marginBottom: 8 }}>2. Snelle verfijning</h2>
            <p style={{ color: COLORS.textSoft, marginTop: 0 }}>
              Alleen relevante vragen worden getoond.
            </p>

            <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
              {visibleQuestions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 18,
                    padding: 18,
                    background: COLORS.surfaceSoft
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
                    {q.label}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {answerOptions.map((opt) => {
                      const selected = answers[q.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswer(q.id, opt.value)}
                          style={{
                            minWidth: 110,
                            padding: "12px 16px",
                            borderRadius: 14,
                            border: selected ? `2px solid ${opt.bg}` : `1px solid ${COLORS.border}`,
                            background: selected ? opt.bg : "white",
                            color: selected ? "white" : COLORS.text,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 style={{ marginBottom: 8 }}>3. Resultaten</h2>
            <p style={{ color: COLORS.textSoft, marginTop: 0 }}>
              Suggesties voor verdere beoordeling door het studieteam.
            </p>

            <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
              {visibleStudies.map((study) => {
                const result = evaluate(study);
                const tone = toneStyles(result.tone);

                return (
                  <div
                    key={study.id}
                    style={{
                      border: tone.border,
                      background: tone.bg,
                      borderRadius: 20,
                      padding: 20
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: tone.badgeBg,
                        color: "white",
                        fontWeight: 700,
                        fontSize: 13,
                        marginBottom: 12
                      }}
                    >
                      {result.symbol} {result.label}
                    </div>

                    <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                      {study.title}
                    </div>

                    <div style={{ fontSize: 15, color: COLORS.textSoft, fontWeight: 600, marginBottom: 12 }}>
                      {study.subtitle}
                    </div>

                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                      <strong>Waarom:</strong> {result.reason}
                    </div>

                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                      <strong>Studie:</strong> {study.synopsis}
                    </div>

                    <div style={{ fontSize: 15, marginBottom: 10 }}>
                      <strong>Pitch naar patiënt:</strong> {study.pitch}
                    </div>

                    <div style={{ fontSize: 15 }}>
                      <strong>Contact:</strong> {study.contact}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((step - 1) as Step)}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                background: "white",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Vorige
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              disabled={!canGoFromStep1}
              onClick={() => setStep(2)}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "none",
                background: canGoFromStep1 ? COLORS.primaryDark : COLORS.gray,
                color: "white",
                cursor: canGoFromStep1 ? "pointer" : "not-allowed",
                fontWeight: 700
              }}
            >
              Verder
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(3)}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "none",
                background: COLORS.primaryDark,
                color: "white",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Toon resultaten
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={resetAll}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "none",
                background: COLORS.black,
                color: "white",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Nieuwe screening
            </button>
          )}
        </div>
      </div>
    </main>
  );
}