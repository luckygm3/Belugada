import { TemplateEditor } from '@/components/template-editor'

export default function NovoTemplatePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-h1 text-ink">Criar template</h1>
      <TemplateEditor />
    </div>
  )
}
