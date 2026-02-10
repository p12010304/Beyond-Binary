import { useState, useRef } from 'react'
import { Upload, FileText, ScanText, Volume2, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { processDocument } from '@/services/documentService'

export default function DocumentScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [summary, setSummary] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { speak, preferences } = useAccessibility()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setExtractedText('')
      setSummary('')
      setError(null)
    }
  }

  const handleProcess = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)

    try {
      const result = await processDocument(file)
      setExtractedText(result.text)
      setSummary(result.summary)

      if (preferences.auto_tts) {
        speak(`Document processed. Summary: ${result.summary}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document')
    } finally {
      setProcessing(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setExtractedText('')
    setSummary('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
          Document Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="doc-upload"
            className="flex flex-col items-center justify-center rounded-[--radius-lg] border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/40 transition-colors duration-[--duration-normal] ease-[--ease-out]"
          >
            <Upload className="h-7 w-7 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Upload a document'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images (JPG, PNG) or text files
            </p>
            <input
              ref={fileInputRef}
              id="doc-upload"
              type="file"
              accept="image/*,.txt"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Upload document for scanning and summarization"
            />
          </label>
        </div>

        {file && (
          <div className="flex gap-2">
            <Button onClick={handleProcess} disabled={processing} className="flex-1">
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                <>
                  <ScanText className="h-4 w-4" aria-hidden="true" />
                  Extract & Summarize
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear} aria-label="Clear uploaded file">
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-[--radius-md] bg-destructive/10 border border-destructive p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {extractedText && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Extracted Text</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(extractedText)}
                aria-label="Read extracted text aloud"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Read Aloud
              </Button>
            </div>
            <div className="rounded-[--radius-md] bg-muted p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto leading-relaxed">
              {extractedText}
            </div>
          </div>
        )}

        {summary && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">
                <Badge variant="secondary" className="text-xs">Summary</Badge>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(summary)}
                aria-label="Read summary aloud"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Read Aloud
              </Button>
            </div>
            <div className="rounded-[--radius-md] bg-primary/5 border border-primary/15 p-3 text-sm leading-relaxed">
              {summary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
