import React from "react"
import { useFormContext } from "react-hook-form"

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { UpdateSettingsInput } from "@shared/settings-schema"
import type { ModelValues } from "@client/pages/settings/types"

type ModelSettingsSectionProps = {
  values: ModelValues
  isLoading: boolean
  isSaving: boolean
}

export const ModelSettingsSection: React.FC<ModelSettingsSectionProps> = ({
  values,
  isLoading,
  isSaving,
}) => {
  const { effective, default: defaultModel, scorer, tailoring, projectSelection } = values
  const { register, formState: { errors } } = useFormContext<UpdateSettingsInput>()

  return (
    <AccordionItem value="model" className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <span className="text-base font-semibold">Model</span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Override model</div>
            <Input
              {...register("model")}
              placeholder={defaultModel || "openai/gpt-4o-mini"}
              disabled={isLoading || isSaving}
            />
            {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            <div className="text-xs text-muted-foreground">
              Leave blank to use the default from server env (`MODEL`).
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="text-sm font-medium">Task-Specific Overrides</div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm">Scoring Model</div>
                <Input
                  {...register("modelScorer")}
                  placeholder={effective || "inherit"}
                  disabled={isLoading || isSaving}
                />
                {errors.modelScorer && <p className="text-xs text-destructive">{errors.modelScorer.message}</p>}
                <div className="text-xs text-muted-foreground">
                  Effective: <span className="font-mono">{scorer || effective}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">Tailoring Model</div>
                <Input
                  {...register("modelTailoring")}
                  placeholder={effective || "inherit"}
                  disabled={isLoading || isSaving}
                />
                {errors.modelTailoring && <p className="text-xs text-destructive">{errors.modelTailoring.message}</p>}
                <div className="text-xs text-muted-foreground">
                  Effective: <span className="font-mono">{tailoring || effective}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">Project Selection Model</div>
                <Input
                  {...register("modelProjectSelection")}
                  placeholder={effective || "inherit"}
                  disabled={isLoading || isSaving}
                />
                {errors.modelProjectSelection && <p className="text-xs text-destructive">{errors.modelProjectSelection.message}</p>}
                <div className="text-xs text-muted-foreground">
                  Effective: <span className="font-mono">{projectSelection || effective}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Global Effective</div>
              <div className="break-words font-mono text-xs">{effective || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Default (env)</div>
              <div className="break-words font-mono text-xs">{defaultModel || "—"}</div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
