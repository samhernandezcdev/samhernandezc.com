import { useState, type FormEvent } from "react";

type ContactFormLabels = {
  botLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  submitLabel: string;
  sentLabel: string;
};

type ContactFormProps = {
  labels: ContactFormLabels;
};

export default function ContactForm({ labels }: ContactFormProps) {
  const [sent, setSent] = useState(false);

  function encode(data: Record<string, string>) {
    return new URLSearchParams(data).toString();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "contacto",
        "bot-field": String(formData.get("bot-field") ?? ""),
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        description: String(formData.get("description") ?? ""),
      }),
    });

    setSent(true);
    form.reset();

    setTimeout(() => setSent(false), 4000);    
  }

  return (
    <form
      name="contacto"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="surface-card space-y-5 rounded-2xl p-6 sm:p-8 lg:col-span-3"
      onSubmit={onSubmit}
    >
      <input type="hidden" name="form-name" value="contacto" />

      <p className="hidden">
        <label>
          {labels.botLabel}
          <input name="bot-field" />
        </label>
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.nameLabel} name="name" placeholder={labels.namePlaceholder} required />
        <Field label={labels.emailLabel} name="email" type="email" placeholder={labels.emailPlaceholder} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {labels.descriptionLabel}
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          placeholder={labels.descriptionPlaceholder}
          className="w-full resize-none rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
        ></textarea>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-(--shadow-glow) transition-all hover:bg-brand/90 cursor-pointer"
      >
        {sent ? labels.sentLabel : labels.submitLabel}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
