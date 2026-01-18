import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import SelectInput from '../../components/common/SelectInput'
import DatePickerInput from '../../components/common/DatePickerInput'
import Button from '../../components/common/Button'
import * as incidentsApi from '../../api/incidents.api'
import toast from 'react-hot-toast'
import { usePageTitle } from '../../hooks/usePageTitle'

const CreateIncidentPage = () => {
  usePageTitle('Create incident')

  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium',
    priority: 'normal',
    category: '',
  })
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const handleAttachmentDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setAttachments(Array.from(event.dataTransfer.files ?? []))
  }

  const handleAttachmentDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await incidentsApi.createIncident({
        ...form,
        due_date: dueDate ? dueDate.toISOString().slice(0, 10) : null,
      })
      const incidentId = response.data.data.id
      if (attachments.length) {
        await Promise.all(
          attachments.map((file) => incidentsApi.uploadIncidentAttachment(String(incidentId), file)),
        )
      }
      toast.success('Incident created successfully.')
      navigate('/app/incidents')
    } catch {
      toast.error('Failed to create incident.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Create incident</h1>
          <p className="mt-2 text-sm text-ink-muted">Log a new incident with details.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <Card>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
            required
          />
          <label className="block text-sm font-medium text-ink">
            <span>
              Description
              <span className="text-rose-500"> *</span>
            </span>
            <textarea
              className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
              rows={4}
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              required
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              label="Severity"
              value={form.severity}
              onChange={(value) => handleChange('severity', value)}
              required
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Critical', value: 'critical' },
              ]}
            />
            <SelectInput
              label="Priority"
              value={form.priority}
              onChange={(value) => handleChange('priority', value)}
              required
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Normal', value: 'normal' },
                { label: 'High', value: 'high' },
                { label: 'Urgent', value: 'urgent' },
              ]}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Category"
              value={form.category}
              onChange={(event) => handleChange('category', event.target.value)}
              placeholder="network, security, hardware, software, other"
              required
            />
            <DatePickerInput
              label="Due date"
              selected={dueDate}
              onChange={setDueDate}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <label className="block text-sm font-medium text-ink">
            <span>Attachments (optional)</span>
            <div
              className="relative mt-2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-muted px-4 py-6 text-center text-sm text-ink-muted hover:border-primary-200"
              onDrop={handleAttachmentDrop}
              onDragOver={handleAttachmentDragOver}
            >
              <span>Drag & drop images or PDFs, or click to browse</span>
              <span className="text-xs text-ink-subtle">PNG, JPG, PDF</span>
              <input
                className="absolute inset-0 cursor-pointer opacity-0"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
              />
              {attachments.length ? (
                <div className="text-xs text-ink">{attachments.length} file(s) selected</div>
              ) : null}
            </div>
          </label>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create incident
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateIncidentPage
