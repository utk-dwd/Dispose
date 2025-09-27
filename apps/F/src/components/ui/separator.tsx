import * as React from 'react'
import { cn } from '../../lib/utils'

type SeparatorProps = React.HTMLAttributes<HTMLDivElement>

function Separator({ className, ...props }: SeparatorProps) {
	return (
		<div
			className={cn('shrink-0 bg-black/10', className)}
			role="separator"
			{...props}
		/>
	)
}

export { Separator }
