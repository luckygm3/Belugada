import { Node, mergeAttributes } from '@tiptap/core'

export interface VariableOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      insertVariable: (label: string, key: string) => ReturnType
    }
  }
}

export const Variable = Node.create<VariableOptions>({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true, // não pode ser editado por dentro, só apagado inteiro

  addAttributes() {
    return {
      key: { default: null },   // ex: "nome_funcionario"
      label: { default: null }, // ex: "Nome do Funcionário"
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-variable]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-variable': node.attrs.key,
        class: 'variable-chip',
      }),
      `[[${node.attrs.key}]]`,
    ]
  },

  addCommands() {
    return {
      insertVariable:
        (label: string, key: string) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { key, label },
            })
            .run()
        },
    }
  },
})