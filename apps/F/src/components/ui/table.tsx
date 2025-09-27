import * as React from 'react'
import { cn } from '../../lib/utils'

type TableProps = React.HTMLAttributes<HTMLTableElement>

function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  )
}

const Th = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn('border-b border-black/10 px-4 py-2 text-left font-medium text-black', className)}
    {...props}
  />
)
const Td = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('border-b border-black/5 px-4 py-2 text-black/80', className)} {...props} />
)
const Tr = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('hover:bg-mint/5 transition-colors', className)} {...props} />
)

export { Table, Th, Td, Tr }