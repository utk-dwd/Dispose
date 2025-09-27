import * as React from 'react'

type DivProps = React.HTMLAttributes<HTMLDivElement>
type TooltipProps = Omit<DivProps, 'title'> & { content: React.ReactNode }

function Tooltip({ content, children, className, ...props }: TooltipProps) {
	const title = typeof content === 'string' ? content : undefined
	return (
		<div className={className} {...props} title={title}>
			{children}
		</div>
	)
}

export { Tooltip }
