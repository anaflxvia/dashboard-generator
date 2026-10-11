import { createElement } from 'react'
import { resolveIcon } from '../../lib/icons'

// icone pelo nome que a IA mandou, com reserva por palavra-chave do rotulo
export default function Icone({ name, label, className }: { name?: string; label: string; className?: string }) {
  return createElement(resolveIcon(name, label), { className, strokeWidth: 1.8, 'aria-hidden': true })
}
