declare module 'react-katex' {
  import type { ComponentType, ReactNode } from 'react'

  export interface MathProps {
    math?: string
    children?: ReactNode
    errorColor?: string
    renderError?: (error: Error) => ReactNode
  }

  export const InlineMath: ComponentType<MathProps>
  export const BlockMath: ComponentType<MathProps>
}
