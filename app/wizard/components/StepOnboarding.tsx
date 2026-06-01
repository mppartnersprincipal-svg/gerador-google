"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWizardStore } from "@/lib/store/wizardStore";
import {
  OBJECTIVE_LABELS,
  RADIUS_LABELS,
  type CampaignObjective,
  type TargetRadius,
} from "@/types/onboarding";

const schema = z.object({
  companyName: z.string().min(2, "Informe o nome da empresa"),
  segment: z.string().min(2, "Informe o segmento"),
  productService: z.string().min(5, "Descreva o produto/serviço"),
  differentials: z.string().min(10, "Liste ao menos 3 diferenciais"),
  websiteUrl: z
    .string()
    .min(4, "Informe a URL")
    .refine(
      (v) => /\.[a-z]{2,}/i.test(v),
      "URL inválida (ex: https://seusite.com.br)"
    ),
  targetCity: z.string().min(2, "Informe a cidade/região"),
  targetRadius: z.enum(["city", "state", "national"]),
  campaignObjective: z.enum([
    "leads_form",
    "calls",
    "store_visits",
    "online_sales",
  ]),
  primaryCta: z.string().min(2, "Informe o CTA principal"),
  monthlyBudget: z.coerce.number().min(1, "Informe o budget mensal"),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function StepOnboarding() {
  const { onboarding, setOnboarding, next } = useWizardStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: onboarding ?? {
      targetRadius: "city",
      campaignObjective: "leads_form",
    },
  });

  const radius = watch("targetRadius");
  const objective = watch("campaignObjective");

  const onSubmit = (values: FormValues) => {
    setOnboarding(values);
    next();
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="text-xl">Briefing do Cliente</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para gerar a campanha. Todos os campos são
          obrigatórios (exceto observações).
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field label="Nome da empresa" error={errors.companyName?.message}>
            <Input
              placeholder="Clínica Sorriso Garavelo"
              {...register("companyName")}
            />
          </Field>

          <Field label="Segmento / Nicho" error={errors.segment?.message}>
            <Input placeholder="Odontologia" {...register("segment")} />
          </Field>

          <div className="sm:col-span-2">
            <Field
              label="Produto ou serviço anunciado"
              error={errors.productService?.message}
            >
              <Textarea
                placeholder="Implantes dentários com tecnologia digital"
                {...register("productService")}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field
              label="Diferenciais competitivos (mín. 3)"
              error={errors.differentials?.message}
            >
              <Textarea
                placeholder="Atendimento no mesmo dia; parcelamento em 12x; equipe especializada"
                {...register("differentials")}
              />
            </Field>
          </div>

          <Field label="URL do site" error={errors.websiteUrl?.message}>
            <Input
              placeholder="https://clinicasorriso.com.br"
              {...register("websiteUrl")}
            />
          </Field>

          <Field
            label="Cidade / Região alvo"
            error={errors.targetCity?.message}
          >
            <Input placeholder="Goiânia, GO" {...register("targetCity")} />
          </Field>

          <Field label="Raio de atuação" error={errors.targetRadius?.message}>
            <Select
              value={radius}
              onValueChange={(v) =>
                setValue("targetRadius", v as TargetRadius, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(RADIUS_LABELS) as TargetRadius[]
                ).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RADIUS_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Objetivo da campanha"
            error={errors.campaignObjective?.message}
          >
            <Select
              value={objective}
              onValueChange={(v) =>
                setValue("campaignObjective", v as CampaignObjective, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(OBJECTIVE_LABELS) as CampaignObjective[]
                ).map((o) => (
                  <SelectItem key={o} value={o}>
                    {OBJECTIVE_LABELS[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="CTA principal" error={errors.primaryCta?.message}>
            <Input
              placeholder="Agende sua consulta"
              {...register("primaryCta")}
            />
          </Field>

          <Field
            label="Budget mensal estimado (R$)"
            error={errors.monthlyBudget?.message}
          >
            <Input
              type="number"
              min={0}
              placeholder="3000"
              {...register("monthlyBudget")}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Observações adicionais (opcional)">
              <Textarea
                placeholder="Qualquer informação relevante para a campanha"
                {...register("additionalNotes")}
              />
            </Field>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button type="submit" size="lg">
              Analisar Site
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
