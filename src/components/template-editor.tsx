'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Variable } from '@/lib/tiptap/variable-extension'
import { useState } from 'react'
import { salvarTemplate } from '@/app/actions/salvar-template'
import { VARIAVEIS_DISPONIVEIS } from '@/lib/variaveis-disponiveis'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function TemplateEditor() {
  const editor = useEditor({
    extensions: [StarterKit, Variable],
    content: '<p>Comece a escrever o template aqui...</p>',
  })

  function handleDragStart(e: React.DragEvent, variable: { key: string; label: string }) {
    e.dataTransfer.setData('application/json', JSON.stringify(variable))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data || !editor) return

    const { key, label } = JSON.parse(data)
    editor.chain().focus().insertVariable(label, key).run()
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault() // necessário pra permitir o drop
  }

const [nomeTemplate, setNomeTemplate] = useState('')
const [salvando, setSalvando] = useState(false)
const [mensagem, setMensagem] = useState<string | null>(null)

async function handleSalvar() {
  if (!editor || !nomeTemplate.trim()) {
    setMensagem('Dê um nome ao template antes de salvar.')
    return
  }

  setSalvando(true)
  setMensagem(null)

  try {
    await salvarTemplate({
  nome: nomeTemplate,
  conteudoJson: JSON.stringify(editor.getJSON()),
})
    setMensagem('Template salvo com sucesso!')
  } catch (err) {
    console.error(err)
    setMensagem('Erro ao salvar. Tenta de novo.')
  } finally {
    setSalvando(false)
  }
}

  return (
  <div>
    {/* Nome do template + botão salvar */}
    <div className="mb-4 flex items-end gap-3">
      <div className="flex-1">
        <Input label="Nome do template" value={nomeTemplate} onChange={(e) => setNomeTemplate(e.target.value)} />
      </div>
      <Button variant="primary" onClick={handleSalvar} loading={salvando}>
        Salvar template
      </Button>
    </div>
    {mensagem && <p className="mb-2 text-body-sm text-ink-muted">{mensagem}</p>}

    {/* Sidebar + editor */}
    <div className="flex gap-4">
      <aside className="w-64 shrink-0 space-y-2 rounded-pa-lg border border-border bg-surface p-3 shadow-pa-sm">
        <h3 className="mb-2 text-body-sm font-medium text-ink-muted">Variáveis disponíveis</h3>
        {VARIAVEIS_DISPONIVEIS.map((v) => (
          <div
            key={v.key}
            draggable
            onDragStart={(e) => handleDragStart(e, v)}
            className="cursor-grab rounded-pa-md border border-border bg-surface-alt px-3 py-2 text-body-sm text-ink transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 active:cursor-grabbing"
          >
            {v.label}
          </div>
        ))}
      </aside>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="min-h-[400px] flex-1 rounded-pa-lg border border-border bg-surface p-4"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  </div>
)
}
