export interface TipTapNode {
  type: string
  attrs?: {
    key?: string
    level?: number
    [key: string]: unknown
  }
  content?: TipTapNode[]
  text?: string
}

interface DadosGeracao {
  [key: string]: unknown
}

export function renderizarTemplateEditor(
  conteudoTipTap: TipTapNode,
  dados: DadosGeracao
): string {
  function processarNode(node: TipTapNode): string {
    if (!node) return ''

    if (node.type === 'variable') {
      const chave = node.attrs?.key
      const valor = chave ? dados[chave] : undefined
      return valor !== undefined ? String(valor) : `[${chave} não encontrado]`
    }

    if (node.type === 'text') {
      return node.text ?? ''
    }

    const conteudoFilhos = (node.content ?? [])
      .map(processarNode)
      .join('')

    switch (node.type) {
      case 'paragraph':
        return `<p>${conteudoFilhos}</p>`
      case 'doc':
        return conteudoFilhos
      case 'heading': {
        const nivel = node.attrs?.level ?? 1
        return `<h${nivel}>${conteudoFilhos}</h${nivel}>`
      }
      case 'bulletList':
        return `<ul>${conteudoFilhos}</ul>`
      case 'orderedList':
        return `<ol>${conteudoFilhos}</ol>`
      case 'listItem':
        return `<li>${conteudoFilhos}</li>`
      default:
        return conteudoFilhos
    }
  }

  return processarNode(conteudoTipTap)
}

export function extrairVariaveisUsadas(node: TipTapNode): string[] {
  const chaves = new Set<string>()

  function percorrer(n: TipTapNode) {
    if (!n) return
    if (n.type === 'variable' && n.attrs?.key) {
      chaves.add(n.attrs.key)
    }
    ;(n.content ?? []).forEach(percorrer)
  }

  percorrer(node)
  return Array.from(chaves)
}