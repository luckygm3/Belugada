import { TemplateEditor } from '@/components/template-editor'

export default function NovoTemplatePage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Criar template</h1>
      <TemplateEditor />
    </div>
  )
}