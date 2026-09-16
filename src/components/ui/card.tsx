import * as React from 'react'
import { cn } from '../../lib/utils'

function cardPart(defaultClass: string) {
  return React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn(defaultClass, className)} {...props} />)
}
const Card = cardPart('rounded-xl border bg-card text-card-foreground shadow')
const CardHeader = cardPart('flex flex-col space-y-1.5 p-6')
const CardTitle = cardPart('font-semibold leading-none tracking-tight')
const CardDescription = cardPart('text-sm text-muted-foreground')
const CardContent = cardPart('p-6 pt-0')
export { Card, CardHeader, CardTitle, CardDescription, CardContent }
