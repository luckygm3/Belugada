'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Variable } from '@/lib/tiptap/variable-extension'
import { useState } from 'react'
import { salvarTemplate } from '@/app/actions/salvar-template'
import { VARIAVEIS_DISPONIVEIS } from '@/lib/variaveis-disponiveis'
import { TipTapNode } from '@/lib/renderizar-template-editor'

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
    {/* Nome do template + botão salvar (novo) */}
    <div className="flex items-center gap-3 mb-4">
      <input
        type="text"
        placeholder="Nome do template"
        value={nomeTemplate}
        onChange={(e) => setNomeTemplate(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm flex-1"
      />
      <button
        onClick={handleSalvar}
        disabled={salvando}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar template'}
      </button>
    </div>
    {mensagem && <p className="text-sm text-gray-600 mb-2">{mensagem}</p>}

    {/* Sidebar + editor (já existente) */}
    <div className="flex gap-4">
      <aside className="w-64 shrink-0 border rounded-lg p-3 space-y-2">
  <h3 className="font-medium text-sm text-gray-500 mb-2">Variáveis disponíveis</h3>
  {VARIAVEIS_DISPONIVEIS.map((v) => (
    <div
      key={v.key}
      draggable
      onDragStart={(e) => handleDragStart(e, v)}
      className="cursor-grab active:cursor-grabbing rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
    >
      {v.label}
    </div>
  ))}
</aside>
      <div onDrop={handleDrop} onDragOver={handleDragOver} className="flex-1 border rounded-lg p-4 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  </div>
)
}