import {ReactNode} from 'react'

type Props = {
  title?:  string | ReactNode | undefined,
  message: string | ReactNode | undefined,
  type?:   string
}

export function Alert({title, message, type}: Props) {
  type = type ?? 'warning'
  const colorClasses = {
    info: {
      title: "bg-orange-500 text-white",
      body:  "border-orange-400 bg-orange-100 text-orange-700"
    },
    warning: {
      title: "bg-red-500 text-white",
      body:  "border-red-400 bg-red-100 text-red-700"
    },
  }
  return (
    <div role="alert" className="mb-32">
    {title && (
      <div className={`${colorClasses[type]?.title} font-bold rounded-t px-4 py-2`}>
        {title}
      </div>
    )}
      <div className={`${colorClasses[type]?.body} border border-t-0 rounded-b px-4 py-3`}>
        <p>{message}</p>
      </div>
    </div>
  )
}
