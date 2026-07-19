'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { extrairVariaveisUsadas, TipTapNode } from '@/lib/renderizar-template-editor'

interface SalvarTemplateInput {
  templateId?: string
  nome: string
  empresaId?: string | null
  conteudoJson: string
}

export async function salvarTemplate(input: SalvarTemplateInput) {
  const { templateId, nome, empresaId, conteudoJson } = input

  const conteudo = JSON.parse(conteudoJson) as TipTapNode
  const variaveisDetectadas = extrairVariaveisUsadas(conteudo)
  const conteudoPrisma = conteudo as unknown as Prisma.InputJsonValue

  if (templateId) {
    return prisma.templateDocumento.update({
      where: { id: templateId },
      data: {
        nome,
        conteudo: conteudoPrisma,
        origem: 'EDITOR',
        variaveisDetectadas,
      },
    })
  }

  return prisma.templateDocumento.create({
    data: {
      nome,
      empresaId: empresaId ?? null,
      conteudo: conteudoPrisma,
      origem: 'EDITOR',
      tipo: 'PERSONALIZADO',
      variaveisDetectadas,
    },
  })
}