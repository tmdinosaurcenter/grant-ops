import React from "react"
import { useFormContext } from "react-hook-form"

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { UpdateSettingsInput } from "@shared/settings-schema"
import type { WebhookValues } from "@client/pages/settings/types"

type PipelineWebhookSectionProps = {
  values: WebhookValues
  isLoading: boolean
  isSaving: boolean
}

export const PipelineWebhookSection: React.FC<PipelineWebhookSectionProps> = ({
  values,
  isLoading,
  isSaving,
}) => {
  const { default: defaultPipelineWebhookUrl, effective: effectivePipelineWebhookUrl } = values
  const { register, formState: { errors } } = useFormContext<UpdateSettingsInput>()

  return (
    <AccordionItem value="pipeline-webhook" className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <span className="text-base font-semibold">Pipeline Webhook</span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Pipeline status webhook URL</div>
            <Input
              {...register("pipelineWebhookUrl")}
              placeholder={defaultPipelineWebhookUrl || "https://..."}
              disabled={isLoading || isSaving}
            />
            {errors.pipelineWebhookUrl && <p className="text-xs text-destructive">{errors.pipelineWebhookUrl.message}</p>}
            <div className="text-xs text-muted-foreground">
              When set, the server sends a POST on pipeline completion/failure. Leave blank to disable.
            </div>
          </div>

          <Separator />

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Effective</div>
              <div className="break-words font-mono text-xs">{effectivePipelineWebhookUrl || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Default (env)</div>
              <div className="break-words font-mono text-xs">{defaultPipelineWebhookUrl || "—"}</div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
