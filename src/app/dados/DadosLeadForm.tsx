"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readLeadDraft, saveLeadDraft, trackLeadEvent } from "@/lib/site-tracking";

const EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "yahoo.com.br",
];

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

function buildEmailSuggestions(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  if (!normalized.includes("@")) {
    return EMAIL_DOMAINS.map((domain) => `${normalized}@${domain}`).slice(0, 5);
  }

  const [localPart, domainPart = ""] = normalized.split("@");

  if (!localPart) {
    return [];
  }

  return EMAIL_DOMAINS.filter((domain) => domain.startsWith(domainPart))
    .map((domain) => `${localPart}@${domain}`)
    .filter((suggestion) => suggestion !== normalized)
    .slice(0, 5);
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="mb-2 block text-[0.68rem] uppercase tracking-[0.22em] text-white/[0.44]">
      {children}
    </label>
  );
}

export default function DadosLeadForm() {
  const router = useRouter();
  const draft = readLeadDraft();
  const [fullName, setFullName] = useState(draft.name || "");
  const [cpf, setCpf] = useState(draft.cpf || "");
  const [email, setEmail] = useState(draft.email || "");
  const [phone, setPhone] = useState(draft.phone || "");
  const [emailFocused, setEmailFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailSuggestions = useMemo(
    () => buildEmailSuggestions(email),
    [email],
  );

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const personal = {
      name: fullName.trim(),
      cpf,
      email: email.trim(),
      phone,
      phoneDigits: phone.replace(/\D/g, ""),
    };

    saveLeadDraft(personal);

    await trackLeadEvent({
      event: "lead_submit",
      stage: "dados",
      page: "dados",
      personal,
    });

    router.push("/nike");
  };

  return (
    <div className="liquid-panel relative overflow-visible rounded-[1.85rem] p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-16 bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_72%)] blur-3xl"
      />

      <div className="relative z-10">
        <div className="mb-4">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/[0.42]">
            Resgate da campanha
          </p>
          <h2 className="font-hero mt-3 text-[1.8rem] text-white sm:text-[2.35rem]">
            Preencha seus dados
          </h2>
          <p className="mt-2.5 max-w-xl text-[0.92rem] leading-6 text-white/[0.68]">
            Para resgatar o cupom da campanha, preencha suas informacoes abaixo.
            Assim voce segue para a proxima etapa com a oferta reservada.
          </p>
        </div>

        <div className="grid gap-3">
          <div>
            <FieldLabel>Nome completo</FieldLabel>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Digite seu nome completo"
              autoComplete="name"
              className="w-full rounded-[1.2rem] border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-[0.96rem] text-white outline-none transition-colors duration-300 placeholder:text-white/[0.26] focus:border-white/[0.22] focus:bg-white/[0.06]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>CPF</FieldLabel>
              <input
                type="text"
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoComplete="off"
                className="w-full rounded-[1.2rem] border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-[0.96rem] text-white outline-none transition-colors duration-300 placeholder:text-white/[0.26] focus:border-white/[0.22] focus:bg-white/[0.06]"
              />
            </div>

            <div className="relative">
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value.replace(/\s+/g, ""))
                }
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setEmailFocused(false), 120);
                }}
                placeholder="voce@email.com"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                className="w-full rounded-[1.2rem] border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-[0.96rem] text-white outline-none transition-colors duration-300 placeholder:text-white/[0.26] focus:border-white/[0.22] focus:bg-white/[0.06]"
              />

              {emailFocused && emailSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-20 overflow-hidden rounded-[1.2rem] border border-white/[0.1] bg-[#0a0a0a]/95 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  {emailSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setEmail(suggestion);
                        setEmailFocused(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 text-left text-sm text-white/[0.82] transition-colors duration-200 last:border-b-0 hover:bg-white/[0.05]"
                    >
                      <span className="truncate">{suggestion}</span>
                      <span className="text-[0.64rem] uppercase tracking-[0.18em] text-white/[0.34]">
                        usar
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Numero de telefone</FieldLabel>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="(11) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
              className="w-full rounded-[1.2rem] border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-[0.96rem] text-white outline-none transition-colors duration-300 placeholder:text-white/[0.26] focus:border-white/[0.22] focus:bg-white/[0.06]"
            />
          </div>
        </div>

        <div className="mt-4 rounded-[1.2rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/[0.38]">
            Oferta reservada
          </p>
          <p className="mt-1.5 text-[0.9rem] leading-6 text-white/[0.6]">
            Depois de preencher os dados, voce segue com a mesma oferta da
            campanha para concluir o resgate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
        >
          {isSubmitting ? "Resgatando..." : "Resgatar"}
        </button>
      </div>
    </div>
  );
}
