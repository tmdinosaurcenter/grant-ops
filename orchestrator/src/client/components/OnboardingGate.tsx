import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import * as api from "@client/api"
import { useSettings } from "@client/hooks/useSettings"
import { SettingsInput } from "@client/pages/settings/components/SettingsInput"
import { formatSecretHint } from "@client/pages/settings/utils"
import type { ProfileStatusResponse, ResumeProfile } from "@shared/types"

type RequirementRowProps = {
  label: string
  helper?: string
  complete: boolean
}

const RequirementRow: React.FC<RequirementRowProps> = ({ label, helper, complete }) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3">
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
    <Badge
      variant={complete ? "secondary" : "outline"}
      className={cn("uppercase tracking-[0.18em] text-[0.6rem]", complete ? "text-foreground" : "text-muted-foreground")}
    >
      {complete ? "Ready" : "Next"}
    </Badge>
  </div>
)

export const OnboardingGate: React.FC = () => {
  const { settings, isLoading: settingsLoading, refreshSettings } = useSettings()
  const [profileStatus, setProfileStatus] = useState<ProfileStatusResponse | null>(null)
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [isSavingEnv, setIsSavingEnv] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  const [openrouterApiKey, setOpenrouterApiKey] = useState("")
  const [rxresumeEmail, setRxresumeEmail] = useState("")
  const [rxresumePassword, setRxresumePassword] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const refreshProfileStatus = useCallback(async () => {
    setIsCheckingProfile(true)
    try {
      const status = await api.getProfileStatus()
      setProfileStatus(status)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to check base resume"
      setProfileStatus({ exists: false, error: message })
    } finally {
      setIsCheckingProfile(false)
    }
  }, [])

  useEffect(() => {
    void refreshProfileStatus()
  }, [refreshProfileStatus])

  const hasOpenrouterKey = Boolean(settings?.openrouterApiKeyHint)
  const hasRxresumeEmail = Boolean(settings?.rxresumeEmail?.trim())
  const hasRxresumePassword = Boolean(settings?.rxresumePasswordHint)
  const hasRxresumeCredentials = hasRxresumeEmail && hasRxresumePassword
  const hasBaseResume = Boolean(profileStatus?.exists)

  const shouldOpen = Boolean(settings && profileStatus && !settingsLoading && !isCheckingProfile)
    && !(hasOpenrouterKey && hasRxresumeCredentials && hasBaseResume)

  const openrouterCurrent = settings?.openrouterApiKeyHint
    ? formatSecretHint(settings.openrouterApiKeyHint)
    : undefined
  const rxresumeEmailCurrent = settings?.rxresumeEmail?.trim()
    ? settings.rxresumeEmail
    : undefined
  const rxresumePasswordCurrent = settings?.rxresumePasswordHint
    ? formatSecretHint(settings.rxresumePasswordHint)
    : undefined

  const handleRefresh = async () => {
    const results = await Promise.allSettled([refreshSettings(), refreshProfileStatus()])
    const failed = results.find((result) => result.status === "rejected")
    if (failed) {
      const reason = failed.status === "rejected" ? failed.reason : null
      const message = reason instanceof Error ? reason.message : "Failed to refresh setup"
      toast.error(message)
    }
  }

  const handleSaveCredentials = async () => {
    if (!settings) return
    const update: { openrouterApiKey?: string; rxresumeEmail?: string; rxresumePassword?: string } = {}
    const openrouterValue = openrouterApiKey.trim()
    const emailValue = rxresumeEmail.trim()
    const passwordValue = rxresumePassword.trim()

    const missing: string[] = []

    if (!hasOpenrouterKey && !openrouterValue) {
      missing.push("OpenRouter API key")
    }

    if (!hasRxresumeCredentials) {
      if (!hasRxresumeEmail && !emailValue) missing.push("RxResume email")
      if (!hasRxresumePassword && !passwordValue) missing.push("RxResume password")
    }

    if (missing.length > 0) {
      toast.info("Almost there", {
        description: `Missing: ${missing.join(", ")}`,
      })
      return
    }

    if (openrouterValue) update.openrouterApiKey = openrouterValue
    if (emailValue) update.rxresumeEmail = emailValue
    if (passwordValue) update.rxresumePassword = passwordValue

    if (Object.keys(update).length === 0) {
      toast.info("Nothing new to save")
      return
    }

    try {
      setIsSavingEnv(true)
      await api.updateSettings(update)
      await refreshSettings()
      setOpenrouterApiKey("")
      setRxresumePassword("")
      toast.success("Credentials saved")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save credentials"
      toast.error(message)
    } finally {
      setIsSavingEnv(false)
    }
  }

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.info("Choose your base.json file")
      return
    }

    try {
      setIsUploadingResume(true)
      const text = await resumeFile.text()
      let parsed: ResumeProfile
      try {
        parsed = JSON.parse(text) as ResumeProfile
      } catch {
        throw new Error("Resume JSON is invalid. Export the base.json from RxResume.")
      }

      await api.uploadProfile(parsed)
      await refreshProfileStatus()
      setResumeFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      toast.success("Resume uploaded")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload resume"
      toast.error(message)
    } finally {
      setIsUploadingResume(false)
    }
  }

  const resumeFileName = resumeFile?.name || ""

  const checklist = useMemo(
    () => [
      {
        label: "OpenRouter API key",
        helper: "Needed for scoring + tailoring",
        complete: hasOpenrouterKey,
      },
      {
        label: "RxResume credentials",
        helper: "Used to export PDFs",
        complete: hasRxresumeCredentials,
      },
      {
        label: "Base resume JSON",
        helper: "Upload resume-generator/base.json",
        complete: hasBaseResume,
      },
    ],
    [hasBaseResume, hasOpenrouterKey, hasRxresumeCredentials]
  )

  if (!shouldOpen) return null

  return (
    <AlertDialog open>
      <AlertDialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Job Ops</AlertDialogTitle>
          <AlertDialogDescription>
            Let’s get your workspace ready. Add your keys and resume once, then the pipeline can run end-to-end.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Quick setup checklist</p>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={settingsLoading || isCheckingProfile}>
                Refresh status
              </Button>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <RequirementRow key={item.label} {...item} />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">OpenRouter</p>
              <p className="text-xs text-muted-foreground">Used for job scoring, summaries, and tailoring.</p>
            </div>
            <SettingsInput
              label="OpenRouter API key"
              inputProps={{
                name: "openrouterApiKey",
                value: openrouterApiKey,
                onChange: (event) => setOpenrouterApiKey(event.target.value),
              }}
              type="password"
              placeholder="sk-or-v1..."
              current={openrouterCurrent}
              helper="Create a key at openrouter.ai"
              disabled={isSavingEnv}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">RxResume account</p>
              <p className="text-xs text-muted-foreground">Used to export tailored PDFs.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SettingsInput
                label="Email"
                inputProps={{
                  name: "rxresumeEmail",
                  value: rxresumeEmail,
                  onChange: (event) => setRxresumeEmail(event.target.value),
                }}
                placeholder="you@example.com"
                current={rxresumeEmailCurrent}
                disabled={isSavingEnv}
              />
              <SettingsInput
                label="Password"
                inputProps={{
                  name: "rxresumePassword",
                  value: rxresumePassword,
                  onChange: (event) => setRxresumePassword(event.target.value),
                }}
                type="password"
                placeholder="Enter password"
                current={rxresumePasswordCurrent}
                disabled={isSavingEnv}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveCredentials} disabled={isSavingEnv}>
                {isSavingEnv ? "Saving..." : "Save and continue"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Base resume JSON</p>
              <p className="text-xs text-muted-foreground">Upload your RxResume export named base.json.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label htmlFor="resumeFile" className="text-sm font-medium">
                  base.json
                </label>
                <Input
                  id="resumeFile"
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                  disabled={isUploadingResume}
                />
                {resumeFileName && (
                  <p className="text-xs text-muted-foreground">Selected: {resumeFileName}</p>
                )}
              </div>
              <Button onClick={handleUploadResume} disabled={isUploadingResume}>
                {isUploadingResume ? "Uploading..." : "Upload resume"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-muted bg-muted/30 p-3 text-xs text-muted-foreground">
            Friendly heads-up: pipelines can be slow or a little flaky in alpha. If anything feels off, open a GitHub issue and
            we will take a look.{" "}
            <a
              className="font-semibold text-foreground underline underline-offset-2"
              href="https://github.com/DaKheera47/job-ops/issues"
              target="_blank"
              rel="noreferrer"
            >
              Open an issue
            </a>
            .
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
